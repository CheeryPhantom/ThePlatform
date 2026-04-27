import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { list, markRead, markAllRead } from '../controllers/notificationsController.js';

const router = express.Router();
router.use(authenticate);

router.get('/', list);
router.post('/mark-read', markRead);
router.post('/mark-all-read', markAllRead);

export default router;
