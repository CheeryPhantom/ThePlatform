import { useEffect, useState } from 'react';
import { Award, Medal, Trophy, Gem } from 'lucide-react';
import { apiFetch } from '../../api/api';

const TIER_STYLE = {
  bronze: { color: '#b08d57', Icon: Medal, label: 'Bronze' },
  silver: { color: '#b0b7bf', Icon: Medal, label: 'Silver' },
  gold: { color: '#d4af37', Icon: Trophy, label: 'Gold' },
  platinum: { color: '#7ed7ff', Icon: Gem, label: 'Platinum' }
};

const TrophyCase = () => {
  const [badges, setBadges] = useState([]);
  const [counts, setCounts] = useState({ bronze: 0, silver: 0, gold: 0, platinum: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    apiFetch('certifications/badges')
      .then((d) => {
        setBadges(d.badges || []);
        setCounts(d.counts || { bronze: 0, silver: 0, gold: 0, platinum: 0 });
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="trophy-case loading">Loading trophies…</div>;

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">
        <Award size={20} /> Trophy Case
      </h2>
      {err && <div className="error-message">{err}</div>}

      <div className="trophy-tier-summary">
        {Object.entries(TIER_STYLE).map(([tier, style]) => {
          const { Icon, color, label } = style;
          return (
            <div key={tier} className="trophy-tier-summary-item" style={{ '--tier-color': color }}>
              <Icon size={18} style={{ color }} />
              <span className="trophy-tier-count">{counts[tier] || 0}</span>
              <span className="trophy-tier-label">{label}</span>
            </div>
          );
        })}
      </div>

      {badges.length === 0 ? (
        <div className="trophy-empty">
          <p>No badges yet. Complete a certification and submit the credential to earn your first trophy.</p>
        </div>
      ) : (
        <div className="trophy-grid">
          {badges.map((b) => {
            const style = TIER_STYLE[b.tier] || TIER_STYLE.bronze;
            const Icon = style.Icon;
            return (
              <div key={b.id} className="trophy-card" style={{ '--tier-color': style.color }}>
                <div className="trophy-icon">
                  <Icon size={28} style={{ color: style.color }} />
                </div>
                <div className="trophy-body">
                  <h4>{b.label}</h4>
                  <p className="trophy-meta">
                    <span className="trophy-tier-chip" style={{ '--tier-color': style.color }}>
                      {style.label}
                    </span>
                    <span className="trophy-source">{b.source.replaceAll('_', ' ')}</span>
                  </p>
                  {b.description && <p className="trophy-desc">{b.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TrophyCase;
