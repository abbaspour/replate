import {Hono} from "hono";
import type {Context} from "hono";
import {cors} from "hono/cors";
import {jwtVerify, createRemoteJWKSet, JWTPayload} from "jose";
import {ManagementClient} from "auth0";

// Types generated from OpenAPI (kept minimal here)
import type {components} from "./api-types";

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
        AUTH0_CLIENT_ID: string;
        AUTH0_CLIENT_SECRET: string;
        AUTH0_DOMAIN: string; // e.g., replate-prd.au.auth0.com or id.replate.dev
        SELF_SERVICE_SSO_PROFILE_ID: string; // Auth0 Self-Service Profile ID
        BUSINESS_SPA_CLIENT_ID: string; // business spa app client_id
    };
};

// Helper: scope check
function requirePermissions(c: Context<Env>, required: string[]) {
    const token = c.get("token");
    const permissions = token?.permissions;
    if (!permissions || !Array.isArray(permissions)) return false;
    const permissionArray: [string] = permissions as [string];
    return required.every((s) => permissionArray.includes(s));
}

// Middleware: validate access token with jose
async function verifyAccessToken(c: Context<Env>) {
    const auth = c.req.header("authorization") || "";
    if (!auth.toLowerCase().startsWith("bearer ")) {
        return c.json({error: "Unauthorized"}, 401);
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
        c.set("token", payload);
        return null;
    } catch (e) {
        return c.json({error: "Unauthorized"}, 401);
    }
}

const app = new Hono<Env>().basePath('/api');

let mgmtClient: ManagementClient | null = null;

function getManagementClient(env: Env["Bindings"]): ManagementClient {
    if (!mgmtClient) {
        mgmtClient = new ManagementClient({
            domain: env.AUTH0_DOMAIN,
            clientId: env.AUTH0_CLIENT_ID,
            clientSecret: env.AUTH0_CLIENT_SECRET,
            audience: `https://${env.AUTH0_DOMAIN}/api/v2/`,
        });
    }
    return mgmtClient;
}

function toOrgSlug(input: string): string {
    const base = input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return base || `org-${Math.random().toString(36).slice(2, 8)}`;
}

function toOrgConnectionName(input: string): string {
    const base = input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `org-${base}-cnx`;
}

async function createAuth0Organization(env: Env["Bindings"], params: {name: string; domain: string}) {
    const client = getManagementClient(env);

    try {
        const slug = toOrgSlug(params.name || params.domain);
        const data = {
            name: slug,
            display_name: params.name,
            metadata: {domain: params.domain},
        };
        console.log(`creating org with data: ${JSON.stringify(data)}`);

        const created = await client.organizations.create(data);

        console.log(created);
        return created?.data || created;
    } catch (e) {
        console.log(e);
    }
}

app.use("*", cors());

// Health endpoint
app.get("/health", (c) => c.json({ok: true}));

// List organizations (D1 mirror) - minimal demo implementation
app.get("/organizations", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["read:organizations"])) {
        return c.json({error: "Forbidden"}, 403);
    }

    const {org_type, sso_status, q, page = "1", per_page = "20"} = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(per_page);

    let sql = `SELECT auth0_org_id, name, org_type, domain, sso_status
               FROM Organizations WHERE TRUE`;
    const params: any[] = [];
    if (org_type) {
        sql += " AND org_type = ?";
        params.push(org_type);
    }
    if (sso_status) {
        sql += " AND sso_status = ?";
        params.push(sso_status);
    }
    if (q) {
        sql += " AND (name LIKE ? OR domain LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY name LIMIT ? OFFSET ?";
    params.push(parseInt(per_page), offset);

    try {
        const rs = await c.env.DB.prepare(sql)
            .bind(...params)
            .all<components["schemas"]["OrganizationSummary"]>();
        return c.json(rs.results || []);
    } catch (e) {
        return c.json({error: "Server error"}, 500);
    }
});

// Get organization by auth0_org_id
app.get("/organizations/:orgId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    //const token: any = c.get('token');
    if (!requirePermissions(c, ["read:organizations"])) {
        return c.json({error: "Forbidden"}, 403);
    }
    const orgId = c.req.param("orgId");
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

        if (!rs) return c.json({error: "Not Found"}, 404);

        // vehicle_types stored as JSON string optionally
        let vt: string[] | null = null;
        if (rs.vehicle_types) {
            try {
                vt = JSON.parse(rs.vehicle_types);
            } catch {
                vt = null;
            }
        }

        const org: components["schemas"]["Organization"] = {
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
        return c.json({error: "Server error"}, 500);
    }
});

