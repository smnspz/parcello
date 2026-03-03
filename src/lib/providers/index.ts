/**
 * Tracking provider exports
 * @module providers
 */

// Base classes
export { BaseProvider } from './BaseProvider';
export { NativeProviderBase } from './native/NativeProviderBase';
export { AggregatorProviderBase } from './aggregators/AggregatorProviderBase';

// Native providers
export { PosteItalianeProvider } from './native/PosteItalianeProvider';

// Aggregator providers
export { TrackingMoreProvider } from './aggregators/TrackingMoreProvider';
export { SeventeenTrackProvider } from './aggregators/SeventeenTrackProvider';

// Factory
export { ProviderFactory, createProviderFactory } from './ProviderFactory';
