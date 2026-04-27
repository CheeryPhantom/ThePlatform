-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('candidate','employer','admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  first_name TEXT CHECK (first_name IS NULL OR char_length(first_name) BETWEEN 1 AND 60),
  middle_name TEXT CHECK (middle_name IS NULL OR char_length(middle_name) BETWEEN 1 AND 60),
  last_name TEXT CHECK (last_name IS NULL OR char_length(last_name) BETWEEN 1 AND 60),
  phone TEXT,
  headline TEXT CHECK (headline IS NULL OR char_length(headline) <= 160),
  location JSONB,
  province_code TEXT,
  district_code TEXT,
  municipality_code TEXT,
  ward_number SMALLINT CHECK (ward_number IS NULL OR ward_number BETWEEN 1 AND 35),
  address_line TEXT CHECK (address_line IS NULL OR char_length(address_line) <= 200),
  postal_code TEXT,
  country_code TEXT DEFAULT 'NP',
  date_of_birth DATE,
  gender TEXT,
  profile_photo_url TEXT,
  experience_years INT CHECK (experience_years IS NULL OR experience_years BETWEEN 0 AND 60),
  skills TEXT[],
  certifications JSONB,
  resume_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  preferred_title TEXT,
  availability TEXT,
  work_authorization TEXT,
  preferences JSONB,
  last_assessment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_profiles_skills ON user_profiles USING GIN (skills);

-- Employers
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT,
  website TEXT,
  bio TEXT,
  logo_url TEXT,
  location TEXT,
  industry TEXT,
  company_size TEXT,
  founded_year INT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  location JSONB,
  is_remote BOOLEAN DEFAULT FALSE,
  employment_type TEXT,
  experience_level TEXT,
  currency TEXT,
  salary_min NUMERIC(10,2),
  salary_max NUMERIC(10,2),
  salary_range JSONB,
  application_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  active BOOLEAN DEFAULT TRUE,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_jobs_document ON jobs USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS screening_questions JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  notes TEXT,
  internal_notes TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (job_id, user_id)
);

-- Saved jobs (candidate bookmarks)
CREATE TABLE saved_jobs (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);

-- Assessment
CREATE TABLE assessment_question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES assessment_question_sets(id) ON DELETE CASCADE,
  key TEXT,
  qtype TEXT,
  prompt TEXT,
  meta JSONB,
  branching JSONB,
  weight JSONB,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID REFERENCES assessment_question_sets(id),
  answers JSONB,
  progress_percent SMALLINT DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  result JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES assessment_responses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  traits JSONB,
  recommended_tags TEXT[],
  recommended_courses JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Training courses
CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  provider TEXT,
  external_url TEXT,
  description TEXT,
  duration INT,
  skills_covered TEXT[],
  price NUMERIC(10,2),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES training_courses(id),
  user_id UUID REFERENCES users(id),
  progress JSONB,
  percent_complete SMALLINT DEFAULT 0 CHECK (percent_complete BETWEEN 0 AND 100),
  status TEXT DEFAULT 'enrolled',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reminder_snoozed_until TIMESTAMP WITH TIME ZONE,
  reminders_sent INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_training_enrollments_user_id ON training_enrollments(user_id);
CREATE INDEX idx_training_enrollments_last_activity
  ON training_enrollments(last_activity_at)
  WHERE status = 'enrolled';

-- Notifications, messages, audit logs
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID DEFAULT gen_random_uuid(),
  from_user UUID REFERENCES users(id),
  to_user UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  actor_id UUID REFERENCES users(id),
  category TEXT,
  type TEXT,
  link TEXT,
  payload JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor UUID,
  action TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Uploaded files (resumes, logos, photos, certificates)
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('resume', 'profile_photo', 'employer_logo', 'certificate', 'cover_letter', 'other')),
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes BIGINT CHECK (size_bytes IS NULL OR size_bytes BETWEEN 0 AND 52428800),
  checksum TEXT,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_uploaded_files_user_kind
  ON uploaded_files(user_id, kind)
  WHERE deleted_at IS NULL;

-- User-submitted certifications (CS50, freeCodeCamp, Google Career Cert, etc.)
CREATE TABLE user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_slug TEXT,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  issuer TEXT NOT NULL CHECK (char_length(issuer) BETWEEN 2 AND 120),
  issue_date DATE,
  expiry_date DATE,
  credential_url TEXT,
  credential_id TEXT,
  proof_file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'auto_verified', 'verified', 'rejected', 'expired')),
  tier TEXT NOT NULL DEFAULT 'bronze'
    CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  skills_covered TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_status ON user_certifications(status);
CREATE INDEX idx_user_certifications_tier ON user_certifications(tier);

-- Awarded badges (trophy case)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  label TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  source TEXT NOT NULL CHECK (source IN ('certification', 'assessment', 'training', 'streak', 'manual')),
  source_id UUID,
  icon TEXT,
  description TEXT,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, badge_key, source_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Daily activity streak
CREATE TABLE user_activity_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak_days INT NOT NULL DEFAULT 0,
  longest_streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_jobs_tags ON jobs USING GIN ((metadata->'tags'));
CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_employers_user_id ON employers(user_id);
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_created_by_user_id ON jobs(created_by_user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_category ON notifications(category);
