# NOVA BODA – Project Summary

Summary of what’s accomplished so you can continue in another chat.

---

## 1. Site structure

**Root pages:**
- `index.html` – Landing/home
- `services.html` – Dedicated services page
- `planes.html` – Dedicated pricing/plans page
- `contact.html` – Contact form
- `vendors-auth.html` – Vendor login/signup (with password confirmation)
- `vendor-profile.html` – Vendor profile template (customer-facing)
- `proveedores-boda-valencia.html` – Providers hub
- `404.html` – Custom 404
- `privacy-policy.html`, `terms.html`, `cookies.html` – Legal pages

**Category pages (under `proveedores-boda-valencia/`):**
- 26 category pages (fotografos, catering, fincas, dj, bandas, etc.), each with content and FAQs

**Guides:**
- `guia-presupuesto-boda-valencia.html`
- `guia-calendario-proveedores-boda-valencia.html`
- `guia-finca-vs-salon-boda-valencia.html`
- `guia-musica-boda-dj-vs-banda-valencia.html`

---

## 2. Navigation & links

- **Contacto** – Points to `contact.html` (or `../contact.html`) everywhere
- **Planes** – Points to `planes.html` (or `../planes.html`) everywhere
- **Servicios** – Points to `services.html` (or `../services.html`) everywhere
- **Proveedores** – Points to hub or self when on hub
- **Iniciar sesión** – Points to `vendors-auth.html`
- **Solicitar info** (vendor cards) – All route to `vendor-profile.html` (or `../vendor-profile.html`)

---

## 3. SEO

**Technical:**
- Canonical URLs on all main pages (aligned with actual URLs, e.g. `proveedores-boda-valencia.html`)
- `sitemap.xml` with all public URLs
- `robots.txt` allowing crawl + sitemap reference
- `noindex` on `vendors-auth.html` and `404.html`

**On-page:**
- OG/Twitter tags on index, services, planes, contact, vendor-profile, hub, and category pages
- JSON-LD on key pages (Organization, WebSite, WebPage, BreadcrumbList; FAQPage on category pages)

**Content:**
- Expanded content + FAQs on all category pages
- 4 guide pages targeting long-tail queries, with internal links to categories

---

## 4. Forms & backend

- **Contact forms** – Submit via FormSubmit to `contacto@novaboda.es` (all `.cta-form` instances)
- **Vendor signup** – Client-side password confirmation validation
- No real backend; site is static HTML/CSS/JS

---

## 5. Assets

- `styles.css` – Global styling
- `app.js` – Nav toggle, category search, auth tabs, form submit handler, vendor-card href rewrite
- `assets/` – Logos, placeholders, etc.

---

## 6. Deployment & docs

- `DEPLOYMENT.md` – Hosting, DNS, HTTPS, forms, Search Console
- `week3-offpage-seo-plan.md` – Off-page SEO plan
- `outreach-email-templates.md` – Outreach templates
- `gbp-optimization-checklist.md` – Google Business Profile checklist
- `week3-kpi-tracker.csv` – KPI tracking template

---

## 7. Domain & hosting

- Domain used in metadata/canonicals: `novaboda.es`
- Static site, no build step; ready for Cloudflare Pages, Netlify, Vercel, etc.

---

## 8. Not implemented yet (candidates for next session)

- **Per-vendor pages** – Only one template profile exists; no slug-based vendor URLs
- **Vendor dashboard** – No provider-facing dashboard for profile/leads
- **Real auth/backend** – Vendors-auth is UI-only; no database or authentication
- **Analytics** – No GA/Plausible wired yet
- **Per-vendor contact routing** – All contact forms go to same FormSubmit email

---

## 9. Key file paths

- Root HTML: `index.html`, `services.html`, `planes.html`, `contact.html`, `vendor-profile.html`, `vendors-auth.html`, `proveedores-boda-valencia.html`
- Category pages: `proveedores-boda-valencia/*.html`
- Scripts: `app.js`
- Styles: `styles.css`
- Config: `robots.txt`, `sitemap.xml`
