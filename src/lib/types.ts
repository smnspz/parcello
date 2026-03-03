/**
 * Core type definitions for Parcello
 * @module types
 */

/**
 * Represents a user's tracked package
 * @interface Shipment
 */
export interface Shipment {
    /** Unique identifier (UUID) */
    id: string;
    /** Tracking number from carrier */
    trackingNumber: string;
    /** Optional carrier code (e.g., "ups", "fedex") */
    carrier?: string;
    /** User-defined label/name for the shipment */
    label?: string;
    /** Creation timestamp (Unix epoch) */
    createdAt: number;
}

/**
 * Individual tracking event/update
 * @interface TrackingEvent
 */
export interface TrackingEvent {
    /** Event timestamp (ISO 8601 format) */
    timestamp: string;
    /** Event location (free text, geocoded via Nominatim for map display) */
    location: string;
    /** Event status text */
    status: string;
    /** Detailed event description */
    description: string;
}

/**
 * Tracking status values
 * @type TrackingStatus
 */
export type TrackingStatus =
    | 'pending'
    | 'in_transit'
    | 'delivered'
    | 'exception';

/**
 * Response from tracking provider API
 * @interface TrackingResult
 */
export interface TrackingResult {
    /** Tracking number */
    trackingNumber: string;
    /** Carrier identifier */
    carrier: string;
    /** Current shipment status */
    status: TrackingStatus;
    /** Estimated delivery date (ISO 8601 format) */
    estimatedDelivery?: string;
    /** Array of tracking events, ordered chronologically */
    events: TrackingEvent[];
}

/**
 * User configuration and preferences
 * Stored in localStorage (self-hosted) or D1 database (Cloudflare)
 * @interface UserConfig
 */
export interface UserConfig {
    /** Selected tracking provider ID (e.g., "trackingmore", "17track") */
    provider: string;
    /** AES-GCM encrypted API key */
    apiKey: string;
    /** Configuration creation timestamp (Unix epoch) */
    createdAt: number;
}

/**
 * Interface for tracking provider adapters
 * Implemented by TrackingMore, 17TRACK, etc.
 * @interface TrackingProvider
 */
export interface TrackingProvider {
    /** Provider identifier (e.g., "trackingmore", "17track") */
    id: string;
    /** Human-readable provider name */
    name: string;
    /**
     * Fetch tracking data from provider
     * @param trackingNumber - Tracking number to query
     * @param carrier - Optional carrier code for faster lookup
     * @returns Promise resolving to tracking result
     */
    fetch(trackingNumber: string, carrier?: string): Promise<TrackingResult>;
}

/**
 * Interface for storage implementations
 * Implemented by LocalStorageAdapter (self-hosted) and D1Adapter (Cloudflare)
 * @interface StorageAdapter
 */
export interface StorageAdapter {
    /**
     * Retrieve all shipments for current user
     * @returns Promise resolving to array of shipments
     */
    getShipments(): Promise<Shipment[]>;

    /**
     * Save a new shipment or update existing one
     * @param shipment - Shipment to save
     * @returns Promise resolving when saved
     */
    saveShipment(shipment: Shipment): Promise<void>;

    /**
     * Delete a shipment by ID
     * @param id - Shipment ID to delete
     * @returns Promise resolving when deleted
     */
    deleteShipment(id: string): Promise<void>;

    /**
     * Retrieve user configuration
     * @returns Promise resolving to config or null if not found
     */
    getConfig(): Promise<UserConfig | null>;

    /**
     * Save user configuration
     * @param config - Configuration to save
     * @returns Promise resolving when saved
     */
    saveConfig(config: UserConfig): Promise<void>;
}

/**
 * Generic API response wrapper
 * @template T - Type of data returned on success
 * @interface ApiResponse
 */
export interface ApiResponse<T = unknown> {
    /** Response data (present on success) */
    data?: T;
    /** Error message (present on failure) */
    error?: string;
    /** Success flag */
    success?: boolean;
}

/**
 * Geocoding result from Nominatim API
 * @interface GeocodingResult
 */
export interface GeocodingResult {
    /** Latitude coordinate */
    lat: string;
    /** Longitude coordinate */
    lon: string;
    /** Human-readable location name */
    displayName: string;
}
