// Single shipment API endpoint
// DELETE: Remove a shipment

import type { EventContext } from '@cloudflare/workers-types';

interface Env {
    DB: D1Database;
}

// DELETE shipment
export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const token = context.request.headers.get('X-User-Token');
    const shipmentId = context.params.id as string;

    if (!token) {
        return new Response(
            JSON.stringify({ error: 'Missing X-User-Token header' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    if (!shipmentId) {
        return new Response(JSON.stringify({ error: 'Missing shipment ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Verify ownership before deleting
        const shipment = await context.env.DB.prepare(
            'SELECT id FROM shipments WHERE id = ? AND token = ?',
        )
            .bind(shipmentId, token)
            .first();

        if (!shipment) {
            return new Response(
                JSON.stringify({ error: 'Shipment not found or unauthorized' }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        await context.env.DB.prepare(
            'DELETE FROM shipments WHERE id = ? AND token = ?',
        )
            .bind(shipmentId, token)
            .run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting shipment:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
};
