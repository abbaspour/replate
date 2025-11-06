import React from 'react';
import { Auth0ComponentProvider, UserMFAMgmt } from '@auth0-web-ui-components/react';

export default function Profile() {
  const authDetails = {
    domain: "id.replate.dev",
    clientId: "G5DiwGQsKOuwPIw7dOEIfmfu34inCljx"
  };
  return (
    <main className="container">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h1>My Profile</h1>
        <p className="text-muted">Manage your multi-factor authentication (MFA) methods.</p>
      </div>
      {/* The Auth0ComponentProvider integrates with the existing @auth0/auth0-react context */}
      {/*<Auth0ComponentProvider authDetails={authDetails}>*/}
        <div className="card">
          {/*<UserMFAMgmt />*/}
        </div>
      {/*</Auth0ComponentProvider>*/}
    </main>
  );
}
