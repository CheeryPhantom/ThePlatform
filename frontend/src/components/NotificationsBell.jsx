import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { apiFetch } from '../api/api';

const friendlyType = (n) => {
  const t = n.type || '';
  if (t === 'application.received') {
    const title = n.payload?.job_title || 'a job';
    return `New application for ${title}`;
  }
  if (t.startsWith('application.status.')) {
    const status = t.replace('application.status.', '').replace('_', ' ');
    const title = n.payload?.job_title || 'your application';
    return `Status updated to ${status} for ${title}`;
  }
  return t.replace(/[._]/g, ' ');
};

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchAll = (silent = false) => {
    if (!silent) setLoading(true);
    apiFetch('notifications?limit=15')
      .then((d) => {
        setItems(d.notifications || []);
        setUnread(d.unread_count || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Initial fetch + 60s poll for unread badge
  useEffect(() => {
    fetchAll(true);
    const t = setInterval(() => fetchAll(true), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEscape = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchAll();
  };

  const openLink = async (n) => {
    setOpen(false);
    if (!n.read) {
      try {
        await apiFetch('notifications/mark-read', {
          method: 'POST',
          body: JSON.stringify({ ids: [n.id] })
        });
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        // ignore
      }
    }
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    try {
      await apiFetch('notifications/mark-all-read', { method: 'POST' });
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="notifications-bell" ref={ref}>
      <button
        type="button"
        className="header-notification-btn"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="notifications-dropdown" role="menu">
          <div className="notifications-header">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="notifications-mark-all" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <div className="notifications-empty">Loading…</div>
          ) : items.length === 0 ? (
            <div className="notifications-empty">No notifications yet.</div>
          ) : (
            <ul className="notifications-list">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item ${n.read ? '' : 'unread'}`}
                  onClick={() => openLink(n)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openLink(n)}
                >
                  <div className="notification-text">{friendlyType(n)}</div>
                  <div className="notification-time">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
