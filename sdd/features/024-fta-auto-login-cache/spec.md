# Feature Specification: FEAT-024 — FTA First-Use Auto-Login via Cached Request Token

**Feature ID**: FEAT-024  
**Feature Name**: FTA First-Use Auto-Login via Cached Request Token  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-001 (User Login), FR-003 (Role-Based Access Control), FEAT-022 (FTA Event Access Request System)  

---

## 1. Overview & Purpose

When a prospective FIRST Technical Advisor (FTA) submits an event access request via `LoginView.vue`, they currently must wait for an Administrator to approve their request, receive temporary credentials out-of-band, and manually log in.

This feature streamlines the onboarding flow:
1. **Cached Access Request Token**: When an access request is submitted, a cryptographically signed request secret token is stored in client-side secure local storage (`fta_pending_access_token`).
2. **Auto-Polling / Background Verification**: The client app periodically checks request status via `GET /api/access-requests/status-check`.
3. **Seamless Auto-Login**: Upon Admin approval in `AdminDashboardView.vue`, the endpoint returns a valid JWT authentication session token for the approved user. The app automatically authenticates the user, stores the JWT, clears the pending token, and redirects the FTA directly to `DashboardView.vue` with a welcoming onboarding notification.

---

## 2. Actors & Target Roles

* **Prospective FTA**: Submits event access request and receives automatic authentication upon Admin approval.
* **ADMIN**: Approves access requests in `AdminDashboardView.vue`.

---

## 3. User Stories

* **US-24.1 (Auto-Login on Approval)**: As a prospective FTA whose access request was approved, I want the system to automatically log me in without re-entering credentials so that I can immediately access my assigned competition events.
* **US-24.2 (Secure Cached Request Tracking)**: As a system user, I want my pending request secret token safely stored and validated so that unauthorized users cannot hijack access approvals.

---

## 4. Acceptance Criteria

* `POST /api/access-requests` returns `requestSecretToken` along with 201 Created.
* Client stores `requestSecretToken` and `email` in `localStorage`.
* When `LoginView.vue` mounts, if a pending request token exists, it checks status via `POST /api/access-requests/claim-session`.
* On Admin approval, `claim-session` returns `token` (JWT) and `user` object. Client logs in automatically and redirects to `/`.
