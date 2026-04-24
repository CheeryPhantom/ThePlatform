import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Assess',
      description: 'A short, domain-specific skill test. No multi-hour puzzles, no trick questions — just the tech and concepts actual employers hire for.',
      step: 'Step 1'
    },
    {
      icon: '⚡',
      title: 'Match',
      description: 'Your profile and score map to live roles with a clear strength rating, so you stop guessing whether a posting is worth your time.',
      step: 'Step 2'
    },
    {
      icon: '🤝',
      title: 'Connect',
      description: 'One-tap apply with your pre-scored profile — employers see proof of skill, not just another resume lost in a pile.',
      step: 'Step 3'
    }
  ];

  const audiences = [
    {
      title: 'For candidates',
      bullets: [
        'Get matched to roles that actually fit your skill level',
        'Skip the black-hole resume drop',
        'See what you need to learn to unlock higher matches'
      ],
      cta: 'Create your profile',
      to: '/register'
    },
    {
      title: 'For employers',
      bullets: [
        'Pre-screened candidates by skill, not keywords',
        'Role-aware workspace separate from candidate browsing',
        'Post once, reach Nepal\'s IT and Finance talent'
      ],
      cta: 'Hire on The Platform',
      to: '/register?role=employer'
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
      {/* Navigation Header */}
      <nav className="landing-nav container">
        <div className="nav-logo">The Platform</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Log In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

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
                <Link to="/register" className="landing-btn-primary">
                  Start Your Journey
                </Link>
                <Link to="/register?role=employer" className="landing-btn-secondary">
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
                    <div className="stat-number">85<span className="stat-unit">%</span></div>
                    <div className="stat-label">Match Rate</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">24<span className="stat-unit">hr</span></div>
                    <div className="stat-label">Avg Response</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">10<span className="stat-unit">k+</span></div>
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
          <p className="section-subtitle">Three steps — built around the reality of job hunting in IT and Finance.</p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-step">{feature.step}</div>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience split */}
      <section className="audience-section">
        <div className="container">
          <div className="audience-grid">
            {audiences.map((a) => (
              <div key={a.title} className="audience-card">
                <h3 className="audience-title">{a.title}</h3>
                <ul className="audience-bullets">
                  {a.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link to={a.to} className="audience-cta">
                  {a.cta} →
                </Link>
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