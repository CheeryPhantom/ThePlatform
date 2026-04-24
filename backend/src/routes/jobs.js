import express from 'express';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import {
  listPublished,
  getJob,
  apply,
  myApplications,
  listMine,
  create,
  update,
  setStatus,
  remove,
  listApplicants
} from '../controllers/jobsController.js';

const router = express.Router();

// Optional-auth: populate req.user if a valid Bearer token is present,
// otherwise continue as anonymous without erroring.
const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const decoded = User.verifyToken(header.substring(7));
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // ignore — treat as anonymous
  }
  next();
};

// Public feed with optional auth for match scoring.
router.get('/', optionalAuth, listPublished);

// Candidate: my applications
router.get('/applications/mine', authenticate, myApplications);

// Employer: list my jobs
router.get('/mine', authenticate, listMine);

// Employer: create + update + status transitions + delete
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.post('/:id/publish', authenticate, setStatus('published'));
router.post('/:id/close', authenticate, setStatus('closed'));
router.post('/:id/unpublish', authenticate, setStatus('draft'));
router.delete('/:id', authenticate, remove);

// Employer: applicants for a specific job
router.get('/:id/applicants', authenticate, listApplicants);

// Candidate apply
router.post('/:id/apply', authenticate, apply);

// Public single job (put after /mine etc. to avoid conflicts)
router.get('/:id', optionalAuth, getJob);

export default router;
