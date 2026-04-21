import { db } from '../db.js';
import { storeUpload, getCurrentFile, refreshSignedUrl, softDelete } from '../services/fileStorage.js';
import { isSupabaseConfigured } from '../config/supabase.js';

const ensureConfigured = (res) => {
  if (isSupabaseConfigured()) return true;
  res.status(503).json({
    error:
      'File uploads are not configured. Ask an admin to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  });
  return false;
};

const uploadHandler = (kind, { updateProfileField } = {}) => async (req, res) => {
  if (!ensureConfigured(res)) return;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });
  }

  try {
    const stored = await storeUpload({
      userId: req.user.id,
      kind,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    if (updateProfileField) {
      await db.query(
        `UPDATE user_profiles
            SET ${updateProfileField} = $1, updated_at = now()
          WHERE user_id = $2`,
        [stored.public_url, req.user.id]
      );
    }

    res.status(201).json({
      file: {
        id: stored.id,
        url: stored.public_url,
        kind: stored.kind,
        size_bytes: Number(stored.size_bytes),
        mime_type: stored.mime_type,
        original_filename: stored.original_filename,
        created_at: stored.created_at
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
};

export const uploadResume = uploadHandler('resume', { updateProfileField: 'resume_url' });
export const uploadProfilePhoto = uploadHandler('profile_photo', { updateProfileField: 'profile_photo_url' });
export const uploadEmployerLogo = uploadHandler('employer_logo');
export const uploadCertificate = uploadHandler('certificate');

export const getMyCurrentFile = (kind) => async (req, res) => {
  try {
    const file = await getCurrentFile(req.user.id, kind);
    if (!file) return res.status(404).json({ error: 'No current file' });
    if (isSupabaseConfigured()) {
      try {
        const url = await refreshSignedUrl(file);
        return res.json({ file: { ...file, public_url: url } });
      } catch {
        // fall through with stored URL
      }
    }
    res.json({ file });
  } catch (err) {
    console.error('Get file error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMyFile = async (req, res) => {
  try {
    const row = await softDelete(req.user.id, req.params.id);
    if (!row) return res.status(404).json({ error: 'File not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
