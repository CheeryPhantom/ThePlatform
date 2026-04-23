-- Phase 1 + 2: Profile depth, structured address, file storage,
-- certifications catalog and gamified badges, course progress reminders.
-- Safe to re-run: all ALTERs use IF NOT EXISTS, all CREATEs are guarded.

-- ---------------------------------------------------------------------------
-- user_profiles: split name, address pieces, profile photo, DOB
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS province_code TEXT,
  ADD COLUMN IF NOT EXISTS district_code TEXT,
  ADD COLUMN IF NOT EXISTS municipality_code TEXT,
  ADD COLUMN IF NOT EXISTS ward_number SMALLINT,
  ADD COLUMN IF NOT EXISTS address_line TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'NP';

-- Backfill first_name/last_name from legacy full_name where missing.
UPDATE user_profiles
SET
  first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
  last_name  = COALESCE(
                  last_name,
                  NULLIF(regexp_replace(full_name, '^\S+\s*', ''), '')
               )
WHERE full_name IS NOT NULL
  AND (first_name IS NULL OR last_name IS NULL);

-- Length guards keep bogus input out at the DB layer.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_first_name_len') THEN
    ALTER TABLE user_profiles
      ADD CONSTRAINT user_profiles_first_name_len  CHECK (first_name  IS NULL OR char_length(first_name)  BETWEEN 1 AND 60),
      ADD CONSTRAINT user_profiles_middle_name_len CHECK (middle_name IS NULL OR char_length(middle_name) BETWEEN 1 AND 60),
      ADD CONSTRAINT user_profiles_last_name_len   CHECK (last_name   IS NULL OR char_length(last_name)   BETWEEN 1 AND 60),
      ADD CONSTRAINT user_profiles_headline_len    CHECK (headline    IS NULL OR char_length(headline)    <= 160),
      ADD CONSTRAINT user_profiles_address_line_len CHECK (address_line IS NULL OR char_length(address_line) <= 200),
      ADD CONSTRAINT user_profiles_ward_range      CHECK (ward_number IS NULL OR ward_number BETWEEN 1 AND 35),
      ADD CONSTRAINT user_profiles_experience_range CHECK (experience_years IS NULL OR experience_years BETWEEN 0 AND 60);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- uploaded_files: track every uploaded asset with owner and storage metadata
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploaded_files (
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

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_kind
  ON uploaded_files(user_id, kind)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- user_certifications: user-submitted external certifications (CS50, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_certifications (
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

CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_status ON user_certifications(status);
CREATE INDEX IF NOT EXISTS idx_user_certifications_tier ON user_certifications(tier);

-- ---------------------------------------------------------------------------
-- user_badges: awarded trophies shown in the profile trophy case
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_badges (
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

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ---------------------------------------------------------------------------
-- training_enrollments: activity tracking for "continue learning" + reminders
-- ---------------------------------------------------------------------------
ALTER TABLE training_enrollments
  ADD COLUMN IF NOT EXISTS percent_complete SMALLINT DEFAULT 0
    CHECK (percent_complete BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reminder_snoozed_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reminders_sent INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_training_enrollments_user_id ON training_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_last_activity
  ON training_enrollments(last_activity_at)
  WHERE status = 'enrolled';

-- ---------------------------------------------------------------------------
-- user_activity_streaks: for gamification (daily activity, applications, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_activity_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak_days INT NOT NULL DEFAULT 0,
  longest_streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
