// noinspection DuplicatedCode

import React, {useEffect, useMemo, useState, createContext, useContext} from 'react';
import { Auth0ComponentProvider  } from '@auth0/web-ui-components-react';
import {Auth0Provider, useAuth0} from '@auth0/auth0-react';
import {useNavigate} from 'react-router-dom';

const ClaimsContext = createContext(null);

export function ClaimsProvider({children}) {
  const {isAuthenticated, getIdTokenClaims} = useAuth0();
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!mounted) return;
      if (!isAuthenticated) {
        if (mounted) setClaims(null);
        return;
      }
      try {
        const c = await getIdTokenClaims();
        if (mounted) {
          if (c && '__raw' in c) delete c.__raw;
          setClaims(c || null);
        }
      } catch (e) {
        if (mounted) setClaims(null);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, getIdTokenClaims]);

  const value = useMemo(() => ({claims}), [claims]);
  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
}

export function useClaims() {
  return useContext(ClaimsContext) || {claims: null};
}

export function ProtectedRoute({children}) {
  const {isLoading, isAuthenticated, loginWithRedirect} = useAuth0();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      loginWithRedirect({appState: {returnTo: window.location.pathname + window.location.search}});
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) return <div className="container"><p>Loading…</p></div>;
  if (!isAuthenticated) return null;
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

  if (!cfg) return <div className="container"><p>Loading configuration…</p></div>;

  // Derive Auth0 domain dynamically based on where the SPA is running.
  // - If running on localhost, 127.0.0.1, or *.workers.dev, use the domain from auth_config.json.
  // - Otherwise, prefix the top-level domain (eTLD+1) with `id.` (e.g., donor.replate.dev -> id.replate.dev).
  const hostname = window.location.hostname || '';
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.workers.dev');
  let derivedDomain = cfg.domain;
  if (!isLocal) {
    const parts = hostname.split('.');
    const root = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    derivedDomain = `id.${root}`;
  }

  const authDetails = {
    domain: derivedDomain,
    clientId: cfg.clientId
  };

  return (
    <Auth0Provider
      domain={derivedDomain}
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
    >
      {/*<ClaimsProvider>*/}
      {/*<Auth0ComponentProvider authDetails={authDetails}>*/}
        {children}
      {/*</Auth0ComponentProvider>*/}
      {/*</ClaimsProvider>*/}
    </Auth0Provider>
  );
}
