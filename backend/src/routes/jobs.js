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
  listApplicants,
  duplicateJob,
  withdrawApplication,
  updateApplicant,
  saveJob,
  unsaveJob,
  mySavedJobs
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

// Public feed with optional auth for match scoring + saved flag.
router.get('/', optionalAuth, listPublished);

// Candidate: applications + saved jobs
router.get('/applications/mine', authenticate, myApplications);
router.post('/applications/:id/withdraw', authenticate, withdrawApplication);
router.get('/saved', authenticate, mySavedJobs);

// Employer: list my jobs
router.get('/mine', authenticate, listMine);

// Employer: create + update + status transitions + delete + duplicate
router.post('/', authenticate, create);
router.put('/:id', authenticate, update);
router.post('/:id/publish', authenticate, setStatus('published'));
router.post('/:id/close', authenticate, setStatus('closed'));
router.post('/:id/unpublish', authenticate, setStatus('draft'));
router.post('/:id/duplicate', authenticate, duplicateJob);
router.delete('/:id', authenticate, remove);

// Employer: applicants for a specific job + per-applicant updates
router.get('/:id/applicants', authenticate, listApplicants);
router.put('/applicants/:applicationId', authenticate, updateApplicant);

// Candidate apply + bookmark
router.post('/:id/apply', authenticate, apply);
router.post('/:id/save', authenticate, saveJob);
router.delete('/:id/save', authenticate, unsaveJob);

// Public single job (put after /mine etc. to avoid conflicts)
router.get('/:id', optionalAuth, getJob);

export default router;
