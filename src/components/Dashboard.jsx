const CARD_CONFIG = [
  { key: 'total',      label: 'Total Requests',    icon: '📋', color: 'var(--card-total)' },
  { key: 'open',       label: 'Open',              icon: '🔵', color: 'var(--card-open)' },
  { key: 'inProgress', label: 'In Progress',       icon: '🟡', color: 'var(--card-progress)' },
  { key: 'resolved',   label: 'Resolved',          icon: '🟢', color: 'var(--card-resolved)' },
  { key: 'highPri',    label: 'High Priority',     icon: '🔴', color: 'var(--card-high)' },
];

function countRequests(requests) {
  return {
    total: requests.length,
    open: requests.filter((r) => r.status === 'Open').length,
    inProgress: requests.filter((r) => r.status === 'In Progress').length,
    resolved: requests.filter((r) => r.status === 'Resolved').length,
    highPri: requests.filter((r) => r.priority === 'High').length,
  };
}

export default function Dashboard({ requests, loading, error }) {
  if (loading) {
    return (
      <section className="dashboard" aria-label="Dashboard summary">
        <div className="dashboard-cards">
          {CARD_CONFIG.map((card) => (
            <div key={card.key} className="summary-card summary-card--skeleton">
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--long" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard" aria-label="Dashboard summary">
        <div className="state-message state-message--error">
          <span className="state-icon">⚠️</span>
          <p>Could not load dashboard data.</p>
          <p className="state-detail">{error}</p>
        </div>
      </section>
    );
  }

  const counts = countRequests(requests);

  return (
    <section className="dashboard" aria-label="Dashboard summary">
      <div className="dashboard-cards">
        {CARD_CONFIG.map((card) => (
          <div key={card.key} className="summary-card" style={{ '--accent': card.color }}>
            <div className="summary-card__header">
              <span className="summary-card__icon">{card.icon}</span>
              <span className="summary-card__label">{card.label}</span>
            </div>
            <span className="summary-card__count">{counts[card.key]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
