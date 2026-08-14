# Requirements Detail — Dashboard & Tracking (FEAT-005)

Details functional requirements FR-006, FR-007, and FR-008.

## FR-006 — View Incident Dashboard
* **Actor**: Administrator, FTA, CSA
* **Preconditions**: Authenticated user.
* **HTTP Route**: `GET /api/incidents`
* **Filtering**: Supports filtering query inputs (e.g. `?status=OPEN`).

## FR-007 — Update Status Detail
* **Actor**: CSA, FTA
* **Validation**: Validates input statuses are enum `['OPEN', 'INVESTIGATING', 'RESOLVED']`.
* **HTTP Route**: `PATCH /api/incidents/:id/status`

## FR-008 — Claim/Assign Incident Detail
* **Actor**: Admin, FTA, CSA
* **HTTP Route**: `PATCH /api/incidents/:id/status`
* **Payload**: `{ "assignedTo": "userId" }`
