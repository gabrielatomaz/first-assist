# API Contract — Knowledge Base (FEAT-007)

All routes require `Authorization: Bearer <Token>`.

## Endpoints

### `POST /api/incidents/:id/resolve`
* **Purpose**: Resolves ticket and records solutions.
* **Payload**:
  ```json
  {
    "rootCause": "Loose 120A breaker connection.",
    "appliedSolution": "Tightened breaker terminal bolts."
  }
  ```
* **Success Response (200 OK)**: Returns updated Incident object.

### `GET /api/incidents/search`
* **Purpose**: Queries resolved issues.
* **Query Params**: `q=breaker`
* **Success Response (200 OK)**: Array of matching resolved Incident objects.
* **Error Response (400 Bad Request)**: Empty query value checks.
