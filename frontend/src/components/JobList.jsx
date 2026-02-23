import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Clock, Bookmark, ArrowRight } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { apiFetch } from '../api/api';
import './JobList.css';

const JobList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('most-recent');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`jobs?q=${encodeURIComponent(searchTerm)}`);
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchTerm]);

  const filteredJobs = useMemo(() => {
    const byLocation = jobs.filter((job) => {
      const label = `${job.location?.city || ''} ${job.location?.country || ''} ${typeof job.location === 'string' ? job.location : ''}`.toLowerCase();
      return label.includes(location.toLowerCase());
    });

    return [...byLocation].sort((a, b) => {
      if (sortBy === 'most-recent') return new Date(b.posted_at) - new Date(a.posted_at);
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [jobs, location, sortBy]);

  return (
    <DashboardLayout>
      <div className="job-list-page">
        <div className="job-list-header">
          <h1>Find Your Dream Job</h1>
          <p>Discover opportunities that match your skills and experience</p>
        </div>

        <div className="job-list-content">
          <section className="search-filters-section">
            <div className="search-filters-card">
              <div className="search-filters-grid">
                <div className="search-input-group">
                  <Search className="search-input-icon" size={20} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search jobs..."
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
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="most-recent">Most Recent</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          </section>

          {error && <p className="error-message">{error}</p>}
          {loading && <p>Loading jobs...</p>}

          <section className="jobs-section">
            <div className="jobs-grid">
              {!loading && filteredJobs.length === 0 && <p>No jobs found.</p>}
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="company-info">
                      <div className="company-logo">{(job.company_name || 'C').slice(0, 2).toUpperCase()}</div>
                      <div className="company-details"><h3>{job.company_name || 'Company'}</h3></div>
                    </div>
                    <button className="bookmark-btn"><Bookmark size={20} /></button>
                  </div>
                  <h2 className="job-title">{job.title}</h2>
                  <p className="job-description">{job.description || 'No description provided.'}</p>
                  <div className="job-meta">
                    <span><MapPin size={16} /> {job.location?.city || job.location?.country || 'Remote'}</span>
                    <span><DollarSign size={16} /> {job.salary_range?.min ? `${job.salary_range.min}-${job.salary_range.max}` : 'Competitive'}</span>
                    <span><Clock size={16} /> {job.employment_type || 'Full-time'}</span>
                  </div>
                  <div className="job-skills-section">
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Link to="/profile" className="btn btn-secondary btn-sm">Update my profile</Link>
                      <Link to="/dashboard" className="btn btn-primary btn-sm">
                        View details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobList;
