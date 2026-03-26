# NOVA BODA - Operations and Functions

## Purpose
This document explains the real operations currently implemented in NOVA BODA and the JavaScript functions that run them.

## 1) Platform Operations (What NOVA BODA does)

### 1.1 Public website operations
- Serves static marketing and SEO pages (`index.html`, `services.html`, `planes.html`, guides, category pages).
- Supports responsive navigation with mobile menu toggle.
- Routes users to key conversion paths: providers directory, contact, and vendor access.

### 1.2 Provider discovery operations
- Hero search accepts service terms and location.
- Matching logic can route directly to a specific category page (for strong query matches).
- Otherwise it redirects to `proveedores-boda-valencia.html` with query params (`q`, `where`).
- On the providers hub page, category cards/pills are filtered live by search text.

### 1.3 Vendor authentication operations
- Login/signup with Supabase Auth (email/password).
- Google OAuth login/signup through Supabase.
- Password recovery flow with email reset link.
- Session-aware redirect rules:
  - Logged-in vendors are sent to `vendor-dashboard.html`.
  - Logged-out users trying to access dashboard are sent to `vendors-auth.html`.
- Fallback mode (if Supabase config is unavailable): local browser session/profile storage is used.

### 1.4 Vendor profile management operations
- Vendors can edit and save:
  - Business name, category, location, description
  - Contact email, phone, response time, availability note
  - Up to 2 packages (name, price, item list)
  - Up to 20 FAQs
- Save supports:
  - Supabase persistence (`vendors`, `vendor_packages`, `vendor_faqs`)
  - LocalStorage fallback when Supabase is not active
- Vendors can sign out from dashboard.

### 1.5 Public vendor profile operations
- `vendor-profile.html` loads vendor data by `?vendor=` value.
- Lookup supports slug first, then vendor UUID id.
- If no query vendor exists, page can render the active vendor's own profile (session fallback).
- Renders provider overview, packages, FAQs, and availability dynamically.

### 1.6 Lead/contact operations
- Every `.cta-form` submits via AJAX to FormSubmit:
  - Endpoint: `https://formsubmit.co/ajax/contacto@novaboda.es`
- Adds `_captcha=false` and a standard subject.
- Handles button UI states: sending, success, failure, then reset.

### 1.7 Data and access control operations
- Supabase schema includes:
  - `vendors`
  - `vendor_packages`
  - `vendor_faqs`
- Row Level Security policies allow:
  - Public read for listing/display
  - Insert/update/delete only by authenticated owner (`auth.uid()` checks)
- Trigger updates `vendors.updated_at` on every update.

## 2) JavaScript Function Map (`app.js`)

### 2.1 Utility/selectors
- `q`, `qa`: shorthand DOM selectors.
- `parse`: safe JSON parse.
- `p1`: picks first existing key from multiple alternatives.

### 2.2 Session/profile local fallback
- `getLocalSess`, `setLocalSess`, `clearLocalSess`: local session storage.
- `getLocalMap`, `setLocalMap`: local profile map storage.
- `upLocal`: patch-update one local vendor profile.
- `getLocalProfile`: returns current logged local vendor profile.
- `def`: builds default vendor profile object.

### 2.3 Data normalization
- `normItems`: normalizes package item arrays/textarea lines.
- `normPkg`: normalizes package shape and values.
- `normFaq`: normalizes FAQ entries.

### 2.4 Auth/session and account helpers
- `sbSession`: gets active Supabase session.
- `active`: returns active session from Supabase or local fallback.
- `signOut`: signs out (Supabase if active) and clears local session.
- `ensureVendor`: upserts minimal vendor row after auth/signup.

### 2.5 Vendor read/write data layer
- `loadByUser(userId, email)`: loads vendor + packages + FAQs and merges defaults.
- `saveProfile(user, patch)`: upserts vendor header and replaces package/FAQ rows.
- `loadPublic(vendor)`: resolves vendor by slug/id and loads full profile.

### 2.6 Public profile rendering
- `renderPublic(profile)`: fills profile fields, packages, and FAQ accordion in DOM.

### 2.7 Navigation and UI state
- Mobile nav toggle handlers (`.nav-toggle`, `.nav-links`).
- `navState`: updates nav account button text/link based on session.
- Vendor card DOM normalization and CTA link rewrite for profile routing.

### 2.8 Search and routing functions
- Category hub filter handler (search input for category cards/pills).
- Hero search module functions:
  - `norm`, `tokens`
  - `routeFromQuery`
  - `open`, `close`, `render`
- Handles desktop dropdown and mobile sheet behavior.

### 2.9 Auth UI + flows
- `showTab`: switches login/signup tabs.
- `runForgotPassword`: triggers Supabase password reset email.
- `runGoogleOAuth`: starts Google OAuth flow.
- Login submit handler:
  - Supabase password sign-in, or local fallback sign-in.
- Signup submit handler:
  - Supabase signup + vendor seed, or local fallback creation.
- Reset password submit handler for recovery mode.

### 2.10 Dashboard profile + FAQ operations
- Dashboard init validates session and loads profile.
- `set`: writes profile values into form fields (supports custom select values).
- `parseItems`, `pack`, `patch`: transform form into save payload.
- `render` (FAQ admin renderer): draws FAQ list and delete actions.
- Dashboard submit saves profile; FAQ submit appends FAQ entries.

### 2.11 Form submission operations
- Global CTA form submit handler posts AJAX payload to FormSubmit endpoint.

## 3) External Integrations
- Supabase JS client (`@supabase/supabase-js@2`) for auth and DB operations.
- FormSubmit AJAX endpoint for lead capture.

## 4) Current Functional Limits
- No per-vendor lead routing yet (CTA forms go to one inbox).
- Vendor gallery upload UI exists as placeholder only.
- Many pages are static content pages with shared JS behavior rather than per-page business logic.

## 5) Source Files Behind This Document
- `app.js`
- `vendors-auth.html`
- `vendor-dashboard.html`
- `vendor-profile.html`
- `supabase-config.js`
- `supabase-vendor-schema.sql`
