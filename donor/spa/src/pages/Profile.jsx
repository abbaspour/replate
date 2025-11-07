import React from 'react';
import { UserMFAMgmt } from '@auth0/web-ui-components-react';

export default function Profile() {
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h1>My Profile</h1>
        <p className="text-muted">Manage your multi-factor authentication (MFA) methods.</p>
      </div>
        <div className="card">
          <UserMFAMgmt />
        </div>
    </main>
  );
}
