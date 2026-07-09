import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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

export default function RequestList({ requests, users, loading, error, onSelectRequest }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');

  // Extract unique categories from the data
  const categories = [...new Set(requests.map((r) => r.category))].sort();

  // Filter logic (client-side for instant feedback)
  const filtered = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (assignedFilter && r.assignedTo !== assignedFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.requesterName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.requestNumber.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFilterCount = [statusFilter, priorityFilter, categoryFilter, assignedFilter].filter(Boolean).length;

  function handleClearFilters() {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setAssignedFilter('');
  }

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <section className="request-list-section" aria-label="Support requests">
        <h2 className="section-title">Requests</h2>
        <div className="filter-bar">
          <div className="skeleton-line" style={{ width: '100%', height: 40, borderRadius: 8 }} />
        </div>
        <div className="request-table-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="request-row request-row--skeleton">
              <div className="skeleton-line" style={{ width: '90%', height: 16 }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="request-list-section" aria-label="Support requests">
        <h2 className="section-title">Requests</h2>
        <div className="state-message state-message--error">
          <span className="state-icon">⚠️</span>
          <p>Could not load requests.</p>
          <p className="state-detail">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="request-list-section" aria-label="Support requests">
      <div className="section-header">
        <h2 className="section-title">Requests</h2>
        {activeFilterCount > 0 && (
          <button className="btn-link" onClick={handleClearFilters}>
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="filter-bar">
        <div className="filter-search">
          <span className="filter-search__icon" aria-hidden="true">🔍</span>
          <input
            id="search-input"
            type="text"
            className="filter-input"
            placeholder="Search by name, email, or request #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="status-filter"
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          id="priority-filter"
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          id="category-filter"
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          id="assigned-filter"
          className="filter-select"
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
        >
          <option value="">All Assigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.name}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="state-message">
          <span className="state-icon">📭</span>
          <p>No requests match your filters.</p>
          <button className="btn-link" onClick={handleClearFilters}>Clear all filters</button>
        </div>
      ) : (
        <div className="request-table-wrap">
          <table className="request-table" id="request-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Requester</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="request-row"
                  onClick={() => onSelectRequest(r.id)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectRequest(r.id); }}
                >
                  <td className="cell-mono">{r.requestNumber}</td>
                  <td>
                    <div className="cell-name">{r.requesterName}</div>
                    <div className="cell-email">{r.email}</div>
                  </td>
                  <td>{r.category}</td>
                  <td><span className={priorityClass(r.priority)}>{r.priority}</span></td>
                  <td><span className={statusClass(r.status)}>{r.status}</span></td>
                  <td className="cell-assigned">{r.assignedTo || <span className="text-muted">Unassigned</span>}</td>
                  <td className="cell-date">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="result-count">
        Showing {filtered.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
      </p>
    </section>
  );
}
