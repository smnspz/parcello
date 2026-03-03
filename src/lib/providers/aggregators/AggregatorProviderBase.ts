/**
 * Base class for tracking aggregator providers
 * Aggregators (TrackingMore, 17TRACK) require API keys
 * @module providers/aggregators
 */

/// <reference lib="dom" />

import { BaseProvider } from '../BaseProvider';

/**
 * Abstract base class for aggregator providers
 * Extends BaseProvider with API key handling
 */
export abstract class AggregatorProviderBase extends BaseProvider {
    /** API key for authentication */
    protected readonly apiKey: string;

    /**
     * Base URL for the aggregator's API
     */
    protected abstract readonly apiBaseUrl: string;

    /**
     * Creates an aggregator provider instance
     * @param apiKey - API key for authentication
     */
    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    /**
     * Makes an authenticated HTTP request to the aggregator's API
     * @param endpoint - API endpoint path
     * @param options - Fetch options
     * @returns Promise resolving to response data
     */
    protected async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const url = `${this.apiBaseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                'User-Agent': 'Parcello/1.0',
                Accept: 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }

    /**
     * Gets authentication headers for API requests
     * Each aggregator may use different auth methods (header, query param, etc.)
     * @returns Headers object with authentication
     */
    protected abstract getAuthHeaders(): Record<string, string>;
}
