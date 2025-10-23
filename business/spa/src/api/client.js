import {useAuth0} from '@auth0/auth0-react';

const BASE = '/api';

async function request(method, path, getAccessTokenSilently, body) {
    const token = await getAccessTokenSilently();
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`API ${method} ${path} failed: ${res.status}`);
        err.status = res.status;
        err.body = text;
        throw err;
    }
    if (res.status === 204) return null;
    return res.json();
}

export function useApi() {
    const {getAccessTokenSilently} = useAuth0();
    return {
        get: (path) => request('GET', path, getAccessTokenSilently),
        post: (path, body) => request('POST', path, getAccessTokenSilently, body),
        patch: (path, body) => request('PATCH', path, getAccessTokenSilently, body),
    };
}
