import React from 'react';
import {useAuth0} from '@auth0/auth0-react';
import {Link} from 'react-router-dom';

export default function Home() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();

  return (
    <main className="container">
      <div className="card">
        <h1>Reduce Food Waste. Feed Communities.</h1>
        <p>
          Replate connects suppliers, logistics, and communities to move surplus food to the people who need it.
        </p>
        {!isAuthenticated ? (
          <button className="btn" onClick={() => loginWithRedirect()}>Get Started</button>
        ) : (
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <Link className="btn" to="/donate">Donate</Link>
            <Link className="btn secondary" to="/suggest">Suggest a Partner</Link>
          </div>
        )}
      </div>
    </main>
  );
}
