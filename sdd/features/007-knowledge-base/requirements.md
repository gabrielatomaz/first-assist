# Requirements Detail — Knowledge Base (FEAT-007)

Details requirements FR-013 and FR-014.

## FR-013 — Resolve Incident Detail
* **Actor**: CSA, FTA
* **Validation**:
  * `rootCause` and `appliedSolution` must be non-empty strings.
* **HTTP Route**: `POST /api/incidents/:id/resolve`
* **Backend Behavior**: Updates status to `RESOLVED` and sets `resolvedAt` timestamp.

## FR-014 — Search Knowledge Base Detail
* **Actor**: FTA, CSA
* **HTTP Route**: `GET /api/incidents/search`
* **Query Params**: `q=radio` (string value).
* **Search Behavior**: MongoDB Text Search query against `description`, `rootCause`, and `appliedSolution`.
