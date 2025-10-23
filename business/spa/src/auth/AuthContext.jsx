import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Auth0Provider, useAuth0} from '@auth0/auth0-react';
import {useNavigate} from 'react-router-dom';

const ClaimsContext = createContext(null);

export function ClaimsProvider({children}) {
    const {isAuthenticated, getIdTokenClaims} = useAuth0();
    const [claims, setClaims] = useState(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            // Start loading whenever auth state changes
            if (!mounted) return;
            if (!isAuthenticated) {
                if (mounted) {
                    setClaims(null);
                }
                return;
            }
            try {
                const c = await getIdTokenClaims();
                if (mounted) {
                    if (c && '__raw' in c) delete c.__raw;
                    setClaims(c || null);
                }
            } catch (e) {
                if (mounted) {
                    setClaims(null);
                }
            }
        }
        load();
        // cleanup to prevent state updates after unmount
        return () => {
            mounted = false;
        };
        // refresh on auth changes
    }, [isAuthenticated, getIdTokenClaims]);

    const value = useMemo(() => ({claims}), [claims]);

    return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
}

export function useClaims() {
    return useContext(ClaimsContext) || {claims: null};
}

function decodeJwtPayload(token) {
    try {
        const part = token.split('.')[1] || '';
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const json = atob(padded);
        return JSON.parse(json);
    } catch (_) {
        return {};
    }
}

// TODO: split orgId & role (from id_token) and permissions (from access_token) into separate methods

export function useRoleAndPermissions() {
    const {claims} = useClaims();
    const {isAuthenticated, getAccessTokenSilently} = useAuth0();
    const [permissions, setPermissions] = useState(new Set());

    const role = claims?.['https://replate.dev/org_role'] || null;
    const orgId = claims?.org_id || null;

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!isAuthenticated) {
                if (!cancelled) setPermissions(new Set());
                return;
            }
            try {
                const token = await getAccessTokenSilently();
                const payload = decodeJwtPayload(token);
                const perms = Array.isArray(payload?.permissions) ? payload.permissions : [];
                if (!cancelled) setPermissions(new Set(perms));
            } catch (e) {
                if (!cancelled) setPermissions(new Set());
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, getAccessTokenSilently]);

    return {role, orgId, permissions};
}

export function ProtectedRoute({children, requirePermissions = []}) {
    const {isLoading, isAuthenticated, loginWithRedirect} = useAuth0();
    const {orgId, permissions} = useRoleAndPermissions();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            loginWithRedirect({appState: {returnTo: window.location.pathname + window.location.search}});
            return;
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    if (isLoading)
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    if (!isAuthenticated) return null;
    if (!orgId)
        return (
            <div className="container">
                <h2>Organization required</h2>
                <p>Your account is not associated with an organization.</p>
            </div>
        );

    for (const p of requirePermissions) {
        if (!permissions.has(p)) {
            return (
                <div className="container">
                    <h2>Insufficient permissions</h2>
                    <p>
                        Missing permission: <code>{p}</code>
                    </p>
                </div>
            );
        }
    }

    return children;
}

export function Auth0ProviderWithConfig({children}) {
    const navigate = useNavigate();
    const [cfg, setCfg] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const res = await fetch('/auth_config.json', {headers: {'cache-control': 'no-cache'}});
            const json = await res.json();
            if (!cancelled) setCfg(json);
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!cfg)
        return (
            <div className="container">
                <p>Loading configuration…</p>
            </div>
        );

    return (
        <Auth0Provider
            domain={cfg.domain}
            clientId={cfg.clientId}
            authorizationParams={{
                audience: cfg.audience,
                redirect_uri: cfg.redirectUri || window.location.origin,
            }}
            onRedirectCallback={(appState) => {
                const target = appState?.returnTo || '/';
                navigate(target, {replace: true});
            }}
            cacheLocation="localstorage"
            //useRefreshTokens=
        >
            <ClaimsProvider>{children}</ClaimsProvider>
        </Auth0Provider>
    );
}
