import {createAuth0Client, Auth0Client} from '@auth0/auth0-spa-js';

export type AuthConfig = {
    domain: string;
    clientId: string;
    audience: string;
    redirectUri: string;
    organization: string;
};

let client: Auth0Client | null = null;
let config: AuthConfig | null = null;

export async function loadConfig(): Promise<AuthConfig> {
    if (config) return config;
    const res = await fetch('/auth_config.json');
    config = await res.json();
    return config!;
}

export async function getClient(): Promise<Auth0Client> {
    if (client) return client;
    const cfg = await loadConfig();
    client = await createAuth0Client({
        domain: cfg.domain,
        clientId: cfg.clientId,
        authorizationParams: {
            audience: cfg.audience,
            redirect_uri: cfg.redirectUri,
            organization: cfg.organization,
        },
        cacheLocation: 'localstorage',

        //useRefreshTokens: true,
    });
    return client!;
}

export async function ensureAuthenticated(): Promise<void> {
    const auth0 = await getClient();
    const isAuth = await auth0.isAuthenticated();
    if (isAuth) return;

    const query = window.location.search;
    const shouldParse = query.includes('code=') && query.includes('state=');
    if (shouldParse) {
        await auth0.handleRedirectCallback();
        const appState = (await auth0.getUser()) as any;
        window.history.replaceState({}, document.title, '/');
        return;
    }

    await auth0.loginWithRedirect({
        appState: {returnTo: window.location.pathname + window.location.search},
    });
}

export async function getAccessToken(): Promise<string> {
    const auth0 = await getClient();
    return auth0.getTokenSilently();
}

export async function logout(): Promise<void> {
    const cfg = await loadConfig();
    const auth0 = await getClient();
    await auth0.logout({logoutParams: {returnTo: cfg.redirectUri.replace('/callback', '/')}});
}
