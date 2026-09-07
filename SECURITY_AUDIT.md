# Security audit — 02/09/2026

## Fixed in this build

1. **Critical dependency exposure** — project previously allowed Next.js 16.0.x and React 19.2.0. Updated package ranges to Next.js >=16.3.3 line and React 19.2.8 line to include published security fixes current at audit time.
2. **Supabase removed** — no Supabase dependency, config, service/anon keys, schema, or registration call remains.
3. **Turnstile fail-open** — fixed. Production now rejects registration if Turnstile secret is missing or verification fails.
4. **Weak request-size guard** — fixed. API reads raw body and enforces an actual UTF-8 byte cap rather than trusting Content-Length.
5. **Origin validation** — tightened to explicit production origins; no longer derives trust from arbitrary Host alone.
6. **Cross-site form abuse** — checks Origin plus Sec-Fetch-Site.
7. **Spreadsheet formula injection** — Apps Script escapes values beginning with `=`, `+`, `-`, `@` before writing cells.
8. **Duplicate race condition** — email/SĐT duplicate check runs under Apps Script LockService.
9. **Abuse throttling** — HMAC(IP) is sent server-to-server only and used by CacheService for 5 attempts / 10 minutes. Neither raw IP nor hash is stored in Sheet.
10. **Secret leakage** — webhook secret moved into POST body server-to-server, not URL query string. No secret is exposed to browser bundles.
11. **Input validation** — Zod on Vercel and second validation layer in Apps Script.
12. **Error leakage/cache** — generic client errors and no-store API responses.
13. **Headers** — CSP/HSTS/frame-deny/nosniff/Permissions-Policy/COOP/CORP remain enabled and were tightened with script-src-attr, worker-src and manifest-src.

## Residual limitations

- No public web application can be made impossible to attack.
- Apps Script CacheService is best-effort distributed throttling, not a full managed WAF.
- CSP still allows inline scripts/styles for compatibility with the current Next.js/client implementation. React escaping and the absence of `dangerouslySetInnerHTML` materially reduce XSS exposure, but a nonce/hash-based CSP would be stronger and would require a broader rendering/middleware refactor.
- Google Sheets is appropriate for a small/medium event form, not a high-concurrency transactional database.
- Account compromise remains a major risk; use MFA and least-privilege sharing on Google/GitHub/Vercel.

## Verification note

Static source review was completed. Package installation/build could not be completed inside the audit container because npm dependency installation timed out, so run `npm install && npm run build && npm run lint` locally or let Vercel perform the final build after pushing.
