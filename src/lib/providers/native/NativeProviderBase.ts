/**
 * Base class for native tracking providers
 * Native providers have direct API access and don't require API keys
 * @module providers/native
 */

/// <reference lib="dom" />

import { BaseProvider } from '../BaseProvider';
import type { ProviderType } from '../../types';

/**
 * Abstract base class for native providers
 * Extends BaseProvider with native-specific functionality
 */
export abstract class NativeProviderBase extends BaseProvider {
    readonly type: ProviderType = 'native';

    /**
     * Carrier code this native provider handles
     * e.g., "poste-italiane", "inpost", etc.
     */
    abstract readonly carrierCode: string;

    /**
     * Base URL for the carrier's tracking API
     */
    protected abstract readonly apiBaseUrl: string;

    /**
     * Makes an HTTP request to the carrier's API
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
}
