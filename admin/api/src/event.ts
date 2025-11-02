// noinspection SqlResolve

import {Context, Hono} from 'hono';
import type { Env } from './index';
import {bearerAuth} from 'hono/bearer-auth';

// Skeleton Events app
// This Hono app is mounted at POST /api/events by the main app.
const eventsApp = new Hono<Env>();

/**
 * Represents a user event from Auth0
 */
interface User {
    user_id: string;
    email?: string;
    email_verified?: boolean;
    username?: string;
    blocked?: boolean;
    family_name?: string;
    given_name?: string;
    name?: string;
    nickname?: string;
    phone_number?: string;
    phone_verified?: boolean;
    user_metadata?: {
        [key: string]: any;
    };
    app_metadata?: {
        [key: string]: any;
    };
    identities: Array<{
        connection: string;
        user_id: string;
        provider: string;
        isSocial: boolean;
    }>;
    created_at?: string;
    updated_at?: string;
    picture?: string;
}

/**
 * Represents an organization event from Auth0
 */
interface Organization {
    id: string;
    name: string;
    display_name?: string;
    branding?: {
        logo_url?: string;
        colors?: {
            primary?: string;
            page_background?: string;
        };
    };
    metadata?: {
        [key: string]: any;
    };
    created_at?: string;
    updated_at?: string;
}

/*
eventsApp.use('/!*', async (c, next) => {
    const auth = bearerAuth({
        token: c.env.EVENTS_API_TOKEN,
    });
    return auth(c, next);
});
*/

// Handle POST requests to the /events endpoint
eventsApp.post('/', async (c) => {
    console.log('Received Auth0 webhook event:', JSON.stringify(c.req.json(), null, 2));
    try {
        // Parse the JSON body from the request
        const eventData = await c.req.json();

        // Log the received webhook data
        console.log('Received Auth0 webhook event:', JSON.stringify(eventData, null, 2));

        const {type, time, data} = eventData;
        const user = data.object;

        try {
            switch (type) {
                case 'user.created':
                case 'user.updated':
                    await handleUserUpsert(user, time, c, type === 'user.created');
                    break;
                case 'user.deleted':
                    await handleUserDeleted(user, c);
                    break;
                case 'organization.created':
                case 'organization.updated':
                    await handleOrganizationUpsert(user, time, c, type === 'organization.created');
                    break;
                case 'organization.deleted':
                    await handleOrganizationDeleted(user, c);
                    break;
                default:
                    console.log(`Event type '${type}' not implemented yet.`);
            }

            console.log(`Webhook event of type '${type}' committed to the database.`);
            return new Response(null, {status: 204}); // No content response
        } catch (err) {
            console.error('Error processing webhook:', err);
            return c.json({error: 'Internal server error'}, 500);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        return c.json({error: 'Invalid JSON payload'}, 400);
    }
});

// Handle all other routes with a 404
eventsApp.notFound((c: {text: (arg0: string, arg1: number) => any}) => c.text('Not Found', 404));

async function handleUserDeleted(user: User, c: Context) {
    const {user_id} = user;

    try {
        // Delete the user by Auth0 user id
        await c.env.DB.prepare(`DELETE FROM Users WHERE auth0_user_id = ?`)
            .bind(user_id)
            .run();
    } catch (err: any) {
        console.error(`Database error while deleting user_id=${user_id}:`, err);
        throw err;
    }
}

async function handleUserUpsert(user: User, time: string, c: Context, isNewUser: boolean) {
    const {
        user_id,
        email,
        email_verified,
        blocked,
        family_name,
        given_name,
        name,
        nickname,
        phone_number,
        phone_verified,
        picture,
        user_metadata,
        app_metadata,
        identities,
    } = user;

    // Convert complex objects/arrays to JSON strings for storage
    const userMetadataJson = user_metadata ? JSON.stringify(user_metadata) : null;
    const appMetadataJson = app_metadata ? JSON.stringify(app_metadata) : null;
    const identitiesJson = identities ? JSON.stringify(identities) : null;

    // Derive org membership from app_metadata if present (optional)
    const auth0OrgId = app_metadata && (app_metadata as any).org_id ? String((app_metadata as any).org_id) : null;

    // SQLite (D1) uses INTEGER 0/1 for boolean columns
    const toInt = (b: boolean | undefined) => (b ? 1 : 0);

    try {
        await c.env.DB.prepare(
            `INSERT INTO users(
                auth0_user_id,
                auth0_org_id,
                email,
                email_verified,
                name,
                picture,
                blocked,
                family_name,
                given_name,
                nickname,
                phone_number,
                phone_verified,
                user_metadata,
                app_metadata,
                identities,
                last_event_processed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(auth0_user_id) DO UPDATE SET
                auth0_org_id = excluded.auth0_org_id,
                email = excluded.email,
                email_verified = excluded.email_verified,
                name = excluded.name,
                picture = excluded.picture,
                blocked = excluded.blocked,
                family_name = excluded.family_name,
                given_name = excluded.given_name,
                nickname = excluded.nickname,
                phone_number = excluded.phone_number,
                phone_verified = excluded.phone_verified,
                user_metadata = excluded.user_metadata,
                app_metadata = excluded.app_metadata,
                identities = excluded.identities,
                last_event_processed = excluded.last_event_processed`)
            .bind(
                user_id,
                auth0OrgId,
                email || null,
                toInt(email_verified),
                name || null,
                picture || null,
                toInt(blocked),
                family_name || null,
                given_name || null,
                nickname || null,
                phone_number || null,
                toInt(phone_verified),
                userMetadataJson,
                appMetadataJson,
                identitiesJson,
                time
            )
            .run();

        console.log(`User ${user_id} successfully ${isNewUser ? 'inserted' : 'updated'} into Users.`);
    } catch (err: any) {
        console.error(`Database error while upserting user_id=${user_id}:`, err);
        throw err;
    }
}

async function handleOrganizationDeleted(organization: Organization, c: Context) {
    const {id} = organization;

try {
        // Delete the organization by Auth0 org id
        await c.env.DB.prepare(`DELETE FROM Organizations WHERE auth0_org_id = ?`)
            .bind(id)
            .run();
    } catch (err: any) {
        console.error(`Database error while deleting org_id=${id}:`, err);
        throw err;
    }
}


async function handleOrganizationUpsert(organization: Organization, time: string, c: Context, isNewOrg: boolean) {
    const {
        id,
        name,
        display_name,
        branding,
        metadata,
    } = organization;

    // Convert complex objects to JSON strings for storage
    const brandingJson = branding ? JSON.stringify(branding) : null;
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    try {
        await c.env.DB.prepare(
            `INSERT INTO Organizations(
                auth0_org_id,
                name,
                display_name,
                branding,
                metadata,
                org_type,
                last_event_processed
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(auth0_org_id) DO UPDATE SET
                name = excluded.name,
                display_name = excluded.display_name,
                branding = excluded.branding,
                metadata = excluded.metadata,
                last_event_processed = excluded.last_event_processed`)
            .bind(
                id,
                name || null,
                display_name || null,
                brandingJson,
                metadataJson,
                'supplier', // Default org_type for new organizations from Auth0
                time
            )
            .run();

        console.log(`Organization ${id} successfully ${isNewOrg ? 'inserted' : 'updated'} into Organizations.`);
    } catch (err: any) {
        console.error(`Database error while upserting org_id=${id}:`, err);
        throw err;
    }
}

export default eventsApp;