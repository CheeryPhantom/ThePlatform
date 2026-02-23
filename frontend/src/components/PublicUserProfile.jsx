import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';

const PublicUserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`users/${userId}/public-profile`);
        setProfile(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  return (
    <div className="container" style={{ maxWidth: '820px', padding: '32px 16px' }}>
      <Link to="/jobs" className="btn btn-secondary btn-sm" style={{ marginBottom: '20px', display: 'inline-block' }}>
        Back to Jobs
      </Link>
      {loading && <p>Loading profile...</p>}
      {error && <p className="error-message">{error}</p>}
      {profile && (
        <div className="card">
          <h1>{profile.full_name || profile.name}</h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '12px' }}>{profile.headline || 'No headline provided'}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Experience:</strong> {profile.experience_years ?? 'N/A'} years</p>
          <p><strong>Location:</strong> {profile.location?.city ? `${profile.location.city}, ${profile.location.country || ''}` : 'N/A'}</p>
          <div style={{ marginTop: '16px' }}>
            <strong>Skills:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {(profile.skills || []).length > 0 ? (profile.skills || []).map((skill) => (
                <span key={skill} className="skill-tag skill-partial">{skill}</span>
              )) : <span>Not listed</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicUserProfile;
