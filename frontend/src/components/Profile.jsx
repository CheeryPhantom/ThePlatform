import { useState, useEffect } from 'react';
import { apiFetch } from '../api/api';
import { Upload, FileText, Minus, Plus } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    // ... initial state
    full_name: '',
    headline: '',
    location: { city: '', country: '' },
    experience_years: '',
    skills: [],
    resume_url: '',
    preferences: { job_types: [], remote_work: false }
  });
  // ... rest of the component
  const [loading, setLoading] = useState(true);
  const [saving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('users/profile');
      setProfile({
        full_name: data.full_name || '',
        headline: data.headline || '',
        location: data.location || { city: '', country: '' },
        experience_years: data.experience_years || '',
        skills: data.skills || [],
        resume_url: data.resume_url || '',
        preferences: data.preferences || { job_types: [], remote_work: false }
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!profile.headline.trim()) {
      newErrors.headline = 'Professional headline is required';
    }

    if (profile.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    // Validate experience years
    const experienceYears = parseInt(profile.experience_years);
    if (isNaN(experienceYears) || experienceYears < 0) {
      newErrors.experience_years = 'Please enter a valid number of years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await apiFetch('users/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setProfile(updatedProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleExperienceChange = (delta) => {
    const current = parseInt(profile.experience_years) || 0;
    const newValue = Math.max(0, current + delta);
    setProfile(prev => ({ ...prev, experience_years: newValue.toString() }));
  };

  const handleExperienceInputChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '' || /^\d+$/.test(value)) {
      setProfile(prev => ({ ...prev, experience_years: value }));
    }
  };

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: '' }));
      }
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkillAdd();
    }
  };

  const handleRemoteWorkChange = (checked) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, remote_work: checked }
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: 'Please upload a PDF or Word document' });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ file: 'File size must be less than 5MB' });
        return;
      }

      setUploadedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('resume', uploadedFile);

    try {
      const response = await apiFetch('users/upload-resume', {
        method: 'POST',
        body: formData
      });

      setProfile(prev => ({ ...prev, resume_url: response.resume_url }));
      setUploadedFile(null);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload resume:', error);
      setErrors({ file: error.message });
    }
  };

  const handleCancel = () => {
    // Reset form to original state or navigate back
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      fetchProfile(); // Reset to original data
      setErrors({});
      setUploadedFile(null);
      setSkillInput('');
    }
  };

  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
    'AWS', 'Docker', 'Git', 'Agile', 'TypeScript', 'CSS'
  ];

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
            {/* Basic Information Section */}
            <section className="profile-section">
              <h2 className="profile-section-title">Basic Information</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label form-label-required">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-input"
                    value={profile.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && <div className="error-message">{errors.full_name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Professional Headline</label>
                  <input
                    type="text"
                    name="headline"
                    className="form-input"
                    value={profile.headline}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer with 3+ years experience"
                  />
                  {errors.headline && <div className="error-message">{errors.headline}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="location.city"
                      className="form-input"
                      value={profile.location.city}
                      onChange={handleChange}
                      placeholder="e.g. New York"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="location.country"
                      className="form-input"
                      value={profile.location.country}
                      onChange={handleChange}
                      placeholder="e.g. USA"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Experience Section */}
            <section className="profile-section">
              <h2 className="profile-section-title">Experience</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <div className="experience-input-container">
                    <input
                      type="number"
                      className="experience-input"
                      value={profile.experience_years}
                      onChange={handleExperienceInputChange}
                      placeholder="0"
                      min="0"
                    />
                    <div className="experience-buttons">
                      <button
                        type="button"
                        className="experience-btn"
                        onClick={() => handleExperienceChange(-1)}
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        type="button"
                        className="experience-btn"
                        onClick={() => handleExperienceChange(1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  {errors.experience_years && <div className="error-message">{errors.experience_years}</div>}
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <section className="profile-section">
              <h2 className="profile-section-title">Skills</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label form-label-required">Skills</label>
                  <div className="skills-input-container">
                    <input
                      type="text"
                      className="form-input"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder="Type a skill and press Enter"
                    />
                  </div>

                  {/* Display selected skills */}
                  {profile.skills.length > 0 && (
                    <div className="skills-display">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                          <button
                            type="button"
                            className="skill-tag-remove"
                            onClick={() => handleSkillRemove(skill)}
                            aria-label={`Remove ${skill} skill`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Popular skills suggestions */}
                  <div className="skills-suggestions">
                    <span className="skills-suggestions-title">Popular skills:</span>
                    {popularSkills.filter(skill => !profile.skills.includes(skill)).slice(0, 8).map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        className="skill-suggestion add"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            skills: [...prev.skills, skill]
                          }));
                          if (errors.skills) {
                            setErrors(prev => ({ ...prev, skills: '' }));
                          }
                        }}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {errors.skills && <div className="error-message">{errors.skills}</div>}
                </div>
              </div>
            </section>

            {/* Documents Section */}
            <section className="profile-section">
              <h2 className="profile-section-title">Documents</h2>
              <div className="profile-form">
                {profile.resume_url ? (
                  <div className="uploaded-file">
                    <FileText className="upload-icon" size={32} />
                    <div className="uploaded-file-info">
                      <h4>Resume Uploaded</h4>
                      <p>Click to view or replace your resume</p>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() => setProfile(prev => ({ ...prev, resume_url: '' }))}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="resume-upload-section">
                    <Upload className="upload-icon" />
                    <h3 className="upload-title">Upload Your Resume</h3>
                    <p className="upload-subtitle">
                      Drag and drop your resume here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="upload-button">
                      Choose File
                    </label>
                    {uploadedFile && (
                      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                          Selected: {uploadedFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={handleFileUpload}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          Upload Resume
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {errors.file && <div className="error-message">{errors.file}</div>}
              </div>
            </section>

            {/* Preferences Section */}
            <section className="profile-section">
              <h2 className="profile-section-title">Preferences</h2>
              <div className="profile-form">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="remote-work"
                    className="checkbox-input"
                    checked={profile.preferences.remote_work}
                    onChange={(e) => handleRemoteWorkChange(e.target.checked)}
                  />
                  <label htmlFor="remote-work" className="checkbox-label">
                    Open to remote work
                  </label>
                </div>
              </div>
            </section>

            {/* Sticky Footer */}
            <div className="profile-footer">
              <div className="profile-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`save-btn ${saving ? 'loading' : ''}`}
                  disabled={saving}
                >
                  {saving ? 'Saving Profile...' : 'Save Profile'}
                </button>
              </div>
            </div>

            {errors.submit && <div className="error-message">{errors.submit}</div>}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;