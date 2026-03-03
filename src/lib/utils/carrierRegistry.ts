/**
 * Carrier registry utilities
 * Queries carrier metadata from database
 * @module carrierRegistry
 */

import type { CarrierMetadata } from '../types';

/**
 * Interface for database connection (D1 or compatible)
 * Allows for testing with mock implementations
 */
export interface DatabaseConnection {
    prepare(query: string): {
        bind(...values: unknown[]): {
            first<T>(): Promise<T | null>;
            all<T>(): Promise<{ results: T[] }>;
        };
    };
}

/**
 * Fetches carrier metadata by carrier code
 * @param db - Database connection (D1 binding)
 * @param carrierCode - Carrier code to query (e.g., "poste-italiane")
 * @returns Carrier metadata or null if not found
 * @example
 * ```typescript
 * const carrier = await getCarrierMetadata(env.DB, 'poste-italiane');
 * if (carrier?.isNative) {
 *   // Use native provider
 * }
 * ```
 */
export async function getCarrierMetadata(
    db: DatabaseConnection,
    carrierCode: string,
): Promise<CarrierMetadata | null> {
    const result = await db
        .prepare(
            'SELECT carrier_code, carrier_name, is_native, tracking_pattern FROM carrier_metadata WHERE carrier_code = ?',
        )
        .bind(carrierCode)
        .first<{
            carrier_code: string;
            carrier_name: string;
            is_native: number;
            tracking_pattern: string | null;
        }>();

    if (!result) {
        return null;
    }

    return {
        carrierCode: result.carrier_code,
        carrierName: result.carrier_name,
        isNative: Boolean(result.is_native),
        trackingPattern: result.tracking_pattern ?? undefined,
    };
}

/**
 * Fetches all natively supported carriers
 * @param db - Database connection (D1 binding)
 * @returns Array of native carrier metadata
 * @example
 * ```typescript
 * const nativeCarriers = await getNativeCarriers(env.DB);
 * // Display in settings UI
 * ```
 */
export async function getNativeCarriers(
    db: DatabaseConnection,
): Promise<CarrierMetadata[]> {
    const result = await db
        .prepare(
            'SELECT carrier_code, carrier_name, is_native, tracking_pattern FROM carrier_metadata WHERE is_native = 1 ORDER BY carrier_name',
        )
        .bind()
        .all<{
            carrier_code: string;
            carrier_name: string;
            is_native: number;
            tracking_pattern: string | null;
        }>();

    return result.results.map((row) => ({
        carrierCode: row.carrier_code,
        carrierName: row.carrier_name,
        isNative: Boolean(row.is_native),
        trackingPattern: row.tracking_pattern ?? undefined,
    }));
}

/**
 * Checks if a carrier is natively supported
 * @param db - Database connection (D1 binding)
 * @param carrierCode - Carrier code to check
 * @returns True if carrier is natively supported (no API key needed)
 */
export async function isNativelySupported(
    db: DatabaseConnection,
    carrierCode: string,
): Promise<boolean> {
    const carrier = await getCarrierMetadata(db, carrierCode);
    return carrier?.isNative ?? false;
}

/**
 * Fetches all carriers (both native and non-native)
 * @param db - Database connection (D1 binding)
 * @returns Array of all carrier metadata
 */
export async function getAllCarriers(
    db: DatabaseConnection,
): Promise<CarrierMetadata[]> {
    const result = await db
        .prepare(
            'SELECT carrier_code, carrier_name, is_native, tracking_pattern FROM carrier_metadata ORDER BY is_native DESC, carrier_name',
        )
        .bind()
        .all<{
            carrier_code: string;
            carrier_name: string;
            is_native: number;
            tracking_pattern: string | null;
        }>();

    return result.results.map((row) => ({
        carrierCode: row.carrier_code,
        carrierName: row.carrier_name,
        isNative: Boolean(row.is_native),
        trackingPattern: row.tracking_pattern ?? undefined,
    }));
}
