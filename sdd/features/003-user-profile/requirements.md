# Requirements Detail — User Profile (FEAT-003)

Details functional requirement FR-009.

## FR-009 — View/Edit Own Profile Detail
* **Actor**: Authenticated User (Admin, FTA, CSA)
* **Preconditions**: User is logged in.
* **Flow**:
  1. User navigates to profile tab.
  2. Frontend sends request to `GET /api/profile`.
  3. Displays current user's profile info.
  4. User edits fields and clicks "Save".
  5. Frontend sends request to `PUT /api/profile`.
* **Password Change Flow**: Sends request to `POST /api/profile/password`. Re-hashes password using bcrypt.
