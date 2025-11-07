import React from 'react';
//import {useApi} from '../api/client';
import {usePermissions} from '../auth/AuthContext';
import {OrgDetailsEdit, SsoProviderTable, DomainTable} from '@auth0/web-ui-components-react';
import {useNavigate} from 'react-router-dom';

export default function Organization() {
    const permissions = usePermissions();
    const navigate = useNavigate();

    const canRead = permissions.has('read:organization');
    const canUpdate = permissions.has('update:organization');

    if (!canRead)
        return (
            <div className="container">
                <p>You do not have permission to view organization.</p>
            </div>
        );

    const createProviderAction = {
        disabled: !canUpdate,
        onAfter: () => {
            if (!canUpdate) return;
            navigate('/organization/sso-providers/new');
        },
    };

    const editProviderAction = {
        disabled: !canUpdate,
        onAfter: (provider) => {
            if (!canUpdate || !provider?.id) return;
            navigate(`/organization/sso-providers/${provider.id}/edit`);
        },
    };

    return (
        <main className="container">
            <div className="container">
                <div className="card" style={{marginBottom: '1rem'}}>
                    <h1>My Organization Profile</h1>
                    <p className="text-muted">Manage organization.</p>
                </div>

                <div className="card" style={{marginBottom: '1rem'}}>
                    <OrgDetailsEdit />
                </div>

                <div className="card" style={{marginBottom: '1rem'}}>
                    <h2>Single Sign-On Providers</h2>
                    <SsoProviderTable createAction={createProviderAction} editAction={editProviderAction} />
                </div>

                <div className="card">
                    <h2>Verified Domains</h2>
                    <DomainTable />
                </div>
            </div>
        </main>
    );
}
