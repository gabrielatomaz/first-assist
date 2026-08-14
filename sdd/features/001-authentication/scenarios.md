# Scenarios — User Authentication (FEAT-001)

These behavior-driven scenarios verify the authentication module.

## Login Scenarios

### Scenario 1: Successful Login
* **Given** a registered user with email "csa@team.org" and password "pass123" is active
* **When** they fill in valid credentials on the login screen
* **And** submit the login form
* **Then** the app sends a POST request to `/api/auth/login`
* **And** the server responds with a valid JWT token
* **And** the client saves the token and redirects to the dashboard

### Scenario 2: Deactivated User Login
* **Given** a registered user with email "inactive@team.org" is inactive
* **When** they attempt to log in with correct credentials
* **Then** the server responds with a 403 Forbidden status
* **And** the UI displays the error message "Account is deactivated. Contact Administrator."

### Scenario 3: Incorrect Password
* **Given** a registered active user
* **When** they enter their email but type an incorrect password
* **Then** the server returns a 401 Unauthorized status
* **And** the client remains on the login view showing "Invalid email or password"
