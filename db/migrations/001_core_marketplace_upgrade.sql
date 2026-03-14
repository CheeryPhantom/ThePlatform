-- Core marketplace schema upgrade
-- Apply this to an existing database created from an earlier version of db/schema.sql.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS preferred_title TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS work_authorization TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles
      ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'employers_user_id_key'
  ) THEN
    ALTER TABLE employers
      ADD CONSTRAINT employers_user_id_key UNIQUE (user_id);
  END IF;
END $$;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS salary_min NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS salary_max NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS application_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

UPDATE jobs
SET status = CASE
  WHEN active = FALSE OR closed_at IS NOT NULL THEN 'closed'
  ELSE 'published'
END
WHERE status IS NULL;

ALTER TABLE jobs
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_status_check'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_status_check
      CHECK (status IN ('draft', 'published', 'closed'));
  END IF;
END $$;

ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

UPDATE job_applications
SET status = 'submitted'
WHERE status IS NULL;

ALTER TABLE job_applications
  ALTER COLUMN status SET DEFAULT 'submitted',
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'job_applications_status_check'
  ) THEN
    ALTER TABLE job_applications
      ADD CONSTRAINT job_applications_status_check
      CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'job_applications_job_id_user_id_key'
  ) THEN
    ALTER TABLE job_applications
      ADD CONSTRAINT job_applications_job_id_user_id_key UNIQUE (job_id, user_id);
  END IF;
END $$;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID DEFAULT gen_random_uuid();

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS link TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON employers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by_user_id ON jobs(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
