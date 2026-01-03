import { useState } from 'react';
import SkillTag from './SkillTag';
import { Search, MapPin, DollarSign, Clock, Bookmark, ArrowRight } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './JobList.css';

const JobList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('best-match');

  // Mock job data with match information
  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Inc.',
      companyLogo: 'TC',
      location: 'New York, NY',
      salary: '$120k - $150k',
      type: 'Full-time',
      matchPercentage: 85,
      description: 'We are looking for an experienced full stack developer to join our growing team...',
      posted: '2 days ago',
      applicants: 24,
      yourSkills: [
        { name: 'React', level: 'exact' },
        { name: 'Node.js', level: 'strong' },
        { name: 'PostgreSQL', level: 'strong' }
      ],
      skillsToLearn: [
        { name: 'GraphQL', level: 'learning' },
        { name: 'Docker', level: 'learning' }
      ]
    },
    {
      id: 2,
      title: 'Frontend React Developer',
      company: 'StartupXYZ',
      companyLogo: 'SX',
      location: 'San Francisco, CA',
      salary: '$90k - $120k',
      type: 'Full-time',
      matchPercentage: 92,
      description: 'Join our innovative startup as a React developer...',
      posted: '1 week ago',
      applicants: 18,
      yourSkills: [
        { name: 'React', level: 'exact' },
        { name: 'TypeScript', level: 'exact' },
        { name: 'CSS', level: 'strong' }
      ],
      skillsToLearn: []
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      companyLogo: 'CT',
      location: 'Remote',
      salary: '$100k - $130k',
      type: 'Full-time',
      matchPercentage: 45,
      description: 'Manage our cloud infrastructure and CI/CD pipelines...',
      posted: '3 days ago',
      applicants: 31,
      yourSkills: [
        { name: 'AWS', level: 'partial' },
        { name: 'Linux', level: 'strong' }
      ],
      skillsToLearn: [
        { name: 'Kubernetes', level: 'learning' },
        { name: 'Terraform', level: 'learning' },
        { name: 'Docker', level: 'learning' }
      ]
    },
    {
      id: 4,
      title: 'Product Manager',
      company: 'InnovateLabs',
      companyLogo: 'IL',
      location: 'Austin, TX',
      salary: '$110k - $140k',
      type: 'Full-time',
      matchPercentage: 78,
      description: 'Lead product development from ideation to launch...',
      posted: '5 days ago',
      applicants: 12,
      yourSkills: [
        { name: 'Product Strategy', level: 'strong' },
        { name: 'Agile', level: 'exact' },
        { name: 'Analytics', level: 'strong' }
      ],
      skillsToLearn: [
        { name: 'SQL', level: 'learning' }
      ]
    }
  ];

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(job =>
    job.location.toLowerCase().includes(location.toLowerCase())
  );

  const getMatchBarClass = (percentage) => {
    if (percentage >= 90) return 'exact';
    if (percentage >= 75) return 'strong';
    if (percentage >= 50) return 'partial';
    return 'learning';
  };

  const getMatchColor = (level) => {
    switch (level) {
      case 'exact': return '#10B981';
      case 'strong': return '#3B82F6';
      case 'partial': return '#F59E0B';
      case 'learning': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <DashboardLayout>
      <div className="job-list-page">
        <div className="job-list-header">
          <h1>Find Your Dream Job</h1>
          <p>Discover opportunities that match your skills and experience</p>
        </div>

        <div className="job-list-content">
          {/* Search Filters */}
          <section className="search-filters-section">
            <div className="search-filters-card">
              <div className="search-filters-grid">
                <div className="search-input-group">
                  <Search className="search-input-icon" size={20} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="location-input"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="best-match">Best Match</option>
                  <option value="most-recent">Most Recent</option>
                  <option value="highest-salary">Highest Salary</option>
                </select>
              </div>
            </div>
          </section>

          {/* Jobs Grid */}
          <section className="jobs-section">
            <div className="jobs-grid">
              {filteredJobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="company-info">
                      <div className="company-logo">{job.companyLogo}</div>
                      <div className="company-details">
                        <h3>{job.company}</h3>
                      </div>
                    </div>
                    <button className="bookmark-btn" aria-label="Bookmark job">
                      <Bookmark size={20} />
                    </button>
                  </div>

                  <h2 className="job-title">{job.title}</h2>

                  <div className="job-meta">
                    <div className="job-meta-item">
                      <MapPin className="job-meta-icon" size={16} />
                      {job.location}
                    </div>
                    <div className="job-meta-item">
                      <DollarSign className="job-meta-icon" size={16} />
                      {job.salary}
                    </div>
                    <div className="job-meta-item">
                      <Clock className="job-meta-icon" size={16} />
                      {job.type}
                    </div>
                  </div>

                  <div className="match-section">
                    <div className="match-bar-container">
                      <div
                        className={`match-bar-fill ${getMatchBarClass(job.matchPercentage)}`}
                        style={{ width: `${job.matchPercentage}%` }}
                      ></div>
                    </div>
                    <span
                      className="match-percentage"
                      style={{ color: getMatchColor(getMatchBarClass(job.matchPercentage)) }}
                    >
                      {job.matchPercentage}% Match
                    </span>
                  </div>

                  {job.yourSkills.length > 0 && (
                    <div className="skills-section">
                      <div className="skills-section-title">Your Skills</div>
                      <div className="skills-tags">
                        {job.yourSkills.map((skill, index) => (
                          <SkillTag
                            key={index}
                            skill={skill.name}
                            matchLevel={skill.level}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {job.skillsToLearn.length > 0 && (
                    <div className="skills-section">
                      <div className="skills-section-title">Skills to Learn</div>
                      <div className="skills-tags">
                        {job.skillsToLearn.map((skill, index) => (
                          <SkillTag
                            key={index}
                            skill={skill.name}
                            matchLevel={skill.level}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="job-card-footer">
                    <div className="job-stats">
                      Posted {job.posted} · {job.applicants} applicants
                    </div>
                    <div className="job-actions">
                      <button className="btn btn-secondary">View Details</button>
                      <button className="btn btn-primary">
                        Quick Apply
                        <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Load More */}
          <section className="load-more-section">
            <button className="load-more-btn">Load More Jobs</button>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobList;