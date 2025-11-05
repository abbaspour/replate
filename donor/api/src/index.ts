// noinspection SqlResolve

import {Hono} from 'hono';
import type {Context, MiddlewareHandler} from 'hono';
import {cors} from 'hono/cors';
import {createRemoteJWKSet, jwtVerify, JWTPayload} from 'jose';

// Types generated from OpenAPI for Donor API
import type {components} from './api-types';

// Environment bindings for the Donor API worker
export type Env = {
    Variables: {
        token: JWTPayload;
        rawToken: string;
    };
    Bindings: {
        DB: D1Database;
        AUTH0_AUDIENCE: string; // set to donor.api in wrangler.toml
        AUTH0_ISSUER: string; // e.g., https://id.replate.dev/
        AUTH0_DOMAIN: string; // e.g., id.replate.dev
        DONOR_API_CLIENT_ID: string;
        DONOR_API_CLIENT_SECRET: string;
        CONNECTED_ACCOUNTS_CONNECTION: string; // e.g., Microsoft
    };
};

function deriveAuth0ConfigFromRequest(c: Context<Env>) {
    // Determine issuer and JWKS from the API hostname.
    // Rule: issuer is https://id.<rootDomain>/ where rootDomain is the top-level domain the API is accessed on
    // Example: donor.replate.dev -> issuer https://id.replate.dev/
    const url = new URL(c.req.url);
    const hostname = url.hostname; // may include subdomains

    // Handle localhost / workers.dev for local/dev environments by falling back to the configured domain if present
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.workers.dev');

    if (isLocal) {
        // Fall back to the provided AUTH0_DOMAIN if available (e.g., id.dev.example.com)
        const rootDomain = c.env.AUTH0_DOMAIN;

        const issuerDomain = c.env.AUTH0_ISSUER ?? `id.${rootDomain}`;
        const issuer = `https://${issuerDomain}/`;
        const jwksUrl = `${issuer}.well-known/jwks.json`;

        return { issuer, jwksUrl, issuerDomain };
    }

    const parts = hostname.split('.');

    let rootDomain;
    if (parts.length >= 2) {
        // naive eTLD+1 approach: last two labels make the root (works for replate.dev, replate.uk)
        rootDomain = parts.slice(-2).join('.');
    } else {
        rootDomain = hostname;
    }

    const issuerDomain = `id.${rootDomain}`;
    const issuer = `https://${issuerDomain}/`;
    const jwksUrl = `${issuer}.well-known/jwks.json`;

    return { issuer, jwksUrl, issuerDomain };
}

// Middleware: verify access token with jose
async function verifyAccessToken(c: Context<Env>) {
    const auth = c.req.header('authorization') || '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
        return c.json({error: 'Unauthorized'}, 401);
    }
    const token = auth.slice(7).trim();
    try {
        // Derive issuer and JWKS dynamically from request hostname
        const cfg = deriveAuth0ConfigFromRequest(c);
        const JWKS = createRemoteJWKSet(new URL(cfg.jwksUrl));
        const {payload} = await jwtVerify(token, JWKS, {
            issuer: cfg.issuer,
            audience: c.env.AUTH0_AUDIENCE,
        });
        c.set('token', payload);
        c.set('rawToken', token);
        return null;
    } catch {
        return c.json({error: 'Unauthorized'}, 401);
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
app.get('/health', (c) => c.json({ok: true}));

// GET /donations - list donations for caller (with simple pagination)
app.get('/donations', auth(), async (c) => {
    const sub = getCallerSub(c);
    if (!sub) return c.json({error: 'Unauthorized'}, 401);

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
        return c.json({error: 'Server error'}, 500);
    }
});

// POST /donations/create-payment-intent - create a donation (mock payment intent) and return its id
app.post('/donations/create-payment-intent', auth(), async (c) => {
    const sub = getCallerSub(c);
    if (!sub) return c.json({error: 'Unauthorized'}, 401);

    let body: components['schemas']['CreatePaymentIntentRequest'];
    try {
        body = await c.req.json();
    } catch {
        return c.json({error: 'Bad Request', message: 'Invalid JSON'}, 400);
    }

    const amount = Number((body as any)?.amount);
    if (!Number.isFinite(amount) || amount < 1) {
        return c.json({error: 'Bad Request', message: 'amount must be >= 1'}, 400);
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
        return c.json({error: 'Server error'}, 500);
    }
});

// POST /suggestions - submit a partner suggestion
app.post('/suggestions', auth(), async (c) => {
    const sub = getCallerSub(c);
    if (!sub) return c.json({error: 'Unauthorized'}, 401);

    let body: components['schemas']['SuggestionCreateRequest'];
    try {
        body = await c.req.json();
    } catch {
        return c.json({error: 'Bad Request', message: 'Invalid JSON'}, 400);
    }

    const type = (body.type || '').toString();
    const name = (body.name || '').toString().trim();
    const address = (body.address || '').toString().trim();

    if (!['supplier', 'community', 'logistics'].includes(type)) {
        return c.json({error: 'Bad Request', message: 'Invalid type'}, 400);
    }
    if (!name) {
        return c.json({error: 'Bad Request', message: 'name is required'}, 400);
    }

    try {
        console.log(`inserting suggestion: ${sub}, ${type}, ${name}, ${address}`);

        const insert = await c.env.DB.prepare(
            `INSERT INTO Suggestions (submitter_auth0_user_id, type, name, address)
       VALUES (?, ?, ?, ?)`,
        )
            .bind(sub, type, name, address || null)
            .run();

        const insertedId = (insert as any).lastRowId || (insert as any).meta?.last_row_id || (insert as any).meta?.lastRowId;

        const resp: components['schemas']['SuggestionCreateResponse'] = {
            id: Number(insertedId),
        };
        return c.json(resp, 201);
    } catch (e) {
        console.error('Error submitting suggestion', e);
        return c.json({error: 'Server error'}, 500);
    }
});

// Calendar federated token via Auth0 Token Exchange for donor
app.get('/calendar/token', auth(), async (c) => {
    try {
        const subjectToken = c.get('rawToken') as string | undefined;
        if (!subjectToken) {
            return c.json({error: 'Unauthorized'}, 401);
        }

        const cfg = deriveAuth0ConfigFromRequest(c);
        const url = `https://${cfg.issuerDomain}/oauth/token`;
        const payload = {
            client_id: c.env.DONOR_API_CLIENT_ID,
            client_secret: c.env.DONOR_API_CLIENT_SECRET,
            subject_token: subjectToken,
            grant_type: 'urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            requested_token_type: 'http://auth0.com/oauth/token-type/federated-connection-access-token',
            connection: c.env.CONNECTED_ACCOUNTS_CONNECTION,
        } as const;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return c.json({error: 'Bad Gateway', message: text || `Upstream ${res.status}`}, 502);
        }

        const data = await res.json();
        // @ts-ignore
        return c.json(data);
    } catch (e) {
        return c.json({error: 'Server error'}, 500);
    }
});

// noinspection JSUnusedGlobalSymbols
export default app;
