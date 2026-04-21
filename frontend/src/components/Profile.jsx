import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { apiFetch } from '../api/api';
import DashboardLayout from './DashboardLayout';
import AddressPicker from './profile/AddressPicker';
import SkillsInput from './profile/SkillsInput';
import PreferencesSection from './profile/PreferencesSection';
import ResumeUpload from './profile/ResumeUpload';
import TrophyCase from './profile/TrophyCase';
import {
  LIMITS,
  requiredText,
  optionalText,
  validatePhone,
  validateUrl
} from '../utils/validation';
import './Profile.css';

const emptyProfile = {
  first_name: '',
  middle_name: '',
  last_name: '',
  phone: '',
  headline: '',
  date_of_birth: '',
  gender: '',

  province_code: '',
  district_code: '',
  municipality_code: '',
  ward_number: '',
  address_line: '',
  postal_code: '',
  country_code: 'NP',

  experience_years: '',
  skills: [],

  linkedin_url: '',
  github_url: '',
  portfolio_url: '',

  availability: '',
  work_authorization: '',
  preferred_title: '',

  preferences: {
    employment_types: [],
    work_modes: [],
    willing_to_relocate: false,
    notice_period_days: null,
    expected_salary: { currency: 'NPR', min: '', max: '', period: 'month' },
    preferred_company_sizes: [],
    open_to_work: false
  },
  resume_url: ''
};

