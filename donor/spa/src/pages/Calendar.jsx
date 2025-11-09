import React, {useEffect, useState} from 'react';
import {useApi} from '../lib/api';
import {Client} from '@microsoft/microsoft-graph-client';

export default function Calendar() {
  const api = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  function todayRangeAsUtc() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return {
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    };
  }

  function parseGraphDate(dt) {
    if (!dt) return new Date();
    // dt is an object like { dateTime: '2025-11-09T10:00:00.0000000', timeZone: 'UTC' }
    const s = dt.dateTime || dt;
    if (!s) return new Date();
    // If there's no timezone info, treat it as UTC
    const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
    return new Date(hasZone ? s : `${s}Z`);
  }

  async function load() {
    setLoading(true);
    setErr('');
    try {
      // 1) Get federated Microsoft access token from our API
      const tokenResp = await api.get('/calendar/token');
      const accessToken = tokenResp?.access_token;
      if (!accessToken) throw new Error('No calendar access token received');

      // 2) Init Microsoft Graph client with the access token
      const client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => accessToken,
        },
      });

      // 3) Fetch today's events using calendarView
      const {startDateTime, endDateTime} = todayRangeAsUtc();
      const result = await client
        .api('/me/calendarView')
        .header('Prefer', 'outlook.timezone="UTC"')
        .query({startDateTime, endDateTime})
        .orderby('start/dateTime')
        .top(50)
        .get();

      const items = Array.isArray(result?.value) ? result.value : [];
      setEvents(items);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to load calendar');
      setEvents([]);
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
        {err && <p className="error" role="alert">{err}</p>}
        {!loading && !err && (
          events.length === 0 ? (
            <p className="text-muted">No events today.</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table className="table" style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr>
                    <th style={{textAlign: 'left', padding: '8px'}}>Event</th>
                    <th style={{textAlign: 'left', padding: '8px'}}>Date</th>
                    <th style={{textAlign: 'left', padding: '8px'}}>Start</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => {
                    const start = parseGraphDate(ev.start);
                    return (
                      <tr key={ev.id}>
                        <td style={{padding: '8px'}}>{ev.subject || '(no title)'}</td>
                        <td style={{padding: '8px'}}>{start.toLocaleDateString()}</td>
                        <td style={{padding: '8px'}}>{start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
