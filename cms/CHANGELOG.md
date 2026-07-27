# Changelog — file-by-file

Every file added or changed since the project started, grouped by the change that caused it.
Paths are relative to the project root (the `cms/` folder in the zip).

## 1. Initial design pass (before full build)

**Added**
- `docs/01-architecture-overview.md`
- `docs/02-er-diagram.mermaid`
- `docs/03-folder-structure.md`

## 2. Full project build

**Added — backend**
- `backend/database/schema.sql`, `backend/database/seeds/seed.sql`
- `backend/package.json`, `backend/.env.example`
- `backend/config/env.js`, `db.js`, `socket.js`, `swagger.js`
- `backend/utils/logger.js`, `jwt.js`, `apiResponse.js`, `mailer.js`, `complaintNumberGenerator.js`
- `backend/middleware/errorHandler.js`, `authenticate.js`, `authorize.js`, `validate.js`, `rateLimiter.js`, `upload.js`
- `backend/validators/auth.validator.js`, `vendor.validator.js`, `complaint.validator.js`, `executive.validator.js`
- `backend/repositories/user.repository.js`, `refreshToken.repository.js`, `vendor.repository.js`, `executive.repository.js`, `complaint.repository.js`, `report.repository.js`, `auditLog.repository.js`, `notification.repository.js`
- `backend/services/auth.service.js`, `vendor.service.js`, `executive.service.js`, `complaint.service.js`, `notification.service.js`, `report.service.js`
- `backend/controllers/auth.controller.js`, `vendor.controller.js`, `executive.controller.js`, `complaint.controller.js`, `report.controller.js`, `notification.controller.js`
- `backend/routes/auth.routes.js`, `vendor.routes.js`, `vendorUser.routes.js`, `executive.routes.js`, `complaint.routes.js`, `report.routes.js`, `notification.routes.js`, `index.js`
- `backend/socket/index.js`, `handlers/location.handler.js`, `handlers/complaint.handler.js`
- `backend/app.js`, `server.js`
- `backend/tests/unit/complaint.transitions.test.js`, `tests/api/auth.api.test.js`, `jest.config.js`
- `backend/Dockerfile`, `.dockerignore`
- `deployment/docker-compose.yml`, `nginx.conf`, `ecosystem.config.js`

