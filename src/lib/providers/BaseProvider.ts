/**
 * Abstract base class for all tracking providers
 * @module providers
 */

import type { TrackingResult, ProviderType } from '../types';

/**
 * Abstract base provider class
 * All tracking providers (native and aggregators) extend this class
 */
export abstract class BaseProvider {
    /** Provider type identifier */
    abstract readonly type: ProviderType;

    /** Human-readable provider name */
    abstract readonly name: string;

    /**
     * Fetch tracking data for a tracking number
     * @param trackingNumber - Tracking number to query
     * @param carrier - Optional carrier code for faster lookup
     * @returns Promise resolving to normalized tracking result
     */
    abstract fetch(
        trackingNumber: string,
        carrier?: string,
    ): Promise<TrackingResult>;

    /**
     * Validates a tracking number format
     * @param trackingNumber - Tracking number to validate
     * @returns True if format is valid for this provider
     */
    protected validateTrackingNumber(trackingNumber: string): boolean {
        // Basic validation: non-empty, alphanumeric
        return /^[A-Z0-9-\s]+$/i.test(trackingNumber.trim());
    }

    /**
     * Normalizes tracking number (trim, uppercase, remove separators)
     * @param trackingNumber - Raw tracking number
     * @returns Normalized tracking number
     */
    protected normalizeTrackingNumber(trackingNumber: string): string {
        return trackingNumber.trim().replace(/[-\s]/g, '').toUpperCase();
    }
}
