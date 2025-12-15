import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Assess',
      description: 'Take a skill assessment tailored to your domain'
    },
    {
      icon: '⚡',
      title: 'Match',
      description: 'Get personalized job recommendations'
    },
    {
      icon: '🤝',
      title: 'Connect',
      description: 'Apply to roles where you\'re a proven fit'
    }
  ];

  const domains = [
    {
      title: 'IT & Technology',
      icon: '💻',
      subcategories: ['Frontend Development', 'Backend Development', 'DevOps', 'Data Science']
    },
    {
      title: 'Finance & Banking',
      icon: '💰',
      subcategories: ['Financial Analysis', 'Risk Management', 'Investment Banking', 'Compliance']
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Find Your Next Role. Powered by Your Skills.</h1>
              <p className="hero-subtitle">
                Assessment-driven matching for IT and Finance professionals
              </p>
              <div className="hero-ctas">
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
                <Link to="/register?role=employer" className="btn-secondary">
                  For Employers
                </Link>
              </div>
              <div className="hero-trust">
                <p>No spam. No endless applications. Just matches.</p>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-illustration">
                {/* Placeholder for illustration */}
                <div className="illustration-placeholder">
                  <div className="stat-card">
                    <div className="stat-number">85%</div>
                    <div className="stat-label">Match Rate</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">24hrs</div>
                    <div className="stat-label">Avg Response</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">10k+</div>
                    <div className="stat-label">Jobs Posted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="domains">
        <div className="container">
          <h2 className="section-title">Domains We Serve</h2>
          <div className="domains-grid">
            {domains.map((domain, index) => (
              <div key={index} className="domain-card card card-interactive">
                <div className="domain-header">
                  <div className="domain-icon">{domain.icon}</div>
                  <h3 className="domain-title">{domain.title}</h3>
                </div>
                <ul className="domain-subcategories">
                  {domain.subcategories.map((sub, subIndex) => (
                    <li key={subIndex}>{sub}</li>
                  ))}
                </ul>
                <Link to="/register" className="btn btn-primary">
                  Start Assessment
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About</h4>
              <p>Assessment-driven job matching for professionals in IT and Finance.</p>
            </div>
            <div className="footer-section">
              <h4>For Users</h4>
              <ul>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><a href="#assessment">Take Assessment</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Employers</h4>
              <ul>
                <li><Link to="/register?role=employer">Post Jobs</Link></li>
                <li><a href="#candidates">Find Candidates</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 The Platform. All rights reserved.</p>
            <div className="social-links">
              <a href="#linkedin">LinkedIn</a>
              <a href="#twitter">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;