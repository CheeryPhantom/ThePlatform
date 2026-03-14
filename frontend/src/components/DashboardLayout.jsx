import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Home,
    User,
    Briefcase,
    Settings,
    Bell,
    Menu,
    X,
    Search,
    Building2,
    PlusSquare
} from 'lucide-react';
import './Dashboard.css';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const profilePath = user?.role === 'employer' ? '/employer-profile' : '/profile';

    const sidebarItems = user?.role === 'employer'
        ? [
            { icon: Home, label: 'Dashboard', path: '/dashboard' },
            { icon: Building2, label: 'Company Profile', path: '/employer-profile' },
            { icon: Briefcase, label: 'Job Listings', path: '/jobs' },
            { icon: PlusSquare, label: 'Post A Role', path: '/jobs' },
            { icon: Settings, label: 'Settings', path: '/settings' }
        ]
        : [
            { icon: Home, label: 'Dashboard', path: '/dashboard' },
            { icon: User, label: 'Profile', path: '/profile' },
            { icon: Briefcase, label: 'Jobs', path: '/jobs' },
            { icon: Settings, label: 'Settings', path: '/settings' }
        ];

    if (!user) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="dashboard-layout">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="dashboard-overlay" onClick={closeSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="dashboard-sidebar-header">
                    <div className="sidebar-logo">The Platform</div>
                    <button className="sidebar-close-btn" onClick={closeSidebar}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="dashboard-sidebar-nav">
                    {sidebarItems.map((item, index) => (
                        <a
                            key={index}
                            href="#"
                            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(item.path);
                                closeSidebar();
                            }}
                        >
                            <item.icon className="sidebar-nav-icon" />
                            {item.label}
                        </a>
                    ))}
                    {/* Logout at bottom of sidebar mobile/desktop */}
                    <a
                        href="#"
                        className="sidebar-nav-item"
                        onClick={(e) => {
                            e.preventDefault();
                            logout();
                            navigate('/login');
                        }}
                        style={{ marginTop: 'auto', borderTop: '1px solid var(--gray-200)' }}
                    >
                        <span className="sidebar-nav-icon">🚪</span>
                        Logout
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <div className="header-search">
                        {location.pathname === '/jobs' ? null : (
                            <div style={{ position: 'relative' }}>
                                <Search className="header-search-icon" size={16} />
                                <input
                                    type="text"
                                    className="header-search-input"
                                    placeholder={user?.role === 'employer' ? 'Search your workspace...' : 'Search...'}
                                />
                            </div>
                        )}
                    </div>
                    <div className="header-actions">
                        <button className="header-notification-btn">
                            <Bell size={20} />
                        </button>
                        <button className="header-avatar-btn" onClick={() => navigate(profilePath)} title="Open profile">
                            {user?.name ? user.name[0].toUpperCase() : <User size={20} />}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
