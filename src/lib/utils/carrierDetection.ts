/**
 * Carrier detection utilities
 * Identifies carriers from tracking number patterns
 * @module carrierDetection
 */

import type { CarrierDetectionResult } from '../types';

/**
 * Carrier pattern definitions
 * Each carrier has one or more regex patterns for tracking number detection
 */
interface CarrierPattern {
    carrier: string;
    patterns: RegExp[];
    isNative: boolean;
}

/**
 * Tracking number patterns for supported carriers
 * Patterns are tried in order - most specific first
 * NOTE: Generic numeric patterns (10-12 digits) are inherently ambiguous
 * and may require user confirmation or manual carrier selection
 */
const CARRIER_PATTERNS: CarrierPattern[] = [
    // DHL Express (International) - Most specific patterns first
    // Format: Waybill formats are highly specific
    // Examples: JJD012345678901234
    {
        carrier: 'dhl-express',
        patterns: [
            /^[A-Z]{3}\d{15}$/i, // 3 letters + 15 digits (waybill) - very specific
        ],
        isNative: true,
    },

    // Poste Italiane (Italy Post) - International format is specific
    // Format: 2 letters + 9 digits + IT suffix
    // Examples: RM12345678901IT, RN12345678901IT, CP12345678901IT
    {
        carrier: 'poste-italiane',
        patterns: [
            /^[A-Z]{2}\d{9}IT$/i, // Standard international format (13 chars) - specific
        ],
        isNative: true,
    },

    // InPost (Poland/Europe parcel lockers) - Prefix patterns are specific
    // Format: Specific numeric prefixes
    // Examples: 630123456789012345, 5900123456789012
    {
        carrier: 'inpost',
        patterns: [
            /^63\d{16}$/, // 18 digits starting with 63 - specific
            /^59\d{14}$/, // 16 digits starting with 59 - specific
        ],
        isNative: true,
    },

    // BRT FermoPoint (Italy) - Prefix format is specific
    // Format: BRT prefix
    // Examples: BRT1234567890
    {
        carrier: 'brt-fermopoint',
        patterns: [
            /^BRT\d{10}$/i, // BRT prefix + 10 digits - specific
        ],
        isNative: true,
    },

    // GLS (General Logistics Systems - Europe) - Prefix format is specific
    // Format: GLS prefix
    // Examples: GLS-1234567890, GLS 12345678901
    {
        carrier: 'gls',
        patterns: [
            /^GLS[-\s]?\d{10,11}$/i, // GLS prefix + digits - specific
        ],
        isNative: true,
    },
];

/**
 * Detects carrier from tracking number using pattern matching
 * @param trackingNumber - Tracking number to analyze
 * @returns Detection result with carrier, confidence, and method
 * @example
 * ```typescript
 * const result = detectCarrierFromPattern('RM12345678901IT');
 * // { carrier: 'poste-italiane', confidence: 'high', method: 'pattern' }
 * ```
 */
export function detectCarrierFromPattern(
    trackingNumber: string,
): CarrierDetectionResult {
    // Normalize input: trim whitespace, remove common separators
    const normalized = trackingNumber.trim().replace(/[-\s]/g, '');

    if (!normalized) {
        return {
            carrier: undefined,
            confidence: 'none',
            method: 'unknown',
        };
    }

    // Try to match against known patterns
    for (const { carrier, patterns } of CARRIER_PATTERNS) {
        for (const pattern of patterns) {
            if (pattern.test(normalized)) {
                return {
                    carrier,
                    confidence: 'high',
                    method: 'pattern',
                };
            }
        }
    }

    // No pattern matched
    return {
        carrier: undefined,
        confidence: 'none',
        method: 'unknown',
    };
}

/**
 * Creates a detection result for user-specified carrier
 * Used when user manually selects carrier instead of auto-detection
 * @param carrier - Carrier code specified by user
 * @returns Detection result with user_specified method
 */
export function createUserSpecifiedResult(
    carrier: string,
): CarrierDetectionResult {
    return {
        carrier,
        confidence: 'high',
        method: 'user_specified',
    };
}

/**
 * Gets list of all natively supported carrier codes
 * @returns Array of carrier codes that don't require API keys
 */
export function getNativeSupportedCarriers(): string[] {
    return CARRIER_PATTERNS.filter((p) => p.isNative).map((p) => p.carrier);
}