const Profile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await apiFetch('users/profile').catch((err) => {
        if (err.status === 404) return null;
        throw err;
      });
      if (data) {
        setProfile({
          ...emptyProfile,
          ...data,
          preferences: { ...emptyProfile.preferences, ...(data.preferences || {}) }
        });
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  }

  const set = (patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    setSaveSuccess(false);
  };

  const validate = () => {
    const e = {};
    const first = requiredText(profile.first_name, 'First name', {
      min: LIMITS.firstName.min,
      max: LIMITS.firstName.max
    });
    if (first) e.first_name = first;
    const last = requiredText(profile.last_name, 'Last name', {
      min: LIMITS.lastName.min,
      max: LIMITS.lastName.max
    });
    if (last) e.last_name = last;
    const mid = optionalText(profile.middle_name, 'Middle name', { max: LIMITS.middleName.max });
    if (mid) e.middle_name = mid;
    const headline = optionalText(profile.headline, 'Headline', { max: LIMITS.headline.max });
    if (headline) e.headline = headline;
    const phone = validatePhone(profile.phone);
    if (phone) e.phone = phone;
    const li = validateUrl(profile.linkedin_url, 'LinkedIn URL');
    if (li) e.linkedin_url = li;
    const gh = validateUrl(profile.github_url, 'GitHub URL');
    if (gh) e.github_url = gh;
    const pf = validateUrl(profile.portfolio_url, 'Portfolio URL');
    if (pf) e.portfolio_url = pf;
    if (profile.experience_years !== '' && profile.experience_years != null) {
      const n = Number(profile.experience_years);
      if (!Number.isInteger(n) || n < 0 || n > LIMITS.experienceMax) {
        e.experience_years = `Enter a whole number between 0 and ${LIMITS.experienceMax}`;
      }
    }
    if (profile.ward_number !== '' && profile.ward_number != null) {
      const n = Number(profile.ward_number);
      if (!Number.isInteger(n) || n < LIMITS.wardMin || n > LIMITS.wardMax) {
        e.ward_number = `Ward must be between ${LIMITS.wardMin} and ${LIMITS.wardMax}`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sanitizeForSave = () => {
    const p = { ...profile };
    const numOrNull = (v) => (v === '' || v == null ? null : Number(v));
    p.experience_years = numOrNull(p.experience_years);
    p.ward_number = numOrNull(p.ward_number);
    if (p.preferences?.expected_salary) {
      p.preferences = {
        ...p.preferences,
        expected_salary: {
          ...p.preferences.expected_salary,
          min: numOrNull(p.preferences.expected_salary.min),
          max: numOrNull(p.preferences.expected_salary.max)
        }
      };
    }
    return p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await apiFetch('users/profile', {
        method: 'PUT',
        body: JSON.stringify(sanitizeForSave())
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      setSaveSuccess(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const changeExperience = (delta) => {
    const current = Number(profile.experience_years) || 0;
    const next = Math.max(0, Math.min(LIMITS.experienceMax, current + delta));
    set({ experience_years: String(next) });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <form onSubmit={handleSubmit}>
          <div className="profile-container">

            {/* Basic Information */}
            <section className="profile-section">
              <h2 className="profile-section-title">Basic information</h2>
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">First name</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={LIMITS.firstName.max}
                      value={profile.first_name}
                      onChange={(e) => set({ first_name: e.target.value })}
                      placeholder="Sita"
                    />
                    {errors.first_name && <div className="error-message">{errors.first_name}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Middle name</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={LIMITS.middleName.max}
                      value={profile.middle_name}
                      onChange={(e) => set({ middle_name: e.target.value })}
                      placeholder="Optional"
                    />
                    {errors.middle_name && <div className="error-message">{errors.middle_name}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Last name</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={LIMITS.lastName.max}
                      value={profile.last_name}
                      onChange={(e) => set({ last_name: e.target.value })}
                      placeholder="Sharma"
                    />
                    {errors.last_name && <div className="error-message">{errors.last_name}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Professional headline</label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={LIMITS.headline.max}
                    value={profile.headline}
                    onChange={(e) => set({ headline: e.target.value })}
                    placeholder="e.g. Full-stack engineer with 3 years building fintech"
                  />
                  <div className="field-hint">
                    {(profile.headline || '').length}/{LIMITS.headline.max}
                  </div>
                  {errors.headline && <div className="error-message">{errors.headline}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={profile.phone}
                      onChange={(e) => set({ phone: e.target.value })}
                      placeholder="+977-98XXXXXXXX"
                    />
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of birth</label>
                    <input
                      type="date"
                      className="form-input"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => set({ date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-input"
                      value={profile.gender || ''}
                      onChange={(e) => set({ gender: e.target.value })}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non_binary">Non-binary</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="profile-section">
              <h2 className="profile-section-title">Address</h2>
              <div className="profile-form">
                <AddressPicker
                  value={profile}
                  onChange={(next) => setProfile((prev) => ({ ...prev, ...next }))}
                  errors={errors}
                />
                {errors.ward_number && <div className="error-message">{errors.ward_number}</div>}
              </div>
            </section>

            {/* Experience */}
            <section className="profile-section">
              <h2 className="profile-section-title">Experience</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Years of experience</label>
                  <div className="experience-input-container">
                    <input
                      type="number"
                      className="experience-input"
                      value={profile.experience_years}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d+$/.test(v)) set({ experience_years: v });
                      }}
                      placeholder="0"
                      min="0"
                      max={LIMITS.experienceMax}
                    />
                    <div className="experience-buttons">
                      <button type="button" className="experience-btn" onClick={() => changeExperience(-1)}>
                        <Minus size={16} />
                      </button>
                      <button type="button" className="experience-btn" onClick={() => changeExperience(1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  {errors.experience_years && <div className="error-message">{errors.experience_years}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred job title</label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={LIMITS.headline.max}
                    value={profile.preferred_title || ''}
                    onChange={(e) => set({ preferred_title: e.target.value })}
                    placeholder="e.g. Senior React Engineer"
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="profile-section">
              <h2 className="profile-section-title">Skills</h2>
              <div className="profile-form">
                <SkillsInput
                  value={profile.skills || []}
                  onChange={(skills) => set({ skills })}
                  error={errors.skills}
                />
              </div>
            </section>

            {/* Online presence */}
            <section className="profile-section">
              <h2 className="profile-section-title">Online presence</h2>
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      className="form-input"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => set({ linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/yourhandle"
                    />
                    {errors.linkedin_url && <div className="error-message">{errors.linkedin_url}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input
                      type="url"
                      className="form-input"
                      value={profile.github_url || ''}
                      onChange={(e) => set({ github_url: e.target.value })}
                      placeholder="https://github.com/yourhandle"
                    />
                    {errors.github_url && <div className="error-message">{errors.github_url}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Portfolio</label>
                    <input
                      type="url"
                      className="form-input"
                      value={profile.portfolio_url || ''}
                      onChange={(e) => set({ portfolio_url: e.target.value })}
                      placeholder="https://yourname.dev"
                    />
                    {errors.portfolio_url && <div className="error-message">{errors.portfolio_url}</div>}
                  </div>
                </div>
              </div>
            </section>

            {/* Resume */}
            <section className="profile-section">
              <h2 className="profile-section-title">Resume</h2>
              <div className="profile-form">
                <ResumeUpload
                  currentUrl={profile.resume_url || null}
                  onUploaded={(file) => set({ resume_url: file ? file.url : '' })}
                />
              </div>
            </section>

            <PreferencesSection
              preferences={profile.preferences}
              availability={profile.availability}
              workAuthorization={profile.work_authorization}
              onPreferencesChange={(preferences) => set({ preferences })}
              onAvailabilityChange={(availability) => set({ availability })}
              onWorkAuthChange={(work_authorization) => set({ work_authorization })}
            />

            <TrophyCase />

            {/* Sticky footer */}
            <div className="profile-footer">
              <div className="profile-actions">
                <button type="button" className="cancel-btn" onClick={loadProfile}>
                  Reset
                </button>
                <button
                  type="submit"
                  className={`save-btn ${saving ? 'loading' : ''}`}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
              {saveSuccess && <div className="success-message">Profile saved.</div>}
              {errors.submit && <div className="error-message">{errors.submit}</div>}
            </div>

          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
