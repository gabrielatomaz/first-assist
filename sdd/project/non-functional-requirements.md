# Non-Functional Requirements — FIRST Assist

This document inventories the non-functional requirements (NFRs) for the FIRST Assist system.

---

## NFR-001 — Performance
* **Requirement**: Response latency for read/write API endpoints should be under 500ms under normal load.
* **Acceptance Criteria**: The Dashboard View lists tickets in under 2 seconds upon mounting.

## NFR-002 — Security
* **Requirement**: Cryptographic safety protocols.
* **Acceptance Criteria**:
  * Passwords must be hashed using bcrypt on the server before database storage.
  * API endpoints must be guarded using stateless JSON Web Tokens (JWT) signed using a server-side secret.
  * No secrets or credentials (e.g. database connections) should be hardcoded in files.

## NFR-003 — PWA Manifest & Shell Caching
* **Requirement**: Installability on Android and iOS web engines.
* **Acceptance Criteria**: The application must include a valid manifest.json showing display mode standalone, and a service worker caching the main index, style, and script resources to load offline.

## NFR-004 — Mobile Responsiveness
* **Requirement**: Field accessibility.
* **Acceptance Criteria**: The UI layouts must adapt responsively using CSS grids/Tailwind flex configurations for comfortable phone interactions during high-pressure match cycles.

## NFR-005 — Accessibility
* **Requirement**: Usability.
* **Acceptance Criteria**: Form labels, input borders, and badge tags must use contrasting colors (e.g., matching the FIRST design style) to be readable in bright FRC arena lighting.

## NFR-006 — Input Validation
* **Requirement**: Guard rails against malicious or garbage data.
* **Acceptance Criteria**: Frontend forms and backend route handlers must validate input fields (such as integer constraints for team numbers).

## NFR-007 — Offline Notification
* **Requirement**: Connection loss warning.
* **Acceptance Criteria**: The user must be informed with a warning banner when the web browser loses network connection.

## NFR-008 — Maintainability
* **Requirement**: Clear code structure.
* **Acceptance Criteria**: Separating routes, controllers, services, repositories, and models ensures clean code segregation for future students continuing this final paper.
