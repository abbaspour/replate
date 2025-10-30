// noinspection SqlResolve

import { Hono } from 'hono';
import type { Context, MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

// Types generated from OpenAPI for Donor API
import type { components } from './api-types';

// Environment bindings for the Donor API worker
export type Env = {
  Variables: {
    token: JWTPayload;
  };
  Bindings: {
    DB: D1Database;
    AUTH0_JWKS_URL: string; // e.g., https://id.replate.dev/.well-known/jwks.json
    AUTH0_AUDIENCE_ADMIN: string; // set to donor.api in wrangler.toml
    AUTH0_ISSUER: string; // e.g., https://id.replate.dev/
  };
};

// Middleware: verify access token with jose
async function verifyAccessToken(c: Context<Env>) {
  const auth = c.req.header('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = auth.slice(7).trim();
  try {
    const JWKS = createRemoteJWKSet(new URL(c.env.AUTH0_JWKS_URL));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: c.env.AUTH0_ISSUER,
      audience: c.env.AUTH0_AUDIENCE_ADMIN,
    });
    c.set('token', payload);
    return null;
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
}

// Hono middleware to require authentication (no special RBAC scopes for donor API)
function auth(): MiddlewareHandler<Env> {
  return async (c, next) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    await next();
  };
}

function getCallerSub(c: Context<Env>): string | undefined {
  const token: JWTPayload = c.get('token');
  return token?.sub as string | undefined;
}

const app = new Hono<Env>().basePath('/api');
app.use('*', cors());

// Health
app.get('/health', (c) => c.json({ ok: true }));

// GET /donations - list donations for caller (with simple pagination)
app.get('/donations', auth(), async (c) => {
  const sub = getCallerSub(c);
  if (!sub) return c.json({ error: 'Unauthorized' }, 401);

  // Pagination params
  const url = new URL(c.req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  let perPage = Number(url.searchParams.get('per_page') || '20');
  if (!Number.isFinite(perPage) || perPage <= 0) perPage = 20;
  perPage = Math.min(100, perPage);
  const offset = (page - 1) * perPage;

  try {
    const rs = await c.env.DB.prepare(
      `SELECT id, amount, currency, status, testimonial, created_at
         FROM Donations
        WHERE auth0_user_id = ?
        ORDER BY datetime(created_at) DESC
        LIMIT ? OFFSET ?`,
    )
      .bind(sub, perPage, offset)
      .all<any>();

    const items: components['schemas']['Donation'][] = (rs.results || []).map((r: any) => ({
      id: r.id,
      amount: Number(r.amount),
      currency: r.currency,
      status: r.status,
      created_at: r.created_at,
      testimonial: r.testimonial ?? null,
    }));

    return c.json(items);
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

// POST /donations/create-payment-intent - create a donation (mock payment intent) and return its id
app.post('/donations/create-payment-intent', auth(), async (c) => {
  const sub = getCallerSub(c);
  if (!sub) return c.json({ error: 'Unauthorized' }, 401);

  let body: components['schemas']['CreatePaymentIntentRequest'];
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Bad Request', message: 'Invalid JSON' }, 400);
  }

  const amount = Number((body as any)?.amount);
  if (!Number.isFinite(amount) || amount < 1) {
    return c.json({ error: 'Bad Request', message: 'amount must be >= 1' }, 400);
  }
  const currency = (body.currency || 'USD').toUpperCase();
  const testimonial = body.testimonial?.toString();

  try {
    const insert = await c.env.DB.prepare(
      `INSERT INTO Donations (auth0_user_id, amount, currency, status, testimonial)
       VALUES (?, ?, ?, 'pending', ?)`,
    )
      .bind(sub, amount, currency, testimonial ?? null)
      .run();

    const insertedId = (insert as any).lastRowId || (insert as any).meta?.last_row_id || (insert as any).meta?.lastRowId;

    const resp: components['schemas']['CreatePaymentIntentResponse'] = {
      id: Number(insertedId),
    };
    return c.json(resp, 201);
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

// POST /suggestions - submit a partner suggestion
app.post('/suggestions', auth(), async (c) => {
  const sub = getCallerSub(c);
  if (!sub) return c.json({ error: 'Unauthorized' }, 401);

  let body: components['schemas']['SuggestionCreateRequest'];
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Bad Request', message: 'Invalid JSON' }, 400);
  }

  const type = (body.type || '').toString();
  const name = (body.name || '').toString().trim();
  const address = (body.address || '').toString().trim();

  if (!['supplier', 'community', 'logistics'].includes(type)) {
    return c.json({ error: 'Bad Request', message: 'Invalid type' }, 400);
  }
  if (!name) {
    return c.json({ error: 'Bad Request', message: 'name is required' }, 400);
  }

  try {
    const insert = await c.env.DB.prepare(
      `INSERT INTO Suggestions (submitter_auth0_user_id, converted_organization_id, type, name, address)
       VALUES (?, NULL, ?, ?, ?)`,
    )
      .bind(sub, type, name, address || null)
      .run();

    const insertedId = (insert as any).lastRowId || (insert as any).meta?.last_row_id || (insert as any).meta?.lastRowId;

    const resp: components['schemas']['SuggestionCreateResponse'] = {
      id: Number(insertedId),
    };
    return c.json(resp, 201);
  } catch {
    return c.json({ error: 'Server error' }, 500);
  }
});

// noinspection JSUnusedGlobalSymbols
export default app;
