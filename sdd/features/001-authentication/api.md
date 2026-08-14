# API Contract — User Authentication (FEAT-001)

## Endpoints

### `POST /api/auth/login`
* **Purpose**: Authenticates credentials and returns user payload + JWT.
* **Request Body**:
  ```json
  {
    "email": "fta@first.org",
    "password": "ftaSecurePassword1!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "60c72b2f9b1d8b2c88888888",
      "name": "Jane Doe",
      "role": "FTA"
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "error": "Invalid email or password"
  }
  ```
* **Error Response (403 Forbidden)**:
  ```json
  {
    "error": "Account is deactivated. Contact Administrator."
  }
  ```
