# Scenarios — User Management (FEAT-002)

These BDD scenarios describe administrative operations.

## Scenarios

### Scenario 1: Create a User successfully
* **Given** an authenticated administrator is on the User Management screen
* **When** they click "Add User"
* **And** fill in name, email, password, and assign the role "CSA"
* **And** submit the registration form
* **Then** the server registers the user and returns status 210/201 Created
* **And** the new user appears in the user list table

### Scenario 2: Prevent non-admins from creating users
* **Given** an authenticated volunteer with role "CSA"
* **When** they attempt to POST a user registration payload to `/api/users`
* **Then** the server blocks the request returning 403 Forbidden

### Scenario 3: Suspend a User
* **Given** an administrator is viewing active users
* **When** they click the toggle to deactivate "jane.miller@first.org"
* **Then** the app sends a PATCH request to `/api/users/:id/status` with value "INACTIVE"
* **And** the user status badge updates to "INACTIVE"
