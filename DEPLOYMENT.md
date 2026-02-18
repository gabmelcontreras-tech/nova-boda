# Deployment Guide (NOVA BODA)

## Recommended stack
- Static hosting: Cloudflare Pages (or Netlify/Vercel equivalent).
- Domain: `novaboda.es` as canonical host.

## 1) Publish the site
- Upload this folder as a static site project.
- Output directory: project root (no build step required).

## 2) DNS and HTTPS
- Point `novaboda.es` and `www.novaboda.es` to your host.
- Enable automatic HTTPS certificates.
- Configure 301 redirects:
  - `http://*` -> `https://*`
  - `https://www.novaboda.es/*` -> `https://novaboda.com/$1`

## 3) Verify core production files
- `https://novaboda.com/robots.txt`
- `https://novaboda.com/sitemap.xml`
- `https://novaboda.com/404.html` (custom 404 fallback)

## 4) Form delivery
- Contact forms submit via FormSubmit endpoint configured in `app.js`.
- Replace the email in `CONTACT_FORM_ENDPOINT` with the real destination.
- Confirm first submission in production and check inbox/spam.

## 5) Indexing setup
- Open Google Search Console and verify domain property.
- Submit `https://novaboda.com/sitemap.xml`.
- Keep `vendors-auth.html` as `noindex`.

## 6) Pre-launch checks
- Mobile + desktop smoke test:
  - `/`
  - `/proveedores-boda-valencia`
  - `/planes.html`
  - `/contact.html`
- Validate forms, no console errors, and no broken links.
- Run Lighthouse on key pages and fix critical issues.


