# Requirements Traceability Matrix

This matrix maps functional requirements to features, architectural files, API endpoints, database structures, and testing coverage.

## Traceability Matrix

| Req ID | Feature ID | Feature Name | Frontend Files | Backend Files | API Endpoints | Mongoose Models | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **FR-001** | FEAT-001 | User Authentication | `LoginView.vue` | `authController.js` | `POST /api/auth/login` | `User.js` | `auth.test.js` | NOT IMPLEMENTED |
| **FR-002** | FEAT-001 | User Authentication | `App.vue` | N/A (Stateless JWT) | N/A | N/A | `auth.test.js` | NOT IMPLEMENTED |
| **FR-003** | FEAT-001 | User Authentication | `ForgotPasswordView.vue` | `authController.js` | `POST /api/auth/recover` | `User.js` | N/A | NOT IMPLEMENTED |
| **FR-004** | FEAT-001 | User Authentication | `main.js`, store | `authMiddleware.js` | N/A | N/A | N/A | NOT IMPLEMENTED |
| **FR-005** | FEAT-002 | User Management | `UserManagementView.vue`| `userController.js` | `POST /api/users` | `User.js` | `user.test.js` | NOT IMPLEMENTED |
| **FR-006** | FEAT-002 | User Management | `UserManagementView.vue`| `userController.js` | `GET /api/users` | `User.js` | N/A | NOT IMPLEMENTED |
| **FR-007** | FEAT-002 | User Management | `UserDetailView.vue` | `userController.js` | `PUT /api/users/:id` | `User.js` | N/A | NOT IMPLEMENTED |
| **FR-008** | FEAT-002 | User Management | `UserDetailView.vue` | `userController.js` | `PATCH /api/users/:id/status`| `User.js` | N/A | NOT IMPLEMENTED |
| **FR-009** | FEAT-003 | User Profile | `ProfileView.vue` | `profileController.js`| `PUT /api/profile` | `User.js` | N/A | NOT IMPLEMENTED |
| **FR-010** | FEAT-004 | Incident Reporting | `IncidentCreateView.vue`| `incidentController.js`| `POST /api/incidents` | `Incident.js` | `incident.test.js` | PARTIALLY IMPLEMENTED |
| **FR-011** | FEAT-004 | Incident Reporting | `VoiceRecorder.vue` | `incidentController.js`| `POST /api/incidents/voice`| `Incident.js` | N/A | NOT IMPLEMENTED |
| **FR-012** | FEAT-005 | Dashboard Tracking | `DashboardView.vue` | `incidentController.js`| `GET /api/incidents` | `Incident.js` | `dashboard.test.js`| PARTIALLY IMPLEMENTED |
| **FR-013** | FEAT-006 | AI Troubleshooting | `AISuggestionPanel.vue` | `incidentController.js`| `GET /api/incidents/:id/ai-suggestions` | `AISuggestion.js` | `ai.test.js` | PARTIALLY IMPLEMENTED |
| **FR-014** | FEAT-007 | Knowledge Base | `KnowledgeBaseView.vue` | `incidentController.js`| `GET /api/incidents/search`| `Incident.js` | `kb.test.js` | NOT IMPLEMENTED |
| **FR-023** | FEAT-023 | RAG AI Troubleshooting | `AISuggestionPanel.vue` | `aiService.js`, `incidentController.js` | `POST /api/incidents/:id/ai-suggestions` | `AISuggestion.js`, `Incident.js` | `rag.test.js` | SPECIFIED |
| **FR-024** | FEAT-024 | FTA Auto-Login Cache | `LoginView.vue` | `accessRequestController.js` | `POST /api/access-requests/claim-session` | `AccessRequest.js`, `User.js` | `auto-login.test.js` | SPECIFIED |
| **FR-025** | FEAT-025 | Dashboard Team Search | `DashboardView.vue`, `SearchBar.vue` | `incidentController.js` | `GET /api/incidents?teamNumber=N` | `Incident.js` | `dashboard-search.test.js` | SPECIFIED |
| **FR-026** | FEAT-026 | FTA/CSA First-Use Tutorial | `OnboardingTutorialModal.vue` | `userController.js` | `PATCH /api/users/profile` | `User.js` | `tutorial.test.js` | SPECIFIED |
| **FR-027** | FEAT-027 | Portuguese Localization & Audio | `App.vue`, `useSpeechRecognition.js` | `aiService.js` | `POST /api/incidents/voice` | `Incident.js` | `i18n.test.js` | SPECIFIED |
| **FR-028** | FEAT-028 | App Security Hardening | `main.js`, `authStore.js` | `server.js`, `authMiddleware.js` | All Endpoints (`helmet`, `rate-limit`) | All Models | `security.test.js` | SPECIFIED |
| **FR-029** | FEAT-029 | Dashboard Infinite Scroll | `DashboardView.vue` | `incidentController.js` | `GET /api/incidents?page=N&limit=10` | `Incident.js` | `infinite-scroll.test.js` | SPECIFIED |
