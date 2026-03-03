/**
 * User configuration API endpoint
 * Manages user settings including tracking provider selection and encrypted API keys
 * @module api/config
 */

import type { EventContext } from '@cloudflare/workers-types';

/**
 * Cloudflare Workers environment bindings
 */
interface Env {
    /** D1 database binding */
    DB: D1Database;
}

/**
 * GET endpoint to retrieve user configuration
 * Requires X-User-Token header for authentication
 * @param context - Cloudflare Pages Function context
 * @returns JSON response with user config (provider, encrypted API key) or error
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const token = context.request.headers.get('X-User-Token');

    if (!token) {
        return new Response(
            JSON.stringify({ error: 'Missing X-User-Token header' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    try {
        const config = await context.env.DB.prepare(
            'SELECT provider, api_key, created_at FROM user_config WHERE token = ?',
        )
            .bind(token)
            .first();

        if (!config) {
            return new Response(JSON.stringify({ error: 'Config not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(config), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching config:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
};

/**
 * POST endpoint to create or update user configuration
 * Requires X-User-Token header for authentication
 * Request body must include provider and encrypted API key
 * @param context - Cloudflare Pages Function context
 * @returns JSON response with success status or error
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const token = context.request.headers.get('X-User-Token');

    if (!token) {
        return new Response(
            JSON.stringify({ error: 'Missing X-User-Token header' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    try {
        const body = await context.request.json<{
            provider: string;
            api_key: string; // AES-GCM encrypted
        }>();

        if (!body.provider || !body.api_key) {
            return new Response(
                JSON.stringify({ error: 'Missing provider or api_key' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const now = Math.floor(Date.now() / 1000);

        // Upsert config
        await context.env.DB.prepare(
            `INSERT INTO user_config (token, provider, api_key, created_at, last_seen)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(token) DO UPDATE SET
         provider = excluded.provider,
         api_key = excluded.api_key,
         last_seen = excluded.last_seen`,
        )
            .bind(token, body.provider, body.api_key, now, now)
            .run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error saving config:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
};
