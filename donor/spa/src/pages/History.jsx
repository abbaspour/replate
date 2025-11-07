import React, {useEffect, useState} from 'react';
import {useApi} from '../lib/api';

export default function History() {
  const api = useApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get('/donations');
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="container">
      <div className="card">
        <h2>Donation History</h2>
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="error" role="alert">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-muted">No donations yet.</p>
        ) : (
          <ul>
            {items.map((d) => (
              <li key={d.id}>
                <strong>{d.amount} {d.currency || 'USD'}</strong> — <span>{new Date(d.created_at || d.createdAt || Date.now()).toLocaleString()}</span> — <em>{d.status}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
