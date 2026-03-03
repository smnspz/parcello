/**
 * Poste Italiane (Italy Post) native tracking provider
 * @module providers/native
 */

import { NativeProviderBase } from './NativeProviderBase';
import type { TrackingResult, TrackingStatus } from '../../types';

/**
 * Response format from Poste Italiane API
 * TODO: Update with actual API response structure after research
 */
interface PosteItalianaApiResponse {
    // Placeholder structure - needs API research
    trackingNumber: string;
    status: string;
    events: Array<{
        date: string;
        description: string;
        location: string;
    }>;
}

/**
 * Poste Italiane native provider
 * Tracks packages through Italy Post's official API
 */
export class PosteItalianeProvider extends NativeProviderBase {
    readonly name = 'Poste Italiane';
    readonly carrierCode = 'poste-italiane';

    // TODO: Research actual Poste Italiane API endpoint
    // Possible endpoints to investigate:
    // - https://api.poste.it/
    // - Official tracking page scraping as fallback
    protected readonly apiBaseUrl = 'https://api.poste.it';

    /**
     * Fetches tracking data from Poste Italiane
     * @param trackingNumber - Tracking number to query
     * @returns Promise resolving to normalized tracking result
     */
    async fetch(trackingNumber: string): Promise<TrackingResult> {
        const normalized = this.normalizeTrackingNumber(trackingNumber);

        if (!this.validateTrackingNumber(normalized)) {
            throw new Error('Invalid tracking number format');
        }

        // TODO: Implement actual API call after research
        // For now, throwing error to indicate not implemented
        throw new Error(
            'Poste Italiane API integration pending - requires API research',
        );

        // Placeholder for future implementation:
        /*
        const response = await this.makeRequest<PosteItalianaApiResponse>(
            `/track/${normalized}`
        );

        return this.normalizeResponse(response, normalized);
        */
    }

    /**
     * Normalizes Poste Italiane API response to standard TrackingResult format
     * @param response - Raw API response
     * @param trackingNumber - Original tracking number
     * @returns Normalized tracking result
     */
    private normalizeResponse(
        response: PosteItalianaApiResponse,
        trackingNumber: string,
    ): TrackingResult {
        return {
            trackingNumber,
            carrier: this.carrierCode,
            status: this.normalizeStatus(response.status),
            events: response.events.map((event) => ({
                timestamp: event.date,
                location: event.location,
                status: event.description,
                description: event.description,
            })),
            providerUsed: this.type,
        };
    }

    /**
     * Maps Poste Italiane status to standard TrackingStatus
     * @param status - Poste Italiane status string
     * @returns Normalized tracking status
     */
    private normalizeStatus(status: string): TrackingStatus {
        const statusLower = status.toLowerCase();

        if (statusLower.includes('consegnat')) return 'delivered';
        if (statusLower.includes('transito')) return 'in_transit';
        if (statusLower.includes('spedito')) return 'in_transit';
        if (statusLower.includes('eccez')) return 'exception';

        return 'pending';
    }
}
