import multer from 'multer';

export const UPLOAD_LIMITS = Object.freeze({
  resume: { maxBytes: 5 * 1024 * 1024, mimes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  profile_photo: { maxBytes: 2 * 1024 * 1024, mimes: ['image/jpeg', 'image/png', 'image/webp'] },
  employer_logo: { maxBytes: 2 * 1024 * 1024, mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
  certificate: { maxBytes: 5 * 1024 * 1024, mimes: ['application/pdf', 'image/jpeg', 'image/png'] },
  cover_letter: { maxBytes: 2 * 1024 * 1024, mimes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] }
});

export const uploadMiddleware = (kind) => {
  const cfg = UPLOAD_LIMITS[kind];
  if (!cfg) throw new Error(`Unknown upload kind: ${kind}`);
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: cfg.maxBytes, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!cfg.mimes.includes(file.mimetype)) {
        return cb(
          Object.assign(new Error(`Invalid file type: ${file.mimetype}`), { status: 415 })
        );
      }
      cb(null, true);
    }
  }).single('file');
};

export const handleUploadError = (err, _req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File is too large' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  next(err);
};
