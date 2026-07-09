import { useEffect, useState, useCallback } from 'react';
import Dashboard from './components/Dashboard.jsx';
import RequestList from './components/RequestList.jsx';
import RequestDetail from './components/RequestDetail.jsx';
import RequestCreateForm from './components/RequestCreateForm.jsx';

export default function App() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadData = useCallback(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      fetch('/api/requests').then((r) => {
        if (!r.ok) throw new Error('Failed to load requests');
        return r.json();
      }),
      fetch('/api/users').then((r) => {
        if (!r.ok) throw new Error('Failed to load users');
        return r.json();
      }),
    ])
      .then(([reqData, userData]) => {
        if (active) {
          setRequests(reqData);
          setUsers(userData);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  function handleSelectRequest(id) {
    setSelectedRequestId(id);
  }

  function handleCloseDetail() {
    setSelectedRequestId(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Support Request Tracker</p>
          <h1>Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
            + Create Request
          </button>
        </div>
      </header>

      <Dashboard requests={requests} loading={loading} error={error} />

      <RequestList
        requests={requests}
        users={users}
        loading={loading}
        error={error}
        onSelectRequest={handleSelectRequest}
      />

      {selectedRequestId && (
        <RequestDetail
          requestId={selectedRequestId}
          users={users}
          onClose={handleCloseDetail}
          onUpdate={loadData}
        />
      )}

      {showCreateForm && (
        <RequestCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadData();
          }}
        />
      )}
    </main>
  );
}

