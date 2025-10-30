// noinspection SqlResolve

import {Hono} from "hono";
import type {Context} from "hono";
import {cors} from "hono/cors";
import {createRemoteJWKSet, jwtVerify, JWTPayload} from "jose";

// Types generated from OpenAPI for Business API
import type {components} from "./api-types";

// Environment bindings for the Business API worker
export type Env = {
    Variables: {
        token: JWTPayload;
    };
    Bindings: {
        DB: D1Database;
        AUTH0_JWKS_URL: string; // e.g., https://id.replate.dev/.well-known/jwks.json
        AUTH0_AUDIENCE_ADMIN: string; // set to business.api in wrangler.toml
        AUTH0_ISSUER: string; // e.g., https://id.replate.dev/
    };
};

// Utility: permission (Auth0 RBAC permissions array)
function requirePermissions(c: Context<Env>, required: string[]): boolean {
    const token: JWTPayload = c.get("token");
    const permissions = token?.permissions;
    if (!permissions || !Array.isArray(permissions)) return false;
    return required.every((p) => (permissions as string[]).includes(p));
}

function getOrgId(c: Context<Env>): string | undefined {
    const token: JWTPayload = c.get("token");
    return token?.org_id as string | undefined;
}

async function verifyAccessToken(c: Context<Env>) {
    const auth = c.req.header("authorization") || "";
    if (!auth.toLowerCase().startsWith("bearer ")) {
        return c.json({error: "Unauthorized"}, 401);
    }
    const token = auth.slice(7).trim();
    try {
        const JWKS = createRemoteJWKSet(new URL(c.env.AUTH0_JWKS_URL));
        const {payload} = await jwtVerify(token, JWKS, {
            issuer: c.env.AUTH0_ISSUER,
            audience: c.env.AUTH0_AUDIENCE_ADMIN,
        });
        c.set("token", payload);
        return null;
    } catch {
        return c.json({error: "Unauthorized"}, 401);
    }
}

const app = new Hono<Env>().basePath("/api");
app.use("*", cors());

// Health
app.get("/health", (c) => c.json({ok: true}));

// Helpers: D1 mappers and lookups
function parseJsonArray<T = string>(val: any): T[] | undefined {
    if (val == null) return undefined;
    if (Array.isArray(val)) return val as T[];
    try {
        const parsed = JSON.parse(String(val));
        return Array.isArray(parsed) ? (parsed as T[]) : undefined;
    } catch {
        return undefined;
    }
}

/*
async function getCallerD1UserId(c: Context<Env>): Promise<number | null> {
    const token: any = c.get("token");
    const sub: string | undefined = token?.sub as string | undefined;
    if (!sub) return null;
    try {
        const row = await c.env.DB.prepare(`SELECT id FROM Users WHERE auth0_user_id = ?`).bind(sub).first<{id: number}>();
        return row?.id ?? null;
    } catch {
        return null;
    }
}
*/

async function getOrgByAuth0Id(
    c: Context<Env>,
    auth0OrgId: string,
): Promise<{id: number; auth0_org_id: string; org_type: string; name: string} | null> {
    const row = await c.env.DB.prepare(`SELECT id, auth0_org_id, org_type, name FROM Organizations WHERE auth0_org_id = ?`)
        .bind(auth0OrgId)
        .first<any>();
    return row ?? null;
}

async function getOrgIdByAuth0Id(c: Context<Env>, auth0OrgId?: string | null): Promise<number | null> {
    if (!auth0OrgId) return null;
    const row = await c.env.DB.prepare(`SELECT id FROM Organizations WHERE auth0_org_id = ?`)
        .bind(auth0OrgId)
        .first<{id: number}>();
    return row?.id ?? null;
}

