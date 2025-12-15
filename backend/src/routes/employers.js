import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getEmployerProfile, updateEmployerProfile } from '../controllers/employerController.js';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// Get employer profile
router.get('/profile', requireRole('employer'), getEmployerProfile);

// Update employer profile
router.put('/profile', requireRole('employer'), updateEmployerProfile);

export default router;
