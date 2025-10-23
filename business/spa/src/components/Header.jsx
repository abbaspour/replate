import React from 'react';
import {Link, NavLink} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';
import {useRoleAndPermissions} from '../auth/AuthContext';

export default function Header() {
    const {isAuthenticated, user, loginWithRedirect, logout, isLoading} = useAuth0();
    const {role, orgId, permissions} = useRoleAndPermissions();

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
                    {/*(role === 'admin' || role === 'member') &&*/ permissions.has('create:pickups') && (
                        <NavLink to="/jobs/new">New Job</NavLink>
                    )}
                    { permissions.has('read:schedules') && <NavLink to="/schedules">Schedules</NavLink>}
                    {/*(role === 'admin' || role === 'member') &&*/ permissions.has('update:schedules') && (
                        <NavLink to="/schedules/new">New Schedule</NavLink>
                    )}
                    { role === 'admin' && permissions.has('read:organization') && <NavLink to="/organization">Organization</NavLink>}
                    <div className="spacer" />
                    <div className="user">
                        {orgId && (
                            <span className="pill" title="org">
                                {orgId}
                            </span>
                        )}
                        {role && (
                            <span className="pill" title="role">
                                {role}
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
