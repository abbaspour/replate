import {DataProvider, DeleteResult} from 'react-admin';
import { getAccessToken } from './auth';

const API_BASE = 'https://api.admin.replate.dev';   // TODO: /api

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    if (resource === 'organizations') {
      const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
      const { field, order } = params.sort ?? { field: 'name', order: 'ASC' };
      const q = params.filter?.q;
      const org_type = params.filter?.org_type;
      const sso_status = params.filter?.sso_status;
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('per_page', String(perPage));
      if (q) query.set('q', q);
      if (org_type) query.set('org_type', org_type);
      if (sso_status) query.set('sso_status', sso_status);
      const data = await apiFetch(`/organizations?${query.toString()}`);
      return { data: data.map((o: any) => ({ id: o.auth0_org_id, ...o })), total: data.length };
    }
    if (resource === 'invitations') {
      // Expect orgId via params.filter.orgId (preferred) or params.meta.orgId
      const orgId = (params as any).filter?.orgId ?? (params as any).meta?.orgId;
      if (!orgId) {
        throw new Error('invitations.getList requires filter.orgId');
      }
      const data = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/sso-invitations`);
      return { data: data.map((i: any) => ({ id: i.invitation_id, ...i })), total: data.length };
    }
    throw new Error(`Unsupported resource: ${resource}`);
  },

  getOne: async (resource, params) => {
    if (resource === 'organizations') {
      const data = await apiFetch(`/organizations/${encodeURIComponent(params.id as string)}`);
      return { data: { id: data.auth0_org_id, ...data } };
    }
    throw new Error(`Unsupported resource: ${resource}`);
  },

  getMany: async (resource, params) => {
    const results = await Promise.all(params.ids.map((id) => apiFetch(`/${resource}/${id}`)));
    return { data: results.map((r: any) => ({ id: r.id ?? r.auth0_org_id, ...r })) };
  },

  getManyReference: async () => ({ data: [], total: 0 }),

  update: async (resource, params) => {
    if (resource === 'organizations') {
      const id = params.id as string;
      const payload = { ...params.data };
      delete (payload as any).id;
      const data = await apiFetch(`/organizations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return { data: { id, ...data } };
    }
    throw new Error(`Unsupported resource: ${resource}`);
  },

  updateMany: async () => ({ data: [] }),

  create: async (resource, params) => {
    if (resource === 'organizations') {
      const data = await apiFetch(`/organizations`, { method: 'POST', body: JSON.stringify(params.data) });
      const id = data.auth0_org_id || data.id;
      return { data: { id, ...params.data, ...data } };
    }
    if (resource === 'invitations') {
      const orgId = (params as any).meta?.orgId;
      if (!orgId) {
        throw new Error('invitations.create requires meta.orgId');
      }
      const data = await apiFetch(`/organizations/${encodeURIComponent(orgId)}/sso-invitations`, { method: 'POST', body: JSON.stringify(params.data) });
      return { data: { id: data.invitation_id, ...data } };
    }
    throw new Error(`Unsupported resource: ${resource}`);
  },

  delete: async (resource, params) => {
    if (resource === 'organizations') {
      await apiFetch(`/organizations/${encodeURIComponent(params.id as string)}`, { method: 'DELETE' });
      return { data: { id: params.id } } as DeleteResult;
    }
    if (resource === 'invitations') {
      const orgId = (params as any).meta?.orgId;
      if (!orgId) {
        throw new Error('invitations.delete requires meta.orgId');
      }
      await apiFetch(`/organizations/${encodeURIComponent(orgId)}/sso-invitations/${encodeURIComponent(params.id as string)}`, { method: 'DELETE' });
      return { data: { id: params.id } } as DeleteResult;
    }
    throw new Error(`Unsupported resource: ${resource}`);
  },

  deleteMany: async () => ({ data: [] }),
};
