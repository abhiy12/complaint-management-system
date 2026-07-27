# Folder Structure

## Backend (`backend/`)

```
backend/
├── config/
│   ├── db.js                # MySQL pool (mysql2/promise)
│   ├── env.js                # loads & validates .env via Joi
│   ├── socket.js              # socket.io init + room logic
│   └── swagger.js             # swagger-jsdoc/ui setup
├── controllers/
│   ├── auth.controller.js
│   ├── vendor.controller.js
│   ├── vendorUser.controller.js
│   ├── executive.controller.js
│   ├── complaint.controller.js
│   ├── report.controller.js
│   └── notification.controller.js
├── services/                  # business logic, orchestrates repositories
│   ├── auth.service.js
│   ├── vendor.service.js
│   ├── executive.service.js
│   ├── complaint.service.js   # state machine, assignment rules, leave check
│   ├── report.service.js
│   └── notification.service.js
├── repositories/               # only layer touching MySQL
│   ├── user.repository.js
│   ├── vendor.repository.js
│   ├── executive.repository.js
│   ├── complaint.repository.js
│   └── auditLog.repository.js
├── middleware/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── validate.js
│   ├── rateLimiter.js
│   ├── upload.js               # multer config
│   └── errorHandler.js
├── validators/                 # Joi schemas, one file per module
│   ├── auth.validator.js
│   ├── vendor.validator.js
│   └── complaint.validator.js
├── routes/
│   ├── auth.routes.js
│   ├── vendor.routes.js
│   ├── vendorUser.routes.js
│   ├── executive.routes.js
│   ├── complaint.routes.js
│   ├── report.routes.js
│   ├── notification.routes.js
│   └── index.js                # mounts all routers under /api
├── socket/
│   ├── index.js
│   └── handlers/
│       ├── location.handler.js
│       └── complaint.handler.js
├── models/                     # optional: if using an ORM instead of raw SQL
├── utils/
│   ├── logger.js               # winston
│   ├── mailer.js                # nodemailer
│   ├── jwt.js
│   ├── apiResponse.js
│   └── complaintNumberGenerator.js
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── views/                  # .sql files for report views
├── uploads/
├── logs/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
├── .env.example
├── app.js                      # express app, middleware wiring
├── server.js                   # http server + socket.io bootstrap
└── package.json
```

## Frontend (`src/app/`)

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts     # attaches access token
│   │   └── error.interceptor.ts     # handles 401 → refresh flow
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── socket.service.ts
│   │   ├── notification.service.ts
│   │   └── google-maps.service.ts
│   └── models/                       # shared TS interfaces (User, Complaint, etc.)
├── shared/
│   ├── components/                    # buttons, cards, status-badge, timeline
│   ├── pipes/
│   ├── directives/
│   └── material.module.ts             # or standalone imports barrel
├── layouts/
│   ├── admin-layout/
│   ├── vendor-layout/
│   └── executive-layout/
├── auth/
│   ├── login/
│   ├── forgot-password/
│   └── reset-password/
├── dashboard/
│   ├── admin-dashboard/
│   ├── vendor-dashboard/
│   └── executive-dashboard/
├── vendors/
│   ├── vendor-list/
│   └── vendor-form/
├── vendor-users/
│   ├── vendor-user-list/
│   └── vendor-user-form/
├── executives/
│   ├── executive-list/
│   ├── executive-form/
│   └── executive-tracking-map/
├── complaints/
│   ├── complaint-list/
│   ├── complaint-form/
│   ├── complaint-details/
│   ├── complaint-timeline/
│   └── assign-complaint/
├── reports/
│   ├── dashboard-reports/
│   └── custom-report/
├── notifications/
│   └── notification-center/
├── settings/
├── profile/
├── app.routes.ts                       # lazy-loaded, role-guarded
└── app.config.ts
```

## Route-to-Role Mapping (drives lazy loading + guards)

| Route prefix | Guarded roles |
|---|---|
| `/admin/**` | super_admin |
| `/vendor/**` | vendor_admin, vendor_sub_user |
| `/executive/**` | executive |
| `/auth/**` | public |

Each top-level route is a lazy-loaded Angular route (`loadChildren`), so a Vendor Sub User's browser never downloads the Super Admin or Executive bundles.

---
Next: full MySQL DDL (`04-schema.sql`) implementing the ER diagram above — tables, foreign keys, indexes, the audit trigger, and the report views — once you've had a chance to review the architecture and ERD.
