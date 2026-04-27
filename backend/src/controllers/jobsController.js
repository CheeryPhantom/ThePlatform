import Joi from 'joi';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Employer from '../models/Employer.js';
import Profile from '../models/Profile.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';

const requirementsSchema = Joi.object({
  skills: Joi.array().items(Joi.string().trim().max(40)).max(30).default([]),
  years_of_experience_min: Joi.number().integer().min(0).max(60).allow(null),
  nice_to_haves: Joi.array().items(Joi.string().trim().max(120)).max(20).default([])
}).unknown(false);

const screeningQuestionSchema = Joi.object({
  id: Joi.string().max(64).required(),
  label: Joi.string().trim().min(2).max(280).required(),
  type: Joi.string().valid('text', 'select', 'yes_no').default('text'),
  required: Joi.boolean().default(false),
  options: Joi.array().items(Joi.string().trim().max(80)).max(10).default([])
}).unknown(false);

const locationSchema = Joi.object({
  country: Joi.string().max(60).default('Nepal'),
  province: Joi.string().max(60).allow('', null),
  city: Joi.string().max(80).allow('', null),
  address_line: Joi.string().max(200).allow('', null)
}).unknown(false);

const jobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160).required(),
  description: Joi.string().trim().max(10000).allow('', null),
  requirements: requirementsSchema.allow(null),
  location: locationSchema.allow(null),
  is_remote: Joi.boolean().default(false),
  employment_type: Joi.string()
    .valid('full_time', 'part_time', 'contract', 'internship', 'freelance', 'temporary')
    .allow(null, ''),
  experience_level: Joi.string()
    .valid('intern', 'junior', 'mid', 'senior', 'lead')
    .allow(null, ''),
  currency: Joi.string().valid('NPR', 'USD', 'INR').default('NPR'),
  salary_min: Joi.number().min(0).allow(null),
  salary_max: Joi.number().min(0).allow(null),
  application_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
  status: Joi.string().valid('draft', 'published', 'closed').default('draft'),
  metadata: Joi.object().unknown(true).allow(null),
  screening_questions: Joi.array().items(screeningQuestionSchema).max(15).default([])
}).unknown(false).custom((value, helpers) => {
  if (
    value.salary_min != null &&
    value.salary_max != null &&
    value.salary_max < value.salary_min
  ) {
    return helpers.error('any.invalid', { message: 'salary_max must be >= salary_min' });
  }
  return value;
});

const applySchema = Joi.object({
  cover_letter: Joi.string().trim().max(4000).allow('', null),
  resume_url: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null),
  answers: Joi.object().pattern(Joi.string(), Joi.string().allow('').max(2000)).default({})
}).unknown(false);

const applicantUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('submitted', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired')
    .optional(),
  internal_notes: Joi.string().max(4000).allow('', null).optional()
}).unknown(false).min(1);

const requireEmployer = async (userId) => {
  const employer = await Employer.findByUserId(userId);
  if (!employer) {
    const err = new Error('Employer profile required. Complete your company profile first.');
    err.status = 400;
    throw err;
  }
  return employer;
};

// Simple match score: overlap between job required skills and candidate skills.
const computeMatch = (requiredSkills, candidateSkills) => {
  if (!Array.isArray(requiredSkills) || !requiredSkills.length) {
    return { score: null, matched: [], missing: [] };
  }
  const candidateSet = new Set(
    (candidateSkills || []).map((s) => String(s).trim().toLowerCase())
  );
  const matched = [];
  const missing = [];
  for (const sk of requiredSkills) {
    if (candidateSet.has(String(sk).trim().toLowerCase())) matched.push(sk);
    else missing.push(sk);
  }
  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
};

// ---------- Public / candidate endpoints ----------

