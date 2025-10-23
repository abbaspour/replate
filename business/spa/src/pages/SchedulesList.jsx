import React, {useEffect, useState} from 'react';
import {useApi} from '../api/client';
import {useRoleAndScopes} from '../auth/AuthContext';

export default function SchedulesList() {
    const api = useApi();
    const {role, scopes} = useRoleAndScopes();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const canUpdate = (role === 'admin' || role === 'member') /*&& scopes.has('update:schedules')*/;

    async function load() {
        setLoading(true);
        setErr('');
        try {
            const data = await api.get('/schedules');
            setItems(data || []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function toggleActive(id, current) {
        try {
            await api.patch(`/schedules/${id}`, {is_active: !current});
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Pickup Schedules</h2>
                {loading && <p>Loading…</p>}
                {err && <p className="error">{err}</p>}
                <div className="grid">
                    {items.map((it) => (
                        <div key={it.id} className="card">
                            <h3>Schedule #{it.id}</h3>
                            <p>
                                Active: <strong>{it.is_active ? 'Yes' : 'No'}</strong>
                            </p>
                            <p>Cron: {it.cron_expression}</p>
                            <p>
                                Pickup at: {it.pickup_time_of_day} for {it.pickup_duration_minutes} mins
                            </p>
                            {canUpdate && (
                                <button className="btn" onClick={() => toggleActive(it.id, it.is_active)}>
                                    {it.is_active ? 'Disable' : 'Enable'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {items.length === 0 && !loading && <p>No schedules found.</p>}
            </div>
        </div>
    );
}
