import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

const missingVars = () => {
  const missing = [];
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
};

export const isSupabaseConfigured = () => missingVars().length === 0;

export const getSupabase = () => {
  if (cachedClient) return cachedClient;
  const missing = missingVars();
  if (missing.length) {
    throw new Error(
      `Supabase is not configured. Missing env vars: ${missing.join(', ')}. ` +
        'Set them in backend/.env. See DEPLOY.md for the storage setup.'
    );
  }
  cachedClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  return cachedClient;
};

export const STORAGE_BUCKETS = Object.freeze({
  resume: process.env.SUPABASE_RESUME_BUCKET || 'resumes',
  profile_photo: process.env.SUPABASE_PHOTO_BUCKET || 'profile-photos',
  employer_logo: process.env.SUPABASE_LOGO_BUCKET || 'employer-logos',
  certificate: process.env.SUPABASE_CERT_BUCKET || 'certificates',
  cover_letter: process.env.SUPABASE_COVER_BUCKET || 'cover-letters',
  other: process.env.SUPABASE_OTHER_BUCKET || 'other-uploads'
});
