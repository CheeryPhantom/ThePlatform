import { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Bell, Lock, User } from 'lucide-react';
import { apiFetch } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

const defaultSettings = {
  language: 'en-US',
  email_on_message: true,
  email_on_job_match: true,
  subscribe_newsletter: false,
  profile_public: true
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(defaultSettings);
  const [status, setStatus] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('users/settings/me');
        setSettings({ ...defaultSettings, ...data });
      } catch (error) {
        setStatus(error.message);
      }
    };

    load();
  }, []);

  const saveSettings = async () => {
    setStatus('Saving...');
    try {
      const updated = await apiFetch('users/settings/me', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setSettings(updated);
      setStatus('Settings saved.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-container">
          <div className="settings-sidebar">
            <button className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}><User size={18} /> Account</button>
            <button className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}><Bell size={18} /> Notifications</button>
            <button className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}><Lock size={18} /> Privacy & Security</button>
          </div>

          <div className="settings-content">
            {activeTab === 'account' && (
              <div className="settings-section">
                <h2>Account Preferences</h2>
                <div className="setting-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="form-input" />
                  <p className="setting-hint">Contact support to change your email.</p>
                </div>
                <div className="setting-group">
                  <label>Language</label>
                  <select className="form-select" value={settings.language} onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}>
                    <option value="en-US">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <div className="setting-checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={settings.email_on_message} onChange={(e) => setSettings((prev) => ({ ...prev, email_on_message: e.target.checked }))} />
                    Email me when I get a new message
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={settings.email_on_job_match} onChange={(e) => setSettings((prev) => ({ ...prev, email_on_job_match: e.target.checked }))} />
                    Email me when a job matches my profile
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={settings.subscribe_newsletter} onChange={(e) => setSettings((prev) => ({ ...prev, subscribe_newsletter: e.target.checked }))} />
                    Subscribe to newsletter
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h2>Privacy & Security</h2>
                <div className="setting-group">
                  <button className="btn btn-secondary">Change Password</button>
                </div>
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={settings.profile_public} onChange={(e) => setSettings((prev) => ({ ...prev, profile_public: e.target.checked }))} />
                    Make my profile public
                  </label>
                </div>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
              {status && <p style={{ marginTop: '8px' }}>{status}</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
