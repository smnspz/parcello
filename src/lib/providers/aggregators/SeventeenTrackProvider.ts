/**
 * 17TRACK aggregator provider
 * @module providers/aggregators
 */

import { AggregatorProviderBase } from './AggregatorProviderBase';
import type { TrackingResult, TrackingStatus, ProviderType } from '../../types';

/**
 * 17TRACK API response structure
 * Based on 17TRACK API documentation
 */
interface SeventeenTrackApiResponse {
    code: number;
    msg: string;
    data: {
        accepted: Array<{
            number: string;
            track: {
                provider_name: string;
                status: number;
                events: Array<{
                    time_iso: string;
                    description: string;
                    location: string;
                    stage: string;
                }>;
            };
        }>;
    };
}

/**
 * 17TRACK provider implementation
 * Supports 2,000+ carriers via 17TRACK API
 */
export class SeventeenTrackProvider extends AggregatorProviderBase {
    readonly type: ProviderType = '17track';
    readonly name = '17TRACK';

    protected readonly apiBaseUrl = 'https://api.17track.net/track/v2.2';

    /**
     * Gets authentication headers for 17TRACK API
     * @returns Headers with API key
     */
    protected getAuthHeaders(): Record<string, string> {
        return {
            '17token': this.apiKey,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Fetches tracking data from 17TRACK
     * @param trackingNumber - Tracking number to query
     * @param carrier - Optional carrier code (17TRACK auto-detects if not provided)
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

        // 17TRACK uses POST request with tracking numbers in body
        const response = await this.makeRequest<SeventeenTrackApiResponse>(
            '/register',
            {
                method: 'POST',
                body: JSON.stringify([
                    {
                        number: normalized,
                        carrier: carrier ? this.mapCarrierCode(carrier) : 0, // 0 = auto-detect
                    },
                ]),
            },
        );

        if (response.code !== 0) {
            throw new Error(`17TRACK API error: ${response.msg}`);
        }

        if (!response.data.accepted || response.data.accepted.length === 0) {
            throw new Error('Tracking number not found');
        }

        const trackData = response.data.accepted[0];
        return this.normalizeResponse(trackData, normalized);
    }

    /**
     * Normalizes 17TRACK API response to standard format
     * @param data - 17TRACK response data
     * @param trackingNumber - Original tracking number
     * @returns Normalized tracking result
     */
    private normalizeResponse(
        data: SeventeenTrackApiResponse['data']['accepted'][0],
        trackingNumber: string,
    ): TrackingResult {
        return {
            trackingNumber,
            carrier: data.track.provider_name
                .toLowerCase()
                .replace(/\s+/g, '-'),
            status: this.normalizeStatus(data.track.status),
            events: data.track.events.map((event) => ({
                timestamp: event.time_iso,
                location: event.location || '',
                status: event.stage,
                description: event.description,
            })),
            providerUsed: this.type,
        };
    }

    /**
     * Maps TrackingStatus to 17TRACK status codes
     * @param status - 17TRACK status code
     * @returns Normalized tracking status
     */
    private normalizeStatus(status: number): TrackingStatus {
        // 17TRACK status codes:
        // 0 = Not Found
        // 1 = In Transit
        // 2 = Expired
        // 3 = Pickup
        // 4 = Undelivered
        // 5 = Delivered
        // 6 = Exception

        switch (status) {
            case 5:
                return 'delivered';
            case 1:
            case 3:
                return 'in_transit';
            case 2:
            case 4:
            case 6:
                return 'exception';
            default:
                return 'pending';
        }
    }

    /**
     * Maps our internal carrier codes to 17TRACK carrier codes
     * @param _carrier - Internal carrier code (unused, returns auto-detect)
     * @returns 17TRACK carrier code (0 for auto-detect)
     */
    private mapCarrierCode(_carrier: string): number {
        // TODO: Build comprehensive carrier code mapping
        // For now, return 0 (auto-detect) for all carriers
        return 0;
    }
}
