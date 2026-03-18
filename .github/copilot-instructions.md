# Copilot instructions for SplitPay

## What this project is
- React single-page app bootstrapped with Create React App (CRA).
- Routes are defined in `src/App.js` using `react-router-dom` v7.
- UI is mostly static placeholder data; real persistence is expected to come from a backend service and/or Supabase.

## Key files & architecture
- `src/index.js`: app entry point (CRA root render).
- `src/App.js`: router + page wiring. Add new views here (routes are hardcoded).
- `src/pages/*`: page-level UI. Each page currently renders a sidebar + content.
- `src/components/*`: reusable UI (currently only auth screens).
- `src/api/*`: lightweight HTTP wrappers used by UI (currently only `auth.js`).
- `src/supabaseClient.js`: Supabase client factory (currently not wired into pages).

## Integration points
- Auth calls go to a separate backend at `http://localhost:8080/api/auth/{login,register}` (see `src/api/auth.js`).
- There is no auth state management (no JWT, no localStorage/sessionStorage usage, no React context).
- Supabase config is hardcoded in `src/supabaseClient.js`; work here should migrate to CRA env vars (`REACT_APP_*`) and avoid committing secrets.

## Project conventions
- Functional components + React hooks only (`useState`, `useNavigate`).
- Styling is plain CSS imported per component (e.g., `Dashboard.css`), not CSS modules or styled-components.
- Navigation uses `useNavigate()` + `<button>`; sidebar menu is duplicated across pages.
- API calls use `fetch` and read `response.text()` (not JSON). If you add JSON APIs, be consistent and document the shape.

## Dev workflow (commands)
- `npm install` (install deps)
- `npm start` (start CRA dev server at http://localhost:3000)
- `npm test` (run CRA tests)
- `npm run build` (build production bundle)

## Notes for AI agents
- Focus on improving data flow / state management; most pages are placeholders without real data hooks.
- When introducing new routes/pages, keep sidebar + layout consistent (consider extracting to avoid duplication).
- Preserve the existing auth API shape (returns plain strings like "Success" / "Invalid username or password").
- If you update `src/supabaseClient.js`, ensure any new env vars are documented and that the app can still run with the current hardcoded keys for local dev.

---

**Checklist before committing changes**
- Confirm `npm start` still works after changes.
- Ensure the auth flow still works against `localhost:8080` if you touch login/register.
- Avoid adding new dependencies unless they are essential (there are already unused deps like `axios`).
