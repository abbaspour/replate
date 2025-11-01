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

eventsApp.use('/*', async (c, next) => {
    const auth = bearerAuth({
        token: c.env.EVENTS_API_TOKEN,
    });
    return auth(c, next);
});

// Handle POST requests to the /events endpoint
eventsApp.post('/', async (c) => {
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
            `REPLACE INTO users(
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
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

export default eventsApp;