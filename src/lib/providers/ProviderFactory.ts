/**
 * Provider factory for smart routing of tracking requests
 * @module providers
 */

import type { BaseProvider } from './BaseProvider';
import type { UserConfig } from '../types';
import { detectCarrierFromPattern } from '../utils/carrierDetection';
import { PosteItalianeProvider } from './native/PosteItalianeProvider';
import { TrackingMoreProvider } from './aggregators/TrackingMoreProvider';
import { SeventeenTrackProvider } from './aggregators/SeventeenTrackProvider';

/**
 * Factory for creating and routing to appropriate tracking providers
 * Implements the routing logic: Native → Aggregator → Error
 */
export class ProviderFactory {
    /**
     * Registry of native providers by carrier code
     */
    private nativeProviders: Map<string, BaseProvider> = new Map([
        ['poste-italiane', new PosteItalianeProvider()],
        // TODO: Add other native providers as they're implemented
        // ['inpost', new InPostProvider()],
        // ['brt-fermopoint', new BRTProvider()],
        // ['gls', new GLSProvider()],
        // ['dhl-express', new DHLProvider()],
    ]);

    /**
     * Gets the appropriate provider for a tracking request
     * Routing logic:
     * 1. Detect carrier if not specified
     * 2. Try native provider if carrier is natively supported
     * 3. Fall back to user's configured aggregator
     * 4. Error if no provider available
     *
     * @param trackingNumber - Tracking number to query
     * @param carrier - Optional carrier code (manual override)
     * @param userConfig - Optional user configuration (for aggregators)
     * @returns Promise resolving to appropriate provider instance
     */
    async getProvider(
        trackingNumber: string,
        carrier?: string,
        userConfig?: UserConfig,
    ): Promise<BaseProvider> {
        // Step 1: Determine carrier
        let detectedCarrier = carrier;

        if (!detectedCarrier) {
            const detection = detectCarrierFromPattern(trackingNumber);
            detectedCarrier = detection.carrier;
        }

        // Step 2: Try native provider first
        if (detectedCarrier && this.isNativelySupported(detectedCarrier)) {
            const provider = this.nativeProviders.get(detectedCarrier);
            if (provider) {
                return provider;
            }
        }

        // Step 3: Fall back to configured aggregator
        if (userConfig?.provider && userConfig?.apiKey) {
            return this.createAggregatorProvider(
                userConfig.provider,
                userConfig.apiKey,
            );
        }

        // Step 4: No provider available
        throw new Error(
            detectedCarrier
                ? `Carrier "${detectedCarrier}" is not natively supported. Please configure an API key for an external aggregator.`
                : 'Unable to detect carrier. Please specify the carrier manually or configure an API key.',
        );
    }

    /**
     * Checks if a carrier is natively supported
     * @param carrierCode - Carrier code to check
     * @returns True if carrier has a native provider
     */
    isNativelySupported(carrierCode: string): boolean {
        return this.nativeProviders.has(carrierCode);
    }

    /**
     * Gets list of all natively supported carrier codes
     * @returns Array of carrier codes
     */
    getNativeSupportedCarriers(): string[] {
        return Array.from(this.nativeProviders.keys());
    }

    /**
     * Creates an aggregator provider instance
     * @param provider - Provider ID ('trackingmore' or '17track')
     * @param apiKey - API key for authentication
     * @returns Provider instance
     */
    private createAggregatorProvider(
        provider: string,
        apiKey: string,
    ): BaseProvider {
        switch (provider.toLowerCase()) {
            case 'trackingmore':
                return new TrackingMoreProvider(apiKey);

            case '17track':
                return new SeventeenTrackProvider(apiKey);

            default:
                throw new Error(
                    `Unknown aggregator provider: ${provider}. Supported: trackingmore, 17track`,
                );
        }
    }

    /**
     * Registers a new native provider
     * Useful for dynamically adding carriers or testing
     * @param carrierCode - Carrier code
     * @param provider - Provider instance
     */
    registerNativeProvider(carrierCode: string, provider: BaseProvider): void {
        this.nativeProviders.set(carrierCode, provider);
    }
}

/**
 * Creates a new ProviderFactory instance
 * @returns ProviderFactory instance
 */
export function createProviderFactory(): ProviderFactory {
    return new ProviderFactory();
}
