import React, {useState} from 'react';
import {useApi} from '../api/client';
import {useRoleAndScopes} from '../auth/AuthContext';
import {useNavigate} from 'react-router-dom';

export default function JobNew() {
    const {role, scopes} = useRoleAndScopes();
    const canCreate = (role === 'admin' || role === 'member') && scopes.has('create:pickups');
    const api = useApi();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        pickup_window_start: '',
        pickup_window_end: '',
        food_category: '',
        estimated_weight_kg: 10,
        packaging: '',
        handling_notes: '',
        community_org_id: '',
    });
    const [err, setErr] = useState('');
    const [ok, setOk] = useState('');

    if (!canCreate) {
        return (
            <div className="container">
                <p>You do not have permission to create jobs.</p>
            </div>
        );
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        setOk('');
        try {
            const body = {
                pickup_window_start: new Date(form.pickup_window_start).toISOString(),
                pickup_window_end: new Date(form.pickup_window_end).toISOString(),
                food_category: form.food_category
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                estimated_weight_kg: Number(form.estimated_weight_kg),
                packaging: form.packaging || undefined,
                handling_notes: form.handling_notes || undefined,
                community_org_id: form.community_org_id || undefined,
            };
            const created = await api.post('/jobs', body);
            setOk(`Created job #${created.id}`);
            setTimeout(() => navigate('/jobs'), 800);
        } catch (e) {
            setErr(e.message);
        }
    }

    function upd(k, v) {
        setForm((f) => ({...f, [k]: v}));
    }

    return (
        <div className="container">
            <div className="card">
                <h2>New Ad-hoc Pickup Job</h2>
                {err && <p className="error">{err}</p>}
                {ok && <p style={{color: 'green'}}>{ok}</p>}
                <form onSubmit={onSubmit}>
                    <div className="row">
                        <label>Pickup window start</label>
                        <input
                            type="datetime-local"
                            required
                            value={form.pickup_window_start}
                            onChange={(e) => upd('pickup_window_start', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Pickup window end</label>
                        <input
                            type="datetime-local"
                            required
                            value={form.pickup_window_end}
                            onChange={(e) => upd('pickup_window_end', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Food categories (comma separated)</label>
                        <input
                            type="text"
                            placeholder="bakery, produce"
                            value={form.food_category}
                            onChange={(e) => upd('food_category', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Estimated weight (kg)</label>
                        <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={form.estimated_weight_kg}
                            onChange={(e) => upd('estimated_weight_kg', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Packaging</label>
                        <input type="text" value={form.packaging} onChange={(e) => upd('packaging', e.target.value)} />
                    </div>
                    <div className="row">
                        <label>Handling notes</label>
                        <textarea rows={3} value={form.handling_notes} onChange={(e) => upd('handling_notes', e.target.value)} />
                    </div>
                    <div className="row">
                        <label>Destination community org_id (optional)</label>
                        <input
                            type="text"
                            value={form.community_org_id}
                            onChange={(e) => upd('community_org_id', e.target.value)}
                        />
                    </div>
                    <div>
                        <button className="btn" type="submit">
                            Create Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
