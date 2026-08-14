# API Contract — AI Troubleshooting (FEAT-006)

All routes require `Authorization: Bearer <Token>`.

## Endpoints

### `GET /api/incidents/:id/ai-suggestions`
* **Purpose**: Retrieves or triggers suggestion generation.
* **Success Response (200 OK)**:
  ```json
  {
    "suggestions": [
      {
        "_id": "60c72b2f9b1d8b2c77777777",
        "incidentId": "60c72b2f9b1d8b2c66666666",
        "suggestedCause": "Power terminal loose connections.",
        "suggestedSolution": "Check screw terminals.",
        "rating": "UNRATED"
      }
    ]
  }
  ```

### `PATCH /api/ai-suggestions/:id/rating`
* **Purpose**: Sends volunteer feedback.
* **Payload**:
  ```json
  {
    "rating": "HELPFUL"
  }
  ```
