import {Hono} from 'hono';
import type {Context} from 'hono';
import {cors} from 'hono/cors';
import {jwtVerify, createRemoteJWKSet, JWTPayload} from 'jose';

// Types generated from OpenAPI (kept minimal here)
import type {components} from './api-types';

// Environment bindings
export type Env = {
    Variables: {
        token: JWTPayload;
    };
    Bindings: {
        DB: D1Database;
        AUTH0_JWKS_URL: string; // e.g., https://id.replate.dev/.well-known/jwks.json
        AUTH0_AUDIENCE_ADMIN: string; // e.g., admin.api
        AUTH0_ISSUER: string; // e.g., https://id.replate.dev/
    };
};

// Helper: scope check
function requirePermissions(c: Context<Env>, required: string[]/*, tokenScopes?: string*/) {
    const token  = c.get('token');
    const permissions = token?.permissions;
    if (!permissions || !Array.isArray(permissions)) return false;
    const permissionArray : [string] = permissions as [string];
    //const set = new Set((tokenScopes ?? '').split(' ').filter(Boolean));
    return required.every((s) => permissionArray.includes(s));
}

// Middleware: validate access token with jose
async function verifyAccessToken(c: Context<Env>) {
    const auth = c.req.header('authorization') || '';
    if (!auth.toLowerCase().startsWith('bearer ')) {
        return c.json({error: 'Unauthorized'}, 401);
    }
    const token = auth.slice(7).trim();

    try {
        const issuer = c.env.AUTH0_ISSUER;
        const audience = c.env.AUTH0_AUDIENCE_ADMIN;
        const jwksUri = c.env.AUTH0_JWKS_URL;

        const JWKS = createRemoteJWKSet(new URL(jwksUri));
        const {payload} = await jwtVerify(token, JWKS, {
            issuer,
            audience,
        });

        // attach token payload to context for handlers
        c.set('token', payload);
        return null;
    } catch (e) {
        return c.json({error: 'Unauthorized'}, 401);
    }
}

const app = new Hono<Env>();

app.use('*', cors());

// Health endpoint
app.get('/health', (c) => c.json({ok: true}));

// List organizations (D1 mirror) - minimal demo implementation
app.get('/organizations', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ['read:organizations']/*, token.scope*/)) {
        return c.json({error: 'Forbidden'}, 403);
    }

    const {org_type, sso_status, q, page = '1', per_page = '20'} = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(per_page);

    let sql = `SELECT auth0_org_id, name, org_type, domain, sso_status
               FROM Organizations`;
    const params: any[] = [];
    if (org_type) {
        sql += ' AND org_type = ?';
        params.push(org_type);
    }
    if (sso_status) {
        sql += ' AND sso_status = ?';
        params.push(sso_status);
    }
    if (q) {
        sql += ' AND (name LIKE ? OR domain LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(per_page), offset);

    try {
        const rs = await c.env.DB.prepare(sql)
            .bind(...params)
            .all<components['schemas']['OrganizationSummary']>();
        return c.json(rs.results || []);
    } catch (e) {
        return c.json({error: 'Server error'}, 500);
    }
});

// Get organization by auth0_org_id
app.get('/organizations/:orgId', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ['read:organizations'])) {
        return c.json({error: 'Forbidden'}, 403);
    }
    const orgId = c.req.param('orgId');
    try {
        const rs = await c.env.DB.prepare(
            `SELECT auth0_org_id,
                    name,
                    org_type,
                    domain,
                    sso_status,
                    pickup_address,
                    delivery_address,
                    coverage_regions,
                    vehicle_types
             FROM Organizations
             WHERE auth0_org_id = ?`,
        )
            .bind(orgId)
            .first<any>();

        if (!rs) return c.json({error: 'Not Found'}, 404);

        // vehicle_types stored as JSON string optionally
        let vt: string[] | null = null;
        if (rs.vehicle_types) {
            try {
                vt = JSON.parse(rs.vehicle_types);
            } catch {
                vt = null;
            }
        }

        const org: components['schemas']['Organization'] = {
            auth0_org_id: rs.auth0_org_id,
            name: rs.name,
            org_type: rs.org_type,
            domain: rs.domain,
            sso_status: rs.sso_status,
            pickup_address: rs.pickup_address ?? null,
            pickup_schedule: rs.pickup_schedule ?? null,
            delivery_address: rs.delivery_address ?? null,
            delivery_schedule: rs.delivery_schedule ?? null,
            coverage_regions: rs.coverage_regions ?? null,
            vehicle_types: vt,
        };
        return c.json(org);
    } catch (e) {
        return c.json({error: 'Server error'}, 500);
    }
});

