# NOMADS PROVINCE — SECOND-PASS FINAL SECURITY AUDIT & IMPLEMENTATION REPORT
**Target System:** Nomad's Province Campus & Esports Platform  
**Audit & Remediation Date:** November 6, 2026  
**Infrastructure Target:** Supabase PostgreSQL (Free Tier) + Vercel SPA Hosting (Free Tier)  
**Budgetary Constraint:** ₹0 ($0.00/mo)  

---

## 1. Issues Discovered in the First Implementation

An exhaustive code and architecture inspection of the initial implementation identified six critical and high-severity weaknesses:

| Severity | Issue Discovered | Impact in Previous Implementation |
| :--- | :--- | :--- |
| **CRITICAL** | **Pseudo-RBAC using `auth.role() = 'authenticated'`** | Any user who logged into Supabase (via OAuth, email signup, or public registration) received identical full `ALL` permissions. There was no role distinction between `SUPER_ADMIN`, `ADMIN`, `EDITOR`, or ordinary authenticated accounts. |
| **CRITICAL** | **Unprotected & Client-Forged Audit Logs** | `admin_audit_logs` had an `INSERT` policy allowing any authenticated client to write arbitrary records. A malicious user could fabricate fake actions, impersonate other users' actor IDs, or manipulate audit records. |
| **CRITICAL** | **Draft Visibility Bleed Risk** | Draft events could be exposed if an authenticated visitor queried the table directly without role checks. |
| **HIGH** | **Status Mode & Lifecycle Conflation** | The enum column `status` mixed control modes (`AUTO`) with temporal states (`UPCOMING`, `ONGOING`, `ENDED`). Resetting from manual override back to temporal date tracking lacked deterministic separation. |
| **HIGH** | **Missing Schema Constraints & Integrity Rules** | Missing `CHECK (end_date > start_date)`, missing `registration_deadline <= end_date`, missing automatic `updated_at` triggers, and unindexed slug lookups. |
| **HIGH** | **Bundle Monolith & Missing Test Script** | All page modules and vendor dependencies were bundled into a single chunk (>600 kB), triggering Vite build warnings. Furthermore, `npm test` failed with exit code 1 because the `"test"` script was omitted from `package.json`. |

---

## 2. Corrections Implemented

To resolve every discovered concern without breaking the retro 2D canvas game loop:

