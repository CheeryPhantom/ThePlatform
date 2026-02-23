import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { listNotifications, markNotificationAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(authenticate);
router.get('/', listNotifications);
router.patch('/:id/read', markNotificationAsRead);

export default router;
