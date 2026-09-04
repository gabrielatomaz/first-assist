# Implementation Tasks: FEAT-022 — FTA Event Access Request System

---

## Backend Tasks

- [ ] **TASK-022-01**: Create `AccessRequest.js` Mongoose model (`backend/src/models/AccessRequest.js`).
- [ ] **TASK-022-02**: Create `accessRequestController.js` with submit, list, approve, and reject endpoints.
- [ ] **TASK-022-03**: Create `accessRequestRoutes.js` (`POST /api/access-requests`, `GET /api/access-requests`, `PATCH /api/access-requests/:id/approve`, `PATCH /api/access-requests/:id/reject`).
- [ ] **TASK-022-04**: Add audit logging for access request approvals and rejections.

---

## Frontend Tasks

- [ ] **TASK-022-05**: Create `AccessRequestModal.vue` component with event multi-select and requester inputs.
- [ ] **TASK-022-06**: Update `LoginView.vue` with "Request FTA Event Access" action trigger.
- [ ] **TASK-022-07**: Update `AdminDashboardView.vue` with "FTA Access Requests" tab and management table.

---

## Testing & Verification Tasks

- [ ] **TASK-022-08**: Write backend unit tests for `AccessRequest` model and controller.
- [ ] **TASK-022-09**: Write frontend component tests for `AccessRequestModal.vue`.
- [ ] **TASK-022-10**: Run `npm run build` to verify clean production compilation.