**Added — frontend**
- `frontend/package.json`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`
- `frontend/src/index.html`, `styles.scss`, `environments/environment.ts`, `environments/environment.prod.ts`
- `frontend/src/main.ts`, `app/app.component.ts`, `app/app.config.ts`, `app/app.routes.ts`
- `frontend/src/app/core/models/user.model.ts`, `complaint.model.ts`, `vendor.model.ts`, `executive.model.ts`, `api-response.model.ts`
- `frontend/src/app/core/services/auth.service.ts`, `socket.service.ts`, `vendor.service.ts`, `executive.service.ts`, `complaint.service.ts`, `report.service.ts`
- `frontend/src/app/core/interceptors/auth.interceptor.ts`, `error.interceptor.ts`
- `frontend/src/app/core/guards/auth.guard.ts`, `role.guard.ts`
- `frontend/src/app/auth/login/*`, `forgot-password/*`, `reset-password/*`
- `frontend/src/app/layouts/admin-layout/*`, `vendor-layout/*`, `executive-layout/*`
- `frontend/src/app/dashboard/admin-dashboard/*`, `vendor-dashboard/*`, `executive-dashboard/*`
- `frontend/src/app/complaints/complaint-list/*`, `complaint-form/*`, `complaint-details/*`, `complaint-timeline/*`, `assign-complaint/*`
- `frontend/src/app/vendors/vendor-list/*`, `vendor-form/*`
- `frontend/src/app/executives/executive-list/*`, `executive-form/*`, `executive-tracking-map/*`
- `frontend/src/app/reports/reports.component.ts`
- `frontend/src/app/notifications/notification-center/notification-center.component.ts`
- `frontend/src/app/settings/settings.component.ts`
- `frontend/src/app/profile/profile.component.ts`

**Added — root**
- `README.md`

## 3. Gap-filling pass (settings API, PDF export, QR codes, Swagger, PWA)

**Added**
- `backend/repositories/settings.repository.js`
- `backend/services/settings.service.js`
- `backend/controllers/settings.controller.js`
- `backend/routes/settings.routes.js`
- `frontend/ngsw-config.json`
- `frontend/src/manifest.webmanifest`
- `frontend/src/assets/icons/README.md`

**Modified**
- `backend/routes/index.js` — mounted `/settings`
- `backend/controllers/report.controller.js` — added PDF export branch (PDFKit) alongside Excel/CSV
- `backend/package.json` — added `qrcode` dependency
- `backend/controllers/complaint.controller.js` — added `qrCode()` handler
- `backend/routes/complaint.routes.js` — added `GET /qrcode/:id` route + `@openapi` annotations
- `backend/routes/auth.routes.js` — added `@openapi` annotations
- `frontend/src/app/settings/settings.component.ts` — rewritten to call the real API instead of showing static text
- `frontend/angular.json` — wired `serviceWorker`/`ngswConfigPath` into the production config
- `frontend/src/app/app.config.ts` — added `provideServiceWorker(...)`

## 4. Bug fixes (login 401, missing icons, blank charts, layout)

**Modified**
- `backend/database/seeds/seed.sql` — replaced the fabricated bcrypt hash with a real one for `Admin@12345`
- `frontend/src/index.html` — added the Material Icons font `<link>`
- `frontend/src/app/app.config.ts` — added `provideCharts(withDefaultRegisterables())`
- `frontend/angular.json` — removed Bootstrap CSS (was overriding Material component styles)
- `frontend/src/app/layouts/admin-layout/admin-layout.component.scss` — fixed topbar icon buttons (forced circular, added spacing)
- `frontend/package.json` — removed the now-unused `bootstrap` dependency

**Delivered separately (not part of the zip)**
- `debug-login.js` — standalone diagnostic script for checking DB connection / user row / bcrypt match directly

## 5. Capacitor / native mobile apps

**Added (first pass — single shared app, later superseded, see §6)**
- `frontend/capacitor.config.ts` *(removed in §6)*
- `frontend/src/app/core/services/geolocation.service.ts`

**Modified**
- `frontend/package.json` — added `@capacitor/core`, `@capacitor/android`, `@capacitor/geolocation`, `@capacitor/app`; added `cap:*` scripts *(scripts and `@capacitor/android` later removed in §6)*
- `frontend/src/app/dashboard/executive-dashboard/executive-dashboard.component.ts` — rewritten to use `GeolocationService` instead of calling `navigator.geolocation` directly
- `README.md` — added APK build section *(rewritten in §6 for the two-app setup)*

## 6. Split into two separately-branded native apps

**Added**
- `mobile/vendor-app/package.json`, `capacitor.config.ts`
- `mobile/executive-app/package.json`, `capacitor.config.ts`
- `frontend/src/app/core/services/app-identity.service.ts` — reads each shell's own `appId` at runtime to block cross-role logins

**Modified**
- `frontend/package.json` — removed `@capacitor/android`, `@capacitor/cli`, and the `cap:*` scripts (moved to each `mobile/*/package.json`); kept `@capacitor/core`, `@capacitor/geolocation`, `@capacitor/app` since those run inside the shared web bundle
- `frontend/src/app/auth/login/login.component.ts` — added the `AppIdentityService` check between login success and navigation, with logout + error message on role/app mismatch
- `README.md` — replaced the single-app APK section with the two-shell build process
- `frontend/capacitor.config.ts` — deleted (replaced by the two files under `mobile/`)

## 7. Vendor creation now includes its default user

**Modified**
- `backend/services/vendor.service.js` — `createVendor()` rewritten to create the vendor row and its default `vendor_admin` login in one transaction
- `backend/validators/vendor.validator.js` — added optional `defaultUserEmail` / `defaultUserPassword` override fields
- `frontend/src/app/core/services/vendor.service.ts` — updated `create()`'s return type to `{ vendor, defaultUser }`
- `frontend/src/app/vendors/vendor-form/vendor-form.component.ts` — handles the new response shape, shows a one-time credentials screen
- `frontend/src/app/vendors/vendor-form/vendor-form.component.html` — added the optional login-override fields and the post-create credentials card
- `frontend/src/app/vendors/vendor-form/vendor-form.component.scss` — styles for the new credentials card

## 8. Full migration from MySQL to PostgreSQL (for Neon/Supabase hosting)

**Rewritten**
- `backend/database/schema.sql` — full Postgres conversion: `SERIAL`/`BIGSERIAL` instead of `AUTO_INCREMENT`, `CHECK` constraints instead of `ENUM`, native `BOOLEAN` instead of `TINYINT(1)`, `JSONB` instead of `JSON`, `plpgsql` functions/triggers instead of MySQL's `DELIMITER` syntax, `updated_at` triggers added (Postgres has no `ON UPDATE CURRENT_TIMESTAMP` column clause)
- `backend/database/seeds/seed.sql` — quoted `"key"` column for Postgres
- `backend/config/env.js`, `db.js` — swapped to a single `DATABASE_URL` (how Neon/Supabase hand out credentials) and the `pg` driver, with SSL support and date/timestamp type parsers to preserve the previous string-based date format
- Every file in `backend/repositories/` — `?` placeholders → `$1, $2, ...`; `[rows]` destructuring → `{ rows }`; `result.insertId` → `RETURNING id`; MySQL `1`/`0` booleans → native `TRUE`/`FALSE`; `ILIKE` instead of `LIKE` for case-insensitive search
- `backend/services/auth.service.js`, `vendor.service.js`, `executive.service.js`, `notification.service.js` — raw queries converted the same way; transactions rewritten from mysql2's `conn.beginTransaction()/commit()/rollback()` to pg's `client.query('BEGIN'/'COMMIT'/'ROLLBACK')`; MySQL's `ER_DUP_ENTRY` error code replaced with Postgres's `23505`
- `backend/.env.example` — `DATABASE_URL` instead of discrete `DB_HOST`/`PORT`/`USER`/`PASSWORD`
- `backend/package.json` — `mysql2` → `pg`
- `render.yaml` — env vars updated for a single `DATABASE_URL`, connection limit lowered for Neon/Supabase free-tier caps
- `deployment/docker-compose.yml` — `mysql:8.0` service replaced with `postgres:16-alpine`
- `deployment/RENDER_DEPLOY.md` — rewritten end-to-end for Neon/Supabase instead of Aiven
- `README.md` — prerequisites and local setup section updated (`psql` instead of `mysql` client)
- `docs/01-architecture-overview.md` — MySQL references updated to PostgreSQL for consistency

