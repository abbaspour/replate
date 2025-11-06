import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';

export default function Header() {
  const {isAuthenticated, isLoading, loginWithRedirect, logout, user} = useAuth0();
  const location = useLocation();

  const handleLogin = () => loginWithRedirect({appState: {returnTo: location.pathname + location.search}});
  const handleLogout = () => logout({logoutParams: {returnTo: window.location.origin}});

  return (
    <header className="nav">
      <div className="brand">
        <span role="img" aria-label="leaf">🍽️</span>
        <span>Replate Donor</span>
      </div>
      <nav style={{display: 'flex', gap: '1rem'}}>
        <Link to="/">Home</Link>
        {isAuthenticated && (
          <>
            <Link to="/donate">Donate</Link>
            <Link to="/history">History</Link>
            <Link to="/suggest">Suggest</Link>
          </>
        )}
      </nav>
      <div className="spacer" />
      <div className="user">
        {isLoading ? (
          <span>Loading…</span>
        ) : isAuthenticated ? (
          <>
            {user?.picture && (
              <img src={user.picture} alt="avatar" style={{width: 28, height: 28, borderRadius: '50%'}} />
            )}
            <span>{user?.name || user?.email}</span>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button className="btn" onClick={handleLogin}>Login</button>
        )}
      </div>
    </header>
  );
}
