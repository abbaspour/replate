import React, {useEffect, useState} from 'react';
import {useApi} from '../lib/api';

export default function Calendar() {
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await api.get('/calendar/token');
      setData(res || null);
    } catch (e) {
      setErr(e.message || 'Failed to load calendar token');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <h2 style={{margin: 0}}>Calendar</h2>
          <button className="btn" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading && <p>Loading…</p>}
        {err && <p className="error">{err}</p>}
        {!loading && !err && (
          <>
            <p>Federated calendar access token response:</p>
            <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(data, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
}
