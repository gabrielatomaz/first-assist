# API Contract — Dashboard & Tracking (FEAT-005)

All routes require `Authorization: Bearer <Token>`.

## Endpoints

### `GET /api/incidents`
* **Purpose**: Retrieves all incident logs.
* **Success Response (200 OK)**: Array of Incident entities.

### `PATCH /api/incidents/:id/status`
* **Purpose**: Update state parameters.
* **Payload**:
  ```json
  {
    "status": "INVESTIGATING",
    "assignedTo": "60c72b2f9b1d8b2c88888888"
  }
  ```
* **Success Response (200 OK)**: Returns the updated Incident object.
