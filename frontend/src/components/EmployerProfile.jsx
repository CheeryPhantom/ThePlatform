import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api/api';
import DashboardLayout from './DashboardLayout';

const EmployerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    company_name: '',
    website: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('employers/profile');
      setProfile({
        company_name: data.company_name || '',
        website: data.website || '',
        bio: data.bio || ''
      });
    } catch (error) {
      console.error('Failed to fetch employer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile = await apiFetch('employers/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setProfile(updatedProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div className="employer-profile">
        <div className="card">
          <h2>Company Profile</h2>
          <p className="form-description">Tell candidates about your company to attract top talent.</p>
          <form onSubmit={handleSubmit} className="employer-form">
            <div className="form-group">
              <label>Company Name</label>
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
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Company Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Describe your company, culture, and what makes you unique..."
                rows="6"
              />
            </div>
            <div className="form-actions" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfile;