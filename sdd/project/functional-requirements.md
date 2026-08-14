# Functional Requirements — FIRST Assist

This inventory documents all functional requirements (FR) of FIRST Assist, including actors, flows, business rules, API targets, and status.

---

## FR-001 — User Login
* **Actor**: Administrator, FTA, CSA
* **Description**: Allows registered users to authenticate using an email and password to receive a JSON Web Token.
* **Preconditions**: 
  * The user has an existing account created by an Admin.
  * The account is active.
* **Main Flow**:
  1. The user navigates to the login view.
  2. The user enters their email and password.
  3. The user submits the form.
  4. The frontend validates the required formats.
  5. The frontend sends a POST request to `/api/auth/login`.
  6. The backend verifies email matching and checks the password hash via bcrypt.
  7. The backend signs a JWT with the user's role.
  8. The frontend stores the token in `localStorage`/Pinia and redirects the user to the dashboard.
* **Alternative Flows**:
  * User is already logged in: Redirected directly to the dashboard.
* **Error Cases**:
  * Invalid credentials: Return 401 Unauthorized with "Invalid email or password".
  * User is deactivated: Return 403 Forbidden with "Account is inactive".
* **Business Rules**: Authentication must use password hashing. Session expiry matches the JWT payload configuration.
* **Data Involved**: Email, password (plain text payload, hashed storage).
* **Expected Result**: User enters active area; token stored.
* **Acceptance Criteria**: Unauthorized users cannot bypass the login view to access the dashboard.
* **Related Feature**: `FEAT-001-authentication`
* **Related Frontend**: `LoginView.vue`
* **Related Backend**: `POST /api/auth/login`
* **Related Tests**: `auth.test.js`
* **Status**: NOT IMPLEMENTED

---

## FR-002 — User Logout
* **Actor**: Authenticated User
* **Description**: Safely ends the session and clears local credentials.
* **Preconditions**: User is authenticated.
* **Main Flow**:
  1. User clicks the "Logout" button.
  2. Frontend dispatches the logout action to the authentication store.
  3. The JWT is removed from `localStorage` and memory.
  4. The router redirects the user to `/login`.
* **Acceptance Criteria**: The browser back button does not display protected dashboard information post-logout.
* **Related Feature**: `FEAT-001-authentication`
* **Related Frontend**: `App.vue` (navigation bar)
* **Related Backend**: None (Stateless JWT clearance)
* **Status**: NOT IMPLEMENTED

---

## FR-003 — Recover Password
* **Actor**: Administrator, FTA, CSA
* **Description**: Allows users to set a new password by requesting a recovery link.
* **Preconditions**: Account exists.
* **Main Flow**:
  1. User clicks "Forgot Password".
  2. User inputs their email.
  3. Backend generates a short-lived recovery token (mock or email integration).
  4. User enters token and sets a new password.
* **Related Feature**: `FEAT-001-authentication`
* **Related Backend**: `POST /api/auth/recover`
* **Status**: NOT IMPLEMENTED

---

## FR-004 — Maintain Session
* **Actor**: Authenticated User
* **Description**: Preserves authentication status across page reloads.
* **Preconditions**: A valid token exists in `localStorage`.
* **Main Flow**:
  1. App initializes (`main.js`).
  2. Pinia auth store reads the token from storage.
  3. Verifies validity.
  4. Populates user profile state.
* **Status**: NOT IMPLEMENTED

---

## FR-005 — Create User Account
* **Actor**: Administrator
* **Description**: Allows administrators to register new technical volunteers.
* **Preconditions**: Administrator is authenticated.
* **Main Flow**:
  1. Admin opens the User Management screen.
  2. Admin inputs Name, Email, Password, and Role (FTA/CSA/ADMIN).
  3. Backend validates required inputs and checks for unique email.
  4. Password is encrypted.
  5. User is saved in the database as `ACTIVE`.
