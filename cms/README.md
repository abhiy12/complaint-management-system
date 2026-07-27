# Complaint Management System

Angular 18 + Node/Express + PostgreSQL. Multi-vendor complaint tracking with live executive
location tracking, real-time notifications (Socket.io), role-based dashboards, and reporting.

## What's fully implemented vs. scaffolded

This is a large system; to keep everything real rather than thin, here's an honest map.

**Fully working (real logic, not stubs):**
- PostgreSQL schema: all tables, FKs, indexes, an audit trigger, `sp_assign_complaint` stored
  procedure, and 6 reporting views.
- Auth: JWT access + refresh tokens (rotated on refresh, hashed at rest), bcrypt passwords,
  forgot/reset password via email, RBAC middleware.
- Vendor, Executive, Complaint CRUD with a real MVC → service → repository layering.
- The full complaint status state machine (`services/complaint.service.js` — `TRANSITIONS`),
  enforced server-side, with `complaint_history` audit trail and `audit_logs` for everything else.
- Leave-blocks-assignment rule, enforced in both the service layer and the DB stored procedure.
- Socket.io: authenticated handshake, per-user rooms, live location broadcast to admins,
  real-time notifications on assign/status-change.
- Reports: dashboard cards, status/category/priority/vendor/executive breakdowns via SQL views,
  Excel, CSV, **and PDF** export.
- Settings: a real `settings` table + CRUD API + editable UI screen (not just seed data).
- QR code generation per complaint (`GET /api/complaints/qrcode/:id`, returns a data URL — scan
  it to look up a complaint by number).
- Swagger: `/auth` and `/complaints` routes carry `@openapi` JSDoc annotations as a worked
  example; the doc renders live at `/api-docs`.
- PWA: `ngsw-config.json` + `manifest.webmanifest` wired into `angular.json` and registered in
  `app.config.ts` (add real icon files under `src/assets/icons/` before shipping — a placeholder
  README marks where).
- Angular: working login/forgot/reset password, role-guarded lazy-loaded routing for three
  portals, admin dashboard with live charts (Chart.js), complaint list/create/detail/assign
  with the timeline view, vendor & executive CRUD screens, live tracking map (Google Maps),
  executive geolocation auto-ping every 30s.
- Sample unit test (status transitions) and API test (login validation) with Jest + Supertest.
- Docker Compose (postgres + api + nginx), Dockerfile, PM2 ecosystem file, Nginx reverse-proxy config.

