import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Send,
  Target,
  Users,
  Pencil,
  ExternalLink
} from 'lucide-react';
import { apiFetch } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import './JobDetail.css';

const formatSalary = (job) => {
  if (job.salary_min == null && job.salary_max == null) return null;
  const f = (v) => (v != null ? Number(v).toLocaleString() : '—');
  return `${job.currency || 'NPR'} ${f(job.salary_min)} – ${f(job.salary_max)} / month`;
};

const formatLocation = (job) => {
  if (job.is_remote) return 'Remote';
  const loc = job.location || {};
  const parts = [loc.city, loc.province, loc.country].filter(Boolean);
  if (!parts.length) return job.company_location || '—';
  return parts.join(', ');
};

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);
  const [applicants, setApplicants] = useState(null);

  const loadJob = () => {
    setLoading(true);
    apiFetch(`jobs/${id}`)
      .then((data) => {
        setJob(data.job);
        setApplied(!!data.job.already_applied);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = !!job?.owned_by_me;

  useEffect(() => {
    if (!isOwner) return;
    apiFetch(`jobs/${id}/applicants`)
      .then((d) => setApplicants(d.applicants || []))
      .catch(() => {});
  }, [id, isOwner]);

  const submitApply = async () => {
    setApplying(true);
    setError(null);
    try {
      await apiFetch(`jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ cover_letter: coverLetter.trim() || null })
      });
      setApplied(true);
      setApplyOpen(false);
    } catch (err) {
      setError(err.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      </DashboardLayout>
    );
  }
  if (error && !job) {
    return (
      <DashboardLayout>
        <div className="job-detail-page">
          <div className="job-detail-container">
            <div className="error-message">{error}</div>
            <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>
              Back to jobs
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  if (!job) return null;

  const match = job.match || { score: null, matched: [], missing: [] };
  const requiredSkills = (job.requirements && job.requirements.skills) || [];
  const canApply =
    job.status === 'published' && user && user.role !== 'employer' && !applied;
  const external = job.application_url && job.application_url.startsWith('http');

  return (
    <DashboardLayout>
      <div className="job-detail-page">
        <div className="job-detail-container">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>

          <section className="job-detail-hero">
            <div className="job-detail-company">
              <div className="company-logo">
                {(job.company_name || job.title || '??').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="job-detail-company-name">{job.company_name || 'Company'}</div>
                <h1 className="job-detail-title">{job.title}</h1>
              </div>
            </div>

            <div className="job-detail-meta">
              <div className="job-meta-item"><MapPin size={16} /> {formatLocation(job)}</div>
              {job.employment_type && (
                <div className="job-meta-item"><Clock size={16} /> {job.employment_type.replace('_', '-')}</div>
              )}
              {formatSalary(job) && (
                <div className="job-meta-item"><DollarSign size={16} /> {formatSalary(job)}</div>
              )}
              {job.status && job.status !== 'published' && (
                <span className={`job-status-badge status-${job.status}`}>{job.status}</span>
              )}
            </div>

            {match.score != null && (
              <div className="job-detail-match">
                <div className="match-row">
                  <Target size={18} />
                  <strong>{match.score}% match</strong>
                  <span className="match-sub">
                    {match.matched.length} of {requiredSkills.length} required skills
                  </span>
                </div>
                <div className="match-bar-container">
                  <div
                    className={`match-bar-fill ${
                      match.score >= 90
                        ? 'exact'
                        : match.score >= 75
                        ? 'strong'
                        : match.score >= 50
                        ? 'partial'
                        : 'learning'
                    }`}
                    style={{ width: `${match.score}%` }}
                  />
                </div>
              </div>
            )}

            <div className="job-detail-actions">
              {isOwner ? (
                <>
                  <Link to={`/jobs/${job.id}/edit`} className="btn btn-primary">
                    <Pencil size={16} style={{ marginRight: 6 }} /> Edit listing
                  </Link>
                  {job.status === 'draft' && (
                    <button
                      className="btn btn-secondary"
                      onClick={async () => {
                        await apiFetch(`jobs/${job.id}/publish`, { method: 'POST' });
                        loadJob();
                      }}
                    >
                      Publish
                    </button>
                  )}
                </>
              ) : applied ? (
                <button className="btn btn-secondary" disabled>
                  <CheckCircle size={16} style={{ marginRight: 6 }} />
                  Application submitted
                </button>
              ) : external ? (
                <a
                  className="btn btn-primary"
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply on company site
                  <ExternalLink size={14} style={{ marginLeft: 6 }} />
                </a>
              ) : canApply ? (
                <button className="btn btn-primary" onClick={() => setApplyOpen(true)}>
                  <Send size={16} style={{ marginRight: 6 }} /> Quick Apply
                </button>
              ) : !user ? (
                <Link className="btn btn-primary" to="/login">Sign in to apply</Link>
              ) : null}
            </div>
          </section>

          <div className="job-detail-grid">
            <section className="job-detail-main">
              <h2>About the role</h2>
              {job.description ? (
                <div className="job-detail-description">{job.description}</div>
              ) : (
                <p className="job-detail-empty">
                  This listing doesn't have a description yet.
                </p>
              )}
            </section>

            <aside className="job-detail-side">
              <section className="sidecard">
                <h3>Required skills</h3>
                {requiredSkills.length === 0 ? (
                  <p className="muted">None listed.</p>
                ) : (
                  <ul className="skill-list">
                    {requiredSkills.map((s) => {
                      const matched = match.matched?.map((x) => x.toLowerCase()).includes(s.toLowerCase());
                      return (
                        <li key={s} className={matched ? 'matched' : 'missing'}>
                          {matched ? '✓' : '○'} {s}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {job.requirements?.years_of_experience_min != null && (
                <section className="sidecard">
                  <h3>Experience</h3>
                  <p>{job.requirements.years_of_experience_min}+ years preferred</p>
                </section>
              )}

              {isOwner && (
                <section className="sidecard">
                  <h3><Users size={14} style={{ marginRight: 4 }} /> Applicants</h3>
                  {applicants == null ? (
                    <p className="muted">Loading…</p>
                  ) : applicants.length === 0 ? (
                    <p className="muted">No applicants yet.</p>
                  ) : (
                    <ul className="applicant-list">
                      {applicants.map((a) => (
                        <li key={a.id}>
                          <strong>
                            {a.first_name || a.last_name
                              ? `${a.first_name || ''} ${a.last_name || ''}`.trim()
                              : a.name || a.email}
                          </strong>
                          <span className="applicant-meta">
                            {a.headline || 'Candidate'} · applied {new Date(a.applied_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </aside>
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}
        </div>

        {applyOpen && (
          <div className="apply-modal-backdrop" onClick={() => !applying && setApplyOpen(false)}>
            <div className="apply-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Apply to {job.title}</h3>
              <p className="muted">
                Your profile and resume (if uploaded) will be sent automatically. Add a short note if you want.
              </p>
              <textarea
                className="form-input"
                rows={6}
                maxLength={4000}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Optional: why you're a fit, what you'd bring to the role…"
              />
              <div className="apply-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setApplyOpen(false)}
                  disabled={applying}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={submitApply}
                  disabled={applying}
                >
                  {applying ? 'Submitting…' : 'Submit application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
