import { useEffect, useRef, useState } from 'react';
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
    PlusSquare,
    LogOut,
    ChevronDown
} from 'lucide-react';
import './Dashboard.css';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const profilePath = user?.role === 'employer' ? '/employer-profile' : '/profile';

    const doLogout = () => {
        setUserMenuOpen(false);
        logout();
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        const onClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        const onEscape = (e) => {
            if (e.key === 'Escape') setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

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
                    {/* Logout at bottom of sidebar */}
                    <button
                        type="button"
                        className="sidebar-nav-item sidebar-logout"
                        onClick={doLogout}
                    >
                        <LogOut className="sidebar-nav-icon" size={18} />
                        Log out
                    </button>
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
                        <button className="header-notification-btn" aria-label="Notifications">
                            <Bell size={20} />
                        </button>
                        <div className="user-menu" ref={userMenuRef}>
                            <button
                                className="header-avatar-btn"
                                onClick={() => setUserMenuOpen((o) => !o)}
                                aria-haspopup="menu"
                                aria-expanded={userMenuOpen}
                                aria-label="Account menu"
                            >
                                <span className="header-avatar-initials">
                                    {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
                                </span>
                                <ChevronDown size={14} className="header-avatar-caret" />
                            </button>
                            {userMenuOpen && (
                                <div className="user-menu-dropdown" role="menu">
                                    <div className="user-menu-header">
                                        <div className="user-menu-name">{user?.name || 'User'}</div>
                                        <div className="user-menu-email">{user?.email}</div>
                                        <div className="user-menu-role">{user?.role}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="user-menu-item"
                                        role="menuitem"
                                        onClick={() => { setUserMenuOpen(false); navigate(profilePath); }}
                                    >
                                        <User size={16} /> {user?.role === 'employer' ? 'Company profile' : 'My profile'}
                                    </button>
                                    <button
                                        type="button"
                                        className="user-menu-item"
                                        role="menuitem"
                                        onClick={() => { setUserMenuOpen(false); navigate('/settings'); }}
                                    >
                                        <Settings size={16} /> Settings
                                    </button>
                                    <div className="user-menu-divider" />
                                    <button
                                        type="button"
                                        className="user-menu-item user-menu-danger"
                                        role="menuitem"
                                        onClick={doLogout}
                                    >
                                        <LogOut size={16} /> Log out
                                    </button>
                                </div>
                            )}
                        </div>
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