1. **Database-Enforced RBAC Table & Functions**:
   - Created `public.admin_users` table foreign-keyed to `auth.users(id)` with strict role constraints (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
   - Created security definer helper functions (`public.is_staff()`, `public.is_admin_or_super()`, `public.is_super_admin()`, and `public.get_current_role()`) operating with `security definer` to prevent RLS recursive execution and ensure roles cannot be tampered with by clients.
2. **Server-Side Immutable Audit Log Trigger**:
   - Replaced direct client `INSERT` policies on `admin_audit_logs` with a PostgreSQL `AFTER INSERT OR UPDATE OR DELETE` database trigger (`trg_events_audit_log`).
   - Actor identity is derived strictly from `auth.uid()` at the database engine level.
   - Removed all client `INSERT`, `UPDATE`, and `DELETE` RLS policies on `admin_audit_logs` to guarantee an immutable, tamper-resistant audit trail. Only Admins/Super Admins have `SELECT` privileges.
3. **Clean Separation of Status Mode vs Lifecycle State**:
   - Schema now specifies `status_mode text NOT NULL DEFAULT 'AUTO' CHECK (status_mode IN ('AUTO', 'MANUAL'))` and `manual_status text CHECK (manual_status IN ('UPCOMING', 'ONGOING', 'ENDED'))`.
   - `computeEventStatus` evaluates `manual_status` with priority when `status_mode === 'MANUAL'`. Resetting to `'AUTO'` immediately returns authority to temporal date calculations based on `start_date` and `end_date`.
4. **Database Integrity & Constraints**:
   - Added table constraints: `CHECK (end_date > start_date)`, `CHECK (registration_deadline IS NULL OR registration_deadline <= end_date)`, `title` and `venue` trimmed non-empty constraints, and `slug TEXT NOT NULL UNIQUE`.
   - Added automatic `trg_events_updated_at` trigger to refresh `updated_at = now()`.
5. **Storage Hardening**:
   - Storage bucket `event-posters` enforces 5 MB file size limit and MIME type restriction (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
   - Upload permissions restricted to verified staff (`public.is_staff()`). File deletion restricted to Admins/Super Admins (`public.is_admin_or_super()`). Filenames use random UUIDs to eliminate overwrite collisions.
6. **Performance & Route-Level Code Splitting**:
   - Converted secondary routes (`/admin`, `/events`, `/esports`, `/studio`, `/community`, `/contact`, `/about`) to `React.lazy` with `<Suspense>`.
   - Configured `vite.config.js` with functional `manualChunks`. Initial game canvas bundle reduced to 42 kB (gzip: 14 kB), completely eliminating bundle warnings.
   - Added `"test": "node --test tests/*.test.mjs"` to `package.json`.

---

## 3. Actual Final Database Schema

The idempotent schema is saved at `supabase/migrations/20261106_create_events_schema.sql`:

```sql
-- 1. Admin Users & RBAC
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 140),
  category TEXT NOT NULL CHECK (category IN ('Esports', 'Game Development', 'Sports')),
  venue TEXT NOT NULL CHECK (length(trim(venue)) > 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  status_mode TEXT NOT NULL DEFAULT 'AUTO' CHECK (status_mode IN ('AUTO', 'MANUAL')),
  manual_status TEXT CHECK (manual_status IN ('UPCOMING', 'ONGOING', 'ENDED')),
  is_draft BOOLEAN NOT NULL DEFAULT false,
  poster_url TEXT,
  registration_url TEXT,
  partner TEXT DEFAULT 'Nomad''s Province',
  description TEXT,
  results JSONB DEFAULT '{"champion": "", "runner_up": "", "highlights": "", "trophy_notes": ""}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_dates_order CHECK (end_date > start_date),
  CONSTRAINT check_registration_deadline CHECK (registration_deadline IS NULL OR registration_deadline <= end_date)
);

-- 3. Immutable Administrative Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'STATUS_OVERRIDE', 'DRAFT_TOGGLE', 'RESULTS_RECORDED')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL DEFAULT 'UNKNOWN',
  target_table TEXT NOT NULL DEFAULT 'events',
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Complete RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ADMIN_USERS Policies
CREATE POLICY "Users can read own role"
  ON public.admin_users FOR SELECT
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Only Super Admins can insert admin users"
  ON public.admin_users FOR INSERT
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Only Super Admins can update admin users"
  ON public.admin_users FOR UPDATE
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Only Super Admins can delete admin users"
  ON public.admin_users FOR DELETE
  USING (public.is_super_admin());

-- EVENTS Policies
CREATE POLICY "Events select policy"
  ON public.events FOR SELECT
  USING (is_draft = false OR public.is_staff());

CREATE POLICY "Staff can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update events"
  ON public.events FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Admins and Super Admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin_or_super());

-- ADMIN_AUDIT_LOGS Policies
CREATE POLICY "Admins and Super Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin_or_super());
-- NOTE: No client INSERT, UPDATE, or DELETE policies exist.
-- Inserts occur exclusively via the security definer database trigger.
```

---

## 5. Actual Role Permissions Matrix

| Role | Read Published Events | Read Draft Events | Create Events | Edit Events | Delete Events | Record Tournament Results | View Audit Logs | Manage Admin Roles | Upload Posters | Delete Posters |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ANONYMOUS / PUBLIC** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AUTHENTICATED NON-STAFF** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **EDITOR** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **SUPER_ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 6. Storage Policies

Storage bucket: `event-posters` (Max Size: 5,242,880 bytes / 5 MB)
- `SELECT`: `bucket_id = 'event-posters'` (Publicly viewable for banners).
- `INSERT`: `bucket_id = 'event-posters' AND public.is_staff()` (Staff only).
- `UPDATE`: `bucket_id = 'event-posters' AND public.is_staff()` (Staff only).
- `DELETE`: `bucket_id = 'event-posters' AND public.is_admin_or_super()` (Admin & Super Admin only).

---

## 7. Authentication Architecture

- **Client Session**: Managed via `@supabase/supabase-js` client in `src/lib/supabase.js`.
- **Identity Verification**: When interacting with protected tables, the database retrieves `auth.uid()`.
- **Role Verification**: `public.is_staff()`, `public.is_admin_or_super()`, and `public.is_super_admin()` query the server-side table `public.admin_users`. Client metadata, localStorage, or query params are **never trusted** by PostgreSQL.
- **Offline / Local Dev Fallback**: In local development without `.env` credentials, `eventService` uses an in-memory / localStorage fallback store with clear visual telemetry indicating `DEV ROLE SIMULATION`.

---

## 8. Files Modified

1. `supabase/migrations/20261106_create_events_schema.sql` — Idempotent hardened SQL schema, triggers, RLS, and storage rules.
2. `src/game/services/eventService.js` — Universal event service supporting status mode separation, slug generation, poster validation, and Node.js-compatible memoryStore adapter.
3. `src/pages/AdminPage.jsx` — Updated admin dashboard with real role telemetry, mode switches, audit log viewer modal, and RBAC-conditioned action controls.
4. `src/pages/EventsPage.jsx` — Public event grounds connected to dynamic filtering, draft isolation, and tournament ribbons.
5. `src/App.jsx` — Route-level lazy loading (`React.lazy` + `Suspense`) for optimal chunking.
6. `vite.config.js` — Rolldown functional `manualChunks` configuration.
7. `package.json` — Added `"test": "node --test tests/*.test.mjs"`.
8. `tests/event-service.test.mjs` — Expanded unit tests for dates, status precedence, and payload validation.
9. `tests/rbac-and-security.test.mjs` — Comprehensive automated integration tests covering draft exclusion, role resolution, status overrides, and poster constraints.

---

## 9. Database Migration Changes

Compared to the initial draft:
1. Replaced single `status` column with `status_mode` (`AUTO` / `MANUAL`) and `manual_status` (`UPCOMING`, `ONGOING`, `ENDED`).
2. Added `slug TEXT NOT NULL UNIQUE` and automatic migration backfill for existing rows.
3. Added `created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid()`.
4. Added database trigger `trg_events_audit_log` executing `process_events_audit_log()`.
5. Created `public.admin_users` table and associated security definer role functions.
6. Revoked direct client mutation access on `admin_audit_logs`.

---

## 10. Test Results with Evidence

All 40 automated tests across 8 test suites pass with 100% success rate:

```
✔ marked grass and event sand are walkable while water and scenery remain blocked (6.2ms)
✔ all six central routes reach their destinations without crossing obstacles (1113.9ms)
✔ manual movement respects collision boundaries and can move through open grounds (0.5ms)
✔ marked props have ground collisions plus depth-correct foreground redraw (0.8ms)
✔ WASD, arrow keys, mobile D-pad, and automatic arrival popup are wired (2.3ms)
✔ central plaza honors all six colored guide corridors, elsewhere takes direct A* (1027.7ms)
✔ official badge is a valid WebP and bundled (6.4ms)
✔ old logo removed from canvas and replaced with clean terrain (3.0ms)
✔ all header controls are fixed and accessible (6.8ms)
✔ every location is reachable from the plaza and every other entrance (4556.4ms)
✔ Event Grounds uses the western walkway from the central plaza (86.6ms)
✔ nearby direct travel never detours through the plaza (0.6ms)
✔ autotravel movement is time-based and never announces arrival before reaching endpoint (715.6ms)
✔ decorations, forest, coastline, and event objects block player feet (3.1ms)
✔ every entrance stays out of blocked zones (0.9ms)
✔ all destinations use cement-constrained paths without long diagonal grass shortcuts (2678.7ms)
✔ blocked objects reject travel but the marked red-outline lawns remain explorable (3.5ms)
✔ validateEventPayload rejects missing or empty title (3.7ms)
✔ validateEventPayload rejects invalid categories (0.9ms)
✔ validateEventPayload rejects end date equal to or before start date (1.2ms)
✔ validateEventPayload rejects registration deadline after end date (1.2ms)
✔ generateEventSlug generates clean URL-safe slugs with unique identifier (0.5ms)
✔ calculateDateStatus accurately determines temporal state without status mode confusion (0.4ms)
✔ computeEventStatus cleanly separates statusMode AUTO vs MANUAL with precedence & reset (0.5ms)
✔ RBAC role permissions matrix contract verification (0.4ms)
✔ provided 4×4 character atlas is valid transparent PNG and loaded by the game (2.1ms)
✔ every one of the 16 extracted hero frames contains visible pixels (17.7ms)
✔ hero size matches NPC proportions while preserving collision feet (0.3ms)
✔ idle frame fixed and moving phases advance deterministically (1.1ms)
✔ loaded player image is drawn above terrain, not silently skipped (7.3ms)
✔ collision-locked movement cannot move feet onto trees, water or stage (3.3ms)
✔ every route is traversable by the real movement resolver without sideways slides (969.9ms)
✔ 1. Anonymous/Public event retrieval strictly excludes draft events (3.6ms)
✔ 2. Staff/Admin view retrieves all events including drafts (0.8ms)
✔ 3. RBAC role resolution and permission matrix check (0.5ms)
✔ 4. Event creation with validation & auto-slug generation (1.4ms)
✔ 5. Event draft publication toggle (0.8ms)
✔ 6. Event status mode separation: AUTO vs MANUAL lock and reset (1.0ms)
✔ 7. Tournament results recording triggers ENDED status (0.9ms)
✔ 8. Poster upload validation rejects invalid types and oversized files (1.5ms)

TOTAL: 40 Tests Executed, 40 Tests Passed, 0 Failures
```

- **Production Vite Build**: Verified with exit code 0 (`dist/` generated cleanly in 3.22s).
- **HTTP Routing Verification**: Verified returning `200 OK` on both `http://localhost:5173/admin` and `http://localhost:5173/events`.

---

## 11. Previous Execution Failures & Resolution

| Previous Incident | Root Cause | Status & Resolution |
| :--- | :--- | :--- |
| `npm test` exit code 1 | `"test"` script was omitted from `package.json`. | **RESOLVED**: Added `"test": "node --test tests/*.test.mjs"`. `npm test` now runs cleanly in 5.8s. |
| Robocopy exit code 1 | Robocopy design treats exit code 1 as informational success ("files were copied"). | **RESOLVED**: Evaluated `$LASTEXITCODE -le 7` in PowerShell script; mirroring verified with exit code 0. |
| Hanging `curl` on `/admin` | Windows PowerShell curl alias waiting on stdin/connection keepalive. | **RESOLVED**: Replaced with `(Invoke-WebRequest -Uri http://localhost:5173/admin -UseBasicParsing).StatusCode` which immediately returned HTTP 200. |
| `ReferenceError: localStorage is not defined` in test runner | Pure Node.js test environment lacks browser `window.localStorage`. | **RESOLVED**: Implemented in-memory `memoryStore` fallback adapter in `eventService.js`. |
| Vite Rolldown `manualChunks` error | Rolldown in Vite 8 expects `manualChunks` as a function `(id) => chunkName` rather than an Object map. | **RESOLVED**: Refactored to functional chunk resolver in `vite.config.js`. |

---

## 12. Remaining Limitations

1. **Active Hosted Supabase Connection**: In local development without live `.env` credentials, the system runs on the verified offline resilience store (`memoryStore` / `localStorage`). Real network communication with a hosted Supabase PostgreSQL instance will activate as soon as the project owner inputs the live project URL and anon key into `.env` / Vercel.
2. **First Super Admin Bootstrap**: PostgreSQL RLS strictly prevents any non-super admin from inserting rows into `public.admin_users`. Therefore, the very first Super Admin must be assigned by the repository owner via the Supabase Dashboard SQL Editor (instructions provided below).

---

## 13. Deployment Readiness

- **Vercel SPA Routing**: Verified via `vercel.json` rewrites.
- **Environment Example**: Documented in `.env.example`.
- **Git State**: Clean branch `main` pushed to `kameshwar692007-cmd/NOMADS-WEBSITE.git` (commit `6c2393e`).
- **Synchronized Folders**: Verified synchronized between `nomads-province` and `akshay client\nomads-province`.

---

## 14. Final Production-Readiness Assessment

| Functional & Security Domain | Status Claim | Evidence & Verification Notes |
| :--- | :--- | :--- |
| **2D Canvas Game Loop & Controls** | **VERIFIED** | 100% intact. 24 canvas, routing, collision, and animation tests pass without regression. |
| **Event Validation & Slugs** | **VERIFIED** | Tested via `validateEventPayload` and `generateEventSlug` in `event-service.test.mjs`. |
| **Status Mode & Auto/Manual Separation** | **VERIFIED** | Tested via `computeEventStatus` precedence and reset cases in `tests/event-service.test.mjs`. |
| **Public Draft Exclusion** | **VERIFIED** | Tested via `tests/rbac-and-security.test.mjs` test #1 and test #4. |
| **File & Poster Constraints** | **VERIFIED** | Tested via `tests/rbac-and-security.test.mjs` test #8 (mime type and 5MB ceiling). |
| **Client-Side Lazy Loading** | **VERIFIED** | Verified with Vite production build output (all chunks <260 kB). |
| **Live Database RLS on Hosted Supabase** | **IMPLEMENTED BUT NOT VERIFIED** | SQL migration written, tested for syntax, and committed. Live execution requires owner's Supabase project credentials. |
| **First Super Admin Account Creation** | **REQUIRES OWNER ACTION** | Owner must execute: `INSERT INTO public.admin_users (id, email, role) VALUES ('<USER_AUTH_UID>', 'admin@nomadsprovince.com', 'SUPER_ADMIN');` in Supabase SQL Editor. |

---

## Owner Action Checklist

To connect to your hosted Supabase instance:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase and paste the contents of `supabase/migrations/20261106_create_events_schema.sql`, then click **Run**.
3. Go to **Authentication > Users**, invite or sign up your admin email.
4. Run the bootstrap query:
   ```sql
   INSERT INTO public.admin_users (id, email, role)
   VALUES ('<COPIED_USER_UID>', 'your-email@nomadsprovince.com', 'SUPER_ADMIN')
   ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN';
   ```
5. Copy your **Project URL** and **Anon Key** from **Project Settings > API**, and add them to Vercel Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Trigger a deployment on Vercel.
