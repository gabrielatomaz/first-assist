# Requirements Detail — User Authentication (FEAT-001)

This details requirements FR-001 to FR-004 mapped to user stories.

## FR-001 — User Login Detail
* **Actor**: Administrator, FTA, CSA
* **Input Fields**: `email` (string, validated), `password` (string).
* **Validation**: Non-empty fields, email regex verification.
* **Backend Validation**:
  * Check account status (`ACTIVE` vs `INACTIVE`).
  * Check password against bcrypt hash in database.
* **HTTP Target**: `POST /api/auth/login`
* **Response**: `200 OK` + JWT, or `401 Unauthorized`.

## FR-002 — Logout Detail
* **Actor**: Logged-in User
* **Client Behavior**: Clears `localStorage.removeItem('token')`, triggers Pinia store state reset, routes to `/login`.

## FR-003 — Recover Password Detail
* **Actor**: Unauthenticated User
* **Main Flow**: Submits email to `POST /api/auth/recover` → Backend validates account exists → Generates temporary token.

## FR-004 — Maintain Session Detail
* **Actor**: Authenticated User
* **Client Behavior**: Pinia auth store reads JWT on lifecycle mount.
