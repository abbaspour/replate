import React, {useState} from 'react';
import {usePermissions} from '../auth/AuthContext';
import {useApi} from '../api/client';
import {useNavigate} from 'react-router-dom';

export default function ScheduleNew() {
    const {permissions} = usePermissions();
    const canCreate = permissions.has('update:schedules');
    const api = useApi();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        default_community_id: '',
        is_active: true,
        cron_expression: '',
        pickup_time_of_day: '',
        pickup_duration_minutes: 30,
        default_food_category: '',
        default_estimated_weight_kg: 10,
    });
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    if (!canCreate)
        return (
            <div className="container">
                <p>You do not have permission to create schedules.</p>
            </div>
        );

    function upd(k, v) {
        setForm((f) => ({...f, [k]: v}));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        setMsg('');
        try {
            const body = {
                default_community_id: form.default_community_id || undefined,
                is_active: !!form.is_active,
                cron_expression: form.cron_expression,
                pickup_time_of_day: form.pickup_time_of_day,
                pickup_duration_minutes: Number(form.pickup_duration_minutes),
                default_food_category: form.default_food_category
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                default_estimated_weight_kg: Number(form.default_estimated_weight_kg),
            };
            const created = await api.post('/schedules', body);
            setMsg(`Created schedule #${created.id}`);
            setTimeout(() => navigate('/schedules'), 800);
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div className="container">
            <div className="card">
                <h2>New Pickup Schedule</h2>
                {err && <p className="error">{err}</p>}
                {msg && <p style={{color: 'green'}}>{msg}</p>}
                <form onSubmit={onSubmit}>
                    <div className="row">
                        <label>Active</label>
                        <select
                            value={form.is_active ? 'true' : 'false'}
                            onChange={(e) => upd('is_active', e.target.value === 'true')}>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div className="row">
                        <label>Cron expression</label>
                        <input
                            type="text"
                            required
                            placeholder="0 19 * * 1-5"
                            value={form.cron_expression}
                            onChange={(e) => upd('cron_expression', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Pickup time of day (HH:mm)</label>
                        <input
                            type="time"
                            required
                            value={form.pickup_time_of_day}
                            onChange={(e) => upd('pickup_time_of_day', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Pickup duration (minutes)</label>
                        <input
                            type="number"
                            min="5"
                            step="5"
                            value={form.pickup_duration_minutes}
                            onChange={(e) => upd('pickup_duration_minutes', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Default food categories (comma separated)</label>
                        <input
                            type="text"
                            value={form.default_food_category}
                            onChange={(e) => upd('default_food_category', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Default estimated weight (kg)</label>
                        <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={form.default_estimated_weight_kg}
                            onChange={(e) => upd('default_estimated_weight_kg', e.target.value)}
                        />
                    </div>
                    <div className="row">
                        <label>Default community org_id (optional)</label>
                        <input
                            type="text"
                            value={form.default_community_id}
                            onChange={(e) => upd('default_community_id', e.target.value)}
                        />
                    </div>
                    <button className="btn" type="submit">
                        Create Schedule
                    </button>
                </form>
            </div>
        </div>
    );
}
