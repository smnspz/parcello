/**
 * Integration tests for ProviderFactory
 */

import { describe, it, expect } from 'vitest';
import { ProviderFactory, createProviderFactory } from './ProviderFactory';
import { PosteItalianeProvider } from './native/PosteItalianeProvider';
import { TrackingMoreProvider } from './aggregators/TrackingMoreProvider';
import { SeventeenTrackProvider } from './aggregators/SeventeenTrackProvider';

describe('ProviderFactory', () => {
    describe('createProviderFactory', () => {
        it('should create a new factory instance', () => {
            const factory = createProviderFactory();
            expect(factory).toBeInstanceOf(ProviderFactory);
        });
    });

    describe('isNativelySupported', () => {
        it('should return true for Poste Italiane', () => {
            const factory = createProviderFactory();
            expect(factory.isNativelySupported('poste-italiane')).toBe(true);
        });

        it('should return false for unsupported carriers', () => {
            const factory = createProviderFactory();
            expect(factory.isNativelySupported('ups')).toBe(false);
            expect(factory.isNativelySupported('fedex')).toBe(false);
        });
    });

    describe('getNativeSupportedCarriers', () => {
        it('should return array of native carriers', () => {
            const factory = createProviderFactory();
            const carriers = factory.getNativeSupportedCarriers();
            expect(carriers).toContain('poste-italiane');
            expect(carriers.length).toBeGreaterThan(0);
        });
    });

    describe('getProvider - Native routing', () => {
        it('should return Poste Italiane provider for Italian tracking number', async () => {
            const factory = createProviderFactory();
            const provider = await factory.getProvider('RM123456789IT');

            expect(provider).toBeInstanceOf(PosteItalianeProvider);
        });

        it('should return native provider when carrier is manually specified', async () => {
            const factory = createProviderFactory();
            const provider = await factory.getProvider(
                'ABC123',
                'poste-italiane',
            );

            expect(provider).toBeInstanceOf(PosteItalianeProvider);
        });
    });

    describe('getProvider - Aggregator fallback', () => {
        it('should return TrackingMore provider when configured', async () => {
            const factory = createProviderFactory();
            const config = {
                provider: 'trackingmore',
                apiKey: 'test-key',
                createdAt: Date.now(),
            };

            const provider = await factory.getProvider(
                'UNKNOWN123',
                undefined,
                config,
            );

            expect(provider).toBeInstanceOf(TrackingMoreProvider);
        });

        it('should return 17TRACK provider when configured', async () => {
            const factory = createProviderFactory();
            const config = {
                provider: '17track',
                apiKey: 'test-key',
                createdAt: Date.now(),
            };

            const provider = await factory.getProvider(
                'UNKNOWN123',
                undefined,
                config,
            );

            expect(provider).toBeInstanceOf(SeventeenTrackProvider);
        });

        it('should fall back to aggregator for non-native carriers', async () => {
            const factory = createProviderFactory();
            const config = {
                provider: 'trackingmore',
                apiKey: 'test-key',
                createdAt: Date.now(),
            };

            // UPS is not natively supported, should use aggregator
            const provider = await factory.getProvider(
                '1Z999AA10123456784',
                'ups',
                config,
            );

            expect(provider).toBeInstanceOf(TrackingMoreProvider);
        });
    });

    describe('getProvider - Error cases', () => {
        it('should throw error for unsupported carrier without config', async () => {
            const factory = createProviderFactory();

            await expect(
                factory.getProvider('UNKNOWN123', 'ups'),
            ).rejects.toThrow(/not natively supported/);
        });

        it('should throw error for unknown tracking number without config', async () => {
            const factory = createProviderFactory();

            await expect(factory.getProvider('UNKNOWN123')).rejects.toThrow(
                /Unable to detect carrier/,
            );
        });

        it('should throw error for invalid aggregator provider', async () => {
            const factory = createProviderFactory();
            const config = {
                provider: 'invalid-provider',
                apiKey: 'test-key',
                createdAt: Date.now(),
            };

            await expect(
                factory.getProvider('UNKNOWN123', undefined, config),
            ).rejects.toThrow(/Unknown aggregator provider/);
        });
    });

    describe('registerNativeProvider', () => {
        it('should allow registering custom native providers', async () => {
            const factory = createProviderFactory();

            // Mock provider
            const mockProvider = new PosteItalianeProvider();

            factory.registerNativeProvider('custom-carrier', mockProvider);

            expect(factory.isNativelySupported('custom-carrier')).toBe(true);

            const provider = await factory.getProvider(
                'ABC123',
                'custom-carrier',
            );
            expect(provider).toBe(mockProvider);
        });
    });

    describe('Provider routing priority', () => {
        it('should prefer native over aggregator when both available', async () => {
            const factory = createProviderFactory();
            const config = {
                provider: 'trackingmore',
                apiKey: 'test-key',
                createdAt: Date.now(),
            };

            // Poste Italiane is native, should use native even though aggregator is configured
            const provider = await factory.getProvider(
                'RM123456789IT',
                undefined,
                config,
            );

            expect(provider).toBeInstanceOf(PosteItalianeProvider);
            expect(provider).not.toBeInstanceOf(TrackingMoreProvider);
        });
    });
});
