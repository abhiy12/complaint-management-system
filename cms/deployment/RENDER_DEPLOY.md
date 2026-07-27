# Deploying to Render with Neon or Supabase (PostgreSQL)

## 1. Create the database

**Neon** (https://neon.tech):
1. Sign up free, **Create a project**.
2. On the project dashboard, **Connection Details** panel gives you a ready-made connection
   string — copy it. It looks like:
   ```
   postgresql://user:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   That whole string is your `DATABASE_URL`.

**Supabase** (https://supabase.com):
1. Sign up free, **New project**, set a database password (remember it).
2. **Project Settings → Database → Connection string** → copy the **URI** format (not the individual host/port fields). It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the password you set, and that's your `DATABASE_URL`.
   Supabase also offers a **connection pooler** string (port 6543) — prefer that one if
   available, since Render's free-tier + Supabase's free-tier both have low connection caps.

## 2. Load the schema

**With a local `psql` client:**
```bash
psql "<YOUR_DATABASE_URL>" -f backend/database/schema.sql
psql "<YOUR_DATABASE_URL>" -f backend/database/seeds/seed.sql
```

**No local `psql`?**
- **Neon**: dashboard → **SQL Editor** → paste the contents of `schema.sql`, run it, then paste and run `seed.sql`.
- **Supabase**: dashboard → **SQL Editor** → same approach.

## 3. Push the project to GitHub

Render deploys from a Git repo, not a zip upload:
```bash
cd cms
git init
git add .
git commit -m "Initial commit"
```
Create an empty repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```
The included `.gitignore` already keeps `.env`, `node_modules`, and build output out of the repo.

## 4. Deploy the blueprint on Render

1. https://render.com → **New → Blueprint**
2. Connect GitHub, select your repo. Render reads `render.yaml` and shows two services:
   `cms-backend` and `cms-frontend`.
3. Fill in the `sync: false` env vars it prompts for:
   - `DATABASE_URL` → the full connection string from step 1
   - `CLIENT_ORIGIN` → put `https://cms-frontend.onrender.com` for now (fixed in step 6 if wrong)
   - SMTP fields → leave blank if you don't need email yet
4. **Apply** — both services build and deploy, a few minutes.

## 5. Point the frontend at the real backend URL

Angular bakes `apiUrl`/`socketUrl` into the build at compile time — there's no runtime env
injection for a static site — so this has to happen after the backend is live:

1. Copy `cms-backend`'s exact URL from the Render dashboard.
2. Edit `frontend/src/environments/environment.prod.ts` locally:
   ```ts
   apiUrl: 'https://cms-backend.onrender.com/api',
   socketUrl: 'https://cms-backend.onrender.com',
   ```
3. Commit and push — Render auto-redeploys the frontend:
   ```bash
   git add frontend/src/environments/environment.prod.ts
   git commit -m "Point frontend at deployed backend URL"
   git push
   ```

## 6. Fix CORS

1. Once `cms-frontend` redeploys, copy its URL.
2. Render dashboard → `cms-backend` → **Environment** → set `CLIENT_ORIGIN` to that exact URL
   (no trailing slash) → saves and auto-redeploys.

## 7. Verify

Visit the frontend URL, log in with `admin@example.com` / `Admin@12345` (from the seed data) —
**change this password immediately**, since it's now public. Dev tools → Network tab → confirm
`/api/auth/login` succeeds with no CORS error.

## Known limitations on the free tiers

- **Render cold starts**: free web services sleep after 15 minutes idle, ~30-60s to wake on the
  next request.
- **Ephemeral filesystem**: `backend/uploads/` (complaint photos) is wiped on every Render
  redeploy/restart — fine for testing, needs S3/Cloudinary for real production use.
- **Connection caps**: both Neon's and Supabase's free tiers cap concurrent connections fairly
  low. `DB_CONNECTION_LIMIT: 5` in `render.yaml` is deliberately conservative — if you see
  "too many connections" errors, lower it further rather than raise it, or switch to Supabase's
  pooler connection string (port 6543) if you haven't already.
- **Neon autosuspend**: Neon's free tier also suspends the database itself after inactivity —
  the first query after idle time takes an extra second or two to wake it, similar to Render's
  cold start.
