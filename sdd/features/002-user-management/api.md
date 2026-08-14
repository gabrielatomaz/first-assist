# API Contract — User Management (FEAT-002)

All routes require `Authorization: Bearer <Token>` with Admin privileges.

## Endpoints

### `POST /api/users`
* **Purpose**: Registers a new user.
* **Payload**:
  ```json
  {
    "name": "Jane Miller",
    "email": "jane.miller@first.org",
    "password": "tempPassWord123!",
    "role": "CSA"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "_id": "60c72b2f9b1d8b2c99999999",
    "name": "Jane Miller",
    "email": "jane.miller@first.org",
    "role": "CSA",
    "status": "ACTIVE"
  }
  ```

### `GET /api/users`
* **Purpose**: Retrieves all users.
* **Success Response (200 OK)**: Array of User objects.

### `PATCH /api/users/:id/status`
* **Purpose**: Activates or suspends a user.
* **Payload**:
  ```json
  {
    "status": "INACTIVE"
  }
  ```
