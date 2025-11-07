import React from 'react';
//import {useApi} from '../api/client';
import {usePermissions, useOrgId} from '../auth/AuthContext';
import {OrgDetailsEdit} from '@auth0/web-ui-components-react';

export default function Organization() {
    const permissions = usePermissions();

    const canRead = permissions.has('read:organization');
    const canUpdate = permissions.has('update:organization');

    /*
    const [org, setOrg] = useState(null);
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const api = useApi();
    const orgId = useOrgId();

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
    */

    if (!canRead)
        return (
            <div className="container">
                <p>You do not have permission to view organization.</p>
            </div>
        );

    return (
        <main className="container">
            <div className="container">
                <div className="card" style={{marginBottom: '1rem'}}>
                    <h1>My Organization Profile</h1>
                    <p className="text-muted">Manage organization.</p>
                </div>
                <div className="card">
                    <OrgDetailsEdit />
                </div>
            </div>
        </main>
    );
}