**Scaffolded / intentionally left as a next step** (so you know exactly what's thin):
- SMS notifications and multi-language i18n are named in the spec but not built — both are
  self-contained additions (SMS: swap in an SMS provider next to `utils/mailer.js`; i18n:
  Angular's `@angular/localize` plus translated string files).
- The rest of the routes (vendors, executives, reports) don't have `@openapi` annotations yet —
  copy the pattern from `auth.routes.js` / `complaint.routes.js`.
- Fine-grained permission checks (the `role_permissions` table exists and is seeded) — routes
  currently check role name only; swap `authorize('super_admin')` for a permission-code check
  when you need finer control.
- PWA offline **write** queueing (creating a complaint while offline and syncing later) — the
  service worker above handles asset caching and a freshness-based GET cache for the complaint
  list; queuing offline mutations needs a small IndexedDB outbox, which isn't built.

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 14+ (or a free Neon/Supabase project — no local install needed)
- Angular CLI 18 (`npm i -g @angular/cli@18`)
- (Optional) Docker + Docker Compose for the containerized path

## Local setup (without Docker)

### 1. Database
```bash
psql "postgresql://USER:PASSWORD@localhost:5432/complaint_management" -f backend/database/schema.sql
psql "postgresql://USER:PASSWORD@localhost:5432/complaint_management" -f backend/database/seeds/seed.sql
# (create the complaint_management database first if it doesn't exist yet:
#  createdb -U USER complaint_management)
```
This creates the `complaint_management` database and a Super Admin:
`admin@example.com` / `Admin@12345` — **change this password immediately.**

### 2. Backend
```bash
cd backend
cp .env.example .env      # fill in DB credentials, JWT secrets, SMTP
npm install
npm run dev                # nodemon, http://localhost:5000
```
API docs: `http://localhost:5000/api-docs`. Health check: `http://localhost:5000/health`.

### 3. Frontend
```bash
cd frontend
npm install
# put a real key in src/environments/environment.ts -> googleMapsApiKey
ng serve                   # http://localhost:4200
```

## Deploying to Render (with Neon or Supabase PostgreSQL)

Full step-by-step walkthrough — creating the Aiven database, loading the schema, deploying both
services via the included `render.yaml` blueprint, and fixing CORS/URLs afterward — is in
[`deployment/RENDER_DEPLOY.md`](deployment/RENDER_DEPLOY.md). Read that end-to-end before your
first deploy; a couple of steps (pointing the frontend at the backend's real URL) have to happen
in a specific order since Angular bakes config in at build time.

## Docker path

```bash
cd deployment
cp ../backend/.env.example ../backend/.env   # fill in real values first
docker compose up --build
```
This builds the API image, starts Postgres (auto-loading schema + seed on first boot), and
serves Nginx on port 80. Build the Angular app first (`ng build --configuration production`
from `frontend/`) so `frontend/dist` exists for Nginx to serve — or add an Angular build stage
to `docker-compose.yml` if you'd rather it happen automatically.

## Production (bare Ubuntu + PM2, no Docker)

1. Provision PostgreSQL (or use Neon/Supabase), run the two SQL files from `backend/database/`
   against it via `psql` or your provider's SQL editor.
2. `cd backend && npm ci --omit=dev`, set a production `.env`.
3. Install PM2 globally: `npm i -g pm2`, then from `deployment/`:
   `pm2 start ecosystem.config.js --env production`
4. Build Angular: `cd frontend && ng build --configuration production`.
5. Point system Nginx at `deployment/nginx.conf` (adjust `proxy_pass` targets from `api:5000`
   to `127.0.0.1:5000` since there's no Docker network here), and serve `frontend/dist`.

## Building the Vendor and Executive Android apps (two separate APKs)

Both mobile roles get their own installable app — separate icon, name, and Play Store listing —
while sharing 100% of the same Angular code. This works via **two thin native shells** under
`mobile/`, each pointing at the same web build:

```
mobile/
├── vendor-app/       appId: com.cms.vendor,    appName: "CMS Vendor"
└── executive-app/    appId: com.cms.executive, appName: "CMS Executive"
```

Each shell also enforces *who* can log into it: `core/services/app-identity.service.ts` reads
the shell's own `appId` at runtime (via `@capacitor/app`) and blocks login if the account's role
doesn't match — a vendor account can't log into the Executive app and vice versa. This only
applies inside the compiled native apps; the web/PWA version has no such restriction, since the
Admin portal in particular is web-only by design.

This step needs tools this sandbox doesn't have, so run it on your own machine:

**Prerequisites (one-time):** [Android Studio](https://developer.android.com/studio) (bundles the
Android SDK) and JDK 17 (Android Studio bundles one too; make sure `JAVA_HOME` points at it).

**Build the Executive app:**
```bash
cd mobile/executive-app
npm install
npm run cap:add:android      # builds the Angular web app first, then scaffolds android/
npm run cap:open:android     # opens in Android Studio
```

**Build the Vendor app:**
```bash
cd mobile/vendor-app
npm install
npm run cap:add:android
npm run cap:open:android
```

From Android Studio, for either: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. Find the
result under `android/app/build/outputs/apk/debug/app-debug.apk` in that shell's folder.

**After any change to the shared Angular code**, resync both shells before rebuilding:
```bash
cd mobile/executive-app && npm run cap:sync
cd ../vendor-app && npm run cap:sync
```

**Live-reloading on a real device during development:** in either shell's `capacitor.config.ts`,
uncomment the `server.url` line and point it at your machine's LAN IP (not `localhost`), e.g.
`http://192.168.1.50:4200`. Run `ng serve --host 0.0.0.0` from `frontend/`, then `npm run cap:sync`
and relaunch from Android Studio. Comment it back out before building a release APK.

**Signing for the Play Store:** each app needs its own signing keystore — Android Studio's
**Build → Generate Signed Bundle / APK** wizard walks through creating one per shell. That's a
one-time step involving a private key you generate and keep yourself, so it isn't included here.

**What's wired up natively:** GPS location (`@capacitor/geolocation`, with a permission prompt)
through `core/services/geolocation.service.ts` — used by the Executive dashboard's 30-second
location ping. It's a no-op import in the Vendor app (unused there, but harmless to share the
same bundle). Push notifications and offline write-queueing aren't wired up —
`@capacitor/push-notifications` and a local SQLite outbox would be the next additions.

## Testing

```bash
cd backend
npm test              # all
npm run test:unit     # transition-rule tests, no DB needed
npm run test:api      # supertest against a running app instance
```

## Project layout

See `../01-architecture-overview.md`, `../02-er-diagram.mermaid`, and `../03-folder-structure.md`
from the earlier design pass for the full architecture rationale and ER diagram — they still
apply to what's built here.

## Default credentials (change immediately)

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@example.com | Admin@12345 |
