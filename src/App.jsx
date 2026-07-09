import { useEffect, useState } from 'react';

const nextTasks = [
  'Add Prisma schema and seed data',
  'Build request API endpoints',
  'Build dashboard, filters, detail, create, and edit UI',
  'Add role rules, validation, empty/error/success states, and responsive polish',
  'Document setup and QA evidence for submission',
];

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking API...');

  useEffect(() => {
    let active = true;

    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('API returned an error');
        }
        return response.json();
      })
      .then((data) => {
        if (active) {
          setApiStatus(data.ok ? 'API connected' : 'API unavailable');
        }
      })
      .catch(() => {
        if (active) {
          setApiStatus('API not running');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Freelance React + Prisma Assessment</p>
          <h1>Support Request Tracker</h1>
          <p className="lede">
            Project scaffold is ready. The next step is wiring Prisma-backed support request data.
          </p>
        </div>
        <div className="status-panel" aria-label="Project status">
          <span className="status-label">Step 1</span>
          <strong>Scaffold complete</strong>
          <span className="api-status">{apiStatus}</span>
        </div>
      </section>

      <section className="work-grid" aria-label="Implementation plan">
        <article>
          <h2>Included in this step</h2>
          <ul>
            <li>React app entry point with Vite</li>
            <li>Express API placeholder at <code>/api/health</code></li>
            <li>Root run scripts for app, API, Prisma, and setup</li>
            <li>Environment example and ignore rules for local secrets/database files</li>
          </ul>
        </article>

        <article>
          <h2>Remaining work</h2>
          <ol>
            {nextTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
