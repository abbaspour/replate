import React, {useEffect, useState} from 'react';
import {useApi} from '../api/client';
import {useRoleAndScopes} from '../auth/AuthContext';

export default function Dashboard() {
    const api = useApi();
    const {role, orgId, scopes} = useRoleAndScopes();
    const [stats, setStats] = useState({jobs: 0, schedules: 0});
    const [err, setErr] = useState('');

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const [jobs, schedules] = await Promise.all([
                    /*scopes.has('read:pickups')*/ true ? api.get('/jobs') : Promise.resolve([]),
                    /*scopes.has('read:schedules')*/ true ? api.get('/schedules') : Promise.resolve([]),
                ]);
                if (!mounted) return;
                setStats({jobs: jobs.length || 0, schedules: schedules.length || 0});
            } catch (e) {
                if (!mounted) return;
                setErr(e.message);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="container">
            <div className="card">
                <h2>Welcome</h2>
                <p>
                    Organization: <strong>{orgId}</strong>
                </p>
                <p>
                    Role: <strong>{role || 'n/a'}</strong>
                </p>
            </div>

            <div className="grid" style={{marginTop: '1rem'}}>
                <div className="card">
                    <h3>Jobs</h3>
                    <p>{stats.jobs}</p>
                </div>
                <div className="card">
                    <h3>Schedules</h3>
                    <p>{stats.schedules}</p>
                </div>
            </div>

            {err && <p className="error">{err}</p>}
        </div>
    );
}
