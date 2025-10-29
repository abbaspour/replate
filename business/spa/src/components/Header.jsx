import React from 'react';
import {Link, NavLink} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';
import {usePermissions, useOrgId} from '../auth/AuthContext';

export default function Header() {
    const {isAuthenticated, user, loginWithRedirect, logout, isLoading} = useAuth0();
    const orgId = useOrgId();
    const permissions = usePermissions();

    return (
        <nav className="nav">
            <Link to="/" className="brand">
                🍽️ Replate Business
            </Link>
            <div className="spacer" />
            {isLoading && <span>Loading…</span>}
            {isAuthenticated && (
                <>
                    <NavLink to="/" end>
                        Dashboard
                    </NavLink>
                    {permissions.has('read:pickups') && <NavLink to="/jobs">Jobs</NavLink>}
                    { permissions.has('create:pickups') && (
                        <NavLink to="/jobs/new">New Job</NavLink>
                    )}
                    { permissions.has('read:schedules') && <NavLink to="/schedules">Schedules</NavLink>}
                    { permissions.has('update:schedules') && (
                        <NavLink to="/schedules/new">New Schedule</NavLink>
                    )}
                    { permissions.has('read:organization') && <NavLink to="/organization">Organization</NavLink>}
                    <div className="spacer" />
                    <div className="user">
                        {orgId && (
                            <span className="pill" title="org">
                                {orgId}
                            </span>
                        )}
                        {user?.picture && (
                            <img src={user.picture} alt="avatar" width={28} height={28} style={{borderRadius: 999}} />
                        )}
                        <button className="btn" onClick={() => logout({logoutParams: {returnTo: window.location.origin}})}>
                            Logout
                        </button>
                    </div>
                </>
            )}
            {!isAuthenticated && !isLoading && (
                <button className="btn" onClick={() => loginWithRedirect({appState: {returnTo: window.location.pathname}})}>
                    Login
                </button>
            )}
        </nav>
    );
}
