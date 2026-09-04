# Test Plan: FEAT-022 — FTA Event Access Request System

---

## 1. Backend Unit & Integration Tests

* **`accessRequestController.test.js`**:
  * Test `POST /api/access-requests` creates `PENDING` document.
  * Test duplicate submission validation.
  * Test `PATCH /api/access-requests/:id/approve` updates target user's role to `FTA` and adds assigned event codes.
  * Test non-admin user cannot access `GET /api/access-requests` or approve requests (403 Forbidden).

---

## 2. Frontend Component & Integration Tests

* **`AccessRequestModal.spec.js`**:
  * Test rendering form input fields and registered event list.
  * Test submitting form emits success notification and closes modal.

* **`AdminDashboardView.spec.js`**:
  * Test rendering pending access requests badge and management table.
  * Test clicking Approve removes request from pending list and updates UI.
