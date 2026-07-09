import { useState, useEffect } from 'react';

const CATEGORY_OPTIONS = ['Account', 'Billing', 'Bug', 'Feature Request', 'General Inquiry', 'Technical'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function RequestCreateForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    requesterName: '',
    email: '',
    category: '',
    priority: 'Medium',
    status: 'Open',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && !success) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, success]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific validation error when user types
    setValidationErrors((prev) => prev.filter((err) => !err.toLowerCase().includes(name.toLowerCase())));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setValidationErrors(data.details);
        } else {
          setError(data.error || 'Failed to create request');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Delay closing to show success state briefly
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="panel-backdrop" onClick={() => !success && onClose()} />
      <aside className="detail-panel form-panel" role="dialog" aria-label="Create Request">
        <div className="detail-panel__header">
          {!success && (
            <button className="detail-panel__close" onClick={onClose} aria-label="Close panel" disabled={loading}>✕</button>
          )}
          <span className="detail-panel__number">New Request</span>
          <h2 className="detail-panel__title">Create Request</h2>
        </div>

        <div className="detail-panel__body">
          {success ? (
            <div className="state-message state-message--success" style={{ marginTop: '2rem' }}>
              <span className="state-icon">✅</span>
              <p>Request created successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="create-form">
              {error && (
                <div className="form-alert form-alert--error">
                  {error}
                </div>
              )}
              {validationErrors.length > 0 && (
                <div className="form-alert form-alert--error">
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="requesterName">Requester Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="requesterName"
                  name="requesterName"
                  className="form-input"
                  value={formData.requesterName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category <span className="required">*</span></label>
                  <select
                    id="category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="priority">Priority <span className="required">*</span></label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-input"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  className="form-input form-textarea"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
