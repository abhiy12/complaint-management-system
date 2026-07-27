# Complaint Management System — Architecture Overview

## 1. System Context

Four client roles talk to one backend API, which talks to one PostgreSQL database, with a WebSocket channel for real-time events and a static file store for uploads.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Clients (Angular 18 SPA)                  │
│  Super Admin Portal | Vendor Admin/User Portal | Executive Portal │
│  (Same Angular app, route-guarded by role — see §4)               │
└───────────────┬─────────────────────────────┬─────────────────────┘
                │ HTTPS (REST, JWT)            │ WSS (Socket.io)
                ▼                               ▼
        ┌───────────────────────────────────────────────┐
        │            Nginx (reverse proxy, TLS)          │
        └───────────────┬─────────────────┬──────────────┘
                         ▼                 ▼
              ┌────────────────┐  ┌────────────────┐
              │  Node/Express   │  │  Socket.io       │
              │  REST API       │◄─┤  Gateway (same    │
              │  (MVC + repo    │  │  process, shared  │
              │   layer)        │  │  auth middleware) │
              └───────┬─────────┘  └────────┬───────────┘
                      │                     │
         ┌────────────┼─────────────────────┼─────────────┐
         ▼            ▼                     ▼              ▼
   ┌───────────┐ ┌───────────┐      ┌──────────────┐ ┌───────────┐
   │  PostgreSQL   │ │  uploads/  │      │  Nodemailer   │ │  Winston  │
   │ (primary   │ │  (local or │      │  (SMTP)       │ │  Logger   │
   │  store)    │ │  S3-ready) │      │               │ │  (files)  │
   └───────────┘ └───────────┘      └──────────────┘ └───────────┘
```

**Why this shape:**
- One Express process hosts both REST and Socket.io so they share the same JWT auth middleware and don't need a separate pub/sub layer for a system this size. If load ever demands horizontal scaling, Socket.io adds a Redis adapter later without changing the API contract.
- PostgreSQL is the single source of truth; `executive_locations` is a hot-write table (every 30s per active executive) so it's indexed on `executive_id, created_at` and pruned/archived by a scheduled job rather than kept forever.
- File uploads go to disk (`uploads/`) behind Nginx `alias`, structured so swapping to S3/GCS later only touches the storage service, not controllers.

## 2. Layered Backend Architecture (MVC + Repository)

```
Route → Middleware (auth, validate) → Controller → Service → Repository → PostgreSQL
                                              │
                                              └──► Socket.io emit / Nodemailer / Winston
