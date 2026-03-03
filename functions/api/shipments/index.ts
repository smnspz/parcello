// Shipments list API endpoint
// GET: List all shipments for user
// POST: Add new shipment

import type { EventContext } from '@cloudflare/workers-types';

interface Env {
    DB: D1Database;
}

// GET all shipments for user
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
        const { results } = await context.env.DB.prepare(
            'SELECT id, tracking_num, carrier, label, created_at FROM shipments WHERE token = ? ORDER BY created_at DESC',
        )
            .bind(token)
            .all();

        return new Response(JSON.stringify(results || []), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
};

// POST create new shipment
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
            id: string;
            tracking_num: string;
            carrier?: string;
            label?: string;
        }>();

        if (!body.id || !body.tracking_num) {
            return new Response(
                JSON.stringify({ error: 'Missing id or tracking_num' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const now = Math.floor(Date.now() / 1000);

        await context.env.DB.prepare(
            'INSERT INTO shipments (id, token, tracking_num, carrier, label, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
            .bind(
                body.id,
                token,
                body.tracking_num,
                body.carrier || null,
                body.label || null,
                now,
            )
            .run();

        return new Response(
            JSON.stringify({
                id: body.id,
                tracking_num: body.tracking_num,
                carrier: body.carrier,
                label: body.label,
                created_at: now,
            }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    } catch (error) {
        console.error('Error creating shipment:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
};
