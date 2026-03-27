# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NOVA BODA is a **static** wedding vendor marketplace for Valencia, Spain. There is no build step — the root is the output directory.

- **Frontend**: Vanilla HTML/CSS/JS. No framework, no bundler.
- **Backend**: Supabase (Postgres + RLS, Auth JWT, Storage bucket `vendor-media`)
- **Deploy**: Cloudflare Pages — `git push origin main` triggers deploy automatically
- **Domain**: `novaboda.com` (canonical); `www.novaboda.com` redirects via `_redirects`

## Key Files

| File | Purpose |
|------|---------|
| `app.js` | All JS logic — single file, compact style (minified-looking). Cache-busted with `?v=` suffix in HTML |
| `styles.css` | All styles. Also cache-busted |
| `supabase-config.js` | Supabase URL + anon key (`window.NovaBodaSupabase`) |
| `supabase-setup-fresh.sql` | Full schema — run on a new Supabase project |
| `supabase-photos-analytics.sql` | Migration: adds `cover_photo`, `photos` columns + `vendor_events` table |
| `supabase-storage-policies.sql` | Storage RLS policies for `vendor-media` bucket |
| `_headers` | Cloudflare security headers |
| `_redirects` | Cloudflare www→non-www redirect + custom 404 |

## app.js Conventions

The entire JS codebase lives in `app.js`. Key patterns:

- `q(sel)` = `document.querySelector(sel)` — use for single-element lookups
- `qa(sel)` = `[...document.querySelectorAll(sel)]` — use for multi-element
- `sb` = Supabase client (null if `supabase-config.js` is missing or has placeholder values)
- `escHtml(s)` — XSS sanitization; **always use this** when inserting user data into `innerHTML`
- `p1(obj, keys, default)` — safe multi-key accessor (returns first non-null key's value)
- `isSub` — true when the current page is inside `/proveedores-boda-valencia/` subdirectory; used to compute relative paths (e.g. `../vendor-dashboard.html`)

Core async functions:
- `active()` — returns current session (Supabase-first, falls back to localStorage)
- `loadByUser(userId)` — fetches full vendor profile + packages + FAQs from Supabase
- `loadPublic(vendorSlugOrId)` — fetches vendor profile by slug or UUID for public pages
- `saveProfile(user, patch)` — upserts vendor row + deletes/re-inserts packages and FAQs
- `renderPublic(profile)` — populates all DOM elements on `vendor-profile.html`; also sets `<title>`, `<meta>`, canonical URL, cover photo, gallery, GA4 event

## Database Schema

Three main tables (all RLS-enabled):
- `vendors` — one row per vendor (id = auth.users.id); includes `cover_photo text`, `photos jsonb`, `verified bool`, `plan text`, `slug text unique`
- `vendor_packages` — linked by `vendor_id`; max 2 displayed
- `vendor_faqs` — linked by `vendor_id`; max 20 displayed
- `vendor_events` — analytics events (`profile_view`, `contact_submit`); anon INSERT, authenticated SELECT own

RLS pattern: `select` is public on all tables; `insert/update/delete` requires `auth.uid() = id` (or `auth.uid() = vendor_id` for child tables).

## TODO / Placeholders Still in Code

These lines in `app.js` contain placeholders that need real values before go-live:

- **Line 16**: `GA_ID = "G-XXXXXXXXXX"` — replace with real GA4 Measurement ID
- **Lines 39–40**: `STRIPE_LINK_BASIC` / `STRIPE_LINK_PRO` — replace with real Stripe Payment Link URLs
- **Line 44**: `ADMIN_EMAILS = ["admin@novaboda.es"]` — replace with real admin email(s)
- `supabase-setup-fresh.sql` line 109: same admin email placeholder in RLS policy

## Cache Busting

When you change `app.js` or `styles.css`, update the `?v=` query string in **every** HTML file that references them. The current version suffix format is `?v=YYYYMMDD[letter]` (e.g. `?v=20260326a`).

## Deploying

```bash
git add <files>
git commit -m "description"
git push origin main   # triggers Cloudflare Pages deploy automatically
```

No build command. No install step. Changes are live within ~1 minute of push.

## Supabase SQL Migrations

Run SQL migrations manually in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run). Migration files are in the repo root with `supabase-*.sql` names. Apply them in order:
1. `supabase-setup-fresh.sql` — base schema
2. `supabase-vendor-schema.sql` — vendor schema additions
3. `supabase-photos-analytics.sql` — photos + analytics
4. `supabase-plan-migration.sql` — plan/subscription columns
5. `supabase-storage-policies.sql` — storage RLS
