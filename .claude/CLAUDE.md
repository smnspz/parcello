# Parcello — Project Intelligence

## Development Standards

- Package manager: **pnpm**
- Code formatting: **Prettier** with modern defaults (no `printWidth` constraint)
- Git hooks: **Husky** for precommit — must format code and run tests
- Styling: **Tailwind CSS** — no custom CSS unless strictly necessary
- Minimal component count; avoid unnecessary abstraction
- No JavaScript unless absolutely necessary
- Dark/light mode via `prefers-color-scheme` — no toggle
- Mobile-first responsive design
- No cards, no heavy shadows, no decorative backgrounds unless explicitly requested
- Semantic HTML, proper heading hierarchy, WCAG AA contrast
- ARIA labels and skip links where appropriate
- `<time datetime="...">` for all dates
- `role="list"` on `<ol>` and `<ul>` for structured content
- Comment all code concisely (a word or two for HTML, brief inline for logic)

## Color Palette

### Light Mode — _Cardboard & Kraft_

| Role           | Token name         | Hex       | Description           |
| -------------- | ------------------ | --------- | --------------------- |
| Background     | `color-bg`         | `#F5F0E8` | Aged paper white      |
| Surface        | `color-surface`    | `#EDE3D0` | Unbleached cardboard  |
| Border         | `color-border`     | `#C8B89A` | Box edge shadow       |
| Text primary   | `color-text`       | `#2C2016` | Deep dark brown       |
| Text secondary | `color-text-muted` | `#7A6A56` | Faded annotation      |
| Accent / CTA   | `color-accent`     | `#D4621A` | Shipping orange       |
| Accent alt     | `color-accent-alt` | `#3A7CA5` | Packing tape blue     |
| Success        | `color-success`    | `#4A7C59` | Delivered stamp green |
| Warning        | `color-warning`    | `#C8922A` | In-transit amber      |

### Dark Mode — _Warehouse at Night_

Brown-tinted dark theme. Background has a warm brown undertone, not a cold gray-black.

| Role           | Token name         | Hex       | Description           |
| -------------- | ------------------ | --------- | --------------------- |
| Background     | `color-bg`         | `#18130F` | Very deep earth brown |
| Surface        | `color-surface`    | `#241E18` | Lifted surface        |
| Border         | `color-border`     | `#3D2E22` | Subtle warm separator |
| Text primary   | `color-text`       | `#EDE0CC` | Warm parchment white  |
| Text secondary | `color-text-muted` | `#9E8A72` | Dusty tan             |
| Accent / CTA   | `color-accent`     | `#E8722A` | Shipping orange       |
| Accent alt     | `color-accent-alt` | `#5B9EC9` | Packing tape blue     |
| Success        | `color-success`    | `#6A9E78` | Pale sage green       |
| Warning        | `color-warning`    | `#E0A832` | Amber glow            |

## Workflow Rules

- **CRITICAL**: Present every decision for review in granular detail before implementation — user wants to review and approve all choices, no matter how small
- Before implementing any task, explain what you will do and which files you will change — only start after approval
- After completing a task, update `TODO.md`
- After completing a task, automatically review and present the next logical task for approval
- E2E tests use Playwright, located in `tests/`

---

## Project Overview

A self-hostable **package tracking web app**. No login required. Users bring their own tracking API key. Deployable to Cloudflare Pages or self-hosted.

---

## Stack

| Layer                  | Technology                            |
| ---------------------- | ------------------------------------- |
| Framework              | Astro + `@astrojs/cloudflare` adapter |
| Interactive islands    | React                                 |
| Styling                | Tailwind CSS                          |
| Maps                   | Leaflet + OpenStreetMap tiles         |
| Geocoding              | Nominatim                             |
| Hosting                | Cloudflare Pages                      |
| Proxy                  | Cloudflare Workers                    |
| Database (hosted)      | Cloudflare D1                         |
| Database (self-hosted) | localStorage                          |

---

## Pages

| Route            | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `/`              | Shipment list — all tracked packages, status badges, last update            |
| `/shipment/[id]` | Shipment detail — event timeline + Leaflet map with pins per event location |
| `/settings`      | Provider selector, API key input, device code display                       |

---

