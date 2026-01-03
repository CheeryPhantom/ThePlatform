import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  ClipboardCheck,
  User,
  GraduationCap,
  FileText,
  Briefcase
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    if (user.role === 'employer') {
      navigate('/employer-profile');
    } else {
      navigate('/profile');
    }
  };

  // Mock stats data with proper icons and colors
  const stats = [
    {
      label: 'Applied Jobs',
      value: '12',
      change: '+8% this week',
      changeType: 'positive',
      icon: TrendingUp,
      className: 'stat-applied'
    },
    {
      label: 'Profile Views',
      value: '47',
      change: '+12 today',
      changeType: 'positive',
      icon: TrendingUp,
      className: 'stat-views'
    },
    {
      label: 'Skill Score',
      value: '85/100',
      change: 'Strong Match',
      changeType: 'neutral',
      icon: Target,
      className: 'stat-score'
    },
    {
      label: 'Assessment',
      value: '3 of 5',
      change: 'Complete',
      changeType: 'neutral',
      icon: CheckCircle,
      className: 'stat-assessment'
    }
  ];

  const quickActions = [
    {
      title: 'Complete Your Assessment',
      description: 'Take the skills assessment to improve job matches',
      action: 'Start Assessment',
      icon: ClipboardCheck,
      primary: true,
      path: '/assessment'
    },
    {
      title: 'Update Your Profile',
      description: 'Keep your profile current with latest skills',
      action: 'Edit Profile',
      icon: User,
      primary: false,
      path: user.role === 'employer' ? '/employer-profile' : '/profile'
    },
    {
      title: 'Browse Training Courses',
      description: 'Learn new skills to boost your score',
      action: 'View Courses',
      icon: GraduationCap,
      primary: false,
      path: '/training'
    },
    {
      title: 'Upload Resume',
      description: 'Add your resume for better visibility',
      action: 'Upload',
      icon: FileText,
      primary: false,
      path: user.role === 'employer' ? '/employer-profile' : '/profile'
    }
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
              <span className="progress-label">Your profile completion: 60%</span>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          <div className="welcome-actions">
            <button onClick={goToProfile} className="btn btn-primary">
              Complete Your Profile
            </button>
            <button onClick={() => navigate('/jobs')} className="btn btn-secondary">
              Browse Jobs
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
        <h2 className="empty-state-title">Complete Your Assessment</h2>
        <p className="empty-state-description">
          Job recommendations will appear here based on your assessment results.
        </p>
        <button className="btn btn-primary empty-state-btn" onClick={() => navigate('/assessment')}>
          Take Assessment
        </button>
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;
