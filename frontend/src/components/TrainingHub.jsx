import { useState } from 'react';
import { PlayCircle, Clock, Star, BookOpen, Filter, Search } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import './TrainingHub.css';

const TrainingHub = () => {
    const [activeTab, setActiveTab] = useState('all'); // all, enrolled
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Development', 'Design', 'Business', 'Marketing'];

    const courses = [
        {
            id: 1,
            title: 'Advanced React Patterns',
            instructor: 'Sarah Drasner',
            rating: 4.8,
            students: 1250,
            duration: '4h 30m',
            category: 'Development',
            image: 'https://via.placeholder.com/300x180?text=React+Patterns',
            progress: 0,
            enrolled: false
        },
        {
            id: 2,
            title: 'UI/UX Design Masterclass',
            instructor: 'Gary Simon',
            rating: 4.9,
            students: 2100,
            duration: '6h 15m',
            category: 'Design',
            image: 'https://via.placeholder.com/300x180?text=UI/UX+Design',
            progress: 35,
            enrolled: true
        },
        {
            id: 3,
            title: 'Technical Project Management',
            instructor: 'PMP Certified',
            rating: 4.6,
            students: 850,
            duration: '8h 00m',
            category: 'Business',
            image: 'https://via.placeholder.com/300x180?text=Project+Management',
            progress: 0,
            enrolled: false
        },
        {
            id: 4,
            title: 'Node.js Microservices',
            instructor: 'Maximilian',
            rating: 4.7,
            students: 1500,
            duration: '10h 45m',
            category: 'Development',
            image: 'https://via.placeholder.com/300x180?text=Node.js',
            progress: 10,
            enrolled: true
        }
    ];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesTab = activeTab === 'all' || (activeTab === 'enrolled' && course.enrolled);
        return matchesSearch && matchesCategory && matchesTab;
    });

    return (
        <DashboardLayout>
            <div className="training-page">
                <div className="training-header">
                    <h1>Training Hub</h1>
                    <p>Upgrade your skills with industry-leading courses.</p>
                </div>

                <div className="training-controls">
                    <div className="training-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            Browse Courses
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'enrolled' ? 'active' : ''}`}
                            onClick={() => setActiveTab('enrolled')}
                        >
                            My Learning
                        </button>
                    </div>

                    <div className="training-filters">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="category-filter">
                            <Filter size={18} className="filter-icon" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="courses-grid">
                    {filteredCourses.map(course => (
                        <div key={course.id} className="course-card">
                            <div className="course-image">
                                <div className="image-overlay">
                                    <PlayCircle size={48} className="play-icon" />
                                </div>
                                {/* Using a colored div as placeholder if image fails or for design */}
                                <div className="placeholder-image" style={{ background: `linear-gradient(135deg, ${getColorForCategory(course.category)}20, ${getColorForCategory(course.category)}40)` }}>
                                    <span style={{ color: getColorForCategory(course.category) }}>{course.category}</span>
                                </div>
                            </div>
                            <div className="course-content">
                                <div className="course-meta">
                                    <span className="course-category">{course.category}</span>
                                    <div className="course-rating">
                                        <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                                        <span>{course.rating}</span>
                                        <span className="text-gray-400">({course.students})</span>
                                    </div>
                                </div>
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-instructor">by {course.instructor}</p>

                                {course.enrolled ? (
                                    <div className="course-progress-section">
                                        <div className="progress-info">
                                            <span>{course.progress}% Complete</span>
                                        </div>
                                        <div className="progress-track">
                                            <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                                        </div>
                                        <button className="btn btn-secondary btn-sm mt-3 w-full">Continue Learning</button>
                                    </div>
                                ) : (
                                    <div className="course-footer">
                                        <div className="course-duration">
                                            <Clock size={16} />
                                            {course.duration}
                                        </div>
                                        <button className="btn btn-primary btn-sm">Enroll Now</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

const getColorForCategory = (category) => {
    switch (category) {
        case 'Development': return '#3B82F6';
        case 'Design': return '#EC4899';
        case 'Business': return '#10B981';
        case 'Marketing': return '#F59E0B';
        default: return '#6B7280';
    }
};

export default TrainingHub;
