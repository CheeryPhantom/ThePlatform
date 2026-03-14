import { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';
import { Building2, Globe, MapPin, Users, ShieldCheck } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './EmployerProfile.css';

const EmployerProfile = () => {
  const [profile, setProfile] = useState({
    company_name: '',
    website: '',
    bio: '',
    location: '',
    industry: '',
    company_size: '',
    founded_year: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('employers/profile');
      setProfile({
        company_name: data.company_name || '',
        website: data.website || '',
        bio: data.bio || '',
        location: data.location || '',
        industry: data.industry || '',
        company_size: data.company_size || '',
        founded_year: data.founded_year || '',
        logo_url: data.logo_url || ''
      });
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
      const updatedProfile = await apiFetch('employers/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...profile,
          founded_year: profile.founded_year ? Number(profile.founded_year) : null
        })
      });
      setProfile({
        company_name: updatedProfile.company_name || '',
        website: updatedProfile.website || '',
        bio: updatedProfile.bio || '',
        location: updatedProfile.location || '',
        industry: updatedProfile.industry || '',
        company_size: updatedProfile.company_size || '',
        founded_year: updatedProfile.founded_year || '',
        logo_url: updatedProfile.logo_url || ''
      });
      setMessage('Company profile updated successfully.');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="employer-profile-page">
          <div className="employer-profile-shell employer-loading">Loading company profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="employer-profile-page">
        <div className="employer-profile-shell">
          <section className="employer-profile-hero">
            <div>
              <p className="employer-eyebrow">Employer workspace</p>
              <h1>Build a company profile candidates can trust</h1>
              <p className="employer-hero-copy">
                Keep this page focused on company identity and hiring context. Candidate-only actions like resume upload and assessments do not belong here.
              </p>
            </div>
            <div className="employer-hero-badge">
              <ShieldCheck size={18} />
              Employer view
            </div>
          </section>

          <section className="employer-profile-card">
            <div className="employer-card-header">
              <h2>Company Profile</h2>
              <p>Tell candidates who you are, where you operate, and why they should care about your roles.</p>
            </div>

            {message ? <div className="employer-banner success">{message}</div> : null}
            {error ? <div className="employer-banner error">{error}</div> : null}

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
                <label><Users size={16} /> Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={profile.industry}
                  onChange={handleChange}
                  placeholder="Fintech, SaaS, recruitment, healthcare..."
                />
              </div>

              <div className="form-group">
                <label>Company Size</label>
                <input
                  type="text"
                  name="company_size"
                  value={profile.company_size}
                  onChange={handleChange}
                  placeholder="11-50 employees"
                />
              </div>

              <div className="form-group">
                <label>Founded Year</label>
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
                  placeholder="Describe your company, culture, and what makes you unique..."
                  rows="6"
                />
              </div>

              <div className="form-actions employer-form-full">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Company Profile'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfile;
