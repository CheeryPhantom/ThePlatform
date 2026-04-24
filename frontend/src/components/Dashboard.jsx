import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  User,
  Briefcase,
  Building2,
  Eye,
  Users,
  PlusSquare
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployer = user?.role === 'employer';

  const goToProfile = () => {
    if (isEmployer) {
      navigate('/employer-profile');
    } else {
      navigate('/profile');
    }
  };

  const stats = isEmployer
    ? [
        { label: 'Open Roles', value: '0', change: 'Post your first role', changeType: 'neutral', icon: Briefcase, className: 'stat-applied' },
        { label: 'Company Profile', value: '70%', change: 'Add logo and team info', changeType: 'positive', icon: Building2, className: 'stat-views' },
        { label: 'Candidate Views', value: '—', change: 'Shows once jobs are live', changeType: 'neutral', icon: Eye, className: 'stat-score' },
        { label: 'Applicants', value: '0', change: 'Will appear here', changeType: 'neutral', icon: Users, className: 'stat-assessment' }
      ]
    : [
        { label: 'Applied Jobs', value: '0', change: 'Start browsing roles', changeType: 'neutral', icon: TrendingUp, className: 'stat-applied' },
        { label: 'Profile Views', value: '—', change: 'Shows once you apply', changeType: 'neutral', icon: TrendingUp, className: 'stat-views' },
        { label: 'Skill Score', value: '—', change: 'Take an assessment to score', changeType: 'neutral', icon: Target, className: 'stat-score' },
        { label: 'Profile Status', value: '3 of 5', change: '2 sections left', changeType: 'neutral', icon: CheckCircle, className: 'stat-assessment' }
      ];

  const quickActions = isEmployer
    ? [
        { title: 'Complete Company Profile', description: 'Add the details candidates look for: logo, team size, and what you actually build.', action: 'Edit Company', icon: Building2, primary: true, path: '/employer-profile' },
        { title: 'Manage Job Listings', description: 'Your posted and drafted roles in one place — separate from the candidate feed.', action: 'View Listings', icon: Briefcase, primary: false, path: '/jobs' },
        { title: 'Plan a New Role', description: 'Draft a role spec and skill requirements before posting it live.', action: 'Open Listings', icon: PlusSquare, primary: false, path: '/jobs' }
      ]
    : [
        { title: 'Complete Your Profile', description: 'A filled-out profile matches to ~3× more roles. Start with skills and experience.', action: 'Edit Profile', icon: User, primary: true, path: '/profile' },
        { title: 'Browse Jobs', description: 'See open roles in IT and Finance with a clear match rating against your profile.', action: 'View Jobs', icon: Briefcase, primary: false, path: '/jobs' },
        { title: 'Take an Assessment', description: 'Prove your skills with a short domain-specific test — your score unlocks stronger matches.', action: 'Start Assessment', icon: Target, primary: false, path: '/assessment' }
      ];

  if (!user) return <div className="text-center py-8">Loading...</div>;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-header">
          <div>
            <h1 className="welcome-title">Welcome back, {user.name}!</h1>
            <div className="assessment-progress">
              <span className="progress-label">{isEmployer ? 'Your company profile completion: 70%' : 'Your profile completion: 60%'}</span>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: isEmployer ? '70%' : '60%' }}></div>
              </div>
            </div>
          </div>
          <div className="welcome-actions">
            <button onClick={goToProfile} className="btn btn-primary">
              {isEmployer ? 'Complete Company Profile' : 'Complete Your Profile'}
            </button>
            <button onClick={() => navigate('/jobs')} className="btn btn-secondary">
              {isEmployer ? 'Manage Job Listings' : 'Browse Jobs'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.className}`}>
              <stat.icon size={24} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-change ${stat.changeType}`}>
              {stat.changeType === 'positive' && <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />}
              {stat.changeType === 'negative' && <TrendingDown size={12} style={{ display: 'inline', marginRight: '4px' }} />}
              {stat.change}
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="quick-action-card" onClick={() => navigate(action.path)}>
              <action.icon className="quick-action-icon" size={48} />
              <h3 className="quick-action-title">{action.title}</h3>
              <p className="quick-action-description">{action.description}</p>
              <button className={`btn quick-action-btn ${action.primary ? 'btn-primary' : 'btn-secondary'}`}>
                {action.action}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended / Workspace Empty State */}
      <section className="recommended-jobs-section">
        <div className="empty-state-icon">
          <Briefcase size={120} />
        </div>
        <h2 className="empty-state-title">{isEmployer ? 'Your hiring workspace' : 'Recommended jobs'}</h2>
        <p className="empty-state-description">
          {isEmployer
            ? 'Once you publish a role, applicants and candidate views will show up here. Until then, keep your company profile current so candidates know who they\'re applying to.'
            : 'Fill out your skills and experience, and we\'ll start surfacing the roles that actually match you — not every job with a matching keyword.'}
        </p>
        <button className="btn btn-primary empty-state-btn" onClick={() => navigate(isEmployer ? '/employer-profile' : '/profile')}>
          {isEmployer ? 'Open Company Profile' : 'Complete Profile'}
        </button>
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
