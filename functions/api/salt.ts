/**
 * Salt endpoint for AES-GCM encryption
 * Returns the encryption salt needed by clients to encrypt API keys
 * @module api/salt
 */

/**
 * Cloudflare Workers environment bindings
 */
interface Env {
    /** Encryption salt for key derivation */
    ENCRYPTION_SALT: string;
}

/**
 * GET endpoint to retrieve encryption salt
 * The salt is public and used by clients for PBKDF2 key derivation
 * @param context - Cloudflare Pages Function context
 * @returns JSON response with salt or error
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!context.env.ENCRYPTION_SALT) {
        return new Response(
            JSON.stringify({ error: 'ENCRYPTION_SALT not configured' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    return new Response(JSON.stringify({ salt: context.env.ENCRYPTION_SALT }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
