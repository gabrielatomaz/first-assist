# API Contract — User Profile (FEAT-003)

All routes require `Authorization: Bearer <Token>`.

## Endpoints

### `GET /api/profile`
* **Success Response (200 OK)**:
  ```json
  {
    "name": "Jane Miller",
    "email": "jane.miller@first.org",
    "role": "CSA",
    "avatarIcon": "robot",
    "avatarColor": "#E85B2F"
  }
  ```

### `PUT /api/profile`
* **Payload**:
  ```json
  {
    "name": "Jane A. Miller",
    "email": "jane.miller@first.org",
    "avatarIcon": "robot",
    "avatarColor": "#E85B2F"
  }
  ```

### `POST /api/profile/password`
* **Payload**:
  ```json
  {
    "currentPassword": "tempPassWord123!",
    "newPassword": "newSecurePassword789!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
