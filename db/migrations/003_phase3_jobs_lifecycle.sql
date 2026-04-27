-- Phase 3: saved jobs, screening questions, application answers,
-- pipeline notes, applicant notes. Idempotent.

-- ---------------------------------------------------------------------------
-- saved_jobs: candidate bookmarks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);

-- ---------------------------------------------------------------------------
-- jobs.screening_questions: per-job custom questions captured during apply.
-- Schema (JSONB array):
--   [{"id":"uuid", "label":"Why are you interested?", "type":"text"|"select"|"yes_no",
--     "required":true, "options":["A","B"]}]
-- ---------------------------------------------------------------------------
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS screening_questions JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- job_applications.answers: candidate's answers keyed by question id.
-- Schema: { "<question-id>": "answer string" }
-- Plus internal employer notes stored alongside the application.
-- ---------------------------------------------------------------------------
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Pipeline stages: existing status column already supports
-- submitted/reviewing/shortlisted/interview/rejected/hired.
-- We add a 'withdrawn' state for candidate self-withdraw.
DO $$
BEGIN
  -- Drop the existing CHECK if present, recreate with withdrawn.
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_status_check') THEN
    ALTER TABLE job_applications DROP CONSTRAINT job_applications_status_check;
  END IF;
  ALTER TABLE job_applications
    ADD CONSTRAINT job_applications_status_check
    CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired', 'withdrawn'));
END $$;
