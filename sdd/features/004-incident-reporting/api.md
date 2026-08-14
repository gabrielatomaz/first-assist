# API Contract — Incident Reporting (FEAT-004)

All routes require `Authorization: Bearer <Token>`.

## Endpoints

### `POST /api/incidents`
* **Purpose**: Creates text incident.
* **Payload**:
  ```json
  {
    "teamNumber": 254,
    "matchNumber": "Q22",
    "description": "Robot radio power drops during contact."
  }
  ```
* **Success Response (201 Created)**: Returns Incident object with `status: 'OPEN'`, unique `_id`, and timestamps.

### `POST /api/incidents/voice`
* **Purpose**: Receives audio file, transcribes, and saves ticket.
* **Request Format**: `multipart/form-data`
* **Payload Params**:
  * `audio`: File (binary blob).
  * `teamNumber`: Number.
  * `matchNumber`: String (optional).
* **Success Response (201 Created)**: Returns translated Incident object including populated `description` and `audioUrl`.
