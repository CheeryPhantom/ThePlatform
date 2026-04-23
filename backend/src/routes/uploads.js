import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.js';
import {
  uploadResume,
  uploadProfilePhoto,
  uploadEmployerLogo,
  uploadCertificate,
  getMyCurrentFile,
  deleteMyFile
} from '../controllers/uploadsController.js';

const router = express.Router();
router.use(authenticate);

router.post('/resume', uploadMiddleware('resume'), handleUploadError, uploadResume);
router.post('/profile-photo', uploadMiddleware('profile_photo'), handleUploadError, uploadProfilePhoto);
router.post('/employer-logo', uploadMiddleware('employer_logo'), handleUploadError, uploadEmployerLogo);
router.post('/certificate', uploadMiddleware('certificate'), handleUploadError, uploadCertificate);

router.get('/current/resume', getMyCurrentFile('resume'));
router.get('/current/profile-photo', getMyCurrentFile('profile_photo'));
router.get('/current/employer-logo', getMyCurrentFile('employer_logo'));

router.delete('/:id', deleteMyFile);

export default router;
