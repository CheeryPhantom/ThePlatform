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
        { label: 'Open Roles', value: '0', change: 'Ready to publish', changeType: 'neutral', icon: Briefcase, className: 'stat-applied' },
        { label: 'Company Profile', value: '70%', change: 'Complete key details', changeType: 'positive', icon: Building2, className: 'stat-views' },
        { label: 'Candidate Views', value: '0', change: 'No live jobs yet', changeType: 'neutral', icon: Eye, className: 'stat-score' },
        { label: 'Applicants', value: '0', change: 'Will appear here', changeType: 'neutral', icon: Users, className: 'stat-assessment' }
      ]
    : [
        { label: 'Applied Jobs', value: '12', change: '+8% this week', changeType: 'positive', icon: TrendingUp, className: 'stat-applied' },
        { label: 'Profile Views', value: '47', change: '+12 today', changeType: 'positive', icon: TrendingUp, className: 'stat-views' },
        { label: 'Skill Score', value: '85/100', change: 'Strong Match', changeType: 'neutral', icon: Target, className: 'stat-score' },
        { label: 'Profile Status', value: '3 of 5', change: 'Complete', changeType: 'neutral', icon: CheckCircle, className: 'stat-assessment' }
      ];

  const quickActions = isEmployer
    ? [
        { title: 'Complete Company Profile', description: 'Add the details candidates need before they trust your roles.', action: 'Edit Company', icon: Building2, primary: true, path: '/employer-profile' },
        { title: 'Review Job Listings', description: 'See employer-owned listings instead of the candidate job feed.', action: 'View Listings', icon: Briefcase, primary: false, path: '/jobs' },
        { title: 'Prepare A New Role', description: 'Posting flow is next, but the employer workspace should already feel distinct.', action: 'Open Listings', icon: PlusSquare, primary: false, path: '/jobs' }
      ]
    : [
        { title: 'Complete Your Profile', description: 'Keep your profile current so employers can evaluate you quickly.', action: 'Edit Profile', icon: User, primary: true, path: '/profile' },
        { title: 'Browse Jobs', description: 'Explore relevant opportunities and prepare for live applications.', action: 'View Jobs', icon: Briefcase, primary: false, path: '/jobs' },
        { title: 'Strengthen Your Positioning', description: 'Assessment and training can follow once the hiring loop is wired.', action: 'Stay Focused', icon: Target, primary: false, path: '/dashboard' }
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

      {/* Recommended Jobs Empty State */}
      <section className="recommended-jobs-section">
        <div className="empty-state-icon">
          <Briefcase size={120} />
        </div>
        <h2 className="empty-state-title">{isEmployer ? 'Your Hiring Workspace Starts Here' : 'Recommended Jobs Will Show Here'}</h2>
        <p className="empty-state-description">
          {isEmployer
            ? 'Use the employer profile and listings workspace to present a clean recruiting story. Posting and applicant management are the next phase.'
            : 'Once jobs are connected to live backend data, this area can surface stronger candidate recommendations.'}
        </p>
        <button className="btn btn-primary empty-state-btn" onClick={() => navigate(isEmployer ? '/employer-profile' : '/jobs')}>
          {isEmployer ? 'Open Company Profile' : 'Open Jobs'}
        </button>
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
