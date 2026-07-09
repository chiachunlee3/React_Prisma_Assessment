import { useEffect, useState } from 'react';

const CATEGORY_OPTIONS = ['Account', 'Billing', 'Bug', 'Feature Request', 'General Inquiry', 'Technical'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];

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

export default function RequestDetail({ requestId, users, role, onClose, onUpdate }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!requestId) return;

    let active = true;
    setLoading(true);
    setError(null);
    setIsEditing(false);

    fetch(`/api/requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load request details');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setDetail(data);
          setEditForm({
            category: data.category,
            priority: data.priority,
            status: data.status,
            assignedTo: data.assignedTo || '',
            internalNote: data.internalNote || '',
          });
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
      if (e.key === 'Escape' && !isEditing) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, isEditing]);

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    // Convert empty string back to null for assignedTo
    const payload = {
      ...editForm,
      assignedTo: editForm.assignedTo === '' ? null : editForm.assignedTo,
    };

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      // Success
      setDetail(data);
      setIsEditing(false);
      onUpdate(); // Trigger dashboard refetch
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setSaveError(null);
    // Reset form to current detail state
    setEditForm({
      category: detail.category,
      priority: detail.priority,
      status: detail.status,
      assignedTo: detail.assignedTo || '',
      internalNote: detail.internalNote || '',
    });
  }

  return (
    <>
      <div className="panel-backdrop" onClick={() => !isEditing && onClose()} />
      <aside className="detail-panel" role="dialog" aria-label="Request detail">
        {/* Header */}
        <div className="detail-panel__header">
          {!isEditing && (
            <button className="detail-panel__close" onClick={onClose} aria-label="Close panel">✕</button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {loading && <div className="detail-panel__title-skeleton"><div className="skeleton-line" style={{ width: '50%', height: 20 }} /></div>}
              {error && <h2 className="detail-panel__title">Error</h2>}
              {detail && (
                <>
                  <span className="detail-panel__number">{detail.requestNumber}</span>
                  <h2 className="detail-panel__title">{detail.requesterName}</h2>
                </>
              )}
            </div>
            
            {detail && !isEditing && role === 'AGENT' && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                Edit Request
              </button>
            )}
          </div>
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
            <form onSubmit={handleSave}>
              {saveError && (
                <div className="form-alert form-alert--error" style={{ marginBottom: 24 }}>
                  {saveError}
                </div>
              )}

              {/* Info grid */}
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-field__label">Email</span>
                  <span className="detail-field__value">{detail.email}</span>
                </div>
                
                <div className="detail-field">
                  <span className="detail-field__label">Category</span>
                  {isEditing ? (
                    <select name="category" className="form-input" value={editForm.category} onChange={handleEditChange} required>
                      {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <span className="detail-field__value">{detail.category}</span>
                  )}
                </div>
                
                <div className="detail-field">
                  <span className="detail-field__label">Priority</span>
                  {isEditing ? (
                    <select name="priority" className="form-input" value={editForm.priority} onChange={handleEditChange} required>
                      {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className="detail-field__value">
                      <span className={priorityClass(detail.priority)}>{detail.priority}</span>
                    </span>
                  )}
                </div>
                
                <div className="detail-field">
                  <span className="detail-field__label">Status</span>
                  {isEditing ? (
                    <select name="status" className="form-input" value={editForm.status} onChange={handleEditChange} required>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className="detail-field__value">
                      <span className={statusClass(detail.status)}>{detail.status}</span>
                    </span>
                  )}
                </div>
                
                <div className="detail-field">
                  <span className="detail-field__label">Assigned To</span>
                  {isEditing ? (
                    <select name="assignedTo" className="form-input" value={editForm.assignedTo} onChange={handleEditChange}>
                      <option value="">Unassigned</option>
                      {users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  ) : (
                    <span className="detail-field__value">{detail.assignedTo || <span className="text-muted">Unassigned</span>}</span>
                  )}
                </div>
                
                <div className="detail-field">
                  <span className="detail-field__label">Created</span>
                  <span className="detail-field__value">{formatDateTime(detail.createdAt)}</span>
                </div>
                
                <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                  <span className="detail-field__label">Updated</span>
                  <span className="detail-field__value">{formatDateTime(detail.updatedAt)}</span>
                </div>
              </div>

              {/* Message (Read-only) */}
              <div className="detail-section">
                <h3 className="detail-section__title">Message</h3>
                <p className="detail-section__text">{detail.message}</p>
              </div>

              {/* Internal Note */}
              {(detail.internalNote || isEditing) && (
                <div className="detail-section detail-section--note">
                  <h3 className="detail-section__title">Internal Note</h3>
                  {isEditing ? (
                    <textarea
                      name="internalNote"
                      className="form-input form-textarea"
                      placeholder="Add a private note (e.g. actions taken, resolution info)..."
                      value={editForm.internalNote}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <p className="detail-section__text">{detail.internalNote}</p>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Event History (only visible when not editing, to save space) */}
              {!isEditing && (
                <div className="detail-section" style={{ marginTop: 32 }}>
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
              )}
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
