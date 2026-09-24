# Requirements Specification: FEAT-024 — FTA First-Use Auto-Login via Cached Request Token

---

## 1. Functional Requirements

### FR-024-01: Access Request Token Generation & Storage
* **Requirement**: Upon successful FTA access request creation (`POST /api/access-requests`), backend generates a unique `requestSecretToken` stored on the `AccessRequest` document.
* **Client Behavior**: Frontend stores `{ email, requestSecretToken, submittedAt }` under `localStorage.getItem('first_assist_pending_access')`.

### FR-024-02: Automatic Session Claiming on Approval
* **Requirement**: Public endpoint `POST /api/access-requests/claim-session` accepts `{ email, requestSecretToken }`.
* **Business Logic**:
  - If request is `APPROVED`, returns `{ token, user }` (JWT auth token).
  - If request is still `PENDING`, returns `{ status: 'PENDING' }`.
  - If request is `REJECTED`, returns `{ status: 'REJECTED', reason }` and clears local storage.
* **Acceptance Criteria**: Approved FTA is logged in instantly without manual password entry.
