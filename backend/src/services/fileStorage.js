import crypto from 'node:crypto';
import { getSupabase, STORAGE_BUCKETS } from '../config/supabase.js';
import { db } from '../db.js';

const sanitizeFilename = (name) => {
  const safe = name.replace(/[^\w.\-]+/g, '_').slice(0, 120);
  return safe || 'file';
};

const hashBuffer = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

const buildStoragePath = (userId, kind, originalName) => {
  const stamp = Date.now();
  const safe = sanitizeFilename(originalName);
  return `${userId}/${kind}/${stamp}-${safe}`;
};

/**
 * Upload to Supabase Storage and record in uploaded_files.
 * Marks any previous upload of the same kind for this user as not current.
 */
export const storeUpload = async ({ userId, kind, buffer, mimetype, originalname }) => {
  const bucket = STORAGE_BUCKETS[kind];
  if (!bucket) throw new Error(`Unknown upload kind: ${kind}`);

  const supabase = getSupabase();
  const storagePath = buildStoragePath(userId, kind, originalname);

  const { error: uploadErr } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType: mimetype,
    upsert: false
  });
  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`);
  }

  const { data: signed } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

  await db.query(
    `UPDATE uploaded_files
       SET is_current = FALSE
     WHERE user_id = $1 AND kind = $2 AND is_current = TRUE`,
    [userId, kind]
  );

  const result = await db.query(
    `INSERT INTO uploaded_files
        (user_id, kind, storage_provider, bucket, storage_path, public_url,
         original_filename, mime_type, size_bytes, checksum, is_current)
     VALUES ($1, $2, 'supabase', $3, $4, $5, $6, $7, $8, $9, TRUE)
     RETURNING *`,
    [
      userId,
      kind,
      bucket,
      storagePath,
      signed ? signed.signedUrl : null,
      originalname,
      mimetype,
      buffer.length,
      hashBuffer(buffer)
    ]
  );

  return result.rows[0];
};

export const getCurrentFile = async (userId, kind) => {
  const result = await db.query(
    `SELECT *
       FROM uploaded_files
      WHERE user_id = $1 AND kind = $2 AND is_current = TRUE AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1`,
    [userId, kind]
  );
  return result.rows[0] || null;
};

export const refreshSignedUrl = async (fileRow, expiresInSeconds = 60 * 60 * 24 * 7) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(fileRow.bucket)
    .createSignedUrl(fileRow.storage_path, expiresInSeconds);
  if (error) throw new Error(`Signed URL error: ${error.message}`);
  return data.signedUrl;
};

export const softDelete = async (userId, fileId) => {
  const result = await db.query(
    `UPDATE uploaded_files
        SET deleted_at = now(), is_current = FALSE
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
    [fileId, userId]
  );
  return result.rows[0] || null;
};
