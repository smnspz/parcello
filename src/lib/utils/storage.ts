/**
 * Generates a UUID v4 string with fallback for browsers that don't support crypto.randomUUID().
 *
 * @returns A UUID v4 string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * @remarks
 * Uses the native crypto.randomUUID() API when available, otherwise falls back to
 * a Math.random()-based implementation.
 *
 * @internal
 */
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        },
    );
}

/**
 * Retrieves the user's device token from localStorage, or creates a new one if it doesn't exist.
 *
 * @returns The user's device token (UUID v4 string)
 *
 * @remarks
 * The device token is stored in localStorage under the key 'userToken'.
 * If localStorage is unavailable or fails, a temporary UUID is returned without persistence.
 *
 * @example
 * ```typescript
 * const token = getOrCreateDeviceToken();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function getOrCreateDeviceToken(): string {
    try {
        let userToken = localStorage.getItem('userToken');
        if (!userToken) {
            userToken = generateUUID();
            localStorage.setItem('userToken', userToken);
        }
        return userToken;
    } catch (error) {
        console.error('Error getting/creating device token:', error);
        // Return a temporary UUID if localStorage fails
        return generateUUID();
    }
}

/**
 * Loads the user's tracking provider configuration from localStorage.
 *
 * @returns An object containing the provider and apiKey, or null if no configuration exists
 *
 * @remarks
 * The configuration is stored in localStorage under the key 'userConfig'.
 * Returns null if no configuration is found or if an error occurs during parsing.
 * Empty strings are returned for missing provider or apiKey fields.
 *
 * @example
 * ```typescript
 * const config = loadUserConfig();
 * if (config) {
 *   console.log(config.provider); // "trackingmore"
 *   console.log(config.apiKey);   // "your-api-key"
 * }
 * ```
 */
export function loadUserConfig(): {
    provider: string;
    apiKey: string;
} | null {
    try {
        const savedConfig = localStorage.getItem('userConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            return {
                provider: config.provider || '',
                apiKey: config.apiKey || '',
            };
        }
        return null;
    } catch (error) {
        console.error('Error loading user config:', error);
        return null;
    }
}

/**
 * Saves the user's tracking provider configuration to localStorage.
 *
 * @param provider - The tracking provider identifier (e.g., "trackingmore", "17track")
 * @param apiKey - The API key for the selected provider
 *
 * @throws {Error} Rethrows any errors that occur during localStorage operations
 *
 * @remarks
 * The configuration is stored in localStorage under the key 'userConfig' as a JSON string.
 * Includes a createdAt timestamp (Unix epoch in milliseconds) for tracking when the config was saved.
 *
 * @example
 * ```typescript
 * try {
 *   saveUserConfig("trackingmore", "your-api-key");
 *   console.log("Configuration saved successfully");
 * } catch (error) {
 *   console.error("Failed to save configuration:", error);
 * }
 * ```
 */
export function saveUserConfig(provider: string, apiKey: string): void {
    try {
        const config = {
            provider,
            apiKey,
            createdAt: Date.now(),
        };
        localStorage.setItem('userConfig', JSON.stringify(config));
    } catch (error) {
        console.error('Error saving user config:', error);
        throw error;
    }
}