```

- **Routes**: map URL + verb to controller method only. No logic.
- **Middleware**: `authenticate` (verify JWT), `authorize(roles[])` (RBAC), `validate(schema)` (Joi), `rateLimiter`, `errorHandler` (last in chain).
- **Controllers**: parse req, call service, shape response. No SQL, no business rules.
- **Services**: business logic — e.g. "don't assign a complaint to an executive currently on approved leave," "auto-escalate complaint if unassigned > N hours." Services orchestrate repositories and emit events.
- **Repositories**: only layer that talks to PostgreSQL (via `pg` + parameterized queries, or Knex as query builder). Keeps SQL centralized and testable.
- **Validators**: Joi schemas, one per endpoint payload, colocated by module.

This separation is what makes the "unit / integration / API test" requirement realistic: services are testable with mocked repositories; repositories are tested against a test database; controllers are covered by supertest API tests.

## 3. Authentication & Authorization

- **Access token** (JWT, short-lived, ~15 min) — sent as `Authorization: Bearer`.
- **Refresh token** (long-lived, ~7–30 days) — stored hashed in `refresh_tokens` table, rotated on every use (rotation + reuse detection prevents replay).
- **Password reset**: one-time token in `password_resets`, expiring, single-use, emailed via Nodemailer.
- **RBAC**: `roles` + `permissions` + `role_permissions` tables drive a `authorize('complaint:assign')` style middleware rather than hardcoding role name checks everywhere — new roles or finer permissions later don't require touching every route.
- Passwords: bcrypt, cost factor 12.

## 4. Frontend Architecture (Angular 18)

- **One SPA, role-based routing**: `core/guards/role.guard.ts` + lazy-loaded feature modules per role area, so a Vendor Sub User's bundle never pulls in Super Admin code.
- **State**: Angular Signals for local/component state; a thin `services/*.service.ts` layer wrapping HttpClient + RxJS for server state (no heavy NgRx needed at this scope — services + signals keep it simple and debuggable).
- **Real-time**: a single `SocketService` (wraps socket.io-client) reconnects, joins a room per user role/vendor/executive, and pushes events into signals that components subscribe to — e.g. new-complaint toasts, live executive location updates on the map.
- **Maps**: `GoogleMapsService` wraps `@angular/google-maps`; executive location markers update via socket events, not polling.
- **PWA**: Angular service worker caches shell + last-viewed complaint list for offline read access; writes queue and sync when back online (complaint status updates, not complaint creation, are the safe offline case).

## 5. Complaint State Machine

Statuses and legal transitions (enforced in the service layer, not just the DB, so invalid transitions return a 409 before touching the database):

```
Open → Assigned → Accepted → Reached Site → Started → In Progress
                 → Rejected (back to Open, re-assign)
  In Progress → Waiting for Parts → In Progress
  In Progress → Completed → Closed (admin verifies)
  Any pre-Completed state → Cancelled (admin only)
```

Every transition writes a row to `complaint_history` (who, from-status, to-status, remarks, timestamp) — this table *is* the audit trail for complaints specifically, separate from the system-wide `audit_logs` table which covers logins, CRUD on vendors/executives, password changes, etc.

## 6. Live Tracking Data Flow

1. Executive app sends `{lat, lng, timestamp}` every 30s via `POST /api/executives/location` (or a socket event — recommend socket to avoid REST overhead at that frequency).
2. Server writes to `executive_locations`, updates `executives.current_latitude/longitude` (denormalized for fast "current position" reads), and emits `executive:location` to any admin sockets watching that executive/zone.
3. Admin dashboard map subscribes and updates the marker in place — no polling.
4. Location history table is retained N days (configurable in `settings`) and pruned by a scheduled job, since raw 30-second pings for months of executives isn't useful data to keep indefinitely.

## 7. Reporting & Export

Reports are computed via **PostgreSQL views** for the common aggregations (vendor-wise counts, status counts, executive performance) so the report endpoints stay thin — `SELECT` from a view, optionally filtered by date/vendor/executive, then handed to an export formatter (ExcelJS for xlsx, json2csv for CSV, Puppeteer or PDFKit for PDF). Heavy custom-date-range reports fall back to parameterized queries rather than views.

## 8. Deployment Topology

```
Internet → Nginx (TLS termination, static Angular build, /api → proxy_pass, /socket.io → proxy_pass with upgrade headers)
              │
              ▼
        PM2 (cluster mode, N workers) → Node/Express app
              │
              ▼
           PostgreSQL (separate container/host, persisted volume)
```

Docker Compose ties `nginx`, `api` (Node, PM2 inside or PM2 on host), and `mysql` together for local/staging; production deployment guide covers the same topology on a bare Ubuntu box with PM2 managing the Node process directly and system Nginx in front.

## 9. Security Checklist Mapped to Layers

| Concern | Where enforced |
|---|---|
| SQL injection | Parameterized queries only, repository layer |
| XSS | Angular's built-in sanitization (no `innerHTML` bypass) + `helmet` CSP headers |
| CSRF | Not applicable in the classic sense (stateless JWT, no cookie-based session) — access token in memory, refresh token in httpOnly secure cookie with `SameSite=Strict` |
| Brute force | `express-rate-limit` on `/auth/login`, `/auth/forgot-password` |
| Payload validation | Joi schema per endpoint, rejected before reaching controller |
| File upload abuse | Multer file-type + size (10MB) whitelist, renamed on disk, served from a non-executable path |
| Secrets | `.env`, never committed; separate `.env.example` |

---
Next deliverable: **ER diagram** (`02-er-diagram.mermaid`) and **folder structure** (`03-folder-structure.md`), followed by full DDL once you confirm the schema looks right.
