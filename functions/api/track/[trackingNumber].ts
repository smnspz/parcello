/**
 * Tracking proxy API endpoint
 * Fetches tracking data from provider after decrypting user's API key
 * @module api/track
 */

import type { EventContext } from '@cloudflare/workers-types';

/**
 * Cloudflare Workers environment bindings
 */
interface Env {
    /** D1 database binding */
    DB: D1Database;
    /** Encryption salt for PBKDF2 key derivation */
    ENCRYPTION_SALT: string;
}

/**
 * Decrypts an AES-GCM encrypted API key using PBKDF2 key derivation
 *
 * Security model:
 * - Derives encryption key from user's UUID using PBKDF2 (100,000 iterations)
 * - Uses configurable salt from environment (public, not secret)
 * - User's UUID is the actual secret - without it, encrypted keys are useless
 * - Even database compromise doesn't reveal API keys without user UUIDs
 *
 * @param encryptedKey - Base64-encoded encrypted API key (IV + ciphertext)
 * @param userToken - User's UUID token (secret, used for key derivation)
 * @param salt - Application salt (public, from ENCRYPTION_SALT env var)
 * @returns Decrypted API key in plaintext
 * @throws Error if decryption fails
 */
async function decryptApiKey(
    encryptedKey: string,
    userToken: string,
    salt: string,
): Promise<string> {
    // Derive encryption key from user token using PBKDF2
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userToken),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey'],
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt'],
    );

    // Decrypt the API key
    const encryptedData = Uint8Array.from(atob(encryptedKey), (c) =>
        c.charCodeAt(0),
    );

    // Extract IV (first 12 bytes) and ciphertext
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        ciphertext,
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * GET endpoint to retrieve tracking data for a package
 *
 * Process:
 * 1. Authenticates user via X-User-Token header
 * 2. Retrieves encrypted API key from database
 * 3. Decrypts API key using user's token and application salt
 * 4. Proxies request to tracking provider (TODO: not yet implemented)
 *
 * @param context - Cloudflare Pages Function context with trackingNumber param
 * @returns JSON response with tracking data or error
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const token = context.request.headers.get('X-User-Token');
    const trackingNumber = context.params.trackingNumber as string;

    if (!token) {
        return new Response(
            JSON.stringify({ error: 'Missing X-User-Token header' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    if (!trackingNumber) {
        return new Response(
            JSON.stringify({ error: 'Missing tracking number' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    try {
        // Get user config (provider + encrypted API key)
        const config = await context.env.DB.prepare(
            'SELECT provider, api_key FROM user_config WHERE token = ?',
        )
            .bind(token)
            .first<{ provider: string; api_key: string }>();

        if (!config) {
            return new Response(
                JSON.stringify({
                    error: 'User config not found. Please configure your API key in settings.',
                }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        // Decrypt API key
        let apiKey: string;
        try {
            apiKey = await decryptApiKey(
                config.api_key,
                token,
                context.env.ENCRYPTION_SALT,
            );
        } catch (error) {
            console.error('Error decrypting API key:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to decrypt API key' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        // Proxy request to tracking provider
        // TODO: Implement provider-specific logic (TrackingMore, 17TRACK)
        // For now, return a placeholder response

        return new Response(
            JSON.stringify({
                trackingNumber,
                provider: config.provider,
                message:
                    'Tracking proxy not yet implemented. API key decrypted successfully.',
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }
};
