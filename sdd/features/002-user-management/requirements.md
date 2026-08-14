# Requirements Detail — User Management (FEAT-002)

This details functional requirements FR-005 to FR-008.

## FR-005 — Create User
* **Actor**: Administrator
* **Preconditions**: Administrator is logged in.
* **Flow**: Inputs fields → submits → backend checks email uniqueness → hashes password → saves account.
* **HTTP Route**: `POST /api/users`
* **Errors**: Return 409 Conflict if email is taken.

## FR-006 — View Users List
* **Actor**: Administrator
* **HTTP Route**: `GET /api/users`

## FR-007 — Edit User
* **Actor**: Administrator
* **HTTP Route**: `PUT /api/users/:id`

## FR-008 — Deactivate/Reactivate User
* **Actor**: Administrator
* **HTTP Route**: `PATCH /api/users/:id/status`
* **Payload**: `{ "status": "INACTIVE" }` or `{ "status": "ACTIVE" }`