// Create organization: create in Auth0 via Management API then mirror in D1
app.post("/organizations", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["create:organizations"])) {
        return c.json({error: "Forbidden"}, 403);
    }
    const body = await c.req.json<components["schemas"]["OrganizationCreateRequest"]>();

    console.log(body);

    if (!body?.name || !body?.org_type || !body?.domain) {
        return c.json({error: "Bad Request"}, 400);
    }
    try {
        // Create in Auth0 Management API
        const auth0Org = await createAuth0Organization(c.env, {name: body.name, domain: body.domain});
        const auth0_org_id = auth0Org?.id;
        if (!auth0_org_id) {
            return c.json({error: "Upstream error"}, 502);
        }

        console.log(auth0_org_id);

        await c.env.DB.prepare(
            `INSERT INTO Organizations (auth0_org_id, name, org_type, domain, sso_status)
             VALUES (?, ?, ?, ?, 'configured')`,
        )
            .bind(auth0_org_id, body.name, body.org_type, body.domain)
            .run();

        return c.json({auth0_org_id}, 201);
    } catch (e: any) {
        console.trace(e);
        const msg = String(e?.message || "");
        if (msg.includes("UNIQUE")) return c.json({error: "Conflict"}, 409);
        return c.json({error: "Upstream error"}, 502);
    }
});

// Update organization metadata (D1 only demo)
app.patch("/organizations/:orgId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:organizations"])) {
        return c.json({error: "Forbidden"}, 403);
    }
    const orgId = c.req.param("orgId");
    const body = await c.req.json<components["schemas"]["OrganizationUpdateRequest"]>();

    try {
        const existing = await c.env.DB.prepare("SELECT auth0_org_id FROM Organizations WHERE auth0_org_id = ?")
            .bind(orgId)
            .first();
        if (!existing) return c.json({error: "Not Found"}, 404);

        const fields: string[] = [];
        const params: any[] = [];
        if (body.name !== undefined) {
            fields.push("name = ?");
            params.push(body.name);
        }
        if (body.domain !== undefined) {
            fields.push("domain = ?");
            params.push(body.domain);
        }
        if (body.metadata?.org_type !== undefined) {
            fields.push("org_type = ?");
            params.push(body.metadata.org_type);
        }
        if (body.metadata?.pickup_address !== undefined) {
            fields.push("pickup_address = ?");
            params.push(body.metadata.pickup_address);
        }
        if (body.metadata?.delivery_address !== undefined) {
            fields.push("delivery_address = ?");
            params.push(body.metadata.delivery_address);
        }
        if (body.metadata?.coverage_regions !== undefined) {
            fields.push("coverage_regions = ?");
            params.push(body.metadata.coverage_regions);
        }
        if (body.metadata?.vehicle_types !== undefined) {
            fields.push("vehicle_types = ?");
            params.push(JSON.stringify(body.metadata.vehicle_types));
        }

        if (!fields.length) return c.json({updated: 0});

        params.push(orgId);
        const sql = `UPDATE Organizations
                     SET ${fields.join(", ")}
                     WHERE auth0_org_id = ?`;
        await c.env.DB.prepare(sql)
            .bind(...params)
            .run();
        return c.json({updated: 1});
    } catch (e) {
        return c.json({error: "Server error"}, 500);
    }
});

// Soft delete (archive)
app.delete("/organizations/:orgId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:organizations"])) {
        return c.json({error: "Forbidden"}, 403);
    }
    const orgId = c.req.param("orgId");
    try {
        await c.env.DB.prepare("DELETE FROM Organizations WHERE auth0_org_id = ?").bind(orgId).run();
        return c.json({archived: true});
    } catch (e) {
        return c.json({error: "Server error"}, 500);
    }
});

// SSO Invitations endpoints (SQL-backed) now nested under organizations
app.get("/organizations/:orgId/sso-invitations", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["read:sso_invitations"])) {
        return c.json({error: "Forbidden"}, 403);
    }

    const {status, org_type, q} = c.req.query();
    const orgId = c.req.param("orgId");

    // Compute status from ttl and created_at; join org info
    let sql = `
      SELECT 
        s.id AS invitation_id,
        o.auth0_org_id AS auth0_org_id,
        o.name AS name,
        o.org_type AS org_type,
        o.domain AS domain,
        s.link AS link,
        s.created_at AS created_at,
        CASE WHEN (strftime('%s','now') > (strftime('%s', s.created_at) + s.ttl)) THEN 'expired' ELSE 'invited' END AS sso_status
      FROM SsoInvitations s
      JOIN Organizations o ON o.id = s.organization_id
      WHERE o.auth0_org_id = ?`;
    const params: any[] = [orgId];

    if (org_type) {
        sql += " AND o.org_type = ?";
        params.push(org_type);
    }
    if (q) {
        sql += " AND (o.name LIKE ? OR o.domain LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
    }
    if (status) {
        if (status === "expired") {
            sql += " AND (strftime('%s','now') > (strftime('%s', s.created_at) + s.ttl))";
        } else if (status === "invited" || status === "configured" || status === "active") {
            // For now, SsoInvitations table only reflects 'invited' vs 'expired'. Other states would come from org.sso_status
            if (status === "invited") {
                sql += " AND (strftime('%s','now') <= (strftime('%s', s.created_at) + s.ttl))";
            } else {
                sql += " AND o.sso_status = ?";
                params.push(status);
            }
        }
    }

    sql += " ORDER BY s.created_at DESC";

    try {
        const rs = await c.env.DB.prepare(sql)
            .bind(...params)
            .all<components["schemas"]["InvitationSummary"]>();
        return c.json(rs.results || []);
    } catch (e) {
        return c.json({error: "Server error"}, 500);
    }
});

