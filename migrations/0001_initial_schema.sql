-- User configuration table
-- Stores encrypted API keys and provider selection per user
CREATE TABLE IF NOT EXISTS user_config (
  token TEXT PRIMARY KEY,           -- User's UUID (device identifier)
  provider TEXT NOT NULL,            -- Selected tracking provider (trackingmore, 17track)
  api_key TEXT NOT NULL,             -- AES-GCM encrypted API key
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_seen INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Index for cleanup/analytics
CREATE INDEX IF NOT EXISTS idx_user_config_last_seen ON user_config(last_seen);

-- Shipments table
-- Stores user's tracked packages
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,               -- UUID for shipment
  token TEXT NOT NULL,               -- References user_config(token)
  tracking_num TEXT NOT NULL,        -- Tracking number from carrier
  carrier TEXT,                      -- Optional carrier code
  label TEXT,                        -- User-defined label/name for shipment
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (token) REFERENCES user_config(token) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_shipments_token ON shipments(token);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_num ON shipments(tracking_num);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);
