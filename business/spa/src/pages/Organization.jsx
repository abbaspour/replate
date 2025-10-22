import React, {useEffect, useState} from 'react';
import {useApi} from '../api/client';
import {useRoleAndScopes} from '../auth/AuthContext';

export default function Organization() {
    const api = useApi();
    const {role, orgId, scopes} = useRoleAndScopes();
    const [org, setOrg] = useState(null);
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const canRead = scopes.has('read:organization');
    const canUpdate = role === 'admin' && scopes.has('update:organization');

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!canRead) return;
            try {
                const data = await api.get(`/organizations/${orgId}`);
                if (mounted) setOrg(data);
            } catch (e) {
                if (mounted) setErr(e.message);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [orgId, canRead]);

    async function onSave(e) {
        e.preventDefault();
        setErr('');
        setMsg('');
        try {
            const body = {
                metadata: {
                    pickup_address: org?.pickup_address || undefined,
                    delivery_address: org?.delivery_address || undefined,
                    coverage_regions: org?.coverage_regions || undefined,
                    vehicle_types: org?.vehicle_types || undefined,
                },
            };
            const updated = await api.patch(`/organizations/${orgId}`, body);
            setOrg(updated);
            setMsg('Saved');
        } catch (e) {
            setErr(e.message);
        }
    }

    if (!canRead)
        return (
            <div className="container">
                <p>You do not have permission to view organization.</p>
            </div>
        );

    return (
        <div className="container">
            <div className="card">
                <h2>Organization</h2>
                {err && <p className="error">{err}</p>}
                {msg && <p style={{color: 'green'}}>{msg}</p>}
                {!org && !err && <p>Loading…</p>}
                {org && (
                    <form onSubmit={onSave}>
                        <div className="row">
                            <label>Auth0 Org ID</label>
                            <input disabled value={org.auth0_org_id} />
                        </div>
                        <div className="row">
                            <label>Name</label>
                            <input disabled value={org.name || ''} />
                        </div>
                        {org.org_type === 'supplier' && (
                            <div className="row">
                                <label>Pickup address</label>
                                <input
                                    value={org.pickup_address || ''}
                                    onChange={(e) => setOrg((o) => ({...o, pickup_address: e.target.value}))}
                                />
                            </div>
                        )}
                        {org.org_type === 'community' && (
                            <div className="row">
                                <label>Delivery address</label>
                                <input
                                    value={org.delivery_address || ''}
                                    onChange={(e) => setOrg((o) => ({...o, delivery_address: e.target.value}))}
                                />
                            </div>
                        )}
                        {org.org_type === 'logistics' && (
                            <>
                                <div className="row">
                                    <label>Coverage regions</label>
                                    <input
                                        value={org.coverage_regions || ''}
                                        onChange={(e) => setOrg((o) => ({...o, coverage_regions: e.target.value}))}
                                    />
                                </div>
                                <div className="row">
                                    <label>Vehicle types (comma separated)</label>
                                    <input
                                        value={(org.vehicle_types || []).join(', ')}
                                        onChange={(e) =>
                                            setOrg((o) => ({
                                                ...o,
                                                vehicle_types: e.target.value
                                                    .split(',')
                                                    .map((s) => s.trim())
                                                    .filter(Boolean),
                                            }))
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {canUpdate ? (
                            <button className="btn" type="submit">
                                Save
                            </button>
                        ) : (
                            <p className="error">You do not have permission to update organization.</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
