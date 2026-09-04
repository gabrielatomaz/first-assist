# Implementation Tasks: FEAT-021 — Multi-Team & Multi-Event Management Context

---

## Backend Tasks

- [ ] **TASK-021-01**: Create `TeamMembership.js` Mongoose model (`backend/src/models/TeamMembership.js`).
- [ ] **TASK-021-02**: Update `Team.js` schema with canonical indexes and location metadata.
- [ ] **TASK-021-03**: Create `teamController.js` and `teamService.js` to manage multi-team memberships and roster APIs (`GET /api/teams/my-teams`, `POST /api/teams/:number/members`).
- [ ] **TASK-021-04**: Add team context validation middleware (`backend/src/middleware/contextMiddleware.js`) to verify user membership for requested `teamNumber`.
- [ ] **TASK-021-05**: Update `incidentController.js` to enforce composite `(teamNumber, eventCode)` filtering and authorization.

---

## Frontend Tasks

- [ ] **TASK-021-06**: Extend `useAuthStore` in `frontend/src/stores/auth.js` with `teamMemberships`, `activeTeamNumber`, `activeEventCode`, `setActiveTeam()`, and `setActiveEvent()`.
- [ ] **TASK-021-07**: Build `ContextSwitcher.vue` dropdown component in navigation bar allowing multi-team users to switch active team & event context.
- [ ] **TASK-021-08**: Integrate `activeTeamNumber` and `activeEventCode` into `IncidentCreateView.vue`, `DashboardView.vue`, and `KnowledgeBaseView.vue`.
- [ ] **TASK-021-09**: Add Team Roster management view or modal for Lead Mentors.

---

## Testing & Verification Tasks

- [ ] **TASK-021-10**: Write backend unit tests for `TeamMembership` and context validation middleware.
- [ ] **TASK-021-11**: Write frontend component test for `ContextSwitcher.vue` and `authStore` context switching.
- [ ] **TASK-021-12**: Run `npm run build` to verify clean production compilation.
