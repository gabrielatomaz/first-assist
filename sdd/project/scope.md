# Project Scope — FIRST Assist

## In-Scope

### 1. User Authentication & Role Management
* Secure login with role assignments (Admin, FTA, CSA).
* Persistent session control.
* Administrative user creation and deactivation management.
* User profiles and password modifications.

### 2. Incident Reporting (Text & Voice)
* Form inputs specifying Team Number, Match Number, and Description.
* Voice recording interface (Speech-to-Text) utilizing browser recording APIs for fast entry.

### 3. Real-Time Tracking & Communication
* Active dashboard list summarizing tickets.
* Ticket updates (OPEN, INVESTIGATING, RESOLVED).
* Assignment of CSAs to specific incident tickets.
* Collaborative commenting system.

### 4. AI-Powered Troubleshooting
* Generation of suggested causes and actions using description context.
* Volunteer feedback ratings on suggestions.

### 5. Knowledge Base
* Enforced documentation of root cause and solution upon ticket resolution.
* Search query interface targeting historical data.

---

## Out-of-Scope

* **Public User Registration**: Self-service registration is excluded. Administrators register accounts to ensure only authorized FRC volunteers access the system.
* **Multi-Event Management**: The system targets a single active event at a time.
* **Native Apps**: Excluded in favor of a Progressive Web App (PWA) to ensure platform-agnostic distribution.
* **Hardware Integrations**: Directly fetching robot diagnostics via USB or radio is excluded.
