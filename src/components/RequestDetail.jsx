import { useEffect, useState } from 'react';

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function priorityClass(priority) {
  const map = { High: 'high', Medium: 'medium', Low: 'low' };
  return `badge badge--${map[priority] || 'default'}`;
}

function statusClass(status) {
  const map = { Open: 'open', 'In Progress': 'progress', Resolved: 'resolved', Closed: 'closed' };
  return `badge badge--${map[status] || 'default'}`;
}

export default function RequestDetail({ requestId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId) return;

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load request details');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [requestId]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="detail-panel" role="dialog" aria-label="Request detail">
        {/* Header */}
        <div className="detail-panel__header">
          <button className="detail-panel__close" onClick={onClose} aria-label="Close panel">✕</button>

          {loading && <div className="detail-panel__title-skeleton"><div className="skeleton-line" style={{ width: '50%', height: 20 }} /></div>}
          {error && <h2 className="detail-panel__title">Error</h2>}
          {detail && (
            <>
              <span className="detail-panel__number">{detail.requestNumber}</span>
              <h2 className="detail-panel__title">{detail.requesterName}</h2>
            </>
          )}
        </div>

        {/* Body */}
        <div className="detail-panel__body">
          {loading && (
            <div className="detail-panel__skeleton">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-line" style={{ width: `${70 + Math.random() * 30}%`, height: 14, marginBottom: 16 }} />
              ))}
            </div>
          )}

          {error && (
            <div className="state-message state-message--error">
              <span className="state-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {detail && (
            <>
              {/* Info grid */}
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-field__label">Email</span>
                  <span className="detail-field__value">{detail.email}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field__label">Category</span>
                  <span className="detail-field__value">{detail.category}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field__label">Priority</span>
                  <span className="detail-field__value">
                    <span className={priorityClass(detail.priority)}>{detail.priority}</span>
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-field__label">Status</span>
                  <span className="detail-field__value">
                    <span className={statusClass(detail.status)}>{detail.status}</span>
                  </span>
                </div>
                <div className="detail-field">
                  <span className="detail-field__label">Assigned To</span>
                  <span className="detail-field__value">{detail.assignedTo || <span className="text-muted">Unassigned</span>}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field__label">Created</span>
                  <span className="detail-field__value">{formatDateTime(detail.createdAt)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field__label">Updated</span>
                  <span className="detail-field__value">{formatDateTime(detail.updatedAt)}</span>
                </div>
              </div>

              {/* Message */}
              <div className="detail-section">
                <h3 className="detail-section__title">Message</h3>
                <p className="detail-section__text">{detail.message}</p>
              </div>

              {/* Internal Note */}
              {detail.internalNote && (
                <div className="detail-section detail-section--note">
                  <h3 className="detail-section__title">Internal Note</h3>
                  <p className="detail-section__text">{detail.internalNote}</p>
                </div>
              )}

              {/* Event History */}
              <div className="detail-section">
                <h3 className="detail-section__title">History</h3>
                {detail.events && detail.events.length > 0 ? (
                  <ul className="event-timeline">
                    {detail.events.map((event) => (
                      <li key={event.id} className="event-timeline__item">
                        <div className="event-timeline__dot" />
                        <div className="event-timeline__content">
                          <span className="event-timeline__action">{event.action}</span>
                          {event.note && <p className="event-timeline__note">{event.note}</p>}
                          <span className="event-timeline__time">{formatDateTime(event.createdAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>No history events recorded.</p>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
