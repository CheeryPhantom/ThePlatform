import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Bell, Lock, User, Shield } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');

    return (
        <DashboardLayout>
            <div className="settings-page">
                <h1 className="settings-title">Settings</h1>

                <div className="settings-container">
                    <div className="settings-sidebar">
                        <button
                            className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <User size={18} /> Account
                        </button>
                        <button
                            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <Bell size={18} /> Notifications
                        </button>
                        <button
                            className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy')}
                        >
                            <Lock size={18} /> Privacy & Security
                        </button>
                    </div>

                    <div className="settings-content">
                        {activeTab === 'account' && (
                            <div className="settings-section">
                                <h2>Account Preferences</h2>
                                <div className="setting-group">
                                    <label>Email Address</label>
                                    <input type="email" value="user@example.com" disabled className="form-input" />
                                    <p className="setting-hint">Contact support to change your email.</p>
                                </div>
                                <div className="setting-group">
                                    <label>Language</label>
                                    <select className="form-select">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="settings-section">
                                <h2>Notification Preferences</h2>
                                <div className="setting-checkbox-group">
                                    <label className="checkbox-label">
                                        <input type="checkbox" defaultChecked />
                                        Email me when I get a new message
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" defaultChecked />
                                        Email me when a job matches my profile
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" />
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
                                        <input type="checkbox" defaultChecked />
                                        Make my profile public
                                    </label>
                                </div>
                                <div className="setting-group danger-zone">
                                    <h3>Delete Account</h3>
                                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                                    <button className="btn btn-danger">Delete Account</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
