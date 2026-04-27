import { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Pencil,
  X,
  Calendar,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './EmployerProfile.css';

const emptyProfile = {
  company_name: '',
  website: '',
  bio: '',
  location: '',
  industry: '',
  company_size: '',
  founded_year: '',
  logo_url: ''
};

const EmployerProfile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const normalize = (data) => ({
    company_name: data?.company_name || '',
    website: data?.website || '',
    bio: data?.bio || '',
    location: data?.location || '',
    industry: data?.industry || '',
    company_size: data?.company_size || '',
    founded_year: data?.founded_year || '',
    logo_url: data?.logo_url || ''
  });

  const isComplete = (p) => !!(p && p.company_name && p.company_name.trim());

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('employers/profile').catch((err) => {
        if (err.status === 404) return null;
        throw err;
      });
      const clean = normalize(data);
      setProfile(clean);
      setOriginalProfile(clean);
      // First-time setup: open form. Completed profile: show read view.
      setEditing(!isComplete(clean));
    } catch (fetchError) {
      console.error('Failed to fetch employer profile:', fetchError);
      setError('Unable to load company profile right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updated = await apiFetch('employers/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...profile,
          founded_year: profile.founded_year ? Number(profile.founded_year) : null
        })
      });
      const clean = normalize(updated);
      setProfile(clean);
      setOriginalProfile(clean);
      setEditing(false);
      setMessage('Company profile saved.');
    } catch (saveError) {
      console.error('Failed to update profile:', saveError);
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const cancelEdit = () => {
    if (originalProfile) setProfile(originalProfile);
    setEditing(false);
    setError('');
    setMessage('');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="employer-profile-page">
          <div className="employer-profile-shell employer-loading">Loading company profile…</div>
        </div>
      </DashboardLayout>
    );
  }

  const showForm = editing || !isComplete(profile);
  const initials = (profile.company_name || '??').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="employer-profile-page">
        <div className="employer-profile-shell">
          <section className="employer-profile-hero">
            <div>
              <p className="employer-eyebrow">Employer workspace</p>
              <h1>{showForm ? 'Build your company profile' : profile.company_name}</h1>
              <p className="employer-hero-copy">
                {showForm
                  ? 'Candidates judge a listing by who\'s behind it — company details build trust before they apply.'
                  : 'This is what candidates see when they view one of your job listings.'}
              </p>
            </div>
            <div className="employer-hero-badge">
              <ShieldCheck size={18} />
              Employer view
            </div>
          </section>

          {message ? <div className="employer-banner success">{message}</div> : null}
          {error ? <div className="employer-banner error">{error}</div> : null}

          {showForm ? (
            <section className="employer-profile-card">
              <div className="employer-card-header">
                <div>
                  <h2>{isComplete(originalProfile) ? 'Edit company profile' : 'Company profile'}</h2>
                  <p>Tell candidates who you are, where you operate, and why they should care about your roles.</p>
                </div>
                {isComplete(originalProfile) && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    <X size={14} style={{ marginRight: 4 }} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="employer-form">
                <div className="form-group">
                  <label><Building2 size={16} /> Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={profile.company_name}
                    onChange={handleChange}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Globe size={16} /> Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div className="form-group">
                  <label><MapPin size={16} /> Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    placeholder="City, country or remote-first"
                  />
                </div>

                <div className="form-group">
                  <label><Briefcase size={16} /> Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={profile.industry}
                    onChange={handleChange}
                    placeholder="Fintech, SaaS, recruitment, healthcare…"
                  />
                </div>

                <div className="form-group">
                  <label><Users size={16} /> Company Size</label>
                  <input
                    type="text"
                    name="company_size"
                    value={profile.company_size}
                    onChange={handleChange}
                    placeholder="11-50 employees"
                  />
                </div>

                <div className="form-group">
                  <label><Calendar size={16} /> Founded Year</label>
                  <input
                    type="number"
                    name="founded_year"
                    value={profile.founded_year}
                    onChange={handleChange}
                    placeholder="2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="form-group employer-form-full">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    name="logo_url"
                    value={profile.logo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="form-group employer-form-full">
                  <label>Company Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Describe your company, culture, and what makes you unique…"
                    rows="6"
                  />
                </div>

                <div className="form-actions employer-form-full">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save company profile'}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="employer-profile-view">
              <div className="employer-view-header">
                <div className="employer-view-identity">
                  {profile.logo_url ? (
                    <img src={profile.logo_url} alt={`${profile.company_name} logo`} className="employer-logo" />
                  ) : (
                    <div className="employer-logo employer-logo-fallback">{initials}</div>
                  )}
                  <div>
                    <h2>{profile.company_name}</h2>
                    {profile.industry && <p className="employer-view-industry">{profile.industry}</p>}
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                  <Pencil size={14} style={{ marginRight: 6 }} /> Edit
                </button>
              </div>

              <dl className="employer-detail-grid">
                {profile.website && (
                  <div className="employer-detail">
                    <dt><Globe size={14} /> Website</dt>
                    <dd>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink size={12} style={{ marginLeft: 4 }} />
                      </a>
                    </dd>
                  </div>
                )}
                {profile.location && (
                  <div className="employer-detail">
                    <dt><MapPin size={14} /> Location</dt>
                    <dd>{profile.location}</dd>
                  </div>
                )}
                {profile.company_size && (
                  <div className="employer-detail">
                    <dt><Users size={14} /> Size</dt>
                    <dd>{profile.company_size}</dd>
                  </div>
                )}
                {profile.founded_year && (
                  <div className="employer-detail">
                    <dt><Calendar size={14} /> Founded</dt>
                    <dd>{profile.founded_year}</dd>
                  </div>
                )}
              </dl>

              {profile.bio && (
                <div className="employer-bio">
                  <h3>About</h3>
                  <p>{profile.bio}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfile;
