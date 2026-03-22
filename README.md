# Nottingham Properties

A premium property management website built with Astro, Tailwind CSS, and several third-party integrations.

## Tech Stack

- **Framework:** Astro 4 (server-side rendering)
- **Styling:** Tailwind CSS with custom design tokens
- **AI Chat:** Anthropic Claude (claude-3-haiku)
- **Email:** Resend
- **Maps:** Mapbox GL JS
- **Auth (portal):** Supabase

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

You'll need:
- **Mapbox token** (free) — [mapbox.com](https://mapbox.com) → Account → Tokens
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com)
- **Resend API key** (free tier available) — [resend.com](https://resend.com)
- **Supabase project** (for tenant portal login) — [supabase.com](https://supabase.com)
- Set `ADMIN_PASSWORD` to something secure
- Set `LANDLORD_EMAIL` to your email address

All services work without their keys — they simply fall back gracefully (chat returns a "call us" message, emails log to console, maps show a placeholder).

### 3. Run the development server

```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321)

## Adding & Editing Properties

All property data lives in **`src/data/properties.json`**. To add or edit properties, update this file directly.

Each property needs:

```json
{
  "id": "unique-slug",              // used in URL: /properties/unique-slug
  "title": "Property Name",
  "address": "Full address, NG1 1AA",
  "area": "Area Name",              // used in filter dropdown
  "bedrooms": 2,                    // 0 = studio
  "bathrooms": 1,
  "rent": 1100,                     // per month in £
  "available": true,
  "availableFrom": "2026-05-01",    // null if not available
  "photos": ["/images/photo.jpg"],  // add images to public/images/
  "description": "...",
  "features": ["Feature 1", "Feature 2"],
  "lat": 52.9510,
  "lng": -1.1467
}
```

## Adding Photos

Place images in the `public/images/` directory and reference them as `/images/filename.jpg` in the `photos` array.

## Site Structure

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with hero, featured properties, testimonials |
| Properties | `/properties` | Filterable property grid |
| Property detail | `/properties/[id]` | Full property page with enquiry form |
| Map | `/map` | Mapbox map of all properties |
| Contact | `/contact` | Contact form |
| Tenant Portal | `/portal` | Login page (Supabase auth) |
| Dashboard | `/portal/dashboard` | Tenant's tenancy overview |
| Maintenance | `/portal/maintenance` | Report maintenance issues |
| Admin | `/admin` | Password-protected admin dashboard |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | AI chat powered by Claude |
| `/api/enquiry` | POST | Property/contact enquiry → email via Resend |
| `/api/maintenance` | POST | Maintenance request → email via Resend |

## Deployment

Build for production:

```bash
npm run build
```

The build output (`dist/`) runs as a Node.js server (standalone mode). Start it with:

```bash
node dist/server/entry.mjs
```

### Deploy to Railway / Render / Fly.io

Set all environment variables in your host's dashboard, then deploy the repo. These platforms will run `npm install && npm run build` automatically.

### Deploy to a VPS

```bash
# On your server
git clone your-repo
cd nottingham-properties
npm install
npm run build
# Run with pm2 for process management
npm install -g pm2
pm2 start dist/server/entry.mjs --name nottingham-properties
pm2 save
```

## Tenant Portal (Supabase Setup)

1. Create a Supabase project
2. Add users via Supabase Auth dashboard (or use the "Invite user" feature)
3. Add your `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` to `.env`
4. Update `src/pages/portal/index.astro` to call `supabase.auth.signInWithPassword()`

## Admin Dashboard

Access at `/admin?pw=YOUR_ADMIN_PASSWORD`. The password is checked against `ADMIN_PASSWORD` in your `.env` file. For production, consider replacing this with Supabase auth or a proper session-based approach.

## Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| `charcoal` | `#1A1A18` | Text, backgrounds |
| `brick` | `#C4490C` | CTAs, accents |
| `cream` | `#F5F0E8` | Page background |
| `gold` | `#C9A84C` | Highlights, stars |

Fonts: **DM Serif Display** (headings) + **DM Sans** (body) via Google Fonts.