## User Identity

- On first visit, a **random UUID** is generated and saved in `localStorage`
- The UUID is used as the anonymous user identifier — no login, no passphrase
- The UUID is shown to the user in Settings as a **"device code"** they can copy to restore their config on another device
- On the Cloudflare hosted version, the UUID is sent as `X-User-Token` header on every Worker request

---

## Tracking Providers

The app is **provider-agnostic**. A `TrackingProvider` interface is implemented by each adapter. The user selects their provider and enters their own API key in Settings.

Supported providers at launch: **TrackingMore**, **17TRACK**.

```typescript
interface TrackingProvider {
    id: string;
    name: string;
    fetch(trackingNumber: string, carrier?: string): Promise<TrackingResult>;
}

interface TrackingResult {
    trackingNumber: string;
    carrier: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'exception';
    estimatedDelivery?: string;
    events: TrackingEvent[];
}

interface TrackingEvent {
    timestamp: string;
    location: string; // free text, geocoded via Nominatim for map pins
    status: string;
    description: string;
}
```

---

## Storage

Two adapters, same interface:

```typescript
interface StorageAdapter {
    getShipments(): Promise<Shipment[]>;
    saveShipment(shipment: Shipment): Promise<void>;
    deleteShipment(id: string): Promise<void>;
    getConfig(): Promise<UserConfig | null>;
    saveConfig(config: UserConfig): Promise<void>;
}
```

| Deployment  | Adapter                  |
| ----------- | ------------------------ |
| Self-hosted | `LocalStorageAdapter`    |
| Cloudflare  | `D1Adapter` (via Worker) |

---

## API Key Security (Cloudflare hosted version)

- All calls to the tracking provider go through a **Cloudflare Worker** — the API key never leaves the server in plaintext
- The API key is encrypted **client-side** using AES-GCM before being sent to the Worker
- Encryption key is derived from the user's UUID via **PBKDF2**
- The encrypted key is stored in D1 — not even the app owner can decrypt it without the user's UUID

```
Browser → CF Worker (decrypts key) → TrackingMore / 17TRACK
```

---

## D1 Schema

```sql
CREATE TABLE user_config (
  token       TEXT PRIMARY KEY,
  provider    TEXT NOT NULL,
  api_key     TEXT NOT NULL, -- AES-GCM encrypted
  created_at  INTEGER,
  last_seen   INTEGER
);

CREATE TABLE shipments (
  id           TEXT PRIMARY KEY,
  token        TEXT NOT NULL,
  tracking_num TEXT NOT NULL,
  carrier      TEXT,
  label        TEXT, -- user-defined name
  created_at   INTEGER,
  FOREIGN KEY (token) REFERENCES user_config(token)
);
```

Tracking events are **not persisted** — fetched live from the provider and cached briefly in the Worker.

---

## Cloudflare Worker Routes

| Method   | Route                        | Description                                      |
| -------- | ---------------------------- | ------------------------------------------------ |
| `GET`    | `/api/track/:trackingNumber` | Proxy request to provider, returns tracking data |
| `GET`    | `/api/config`                | Get user config (provider, encrypted key)        |
| `POST`   | `/api/config`                | Save user config                                 |
| `GET`    | `/api/shipments`             | Get all shipments for user                       |
| `POST`   | `/api/shipments`             | Add a shipment                                   |
| `DELETE` | `/api/shipments/:id`         | Delete a shipment                                |

All routes require `X-User-Token` header.

---

## Implementation Phases

### Phase 1 — Core UI with localStorage

- Astro project scaffold with Tailwind
- All three pages with static/mock data
- `LocalStorageAdapter` fully implemented
- Settings page: provider selector + API key input + device code display

### Phase 2 — Provider adapters

- `TrackingProvider` interface
- TrackingMore adapter
- 17TRACK adapter
- Live tracking data in shipment detail page
- Leaflet map with Nominatim geocoding

### Phase 3 — Cloudflare Worker + D1

- Worker setup with all API routes
- `D1Adapter` implementation
- Client-side AES-GCM encryption of API key
- Deploy to Cloudflare Pages

### Phase 4 — Polish

- Loading states and error handling
- Playwright E2E tests
- README and self-hosting documentation