export const listPublished = async (req, res) => {
  try {
    const search = (req.query.q || '').toString().trim();
    const location = (req.query.location || '').toString().trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const jobs = await Job.listPublished({ search, location, limit, offset });

    let candidateSkills = [];
    let savedSet = new Set();
    if (req.user && req.user.role !== 'employer') {
      const profile = await Profile.findByUserId(req.user.id);
      candidateSkills = profile?.skills || [];
      savedSet = new Set(await SavedJob.idsForUser(req.user.id));
    }

    const annotated = jobs.map((j) => {
      const requiredSkills = (j.requirements && j.requirements.skills) || [];
      const match = computeMatch(requiredSkills, candidateSkills);
      return { ...j, match, saved: savedSet.has(j.id) };
    });
    res.json({ jobs: annotated });
  } catch (err) {
    console.error('listPublished err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const requiredSkills = (job.requirements && job.requirements.skills) || [];
    let match = { score: null, matched: [], missing: [] };
    let alreadyApplied = false;
    let ownedByMe = false;

    let saved = false;
    if (req.user) {
      if (req.user.role === 'employer') {
        const employer = await Employer.findByUserId(req.user.id);
        ownedByMe = !!(employer && employer.id === job.employer_id);
      } else {
        const profile = await Profile.findByUserId(req.user.id);
        match = computeMatch(requiredSkills, profile?.skills || []);
        const existing = await Application.findExisting(job.id, req.user.id);
        alreadyApplied = !!existing;
        const savedIds = await SavedJob.idsForUser(req.user.id);
        saved = savedIds.includes(job.id);
      }
    }

    if (job.status !== 'published' && !ownedByMe) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      job: { ...job, match, already_applied: alreadyApplied, owned_by_me: ownedByMe, saved }
    });
  } catch (err) {
    console.error('getJob err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const apply = async (req, res) => {
  try {
    const { error, value } = applySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'published') {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (req.user.role === 'employer') {
      return res.status(403).json({ error: 'Employers cannot apply to jobs' });
    }

    // Enforce required screening questions, if any.
    const questions = Array.isArray(job.screening_questions) ? job.screening_questions : [];
    const answers = value.answers || {};
    for (const q of questions) {
      if (q.required) {
        const a = (answers[q.id] || '').toString().trim();
        if (!a) {
          return res.status(400).json({
            error: `Please answer: ${q.label}`,
            field: q.id
          });
        }
      }
    }

    const app = await Application.create(job.id, req.user.id, value);

    // Notify the employer who created the listing (best-effort)
    if (job.created_by_user_id) {
      try {
        await Notification.create({
          userId: job.created_by_user_id,
          actorId: req.user.id,
          category: 'application',
          type: 'application.received',
          link: `/jobs/${job.id}`,
          payload: { job_id: job.id, job_title: job.title, applicant_id: req.user.id }
        });
      } catch {
        // ignore — notifications are non-critical
      }
    }

    res.status(201).json({ application: app });
  } catch (err) {
    console.error('apply err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const withdrawn = await Application.withdraw(req.params.id, req.user.id);
    if (!withdrawn) return res.status(404).json({ error: 'Application not found' });
    res.json({ application: withdrawn });
  } catch (err) {
    console.error('withdraw err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateApplicant = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const { error, value } = applicantUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const before = await Application.findById(req.params.applicationId);
    if (!before || before.employer_id !== employer.id) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = await Application.updateAsEmployer(req.params.applicationId, employer.id, value);
    if (!updated) return res.status(404).json({ error: 'Application not found' });

    // If status changed, notify the candidate.
    if (value.status && value.status !== before.status) {
      try {
        await Notification.create({
          userId: before.candidate_user_id,
          actorId: req.user.id,
          category: 'application',
          type: `application.status.${value.status}`,
          link: `/applications`,
          payload: { job_id: before.job_id, job_title: before.job_title, status: value.status }
        });
      } catch {
        // ignore
      }
    }

    res.json({ application: updated });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('updateApplicant err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

export const myApplications = async (req, res) => {
  try {
    const apps = await Application.listForUser(req.user.id);
    res.json({ applications: apps });
  } catch (err) {
    console.error('myApplications err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- Employer endpoints ----------

export const listMine = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const jobs = await Job.listForEmployer(employer.id);
    res.json({ jobs });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('listMine err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

export const create = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const { error, value } = jobSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({ path: d.path.join('.'), message: d.message }))
      });
    }
    const created = await Job.create(employer.id, req.user.id, value);
    res.status(201).json({ job: created });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('create job err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const { error, value } = jobSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => ({ path: d.path.join('.'), message: d.message }))
      });
    }
    const updated = await Job.update(req.params.id, employer.id, value);
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: updated });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('update job err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

export const setStatus = (status) => async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const updated = await Job.setStatus(req.params.id, employer.id, status);
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: updated });
  } catch (err) {
    const statusCode = err.status || 500;
    if (statusCode === 500) console.error('setStatus err', err);
    res.status(statusCode).json({ error: err.message || 'Internal server error' });
  }
};

export const remove = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const deleted = await Job.delete(req.params.id, employer.id);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.json({ ok: true });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('delete job err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

export const listApplicants = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const apps = await Application.listForJob(req.params.id, employer.id);
    res.json({ applicants: apps });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('listApplicants err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

export const duplicateJob = async (req, res) => {
  try {
    const employer = await requireEmployer(req.user.id);
    const cloned = await Job.duplicate(req.params.id, employer.id, req.user.id);
    if (!cloned) return res.status(404).json({ error: 'Job not found' });
    res.status(201).json({ job: cloned });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('duplicateJob err', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  }
};

// ---------- Saved jobs ----------

export const saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'published') {
      return res.status(404).json({ error: 'Job not found' });
    }
    await SavedJob.save(req.user.id, job.id);
    res.json({ saved: true, job_id: job.id });
  } catch (err) {
    console.error('saveJob err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    await SavedJob.unsave(req.user.id, req.params.id);
    res.json({ saved: false, job_id: req.params.id });
  } catch (err) {
    console.error('unsaveJob err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const mySavedJobs = async (req, res) => {
  try {
    const ids = await SavedJob.idsForUser(req.user.id);
    if (!ids.length) return res.json({ jobs: [] });
    // Fetch all published saved jobs in one go.
    const jobs = await Promise.all(ids.map((id) => Job.findById(id)));
    const profile = await Profile.findByUserId(req.user.id);
    const candidateSkills = profile?.skills || [];
    const annotated = jobs
      .filter((j) => j && j.status === 'published')
      .map((j) => {
        const requiredSkills = (j.requirements && j.requirements.skills) || [];
        return { ...j, match: computeMatch(requiredSkills, candidateSkills), saved: true };
      });
    res.json({ jobs: annotated });
  } catch (err) {
    console.error('mySavedJobs err', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
