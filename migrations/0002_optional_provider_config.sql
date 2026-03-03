-- Migration 0002: Native Carrier Support (Phase 1 - Non-breaking)
-- Adds carrier metadata registry and tracking attempt logging
-- Makes provider/api_key nullable in a future migration (Phase 2)

-- Carrier metadata registry
-- Stores information about supported carriers (both native and aggregator-based)
CREATE TABLE IF NOT EXISTS carrier_metadata (
  carrier_code TEXT PRIMARY KEY,         -- Unique carrier identifier (e.g., "poste-italiane")
  carrier_name TEXT NOT NULL,            -- Human-readable carrier name
  is_native BOOLEAN NOT NULL DEFAULT 0,  -- Whether this carrier has native support (no API key needed)
  tracking_pattern TEXT,                 -- Regex pattern for tracking number detection (NULL = TBD)
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for querying native carriers
CREATE INDEX IF NOT EXISTS idx_carrier_metadata_is_native ON carrier_metadata(is_native);

-- Tracking attempt logging
-- Records all tracking requests for debugging and analytics
CREATE TABLE IF NOT EXISTS tracking_attempts (
  id TEXT PRIMARY KEY,                   -- UUID for this attempt
  token TEXT NOT NULL,                   -- User token who made the request
  tracking_number TEXT NOT NULL,         -- Tracking number queried
  detected_carrier TEXT,                 -- Carrier detected from pattern (NULL if detection failed)
  provider_used TEXT,                    -- Provider that handled the request (native/trackingmore/17track)
  success BOOLEAN NOT NULL,              -- Whether the tracking request succeeded
  error_message TEXT,                    -- Error message if failed
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (token) REFERENCES user_config(token) ON DELETE CASCADE
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_tracking_attempts_token ON tracking_attempts(token);
CREATE INDEX IF NOT EXISTS idx_tracking_attempts_created_at ON tracking_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_attempts_success ON tracking_attempts(success);

-- Seed native carriers (Italian/European carriers for Vinted use case)
-- Tracking patterns to be researched and added in future commits
INSERT INTO carrier_metadata (carrier_code, carrier_name, is_native, tracking_pattern) VALUES
  ('poste-italiane', 'Poste Italiane', 1, NULL),
  ('inpost', 'InPost', 1, NULL),
  ('brt-fermopoint', 'BRT FermoPoint', 1, NULL),
  ('gls', 'GLS', 1, NULL),
  ('dhl-express', 'DHL Express', 1, NULL);
