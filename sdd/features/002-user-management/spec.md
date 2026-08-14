# Feature Spec — User Management (FEAT-002)

* **Status**: Specified (NOT IMPLEMENTED)
* **Priority**: High

## Purpose
Enables system administrators to register, view, modify roles, and deactivate/reactivate volunteer accounts.

## User Stories

### US-USER-001 — Create User
* **Story**: As an administrator, I want to create a user account, so that authorized technical volunteers can access FIRST Assist.
* **Acceptance Criteria**:
  * Form requires Name, Email, Password, and Role assignment.
  * Duplicate email addresses are rejected.

### US-USER-002 — View Users
* **Story**: As an administrator, I want to view registered users, so that I can manage system access.
* **Acceptance Criteria**: Displays list of names, emails, roles, and status indicators.

### US-USER-003 — Edit User
* **Story**: As an administrator, I want to edit user information, so that user records remain up to date.

### US-USER-004 — Deactivate User
* **Story**: As an administrator, I want to deactivate a user, so that the user can no longer access the application.
* **Acceptance Criteria**: Changing status to INACTIVE blocks subsequent authentication.

### US-USER-005 — Reactivate User
* **Story**: As an administrator, I want to reactivate a deactivated user, so that the user can access the system again.

### US-USER-006 — Assign User Role
* **Story**: As an administrator, I want to assign a role to a user, so that the user receives the appropriate permissions.
