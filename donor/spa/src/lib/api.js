import {useAuth0} from '@auth0/auth0-react';

export function useApi() {
  const {getAccessTokenSilently} = useAuth0();

  async function request(path, options = {}) {
    const token = await getAccessTokenSilently();
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  }

  return {
    get: (path) => request(path, {method: 'GET'}),
    post: (path, body) => request(path, {method: 'POST', body: JSON.stringify(body)}),
    patch: (path, body) => request(path, {method: 'PATCH', body: JSON.stringify(body)}),
  };
}
