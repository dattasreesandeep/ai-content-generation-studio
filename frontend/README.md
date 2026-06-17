# AI Content Studio — Frontend (Phase 2)

React + Vite + Tailwind frontend implementing authentication and protected
routing on top of the Phase 1 FastAPI backend.

## Quick start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at http://localhost:5173. The backend is expected at the URL set in
`VITE_API_BASE_URL` (defaults to `http://localhost:8000`).

## What's implemented

- **Routing**: `react-router-dom` with `/login`, `/register`, `/dashboard`.
- **State management**: `AuthContext` + `useReducer` (`authReducer.js`) —
  no external state library, matches the Phase 2 brief ("Configure Context
  API and reducers").
- **Protected routes**: `ProtectedRoute` redirects to `/login` (preserving
  the originally requested path) when there's no valid session.
  `PublicOnlyRoute` redirects already-authenticated users away from
  `/login` / `/register`.
- **Session persistence**: JWT stored in `localStorage`; on app boot, the
  token (if present) is validated against `GET /auth/me` before the user is
  considered authenticated, so an expired/revoked token doesn't grant a
  false-positive session.
- **Forms**: client-side validation (required fields, email format, password
  length, password confirmation match) before any network call, plus
  server-side error display (e.g. "Invalid credentials", duplicate email).

## ⚠️ API contract assumption

No backend schema existed yet at the time this was built, so the frontend
was written against this assumed contract. **Align the FastAPI routes to
this, or update `src/api/auth.js` if the real contract differs:**

| Method | Path | Body | Success response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ access_token, token_type: "bearer", user: { id, name, email } }` |
| POST | `/auth/login` | `{ email, password }` | `{ access_token, token_type: "bearer", user: { id, name, email } }` |
| GET | `/auth/me` | — (Bearer token) | `{ id, name, email }` |

Errors are expected as FastAPI's standard `{ "detail": "..." }` (string) or
Pydantic's validation array `{ "detail": [{ "msg": "...", ... }] }` — both
shapes are handled in `src/api/client.js`.

## Folder structure

```
src/
  api/         fetch wrapper + auth endpoint functions
  components/  shared UI (FormField, Button, BrandPanel)
  context/     AuthContext provider + authReducer
  pages/       Login, Register, Dashboard, NotFound
  routes/      ProtectedRoute, PublicOnlyRoute
  utils/       client-side validators
```

## Definition of Done — status

- [x] Users can authenticate from the frontend (register + login call the
      backend, store the JWT, populate user state).
- [x] Protected pages are inaccessible without login (`/dashboard` redirects
      to `/login` when unauthenticated; redirects back after sign-in).
