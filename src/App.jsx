import Dashboard from './components/Dashboard.jsx';

export default function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Support Request Tracker</p>
          <h1>Dashboard</h1>
        </div>
      </header>

      <Dashboard />
    </main>
  );
}
