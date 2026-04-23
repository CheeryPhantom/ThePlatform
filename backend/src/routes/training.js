import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listCourses,
  myEnrollments,
  myStaleEnrollments,
  enroll,
  updateProgress,
  snoozeReminder
} from '../controllers/trainingController.js';

const router = express.Router();

router.get('/courses', listCourses);

router.use(authenticate);
router.get('/enrollments', myEnrollments);
router.get('/enrollments/stale', myStaleEnrollments);
router.post('/enrollments', enroll);
router.put('/enrollments/:id/progress', updateProgress);
router.post('/enrollments/:id/snooze', snoozeReminder);

export default router;
