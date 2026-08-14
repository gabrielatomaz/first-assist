# Feature Spec — User Authentication (FEAT-001)

* **Status**: Specified (NOT IMPLEMENTED)
* **Priority**: Critical

## Purpose
Enforces secure roles-based access control. Users must authenticate with registered emails and passwords before viewing event statuses or reporting field incidents.

## User Stories

### US-AUTH-001 — Login
* **Story**: As a registered system user, I want to log into FIRST Assist using my credentials, so that I can access the functionalities available to my role.
* **Acceptance Criteria**:
  * Fields for email and password must accept inputs.
  * Backend must validate user exists and password hash matches.
  * Inactive users cannot authenticate.
  * Redirects to the dashboard on success.

### US-AUTH-002 — Logout
* **Story**: As an authenticated user, I want to log out of FIRST Assist, so that my session is terminated securely.
* **Acceptance Criteria**:
  * A logout action button is displayed.
  * Clears cached JWT.
  * Redirects to login view.

### US-AUTH-003 — Recover Password
* **Story**: As a registered user, I want to recover my password, so that I can regain access if I forget it.

### US-AUTH-004 — Maintain Session
* **Story**: As a registered user, I want my authenticated session to be maintained, so that I don't repeatedly log in during the event.
* **Acceptance Criteria**: Persistent token read on initialization.
