import { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { apiFetch } from '../api/api';

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('notifications');
        setItems(data.notifications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const markRead = async (id) => {
    try {
      await apiFetch(`notifications/${id}/read`, { method: 'PATCH' });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <h1 className="settings-title">Notifications</h1>
        {loading && <p>Loading notifications...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && items.length === 0 && <p>You have no notifications yet.</p>}
        {!loading && items.length > 0 && (
          <div className="card" style={{ display: 'grid', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.id} className="card" style={{ background: item.read ? '#fff' : '#f0f9ff' }}>
                <h3 style={{ marginBottom: '4px' }}>{item.type || 'Notification'}</h3>
                <p style={{ marginBottom: '8px' }}>{item.payload?.message || 'You have a new update.'}</p>
                <small>{new Date(item.created_at).toLocaleString()}</small>
                {!item.read && (
                  <div style={{ marginTop: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => markRead(item.id)}>
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
