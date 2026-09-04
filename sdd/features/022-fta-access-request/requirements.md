# Requirements Specification: FEAT-022 — FTA Event Access Request System

---

## 1. Functional Requirements

### FR-022-01: Login Screen Request Entry Point
* **Requirement**: `LoginView.vue` must feature an accessible link/button to trigger the FTA Access Request modal.
* **Actor**: Unauthenticated User / Prospective FTA.
* **Main Flow**:
  1. User navigates to `/login`.
  2. Clicks "Request FTA Event Access" button beneath login credentials form.
  3. Modal opens displaying access request fields.
* **Acceptance Criteria**: Button is visible on both mobile and desktop screen sizes.

---

### FR-022-02: Event Access Request Submission
* **Requirement**: Public endpoint `POST /api/access-requests` creates a `PENDING` access request.
* **Actor**: Prospective FTA.
* **Input Fields**:
  - `name`: Required String.
  - `email`: Required String (valid email format).
  - `requestedEventCodes`: Required Array of Strings (at least 1 event code).
  - `notes`: Optional String (max 500 chars).
* **Business Rules**:
  - Rate limiting applies (max 3 requests per IP per hour).
  - Prevents duplicate `PENDING` request for exact same `(email, eventCode)`.
* **Acceptance Criteria**: Successful submission returns HTTP 201 Created and displays confirmation toast.

---

### FR-022-03: Admin Review & Access Request Management
* **Requirement**: Admins must be able to view, approve, and reject requests via `AdminDashboardView.vue`.
* **Actor**: ADMIN.
* **Main Flow**:
  1. Admin opens `AdminDashboardView.vue` -> Access Requests tab.
  2. System fetches `GET /api/access-requests?status=PENDING`.
  3. Admin reviews request details and clicks Approve or Reject.
* **Acceptance Criteria**: Action executes immediately and updates table state without full page refresh.

---

### FR-022-04: Automated Role & Event Provisioning
* **Requirement**: Approving an access request automatically updates the user's role and assigned events.
* **Actor**: Backend Service / Admin.
* **Main Flow**:
  1. Admin clicks "Approve" on request `#REQ-123`.
  2. Backend updates `targetUser.role = 'FTA'` (if not `ADMIN`).
  3. Backend appends `requestedEventCodes` to `targetUser.assignedEventCodes` (unique merge).
  4. Sets `request.status = 'APPROVED'`, `request.reviewedBy = req.user._id`, `request.reviewedAt = Date.now()`.
* **Acceptance Criteria**: Target user immediately gains FTA access to approved events upon next login/sync.

---

## 2. Non-Functional Requirements

* **NFR-022-01 (Security)**: `POST /api/access-requests` is public but sanitized against HTML/XSS injection.
* **NFR-022-02 (Auditability)**: All access request approvals and rejections create an `AuditLog` entry in MongoDB.
* **NFR-022-03 (Usability)**: Event selection modal uses `CustomSelect` or checkbox pill list for easy event selection.
