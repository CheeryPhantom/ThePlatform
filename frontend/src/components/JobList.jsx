import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  ArrowRight,
  PlusSquare,
  Users,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import { apiFetch } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import './JobList.css';

const formatSalary = (job) => {
  if (job.salary_min == null && job.salary_max == null) return null;
  const f = (v) => (v != null ? Number(v).toLocaleString() : '—');
  return `${job.currency || 'NPR'} ${f(job.salary_min)} – ${f(job.salary_max)}`;
};

const formatLocation = (job) => {
  if (job.is_remote) return 'Remote';
  const loc = job.location || {};
  const parts = [loc.city, loc.province].filter(Boolean);
  if (!parts.length) return job.company_location || '—';
  return parts.join(', ');
};

const matchBand = (score) => {
  if (score == null) return null;
  if (score >= 90) return 'exact';
  if (score >= 75) return 'strong';
  if (score >= 50) return 'partial';
  return 'learning';
};

const matchColor = {
  exact: '#10B981',
  strong: '#3B82F6',
  partial: '#F59E0B',
  learning: '#6B7280'
};

const statusClass = (status) => `status-${(status || 'draft').toLowerCase()}`;

const JobList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployer = user?.role === 'employer';

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('best-match');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const path = isEmployer ? 'jobs/mine' : 'jobs';
    apiFetch(path)
      .then((d) => setJobs(d.jobs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isEmployer]);

  const filtered = useMemo(() => {
    let list = jobs;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (j) =>
          (j.title || '').toLowerCase().includes(q) ||
          (j.company_name || '').toLowerCase().includes(q)
      );
    }
    if (location) {
      const q = location.toLowerCase();
      list = list.filter((j) => formatLocation(j).toLowerCase().includes(q));
    }
    if (!isEmployer) {
      if (sortBy === 'best-match') {
        list = [...list].sort(
          (a, b) => (b.match?.score ?? -1) - (a.match?.score ?? -1)
        );
      } else if (sortBy === 'most-recent') {
        list = [...list].sort(
          (a, b) => new Date(b.posted_at || b.created_at) - new Date(a.posted_at || a.created_at)
        );
      } else if (sortBy === 'highest-salary') {
        list = [...list].sort(
          (a, b) => (Number(b.salary_max) || 0) - (Number(a.salary_max) || 0)
        );
      }
    }
    return list;
  }, [jobs, searchTerm, location, sortBy, isEmployer]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="job-list-page">
        <div className="job-list-header">
          <h1>{isEmployer ? 'Manage your job listings' : 'Find your next role'}</h1>
          <p>
            {isEmployer
              ? 'Draft, publish, and track applicants for roles you own.'
              : 'Live roles matched against your profile.'}
          </p>
        </div>

        <div className="job-list-content">
          {error && <div className="error-message">{error}</div>}

          {isEmployer ? (
            <>
              <section className="search-filters-section">
                <div className="search-filters-card employer-summary-grid">
                  <div className="employer-summary-card">
                    <Briefcase size={22} />
                    <div>
                      <strong>{jobs.length} listing{jobs.length === 1 ? '' : 's'}</strong>
                      <span>
                        {jobs.filter((j) => j.status === 'published').length} live ·{' '}
                        {jobs.filter((j) => j.status === 'draft').length} draft
                      </span>
                    </div>
                  </div>
                  <div className="employer-summary-card">
                    <Users size={22} />
                    <div>
                      <strong>
                        {jobs.reduce((acc, j) => acc + (j.applicants_count || 0), 0)} applicants
                      </strong>
                      <span>Across all your listings</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="employer-summary-card employer-summary-cta"
                    onClick={() => navigate('/jobs/new')}
                  >
                    <PlusSquare size={22} />
                    <div>
                      <strong>Post a new role</strong>
                      <span>Draft, preview, then publish</span>
                    </div>
                  </button>
                </div>
              </section>

              <section className="jobs-section">
                {filtered.length === 0 ? (
                  <div className="empty-state-card">
                    <Briefcase size={48} />
                    <h3>No listings yet</h3>
                    <p>Draft your first role and publish when you're ready — candidates will see it in their feed immediately.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
                      <PlusSquare size={16} style={{ marginRight: 6 }} /> Post a role
                    </button>
                  </div>
                ) : (
                  <div className="jobs-grid employer-jobs-grid">
                    {filtered.map((job) => (
                      <div
                        key={job.id}
                        className="job-card employer-job-card"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job.id}`)}
                      >
                        <div className="job-card-header">
                          <div className="company-info">
                            <div className="company-logo">
                              {(job.title || '??').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="company-details">
                              <h3>{job.title}</h3>
                              <p className="job-card-subtitle">
                                Updated {new Date(job.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`job-status-badge ${statusClass(job.status)}`}>
                            {job.status}
                          </span>
                        </div>

                        <div className="job-meta">
                          <div className="job-meta-item">
                            <MapPin className="job-meta-icon" size={16} />
                            {formatLocation(job)}
                          </div>
                          <div className="job-meta-item">
                            <Users className="job-meta-icon" size={16} />
                            {job.applicants_count || 0} applicants
                          </div>
                          {formatSalary(job) && (
                            <div className="job-meta-item">
                              <DollarSign className="job-meta-icon" size={16} />
                              {formatSalary(job)}
                            </div>
                          )}
                        </div>

                        <p className="job-card-description">
                          {job.description
                            ? job.description.slice(0, 180) + (job.description.length > 180 ? '…' : '')
                            : 'No description yet.'}
                        </p>

                        <div className="job-card-footer employer-footer">
                          <div className="job-actions">
                            <Link
                              to={`/jobs/${job.id}/edit`}
                              className="btn btn-secondary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="btn btn-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open
                              <ArrowRight size={16} style={{ marginLeft: 8 }} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              <section className="search-filters-section">
                <div className="search-filters-card">
                  <div className="search-filters-grid">
                    <div className="search-input-group">
                      <Search className="search-input-icon" size={20} />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search jobs…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <input
                      type="text"
                      className="location-input"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <select
                      className="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="best-match">Best Match</option>
                      <option value="most-recent">Most Recent</option>
                      <option value="highest-salary">Highest Salary</option>
                    </select>
                  </div>
                  <div className="match-legend" aria-label="Match strength legend">
                    <span className="match-legend-label">Match strength</span>
                    <span className="match-legend-item"><span className="match-legend-dot exact" /> 90+ Strong fit</span>
                    <span className="match-legend-item"><span className="match-legend-dot strong" /> 75+ Good fit</span>
                    <span className="match-legend-item"><span className="match-legend-dot partial" /> 50+ Partial</span>
                    <span className="match-legend-item"><span className="match-legend-dot learning" /> Stretch</span>
                  </div>
                </div>
              </section>

              <section className="jobs-section">
                {filtered.length === 0 ? (
                  <div className="empty-state-card">
                    <Briefcase size={48} />
                    <h3>No jobs match your filters yet</h3>
                    <p>Try clearing the search, or check back soon — employers are posting every week.</p>
                  </div>
                ) : (
                  <div className="jobs-grid">
                    {filtered.map((job) => {
                      const band = matchBand(job.match?.score);
                      return (
                        <div
                          key={job.id}
                          className="job-card"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${job.id}`)}
                        >
                          <div className="job-card-header">
                            <div className="company-info">
                              <div className="company-logo">
                                {(job.company_name || job.title).slice(0, 2).toUpperCase()}
                              </div>
                              <div className="company-details">
                                <h3>{job.company_name || 'Company'}</h3>
                              </div>
                            </div>
                            <button
                              className="bookmark-btn"
                              aria-label="Bookmark job"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Bookmark size={20} />
                            </button>
                          </div>

                          <div className="job-card-body">
                            <h2 className="job-title">{job.title}</h2>

                            <div className="job-meta">
                              <div className="job-meta-item">
                                <MapPin className="job-meta-icon" size={16} />
                                {formatLocation(job)}
                              </div>
                              {formatSalary(job) && (
                                <div className="job-meta-item">
                                  <DollarSign className="job-meta-icon" size={16} />
                                  {formatSalary(job)}
                                </div>
                              )}
                              {job.employment_type && (
                                <div className="job-meta-item">
                                  <Clock className="job-meta-icon" size={16} />
                                  {job.employment_type.replace('_', '-')}
                                </div>
                              )}
                            </div>

                            {band && (
                              <div className="match-section">
                                <div className="match-bar-container">
                                  <div
                                    className={`match-bar-fill ${band}`}
                                    style={{ width: `${job.match.score}%` }}
                                  />
                                </div>
                                <span
                                  className="match-percentage"
                                  style={{ color: matchColor[band] }}
                                >
                                  {job.match.score}% match
                                </span>
                              </div>
                            )}

                            {(job.requirements?.skills || []).length > 0 && (
                              <div className="skills-section">
                                <div className="skills-section-title">Required</div>
                                <div className="skills-tags">
                                  {(job.requirements.skills || []).slice(0, 6).map((s) => {
                                    const matched = (job.match?.matched || [])
                                      .map((x) => x.toLowerCase())
                                      .includes(s.toLowerCase());
                                    return (
                                      <span
                                        key={s}
                                        className={`skill-chip ${matched ? 'matched' : 'missing'}`}
                                      >
                                        {matched && <CheckCircle size={12} />}
                                        {s}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="job-card-footer">
                            <div className="job-stats">
                              Posted {new Date(job.posted_at || job.created_at).toLocaleDateString()}
                            </div>
                            <div className="job-actions">
                              <button
                                className="btn btn-ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/jobs/${job.id}`);
                                }}
                              >
                                View Details
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/jobs/${job.id}`);
                                }}
                              >
                                Apply
                                <ArrowRight size={16} style={{ marginLeft: 8 }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobList;
