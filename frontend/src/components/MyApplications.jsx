import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, ExternalLink, X } from 'lucide-react';
import { apiFetch } from '../api/api';
import DashboardLayout from './DashboardLayout';
import './MyApplications.css';

const STATUS_LABEL = {
  submitted: 'Submitted',
  reviewing: 'Under review',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  rejected: 'Not selected',
  hired: 'Hired',
  withdrawn: 'Withdrawn'
};

const MyApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch('jobs/applications/mine')
      .then((d) => setApps(d.applications || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application? You can re-apply later.')) return;
    setPendingId(id);
    try {
      await apiFetch(`jobs/applications/${id}/withdraw`, { method: 'POST' });
      load();
    } catch (e) {
      alert(e.message || 'Withdraw failed');
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="my-applications-page">
        <header className="my-applications-header">
          <h1>My applications</h1>
          <p>Track the roles you've applied to.</p>
        </header>

        {err && <div className="error-message">{err}</div>}

        {apps.length === 0 ? (
          <div className="empty-state-card">
            <Briefcase size={48} />
            <h3>No applications yet</h3>
            <p>Browse open roles and apply — they'll show up here with status updates.</p>
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
          </div>
        ) : (
          <ul className="application-list">
            {apps.map((a) => {
              const stage = STATUS_LABEL[a.status] || a.status;
              const statusClass = `status-${a.status}`;
              const canWithdraw = !['hired', 'withdrawn'].includes(a.status);
              return (
                <li key={a.id} className="application-row">
                  <div className="application-main">
                    <div className="application-company-logo">
                      {a.company_logo_url ? (
                        <img src={a.company_logo_url} alt="" />
                      ) : (
                        (a.company_name || a.title || '??').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="application-meta">
                      <Link to={`/jobs/${a.job_id}`} className="application-title">
                        {a.title}
                        <ExternalLink size={12} style={{ marginLeft: 6 }} />
                      </Link>
                      <div className="application-company">{a.company_name || 'Company'}</div>
                      <div className="application-applied">
                        <Clock size={12} />
                        Applied {new Date(a.applied_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="application-side">
                    <span className={`application-status ${statusClass}`}>{stage}</span>
                    {canWithdraw && (
                      <button
                        type="button"
                        className="application-withdraw"
                        onClick={() => withdraw(a.id)}
                        disabled={pendingId === a.id}
                      >
                        <X size={12} /> {pendingId === a.id ? 'Withdrawing…' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
