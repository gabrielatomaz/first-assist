# Scenarios — User Profile (FEAT-003)

Behavioral expectations for own profile modification.

## Scenarios

### Scenario 1: Update name successfully
* **Given** an authenticated user is on their profile view
* **When** they change their name input to "Jane A. Miller"
* **And** submit the changes
* **Then** the client sends a PUT request to `/api/profile`
* **And** the server returns 200 OK saving changes
* **And** the UI displays the profile updated confirmation

### Scenario 2: Fail password change due to incorrect old password
* **Given** an authenticated user
* **When** they fill in an incorrect old password
* **And** request a password change
* **Then** the server responds with a 400 Bad Request status
* **And** the UI displays "Incorrect current password"

### Scenario 3: Update avatar icon and color
* **Given** an authenticated user is on their profile view
* **When** they select icon "robot" and color "#E85B2F"
* **And** submit the changes
* **Then** the client sends a PUT request to `/api/profile` with avatar fields
* **And** the avatar badge in top navigation updates immediately