// Create organization (D1 only mirror for demo). In real impl, would call Auth0 Management API.
app.post('/organizations', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ['create:organizations']/*, token.scope*/)) {
        return c.json({error: 'Forbidden'}, 403);
    }
    const body = await c.req.json<components['schemas']['OrganizationCreateRequest']>();

    if (!body?.name || !body?.org_type || !body?.domain) {
        return c.json({error: 'Bad Request'}, 400);
    }
    try {
        // Minimal: create a synthetic auth0_org_id if not provided by upstream
        const auth0_org_id = `org_${Math.random().toString(36).slice(2)}`;

        await c.env.DB.prepare(
            `INSERT INTO Organizations (auth0_org_id, name, org_type, domain, sso_status)
             VALUES (?, ?, ?, ?, 'configured')`,
        )
            .bind(auth0_org_id, body.name, body.org_type, body.domain)
            .run();

        return c.json({auth0_org_id}, 201);
    } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg.includes('UNIQUE')) return c.json({error: 'Conflict'}, 409);
        return c.json({error: 'Upstream error'}, 502);
    }
});

// Update organization metadata (D1 only demo)
app.patch('/organizations/:orgId', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ['update:organizations'])) {
        return c.json({error: 'Forbidden'}, 403);
    }
    const orgId = c.req.param('orgId');
    const body = await c.req.json<components['schemas']['OrganizationUpdateRequest']>();

    try {
        const existing = await c.env.DB.prepare('SELECT auth0_org_id FROM Organizations WHERE auth0_org_id = ?')
            .bind(orgId)
            .first();
        if (!existing) return c.json({error: 'Not Found'}, 404);

        const fields: string[] = [];
        const params: any[] = [];
        if (body.name !== undefined) {
            fields.push('name = ?');
            params.push(body.name);
        }
        if (body.domain !== undefined) {
            fields.push('domain = ?');
            params.push(body.domain);
        }
        if (body.metadata?.org_type !== undefined) {
            fields.push('org_type = ?');
            params.push(body.metadata.org_type);
        }
        if (body.metadata?.pickup_address !== undefined) {
            fields.push('pickup_address = ?');
            params.push(body.metadata.pickup_address);
        }
        if (body.metadata?.delivery_address !== undefined) {
            fields.push('delivery_address = ?');
            params.push(body.metadata.delivery_address);
        }
        if (body.metadata?.coverage_regions !== undefined) {
            fields.push('coverage_regions = ?');
            params.push(body.metadata.coverage_regions);
        }
        if (body.metadata?.vehicle_types !== undefined) {
            fields.push('vehicle_types = ?');
            params.push(JSON.stringify(body.metadata.vehicle_types));
        }

        if (!fields.length) return c.json({updated: 0});

        params.push(orgId);
        const sql = `UPDATE Organizations
                     SET ${fields.join(', ')}
                     WHERE auth0_org_id = ?`;
        await c.env.DB.prepare(sql)
            .bind(...params)
            .run();
        return c.json({updated: 1});
    } catch (e) {
        return c.json({error: 'Server error'}, 500);
    }
});

// Soft delete (archive)
app.delete('/organizations/:orgId', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ['update:organizations']/*, token.scope*/)) {
        return c.json({error: 'Forbidden'}, 403);
    }
    const orgId = c.req.param('orgId');
    try {
        await c.env.DB.prepare('DELETE FROM Organizations WHERE auth0_org_id = ?').bind(orgId).run();
        return c.json({archived: true});
    } catch (e) {
        return c.json({error: 'Server error'}, 500);
    }
});

// Invitations endpoints (stubbed for demo; no external Auth0 calls)
app.get('/organizations/invitations', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ['read:org_invitations']/*, token.scope*/)) {
        return c.json({error: 'Forbidden'}, 403);
    }
    // Minimal: return empty list or demo row joined from Organizations
    const rs = await c.env.DB.prepare(
        'SELECT auth0_org_id, name, org_type, domain, sso_status FROM Organizations WHERE sso_status = ? ORDER BY name',
    )
        .bind('invited')
        .all();
    const now = new Date().toISOString();
    const data = (rs.results || []).map((r: any) => ({
        invitation_id: `inv_${r.auth0_org_id}`,
        auth0_org_id: r.auth0_org_id,
        name: r.name,
        org_type: r.org_type,
        domain: r.domain,
        sso_status: r.sso_status,
        sent_at: now,
    }));
    return c.json(data);
});

app.post('/organizations/invitations', async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ['create:org_invitations', 'update:organizations'])) {
        return c.json({error: 'Forbidden'}, 403);
    }
    const body = await c.req.json<components['schemas']['InvitationCreateRequest']>();
    if (!body?.name || !body?.domain || !body?.org_type || !body?.admin_email) {
        return c.json({error: 'Bad Request'}, 400);
    }
    try {
        const auth0_org_id = `org_${Math.random().toString(36).slice(2)}`;
        await c.env.DB.prepare(
            `INSERT INTO Organizations (auth0_org_id, name, org_type, domain, sso_status)
             VALUES (?, ?, ?, ?, 'invited')`,
        )
            .bind(auth0_org_id, body.name, body.org_type, body.domain)
            .run();

        return c.json({invitation_id: `inv_${auth0_org_id}`, auth0_org_id, status: 'invited'});
    } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg.includes('UNIQUE')) return c.json({error: 'Conflict'}, 409);
        return c.json({error: 'Upstream error'}, 502);
    }
});

// noinspection JSUnusedGlobalSymbols
export default app;
