import React, {useEffect, useState} from 'react';
import {useApi} from '../api/client';
import {useRoleAndScopes} from '../auth/AuthContext';

function StatusPill({status}) {
    const color =
        {
            New: '#e5e7eb',
            Triage: '#fde68a',
            'Logistics Assigned': '#bfdbfe',
            'In Transit': '#fbbf24',
            Delivered: '#86efac',
            Canceled: '#fecaca',
        }[status] || '#e5e7eb';
    return (
        <span className="pill" style={{background: color}}>
            {status}
        </span>
    );
}

export default function JobsList() {
    const api = useApi();
    const {role, scopes} = useRoleAndScopes();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const canUpdate = role === 'driver' && scopes.has('update:pickups');

    async function load() {
        setLoading(true);
        setErr('');
        try {
            const data = await api.get('/jobs');
            setJobs(data || []);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function setStatus(id, status) {
        try {
            await api.patch(`/jobs/${id}`, {status});
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2>Jobs</h2>
                {loading && <p>Loading…</p>}
                {err && <p className="error">{err}</p>}
                <div className="grid">
                    {jobs.map((j) => (
                        <div key={j.id} className="card">
                            <h3>Job #{j.id}</h3>
                            <p>
                                <StatusPill status={j.status} />
                            </p>
                            <p>
                                Pickup window: {new Date(j.pickup_window_start).toLocaleString()} –{' '}
                                {new Date(j.pickup_window_end).toLocaleString()}
                            </p>
                            <p>Food: {j.food_category?.join(', ')}</p>
                            <p>Estimated weight: {j.estimated_weight_kg} kg</p>
                            {canUpdate && (
                                <div style={{display: 'flex', gap: '.5rem'}}>
                                    <button className="btn accent" onClick={() => setStatus(j.id, 'In Transit')}>
                                        Mark In Transit
                                    </button>
                                    <button className="btn" onClick={() => setStatus(j.id, 'Delivered')}>
                                        Mark Delivered
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {jobs.length === 0 && !loading && <p>No jobs found.</p>}
            </div>
        </div>
    );
}
