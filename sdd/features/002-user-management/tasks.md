# Implementation Tasks — User Management (FEAT-002)

These tasks detail the work required to implement User Management.

* **Definition of Done**:
  * Administrator can list all registered volunteers.
  * Administrator can register new users with standard validation.
  * Suspended accounts cannot authenticate.
  * Admin-only checks block non-admin requests with 403 status.

## Task Backlog

- [ ] **TASK-002-01: Create User Administration Routes**
  * Map `POST /api/users` and `GET /api/users`.
- [ ] **TASK-002-02: Implement Admin Authorization Middleware**
  * Create checks verifying `req.user.role === 'ADMIN'`. Block non-matching requests.
- [ ] **TASK-002-03: Implement User Status Toggle Route**
  * Create `PATCH /api/users/:id/status` handler to toggle database state.
- [ ] **TASK-002-04: Create UserManagementView Layout**
  * Build a list view containing search filters and account states.
- [ ] **TASK-002-05: Create Account Creation Form Modal**
  * Implement the inputs and bind them to the creation endpoint.
- [ ] **TASK-002-06: Write End-to-End Authentication Tests**
  * Verify that a deactivated account fails login checks.
