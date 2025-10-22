import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const ClaimsContext = createContext(null)

export function ClaimsProvider({ children }) {
  const { isAuthenticated, getIdTokenClaims } = useAuth0()
  const [claims, setClaims] = useState(null)
  const [claimsLoading, setClaimsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      // Start loading whenever auth state changes
      if (!mounted) return
      setClaimsLoading(true)
      if (!isAuthenticated) {
        if (mounted) {
          setClaims(null)
          setClaimsLoading(false)
        }
        return
      }
      try {
        const c = await getIdTokenClaims()
        if (mounted) {
          // Remove raw token blob for safety
          if (c && '__raw' in c) delete c.__raw
          setClaims(c || null)
          setClaimsLoading(false)
        }
      } catch (e) {
        if (mounted) {
          setClaims(null)
          setClaimsLoading(false)
        }
      }
    }
    load()
    // cleanup to prevent state updates after unmount
    return () => { mounted = false }
    // refresh on auth changes
  }, [isAuthenticated, getIdTokenClaims])

  const value = useMemo(() => ({ claims, claimsLoading }), [claims, claimsLoading])

  return (
    <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>
  )
}

export function useClaims() {
  return useContext(ClaimsContext) || { claims: null, claimsLoading: true }
}

export function useRoleAndScopes() {
  const { claims, claimsLoading } = useClaims()

  const role = claims?.['https://replate.dev/org_role'] || null
  const orgId = claims?.org_id || null
  const scopeString = claims?.scope || ''
  const scopes = new Set(String(scopeString).split(' ').filter(Boolean))

  return { role, orgId, scopes, claimsLoading }
}

export function ProtectedRoute({ children, requireScopes = [] }) {
  //const navigate = useNavigate()
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()
  const { role, orgId, scopes, claimsLoading } = useRoleAndScopes()

  useEffect(() => {
    if (isLoading || claimsLoading) return
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } })
      return
    }
    // For Business app, orgId must be present per spec
/*
    if (!orgId) {
      navigate('/error?reason=no-org', { replace: true })
    }
*/
  }, [isLoading, claimsLoading, isAuthenticated, loginWithRedirect/*, navigate, orgId*/])

  if (isLoading || claimsLoading) return <div className="container"><p>Loading...</p></div>
  if (!isAuthenticated) return null
  if (!orgId) return <div className="container"><h2>Organization required</h2><p>Your account is not associated with an organization.</p></div>

  for (const s of requireScopes) {
    if (!scopes.has(s)) {
      return <div className="container"><h2>Insufficient permissions</h2><p>Missing scope: <code>{s}</code></p></div>
    }
  }

  return children
}

export function Auth0ProviderWithConfig({ children }) {
  const navigate = useNavigate()
  const [cfg, setCfg] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const res = await fetch('/auth_config.json', { headers: { 'cache-control': 'no-cache' } })
      const json = await res.json()
      if (!cancelled) setCfg(json)
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (!cfg) return <div className="container"><p>Loading configuration…</p></div>

  return (
    <Auth0Provider
      domain={cfg.domain}
      clientId={cfg.clientId}
      authorizationParams={{
        audience: cfg.audience,
        redirect_uri: cfg.redirectUri || window.location.origin + '/callback'
      }}
      onRedirectCallback={(appState) => {
        const target = appState?.returnTo || '/'
        navigate(target, { replace: true })
      }}
      cacheLocation="localstorage"
      //useRefreshTokens=
    >
      <ClaimsProvider>{children}</ClaimsProvider>
    </Auth0Provider>
  )
}
