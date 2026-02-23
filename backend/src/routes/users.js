import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { getPublicUserProfile, getSettings, updateSettings } from '../controllers/userController.js';

const router = express.Router();

router.get('/:id/public-profile', getPublicUserProfile);

// Protect all routes
router.use(authenticate);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

router.get('/settings/me', getSettings);
router.put('/settings/me', updateSettings);

export default router;
