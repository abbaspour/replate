import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

const ClaimsContext = createContext(null)

function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch (e) {
    return null
  }
}

export function ClaimsProvider({ children }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [claims, setClaims] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!isAuthenticated) { setClaims(null); return }
      try {
        const token = await getAccessTokenSilently()
        const decoded = decodeJwt(token)
        if (mounted) setClaims({ token, decoded })
      } catch (e) {
        if (mounted) setClaims(null)
      }
    }
    load()
    // refresh on auth changes
  }, [isAuthenticated, getAccessTokenSilently])

  const value = useMemo(() => ({
    claims: claims?.decoded ?? null,
    accessToken: claims?.token ?? null,
  }), [claims])

  return (
    <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>
  )
}

export function useClaims() {
  return useContext(ClaimsContext) || { claims: null, accessToken: null }
}

export function useRoleAndScopes() {
  const { claims } = useClaims()
  const role = claims?.['https://replate.dev/org_role'] || null
  const orgId = claims?.org_id || null
  const scopeString = claims?.scope || ''
  const scopes = new Set(String(scopeString).split(' ').filter(Boolean))
  return { role, orgId, scopes }
}

export function ProtectedRoute({ children, requireScopes = [] }) {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()
  const { role, orgId, scopes } = useRoleAndScopes()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      loginWithRedirect({ appState: { returnTo: window.location.pathname + window.location.search } })
      return
    }
    // For Business app, orgId must be present per spec
    if (!orgId) {
      navigate('/error?reason=no-org', { replace: true })
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, navigate, orgId])

  if (isLoading) return <div className="container"><p>Loading...</p></div>
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
      cacheLocation="memory"
      useRefreshTokens
    >
      <ClaimsProvider>{children}</ClaimsProvider>
    </Auth0Provider>
  )
}