// Organizations
app.get("/organizations/:orgId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["read:organization"])) {
        return c.json({error: "Forbidden"}, 403);
    }
    const orgId = c.req.param("orgId");
    const callerOrgId = getOrgId(c);
    if (!callerOrgId || callerOrgId !== orgId) {
        return c.json({error: "Forbidden"}, 403);
    }
    try {
        const rs = await c.env.DB.prepare(
            `SELECT auth0_org_id,
              org_type,
              name,
              domain,
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

        const org: components["schemas"]["Organization"] = {
            auth0_org_id: rs.auth0_org_id,
            org_type: rs.org_type,
            name: rs.name,
            domain: rs.domain ?? undefined,
            pickup_address: rs.pickup_address ?? null,
            delivery_address: rs.delivery_address ?? null,
            coverage_regions: rs.coverage_regions ?? null,
            vehicle_types: parseJsonArray<string>(rs.vehicle_types) ?? null,
            // Not stored in DDL; return null
            pickup_schedule: null,
            delivery_schedule: null,
        };
        return c.json(org);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

app.patch("/organizations/:orgId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:organization"])) {
        return c.json({error: "Forbidden"}, 403);
    }

    const orgId = c.req.param("orgId");
    const callerOrgId = getOrgId(c);
    if (!callerOrgId || callerOrgId !== orgId) return c.json({error: "Forbidden"}, 403);

    const body = await c.req.json<components["schemas"]["OrganizationUpdateRequest"]>();

    try {
        const exists = await c.env.DB.prepare("SELECT auth0_org_id FROM Organizations WHERE auth0_org_id = ?")
            .bind(orgId)
            .first();
        if (!exists) return c.json({error: "Not Found"}, 404);

        const fields: string[] = [];
        const params: any[] = [];

        if (body?.metadata?.pickup_address !== undefined) {
            fields.push("pickup_address = ?");
            params.push(body.metadata.pickup_address);
        }
        if (body?.metadata?.delivery_address !== undefined) {
            fields.push("delivery_address = ?");
            params.push(body.metadata.delivery_address);
        }
        if (body?.metadata?.coverage_regions !== undefined) {
            fields.push("coverage_regions = ?");
            params.push(body.metadata.coverage_regions);
        }
        if (body?.metadata?.vehicle_types !== undefined) {
            fields.push("vehicle_types = ?");
            params.push(JSON.stringify(body.metadata.vehicle_types ?? []));
        }

        if (fields.length) {
            params.push(orgId);
            const sql = `UPDATE Organizations SET ${fields.join(", ")} WHERE auth0_org_id = ?`;
            await c.env.DB.prepare(sql)
                .bind(...params)
                .run();
        }

        const updated = await c.env.DB.prepare(
            `SELECT auth0_org_id, org_type, name, domain, pickup_address, delivery_address, coverage_regions, vehicle_types
         FROM Organizations WHERE auth0_org_id = ?`,
        )
            .bind(orgId)
            .first<any>();

        const org: components["schemas"]["Organization"] = {
            auth0_org_id: updated.auth0_org_id,
            org_type: updated.org_type,
            name: updated.name,
            domain: updated.domain ?? undefined,
            pickup_address: updated.pickup_address ?? null,
            delivery_address: updated.delivery_address ?? null,
            coverage_regions: updated.coverage_regions ?? null,
            vehicle_types: parseJsonArray<string>(updated.vehicle_types) ?? null,
            pickup_schedule: null,
            delivery_schedule: null,
        };
        return c.json(org);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

// Jobs
app.get("/jobs", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["read:pickups"])) return c.json({error: "Forbidden"}, 403);

    const auth0OrgId = getOrgId(c);
    if (!auth0OrgId) return c.json({error: "Forbidden"}, 403);

    const orgRow = await getOrgByAuth0Id(c, auth0OrgId);
    if (!orgRow) return c.json({error: "Not Found"}, 404);

    const {status, page = "1", per_page = "20"} = c.req.query();
    const limit = Math.min(parseInt(per_page || "20", 10) || 20, 100);
    const offset = ((parseInt(page || "1", 10) || 1) - 1) * limit;

    const role = requirePermissions(c, ["update:pickups"]) ? "driver" : null; // only drivers have permission to update pickups

    try {
        const params: any[] = [];
        // noinspection SqlConstantExpression
        let sql = `SELECT j.id, j.schedule_id, j.status, j.pickup_window_start, j.pickup_window_end, j.food_category, j.estimated_weight_kg, j.packaging, j.handling_notes,
                      sup.auth0_org_id AS supplier_org_id,
                      com.auth0_org_id AS community_org_id,
                      logi.auth0_org_id AS logistics_org_id,
                      j.driver_auth0_user_id AS driver_user_id
                 FROM PickupJobs j
            LEFT JOIN Organizations sup ON j.supplier_id = sup.id
            LEFT JOIN Organizations com ON j.community_id = com.id
            LEFT JOIN Organizations logi ON j.logistics_id = logi.id
                WHERE 1=1`;

        if (role === "driver") {
            const token: any = c.get("token");
            const sub = token?.sub as string | undefined;
            if (!sub) return c.json([], 200);
            sql += ` AND j.driver_auth0_user_id = ? AND (j.supplier_id = ? OR j.community_id = ? OR j.logistics_id = ?)`;
            params.push(sub, orgRow.id, orgRow.id, orgRow.id);
        } else {
            sql += ` AND (j.supplier_id = ? OR j.community_id = ? OR j.logistics_id = ?)`;
            params.push(orgRow.id, orgRow.id, orgRow.id);
        }

        if (status) {
            sql += ` AND j.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY j.pickup_window_start DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const rs = await c.env.DB.prepare(sql)
            .bind(...params)
            .all<any>();
        const list: components["schemas"]["Job"][] = (rs.results || []).map((r: any) => ({
            id: r.id,
            schedule_id: r.schedule_id ?? null,
            status: r.status,
            pickup_window_start: r.pickup_window_start,
            pickup_window_end: r.pickup_window_end,
            food_category: parseJsonArray<string>(r.food_category) ?? [],
            estimated_weight_kg: Number(r.estimated_weight_kg),
            packaging: r.packaging ?? null,
            handling_notes: r.handling_notes ?? null,
            supplier_org_id: r.supplier_org_id,
            community_org_id: r.community_org_id ?? null,
            logistics_org_id: r.logistics_org_id ?? null,
            driver_user_id: r.driver_user_id != null ? String(r.driver_user_id) : null,
        }));
        return c.json(list);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

app.post("/jobs", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["create:pickups"])) return c.json({error: "Forbidden"}, 403);

    const auth0OrgId = getOrgId(c);
    if (!auth0OrgId) return c.json({error: "Forbidden"}, 403);

    const body = await c.req.json<components["schemas"]["JobCreateRequest"]>();

    try {
        const supplier = await getOrgByAuth0Id(c, auth0OrgId);
        if (!supplier) return c.json({error: "Not Found"}, 404);
        if (supplier.org_type !== "supplier") return c.json({error: "Forbidden"}, 403);

        const communityId = await getOrgIdByAuth0Id(c, body.community_org_id ?? null);

        const insert = await c.env.DB.prepare(
            `INSERT INTO PickupJobs (schedule_id, status, pickup_window_start, pickup_window_end, food_category, estimated_weight_kg, packaging, handling_notes, supplier_id, community_id)
       VALUES (NULL, 'New', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
            .bind(
                body.pickup_window_start,
                body.pickup_window_end,
                JSON.stringify(body.food_category || []),
                body.estimated_weight_kg,
                body.packaging ?? null,
                body.handling_notes ?? null,
                supplier.id,
                communityId,
            )
            .run();

        const insertedId = (insert as any).lastRowId || (insert as any).meta?.last_row_id || (insert as any).meta?.last_rowid;

        const row = await c.env.DB.prepare(
            `SELECT j.id, j.schedule_id, j.status, j.pickup_window_start, j.pickup_window_end, j.food_category, j.estimated_weight_kg, j.packaging, j.handling_notes,
              sup.auth0_org_id AS supplier_org_id,
              com.auth0_org_id AS community_org_id,
              logi.auth0_org_id AS logistics_org_id,
              j.driver_auth0_user_id AS driver_user_id
         FROM PickupJobs j
    LEFT JOIN Organizations sup ON j.supplier_id = sup.id
    LEFT JOIN Organizations com ON j.community_id = com.id
    LEFT JOIN Organizations logi ON j.logistics_id = logi.id
        WHERE j.id = ?`,
        )
            .bind(insertedId)
            .first<any>();

        const job: components["schemas"]["Job"] = {
            id: row.id,
            schedule_id: row.schedule_id ?? null,
            status: row.status,
            pickup_window_start: row.pickup_window_start,
            pickup_window_end: row.pickup_window_end,
            food_category: parseJsonArray<string>(row.food_category) ?? [],
            estimated_weight_kg: Number(row.estimated_weight_kg),
            packaging: row.packaging ?? null,
            handling_notes: row.handling_notes ?? null,
            supplier_org_id: row.supplier_org_id,
            community_org_id: row.community_org_id ?? null,
            logistics_org_id: row.logistics_org_id ?? null,
            driver_user_id: row.driver_user_id != null ? String(row.driver_user_id) : null,
        };

        return c.json(job, 201);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

app.patch("/jobs/:id", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:pickups"])) return c.json({error: "Forbidden"}, 403);

    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id) || id < 1) return c.json({error: "Bad Request"}, 400);

    const body = await c.req.json<components["schemas"]["JobUpdateRequest"]>();
    if (!["In Transit", "Delivered"].includes(body.status)) return c.json({error: "Bad Request"}, 400);

    try {
        const token: any = c.get("token");
        const sub = token?.sub as string | undefined;
        if (!sub) return c.json({error: "Forbidden"}, 403);

        const job = await c.env.DB.prepare(`SELECT id, driver_auth0_user_id FROM PickupJobs WHERE id = ?`).bind(id).first<any>();
        if (!job) return c.json({error: "Not Found"}, 404);

        // Ensure the caller is the assigned driver
        if (job.driver_auth0_user_id == null || String(job.driver_auth0_user_id) !== String(sub)) {
            return c.json({error: "Forbidden"}, 403);
        }

        await c.env.DB.prepare(`UPDATE PickupJobs SET status = ? WHERE id = ?`).bind(body.status, id).run();

        const updated = await c.env.DB.prepare(
            `SELECT j.id, j.schedule_id, j.status, j.pickup_window_start, j.pickup_window_end, j.food_category, j.estimated_weight_kg, j.packaging, j.handling_notes,
              sup.auth0_org_id AS supplier_org_id,
              com.auth0_org_id AS community_org_id,
              logi.auth0_org_id AS logistics_org_id,
              j.driver_auth0_user_id AS driver_user_id
         FROM PickupJobs j
    LEFT JOIN Organizations sup ON j.supplier_id = sup.id
    LEFT JOIN Organizations com ON j.community_id = com.id
    LEFT JOIN Organizations logi ON j.logistics_id = logi.id
        WHERE j.id = ?`,
        )
            .bind(id)
            .first<any>();

        const jobDto: components["schemas"]["Job"] = {
            id: updated.id,
            schedule_id: updated.schedule_id ?? null,
            status: updated.status,
            pickup_window_start: updated.pickup_window_start,
            pickup_window_end: updated.pickup_window_end,
            food_category: parseJsonArray<string>(updated.food_category) ?? [],
            estimated_weight_kg: Number(updated.estimated_weight_kg),
            packaging: updated.packaging ?? null,
            handling_notes: updated.handling_notes ?? null,
            supplier_org_id: updated.supplier_org_id,
            community_org_id: updated.community_org_id ?? null,
            logistics_org_id: updated.logistics_org_id ?? null,
            driver_user_id: updated.driver_user_id != null ? String(updated.driver_user_id) : null,
        };
        return c.json(jobDto);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

// Pickup Schedules
app.get("/schedules", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["read:schedules"])) return c.json({error: "Forbidden"}, 403);

    const auth0OrgId = getOrgId(c);
    if (!auth0OrgId) return c.json({error: "Forbidden"}, 403);
    const orgRow = await getOrgByAuth0Id(c, auth0OrgId);
    if (!orgRow) return c.json({error: "Not Found"}, 404);

    const {page = "1", per_page = "20"} = c.req.query();
    const limit = Math.min(parseInt(per_page || "20", 10) || 20, 100);
    const offset = ((parseInt(page || "1", 10) || 1) - 1) * limit;

    try {
        const rs = await c.env.DB.prepare(
            `SELECT s.id,
              s.supplier_id,
              s.default_community_id,
              s.is_active,
              s.cron_expression,
              s.pickup_time_of_day,
              s.pickup_duration_minutes,
              s.default_food_category,
              s.default_estimated_weight_kg,
              sup.auth0_org_id AS supplier_org_id,
              com.auth0_org_id AS default_community_org_id
         FROM PickupSchedules s
    JOIN Organizations sup ON s.supplier_id = sup.id
    LEFT JOIN Organizations com ON s.default_community_id = com.id
        WHERE s.supplier_id = ?
     ORDER BY s.id DESC LIMIT ? OFFSET ?`,
        )
            .bind(orgRow.id, limit, offset)
            .all<any>();

        const list: components["schemas"]["PickupSchedule"][] = (rs.results || []).map((r: any) => ({
            id: r.id,
            supplier_id: r.supplier_org_id,
            default_community_id: r.default_community_org_id ?? null,
            is_active: !!r.is_active,
            cron_expression: r.cron_expression,
            pickup_time_of_day: r.pickup_time_of_day,
            pickup_duration_minutes: Number(r.pickup_duration_minutes),
            default_food_category: parseJsonArray<string>(r.default_food_category),
            default_estimated_weight_kg:
                r.default_estimated_weight_kg != null ? Number(r.default_estimated_weight_kg) : undefined,
        }));
        return c.json(list);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

app.post("/schedules", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:schedules"])) return c.json({error: "Forbidden"}, 403);

    const auth0OrgId = getOrgId(c);
    if (!auth0OrgId) return c.json({error: "Forbidden"}, 403);
    const orgRow = await getOrgByAuth0Id(c, auth0OrgId);
    if (!orgRow) return c.json({error: "Not Found"}, 404);
    if (orgRow.org_type !== "supplier") return c.json({error: "Forbidden"}, 403);

    const body = await c.req.json<components["schemas"]["PickupScheduleCreateRequest"]>();

    try {
        const defaultCommunityNumericId = await getOrgIdByAuth0Id(c, body.default_community_id ?? null);

        const insert = await c.env.DB.prepare(
            `INSERT INTO PickupSchedules (supplier_id, default_community_id, is_active, cron_expression, pickup_time_of_day, pickup_duration_minutes, default_food_category, default_estimated_weight_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
            .bind(
                orgRow.id,
                defaultCommunityNumericId,
                body.is_active ?? 1,
                body.cron_expression,
                body.pickup_time_of_day,
                body.pickup_duration_minutes,
                JSON.stringify(body.default_food_category ?? []),
                body.default_estimated_weight_kg ?? null,
            )
            .run();

        const insertedId = (insert as any).lastRowId || (insert as any).meta?.last_row_id || (insert as any).meta?.last_rowid;

        const row = await c.env.DB.prepare(
            `SELECT s.id,
              s.supplier_id,
              s.default_community_id,
              s.is_active,
              s.cron_expression,
              s.pickup_time_of_day,
              s.pickup_duration_minutes,
              s.default_food_category,
              s.default_estimated_weight_kg,
              sup.auth0_org_id AS supplier_org_id,
              com.auth0_org_id AS default_community_org_id
         FROM PickupSchedules s
    JOIN Organizations sup ON s.supplier_id = sup.id
    LEFT JOIN Organizations com ON s.default_community_id = com.id
        WHERE s.id = ?`,
        )
            .bind(insertedId)
            .first<any>();

        const dto: components["schemas"]["PickupSchedule"] = {
            id: row.id,
            supplier_id: row.supplier_org_id,
            default_community_id: row.default_community_org_id ?? null,
            is_active: !!row.is_active,
            cron_expression: row.cron_expression,
            pickup_time_of_day: row.pickup_time_of_day,
            pickup_duration_minutes: Number(row.pickup_duration_minutes),
            default_food_category: parseJsonArray<string>(row.default_food_category),
            default_estimated_weight_kg:
                row.default_estimated_weight_kg != null ? Number(row.default_estimated_weight_kg) : undefined,
        };

        return c.json(dto, 201);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

app.patch("/schedules/:scheduleId", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:schedules"])) return c.json({error: "Forbidden"}, 403);

    const auth0OrgId = getOrgId(c);
    if (!auth0OrgId) return c.json({error: "Forbidden"}, 403);
    const orgRow = await getOrgByAuth0Id(c, auth0OrgId);
    if (!orgRow) return c.json({error: "Not Found"}, 404);

    const scheduleId = Number(c.req.param("scheduleId"));
    if (!Number.isFinite(scheduleId) || scheduleId < 1) return c.json({error: "Bad Request"}, 400);

    const body = await c.req.json<components["schemas"]["PickupScheduleUpdateRequest"]>();

    try {
        const exists = await c.env.DB.prepare(`SELECT id, supplier_id FROM PickupSchedules WHERE id = ?`)
            .bind(scheduleId)
            .first<any>();
        if (!exists) return c.json({error: "Not Found"}, 404);
        if (exists.supplier_id !== orgRow.id) return c.json({error: "Forbidden"}, 403);

        const fields: string[] = [];
        const params: any[] = [];

        if (body.default_community_id !== undefined) {
            const newComId = await getOrgIdByAuth0Id(c, body.default_community_id ?? null);
            fields.push("default_community_id = ?");
            params.push(newComId);
        }
        if (body.is_active !== undefined) {
            fields.push("is_active = ?");
            params.push(body.is_active ? 1 : 0);
        }
        if (body.cron_expression !== undefined) {
            fields.push("cron_expression = ?");
            params.push(body.cron_expression);
        }
        if (body.pickup_time_of_day !== undefined) {
            fields.push("pickup_time_of_day = ?");
            params.push(body.pickup_time_of_day);
        }
        if (body.pickup_duration_minutes !== undefined) {
            fields.push("pickup_duration_minutes = ?");
            params.push(body.pickup_duration_minutes);
        }
        if (body.default_food_category !== undefined) {
            fields.push("default_food_category = ?");
            params.push(JSON.stringify(body.default_food_category ?? []));
        }
        if (body.default_estimated_weight_kg !== undefined) {
            fields.push("default_estimated_weight_kg = ?");
            params.push(body.default_estimated_weight_kg ?? null);
        }

        if (fields.length) {
            params.push(scheduleId);
            const sql = `UPDATE PickupSchedules SET ${fields.join(", ")} WHERE id = ?`;
            await c.env.DB.prepare(sql)
                .bind(...params)
                .run();
        }

        const row = await c.env.DB.prepare(
            `SELECT s.id,
              s.supplier_id,
              s.default_community_id,
              s.is_active,
              s.cron_expression,
              s.pickup_time_of_day,
              s.pickup_duration_minutes,
              s.default_food_category,
              s.default_estimated_weight_kg,
              sup.auth0_org_id AS supplier_org_id,
              com.auth0_org_id AS default_community_org_id
         FROM PickupSchedules s
    JOIN Organizations sup ON s.supplier_id = sup.id
    LEFT JOIN Organizations com ON s.default_community_id = com.id
        WHERE s.id = ?`,
        )
            .bind(scheduleId)
            .first<any>();

        const dto: components["schemas"]["PickupSchedule"] = {
            id: row.id,
            supplier_id: row.supplier_org_id,
            default_community_id: row.default_community_org_id ?? null,
            is_active: !!row.is_active,
            cron_expression: row.cron_expression,
            pickup_time_of_day: row.pickup_time_of_day,
            pickup_duration_minutes: Number(row.pickup_duration_minutes),
            default_food_category: parseJsonArray<string>(row.default_food_category),
            default_estimated_weight_kg:
                row.default_estimated_weight_kg != null ? Number(row.default_estimated_weight_kg) : undefined,
        };

        return c.json(dto);
    } catch {
        return c.json({error: "Server error"}, 500);
    }
});

// Delivery schedules (community)
// Note: DeliverySchedules table is not present in CRM DDL; return empty list and 404 for update to align with current schema.
app.get("/delivery-schedules", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["read:schedules"])) return c.json({error: "Forbidden"}, 403);

    // No backing table in current DDL
    return c.json([]);
});

app.patch("/delivery-schedules/:id", async (c) => {
    const unauth = await verifyAccessToken(c);
    if (unauth) return unauth;
    if (!requirePermissions(c, ["update:schedules"])) return c.json({error: "Forbidden"}, 403);

    // No backing table in current DDL
    return c.json({error: "Not Found"}, 404);
});

// noinspection JSUnusedGlobalSymbols
export default app;
