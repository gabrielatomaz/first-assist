# Requirements Detail — Incident Reporting (FEAT-004)

Details requirements FR-010 and FR-011.

## FR-010 — Create Incident (Text)
* **Actor**: FTA, CSA
* **Validation**:
  * `teamNumber` must be a valid integer.
  * `description` must not be blank.
* **HTTP Route**: `POST /api/incidents`

## FR-011 — Create Incident (Voice)
* **Actor**: FTA, CSA
* **Workflows**:
  * Voice recording client intercepts audio using `MediaRecorder` API.
  * Sends audio blob via `multipart/form-data` to `POST /api/incidents/voice`.
  * Backend calls transcription APIs.
  * Creates incident with transcription text as `description`.