* **Error Cases**:
  * Email already registered: Return 409 Conflict.
* **Related Feature**: `FEAT-002-user-management`
* **Related Backend**: `POST /api/users`
* **Status**: NOT IMPLEMENTED

---

## FR-006 — View Users List
* **Actor**: Administrator
* **Description**: Displays a table of registered accounts, including roles and active status.
* **Related Feature**: `FEAT-002-user-management`
* **Related Backend**: `GET /api/users`
* **Status**: NOT IMPLEMENTED

---

## FR-007 — Edit User Details
* **Actor**: Administrator
* **Description**: Modify names, emails, roles, or status of an existing user.
* **Related Feature**: `FEAT-002-user-management`
* **Related Backend**: `PUT /api/users/:id`
* **Status**: NOT IMPLEMENTED

---

## FR-008 — Deactivate/Reactivate User
* **Actor**: Administrator
* **Description**: Suspends user authentication capabilities without removing historical database records.
* **Related Feature**: `FEAT-002-user-management`
* **Related Backend**: `PATCH /api/users/:id/status`
* **Status**: NOT IMPLEMENTED

---

## FR-009 — View/Edit Own Profile
* **Actor**: Authenticated User
* **Description**: View own details and edit parameters (e.g., name, password).
* **Related Feature**: `FEAT-003-user-profile`
* **Related Backend**: `GET /api/profile`, `PUT /api/profile`
* **Status**: NOT IMPLEMENTED

---

## FR-010 — Create Incident (Text)
* **Actor**: FTA, CSA
* **Description**: Submit a text-based incident indicating a problem with a robot on the field.
* **Preconditions**: User is logged in.
* **Main Flow**:
  1. User navigates to incident creation form.
  2. Inputs Team Number, Match Number, and Description.
  3. Submits form.
  4. Backend verifies that Team Number and Description are present.
  5. Incident saved with status `OPEN`.
* **Related Feature**: `FEAT-004-incident-reporting`
* **Related Frontend**: `IncidentCreateView.vue`
* **Related Backend**: `POST /api/incidents`
* **Status**: PARTIALLY IMPLEMENTED (missing reportedBy ref and auth protection)

---

## FR-011 — Create Incident (Voice)
* **Actor**: FTA, CSA
* **Description**: Report issues hands-free using microphone recordings transcribed automatically.
* **Related Feature**: `FEAT-004-incident-reporting`
* **Related Frontend**: `VoiceRecorder.vue`
* **Related Backend**: `POST /api/incidents/voice` (Speech-to-Text translation)
* **Status**: NOT IMPLEMENTED

---

## FR-012 — Dashboard Real-Time Tracking
* **Actor**: FTA, CSA, Admin
* **Description**: Renders a listing of unresolved tickets.
* **Related Feature**: `FEAT-005-dashboard-tracking`
* **Related Frontend**: `DashboardView.vue`
* **Related Backend**: `GET /api/incidents`
* **Status**: PARTIALLY IMPLEMENTED (requires updates to integrate real-time triggers/polling and assignment actions)

---

## FR-013 — AI Diagnostic Troubleshooting
* **Actor**: CSA, FTA
* **Description**: Analyzes incident description to suggest possible root causes and troubleshooting instructions.
* **Related Feature**: `FEAT-006-ai-troubleshooting`
* **Related Frontend**: `AISuggestionPanel.vue`
* **Related Backend**: `GET /api/incidents/:id/ai-suggestions`
* **Status**: PARTIALLY IMPLEMENTED (uses static mock responses in backend)

---

## FR-014 — Search Knowledge Base
* **Actor**: FTA, CSA
* **Description**: Searches resolved incidents using text matching.
* **Related Feature**: `FEAT-007-knowledge-base`
* **Related Frontend**: `KnowledgeBaseView.vue`
* **Related Backend**: `GET /api/incidents/search`
* **Status**: NOT IMPLEMENTED
