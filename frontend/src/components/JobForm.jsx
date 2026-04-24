import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, ArrowLeft, Trash2, X } from 'lucide-react';
import { apiFetch } from '../api/api';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import './JobForm.css';

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'temporary', label: 'Temporary' }
];

const EXPERIENCE_LEVELS = [
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior (0-2 yrs)' },
  { value: 'mid', label: 'Mid (3-5 yrs)' },
  { value: 'senior', label: 'Senior (6-9 yrs)' },
  { value: 'lead', label: 'Lead / Principal' }
];

const emptyJob = {
  title: '',
  description: '',
  requirements: { skills: [], years_of_experience_min: null, nice_to_haves: [] },
  location: { country: 'Nepal', province: '', city: '', address_line: '' },
  is_remote: false,
  employment_type: 'full_time',
  experience_level: 'mid',
  currency: 'NPR',
  salary_min: '',
  salary_max: '',
  application_url: ''
};

const JobForm = () => {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [job, setJob] = useState(emptyJob);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    apiFetch(`jobs/${id}`)
      .then((data) => {
        const j = data.job;
        setJob({
          ...emptyJob,
          ...j,
          requirements: { ...emptyJob.requirements, ...(j.requirements || {}) },
          location: { ...emptyJob.location, ...(j.location || {}) },
          salary_min: j.salary_min ?? '',
          salary_max: j.salary_max ?? ''
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'employer') {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const set = (patch) => {
    setJob((prev) => ({ ...prev, ...patch }));
    setFlash(null);
  };
  const setReq = (patch) => set({ requirements: { ...job.requirements, ...patch } });
  const setLoc = (patch) => set({ location: { ...job.location, ...patch } });

  const addSkill = () => {
    const clean = skillInput.trim();
    if (!clean) return;
    if (clean.length > 40) return;
    const skills = job.requirements.skills || [];
    if (skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkillInput('');
      return;
    }
    if (skills.length >= 30) return;
    setReq({ skills: [...skills, clean] });
    setSkillInput('');
  };

  const removeSkill = (name) =>
    setReq({
      skills: (job.requirements.skills || []).filter((s) => s !== name)
    });

  const buildPayload = (overrideStatus) => {
    const numOrNull = (v) => (v === '' || v == null ? null : Number(v));
    return {
      title: job.title.trim(),
      description: job.description?.trim() || null,
      requirements: job.requirements,
      location: job.location,
      is_remote: !!job.is_remote,
      employment_type: job.employment_type || null,
      experience_level: job.experience_level || null,
      currency: job.currency || 'NPR',
      salary_min: numOrNull(job.salary_min),
      salary_max: numOrNull(job.salary_max),
      application_url: job.application_url || null,
      status: overrideStatus || job.status || 'draft'
    };
  };

  const save = async (nextStatus) => {
    setError(null);
    setFlash(null);
    if (!job.title || job.title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return null;
    }
    const payload = buildPayload(nextStatus);
    try {
      if (isEdit) {
        setSaving(true);
        const res = await apiFetch(`jobs/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFlash('Saved');
        return res.job;
      } else {
        setSaving(true);
        const res = await apiFetch('jobs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        navigate(`/jobs/${res.job.id}/edit`, { replace: true });
        setFlash('Draft created');
        return res.job;
      }
    } catch (err) {
      setError(err.message || 'Save failed');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    const saved = await save('draft');
    if (!saved) {
      setPublishing(false);
      return;
    }
    try {
      await apiFetch(`jobs/${saved.id}/publish`, { method: 'POST' });
      setFlash('Published — candidates can now see this role');
      navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const remove = async () => {
    if (!isEdit) return;
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await apiFetch(`jobs/${id}`, { method: 'DELETE' });
      navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      </DashboardLayout>
    );
  }

  const skills = job.requirements?.skills || [];

  return (
    <DashboardLayout>
      <div className="job-form-page">
        <div className="job-form-header">
          <button type="button" className="back-btn" onClick={() => navigate('/jobs')}>
            <ArrowLeft size={16} /> Back to listings
          </button>
          <h1>{isEdit ? 'Edit listing' : 'Post a new role'}</h1>
          <p className="job-form-subtitle">
            {isEdit
              ? 'Update the details — you can save a draft and publish later.'
              : 'Fill out the essentials, save as a draft, and publish when you\'re ready.'}
          </p>
          {isEdit && job.status && (
            <span className={`job-status-badge status-${job.status}`}>{job.status}</span>
          )}
        </div>

        <div className="job-form-container">
          <form className="job-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <section className="profile-section">
              <h2 className="profile-section-title">Role</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label form-label-required">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={160}
                    value={job.title}
                    onChange={(e) => set({ title: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={8}
                    maxLength={10000}
                    value={job.description || ''}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="What the role is, what the candidate will do, what a great hire looks like…"
                  />
                  <div className="field-hint">
                    {(job.description || '').length} / 10000
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employment type</label>
                    <select
                      className="form-input"
                      value={job.employment_type || ''}
                      onChange={(e) => set({ employment_type: e.target.value })}
                    >
                      <option value="">Unspecified</option>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience level</label>
                    <select
                      className="form-input"
                      value={job.experience_level || ''}
                      onChange={(e) => set({ experience_level: e.target.value })}
                    >
                      <option value="">Unspecified</option>
                      {EXPERIENCE_LEVELS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2 className="profile-section-title">Requirements</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Required skills</label>
                  <div className="skill-entry">
                    <input
                      type="text"
                      className="form-input"
                      maxLength={40}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                    />
                    <button type="button" className="btn btn-secondary" onClick={addSkill}>
                      Add
                    </button>
                  </div>
                  <div className="skills-display" style={{ marginTop: '0.75rem' }}>
                    {skills.map((s) => (
                      <span key={s} className="skill-tag">
                        {s}
                        <button
                          type="button"
                          className="skill-tag-remove"
                          aria-label={`Remove ${s}`}
                          onClick={() => removeSkill(s)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="field-hint">
                    Candidates are scored on how many of these they have. Keep it to what's actually required.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum years of experience</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    max="60"
                    value={job.requirements.years_of_experience_min ?? ''}
                    onChange={(e) =>
                      setReq({
                        years_of_experience_min:
                          e.target.value === '' ? null : Number(e.target.value)
                      })
                    }
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2 className="profile-section-title">Location</h2>
              <div className="profile-form">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="job-remote"
                    className="checkbox-input"
                    checked={!!job.is_remote}
                    onChange={(e) => set({ is_remote: e.target.checked })}
                  />
                  <label htmlFor="job-remote" className="checkbox-label">
                    Remote role
                    <small>Candidates can work from anywhere</small>
                  </label>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={80}
                      value={job.location.city || ''}
                      onChange={(e) => setLoc({ city: e.target.value })}
                      placeholder="e.g. Kathmandu"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province / Region</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={60}
                      value={job.location.province || ''}
                      onChange={(e) => setLoc({ province: e.target.value })}
                      placeholder="e.g. Bagmati"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h2 className="profile-section-title">Compensation</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Salary range (per month)</label>
                  <div className="salary-inputs">
                    <select
                      className="form-input"
                      value={job.currency}
                      onChange={(e) => set({ currency: e.target.value })}
                    >
                      <option value="NPR">NPR</option>
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                    </select>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={job.salary_min}
                      onChange={(e) => set({ salary_min: e.target.value })}
                      placeholder="Min (e.g. 60000)"
                    />
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={job.salary_max}
                      onChange={(e) => set({ salary_max: e.target.value })}
                      placeholder="Max (e.g. 90000)"
                    />
                    <div />
                  </div>
                  <div className="field-hint">
                    Listing a salary range makes your role ~2× more likely to get applications.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">External application URL (optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={job.application_url || ''}
                    onChange={(e) => set({ application_url: e.target.value })}
                    placeholder="https://yourcompany.com/careers/frontend"
                  />
                  <div className="field-hint">
                    If set, candidates will be sent here instead of applying on the platform.
                  </div>
                </div>
              </div>
            </section>

            {error && <div className="error-message" role="alert">{error}</div>}
            {flash && <div className="success-message" role="status">{flash}</div>}

            <div className="job-form-actions">
              <div className="actions-left">
                {isEdit && (
                  <button type="button" className="cancel-btn" onClick={remove}>
                    <Trash2 size={14} style={{ marginRight: 6 }} /> Delete
                  </button>
                )}
              </div>
              <div className="actions-right">
                <button
                  type="submit"
                  className="cancel-btn"
                  disabled={saving || publishing}
                >
                  <Save size={14} style={{ marginRight: 6 }} />
                  {saving ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={publish}
                  disabled={saving || publishing || !job.title}
                >
                  <Send size={14} style={{ marginRight: 6 }} />
                  {publishing ? 'Publishing…' : 'Save & Publish'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobForm;
