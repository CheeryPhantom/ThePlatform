import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

export default router;