app.post("/organizations/:orgId/sso-invitations", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["create:sso_invitations"])) {
        return c.json({error: "Forbidden"}, 403);
    }
    const body = await c.req.json<any>().catch(() => undefined);
    const orgId = c.req.param("orgId");
    if (!body || typeof body.ttl !== "number") {
        return c.json({error: "Bad Request"}, 400);
    }

    try {
        // Lookup organization
        const org = await c.env.DB.prepare("SELECT id, auth0_org_id, name FROM Organizations WHERE auth0_org_id = ?")
            .bind(orgId)
            .first<{id: number; auth0_org_id: string; name: string}>();
        if (!org) return c.json({error: "Not Found"}, 404);

        // Optional: resolve issuer user id from token sub
        const token: any = c.get("token");
        const sub = token?.sub as string | undefined;
        let issuerUserId: number | null = null;
        if (sub) {
            const issuer = await c.env.DB.prepare("SELECT id FROM Users WHERE auth0_user_id = ?").bind(sub).first<{id: number}>();
            if (issuer?.id) issuerUserId = issuer.id;
        }

        const domainVerification = body.domain_verification ? "Required" : "Off";

        const auth0ConnectionName = toOrgConnectionName(org.name);

        // Create Self-Service SSO ticket via Auth0 Management API
        const client = getManagementClient(c.env);
        const ssoRes = await client.selfServiceProfiles.createSsoTicket(
            { id: c.env.SELF_SERVICE_SSO_PROFILE_ID },
            {
                enabled_organizations: [
                    {
                        organization_id: org.auth0_org_id,
                        assign_membership_on_login: true,
                        show_as_button: true,
                    },
                ],
                enabled_clients: [
                    c.env.BUSINESS_SPA_CLIENT_ID
                ],
                ttl_sec: body.ttl,
                domain_aliases_config: {
                    domain_verification: body.domain_verification ? "required" : "none",
                },
                connection_config: {
                    name: auth0ConnectionName,
                    is_domain_connection: false,
                    display_name: org.name,
                    // TODO: idpinitiated
                }
            },
        );
        const link = (ssoRes as any)?.data?.ticket ?? (ssoRes as any)?.ticket;
        const auth0TicketId: string | null = null;

        const insert = await c.env.DB.prepare(
            `INSERT INTO SsoInvitations (organization_id, issuer_user_id, display_name, link, auth0_ticket_id, auth0_connection_name, domain_verification, accept_idp_init_saml, ttl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
            .bind(
                org.id,
                issuerUserId,
                org.name,
                link,
                auth0TicketId,
                auth0ConnectionName,
                domainVerification,
                body.accept_idp_init_saml ? 1 : 0,
                body.ttl,
            )
            .run();

        // Update org sso_status to invited
        await c.env.DB.prepare("UPDATE Organizations SET sso_status = 'invited' WHERE id = ?").bind(org.id).run();

        // Return created resource
        const invitation_id = (insert as any)?.lastInsertRowId ?? undefined;
        return c.json({invitation_id: String(invitation_id), auth0_org_id: org.auth0_org_id, link}, 201);
    } catch (e: any) {
        console.log(e);
        return c.json({error: "Upstream error"}, 502);
    }
});

app.delete("/organizations/:orgId/sso-invitations/:invId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["delete:sso_invitations"])) {
        return c.json({error: "Forbidden"}, 403);
    }

    const invId = c.req.param("invId");
    try {
        const res = await c.env.DB.prepare("DELETE FROM SsoInvitations WHERE id = ?").bind(invId).run();
        return c.json({archived: true});
    } catch (e) {
        return c.json({error: "Server error"}, 500);
    }
});

// noinspection JSUnusedGlobalSymbols
export default app;
