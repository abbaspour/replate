import React from 'react';
import {useNavigate} from 'react-router-dom';
import {SsoProviderCreate} from '@auth0/web-ui-components-react';

export default function SsoProviderCreatePage() {
    const navigate = useNavigate();

    const createAction = {
        onClick: async (payload) => {
            // Let underlying component handle creation via default Core client.
            // We simply return payload to proceed; navigation handled in onAfter
            return payload;
        },
        onAfter: async (_payload, createdProvider) => {
            // Navigate to edit page of newly created provider if available
            const id = createdProvider?.id || createdProvider?._id || createdProvider?.provider_id;
            if (id) navigate(`/organization/sso-providers/${id}/edit`);
            else navigate('/organization');
        },
    };

    return (
        <main className="container">
            <div className="container">
                <div className="card" style={{marginBottom: '1rem'}}>
                    <h1>Create SSO Provider</h1>
                    <p className="text-muted">Set up a new SSO connection for your organization.</p>
                </div>
                <div className="card">
                    <SsoProviderCreate createAction={createAction} backButton={{ label: 'Back', onClick: () => navigate('/organization') }} />
                </div>
            </div>
        </main>
    );
}
