/**
 * TrackingMore aggregator provider
 * @module providers/aggregators
 */

import { AggregatorProviderBase } from './AggregatorProviderBase';
import type { TrackingResult, TrackingStatus, ProviderType } from '../../types';

/**
 * TrackingMore API response structure
 * Based on TrackingMore API v4 documentation
 */
interface TrackingMoreApiResponse {
    meta: {
        code: number;
        message: string;
    };
    data: {
        tracking_number: string;
        carrier_code: string;
        status: string;
        origin_info?: {
            trackinfo: Array<{
                Date: string;
                StatusDescription: string;
                Details: string;
                checkpoint_status: string;
            }>;
        };
        destination_info?: {
            trackinfo: Array<{
                Date: string;
                StatusDescription: string;
                Details: string;
                checkpoint_status: string;
            }>;
        };
        latest_event?: {
            description: string;
            time_iso: string;
        };
    };
}

/**
 * TrackingMore provider implementation
 * Supports 1,200+ carriers via TrackingMore API
 */
export class TrackingMoreProvider extends AggregatorProviderBase {
    readonly type: ProviderType = 'trackingmore';
    readonly name = 'TrackingMore';

    protected readonly apiBaseUrl = 'https://api.trackingmore.com/v4';

    /**
     * Gets authentication headers for TrackingMore API
     * @returns Headers with API key
     */
    protected getAuthHeaders(): Record<string, string> {
        return {
            'Tracking-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Fetches tracking data from TrackingMore
     * @param trackingNumber - Tracking number to query
     * @param carrier - Optional carrier code for faster lookup
     * @returns Promise resolving to normalized tracking result
     */
    async fetch(
        trackingNumber: string,
        carrier?: string,
    ): Promise<TrackingResult> {
        const normalized = this.normalizeTrackingNumber(trackingNumber);

        if (!this.validateTrackingNumber(normalized)) {
            throw new Error('Invalid tracking number format');
        }

        // TrackingMore requires carrier code in the request
        let endpoint = `/trackings/${carrier || 'auto'}/${normalized}`;

        // If no carrier provided, use realtime detection endpoint
        if (!carrier) {
            const params = new URLSearchParams({ tracking_number: normalized });
            endpoint = `/trackings/realtime?${params.toString()}`;
        }

        const response =
            await this.makeRequest<TrackingMoreApiResponse>(endpoint);

        if (response.meta.code !== 200) {
            throw new Error(`TrackingMore API error: ${response.meta.message}`);
        }

        return this.normalizeResponse(response.data, normalized);
    }

    /**
     * Normalizes TrackingMore API response to standard format
     * @param data - TrackingMore response data
     * @param trackingNumber - Original tracking number
     * @returns Normalized tracking result
     */
    private normalizeResponse(
        data: TrackingMoreApiResponse['data'],
        trackingNumber: string,
    ): TrackingResult {
        // Combine origin and destination events
        const originEvents = data.origin_info?.trackinfo || [];
        const destEvents = data.destination_info?.trackinfo || [];
        const allEvents = [...originEvents, ...destEvents];

        // Sort by date (newest first)
        allEvents.sort(
            (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime(),
        );

        return {
            trackingNumber,
            carrier: data.carrier_code,
            status: this.normalizeStatus(data.status),
            events: allEvents.map((event) => ({
                timestamp: event.Date,
                location: event.Details || '',
                status: event.StatusDescription,
                description: event.StatusDescription,
            })),
            providerUsed: this.type,
        };
    }

    /**
     * Maps TrackingMore status to standard TrackingStatus
     * @param status - TrackingMore status string
     * @returns Normalized tracking status
     */
    private normalizeStatus(status: string): TrackingStatus {
        const statusLower = status.toLowerCase();

        if (statusLower.includes('delivered')) return 'delivered';
        if (statusLower.includes('transit')) return 'in_transit';
        if (statusLower.includes('pickup')) return 'in_transit';
        if (statusLower.includes('exception')) return 'exception';
        if (statusLower.includes('expired')) return 'exception';

        return 'pending';
    }
}
