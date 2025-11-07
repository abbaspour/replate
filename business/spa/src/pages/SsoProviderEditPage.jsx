import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {SsoProviderEdit} from '@auth0/web-ui-components-react';

export default function SsoProviderEditPage() {
    const navigate = useNavigate();
    const {id} = useParams();

    return (
        <main className="container">
            <div className="container">
                <div className="card" style={{marginBottom: '1rem'}}>
                    <h1>Edit SSO Provider</h1>
                    <p className="text-muted">Configure provider settings, provisioning, and domains.</p>
                </div>
                <div className="card">
                    <SsoProviderEdit providerId={id} backButton={{ label: 'Back', onClick: () => navigate('/organization') }} />
                </div>
            </div>
        </main>
    );
}
