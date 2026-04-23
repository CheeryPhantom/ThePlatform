// Shared field limits kept in sync with backend Joi schemas.
export const LIMITS = Object.freeze({
  firstName: { min: 1, max: 60 },
  middleName: { max: 60 },
  lastName: { min: 1, max: 60 },
  headline: { max: 160 },
  addressLine: { max: 200 },
  skill: { max: 40 },
  maxSkills: 25,
  wardMin: 1,
  wardMax: 35,
  experienceMax: 60,
  resumeBytes: 5 * 1024 * 1024,
  photoBytes: 2 * 1024 * 1024,
  resumeMimes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  photoMimes: ['image/jpeg', 'image/png', 'image/webp']
});

export const NEPAL_PHONE_RE = /^(\+?977[-\s]?)?9[67][0-9]{8}$/;
export const URL_RE = /^https?:\/\/[^\s]{3,}$/i;

export const requiredText = (value, label, { min = 1, max = 200 } = {}) => {
  const v = (value ?? '').toString().trim();
  if (!v) return `${label} is required`;
  if (v.length < min) return `${label} must be at least ${min} characters`;
  if (v.length > max) return `${label} must be at most ${max} characters`;
  return null;
};

export const optionalText = (value, label, { max = 200 } = {}) => {
  if (value == null || value === '') return null;
  const v = value.toString();
  if (v.length > max) return `${label} must be at most ${max} characters`;
  return null;
};

export const validatePhone = (value) => {
  if (!value) return null;
  return NEPAL_PHONE_RE.test(value.trim())
    ? null
    : 'Enter a valid Nepali mobile (e.g. 98XXXXXXXX or +977-98XXXXXXXX)';
};

export const validateUrl = (value, label) => {
  if (!value) return null;
  return URL_RE.test(value.trim()) ? null : `${label} must be a valid http(s) URL`;
};

export const validateFile = (file, { maxBytes, mimes }) => {
  if (!file) return 'Please choose a file';
  if (!mimes.includes(file.type)) return `File type ${file.type || 'unknown'} is not allowed`;
  if (file.size > maxBytes) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB); max is ${(maxBytes / 1024 / 1024).toFixed(0)} MB`;
  }
  return null;
};

export const passwordStrength = (pw) => {
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>_\-\[\]\\/`~+=;']/.test(pw)
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return {
    checks,
    level: passed <= 1 ? 'weak' : passed <= 3 ? 'medium' : 'strong',
    passed
  };
};
