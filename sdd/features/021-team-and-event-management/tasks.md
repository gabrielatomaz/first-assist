# Implementation Tasks: FEAT-021 — Multi-Team & Multi-Event Context & FTA Team Approval

---

## Backend Tasks

- [ ] **TASK-021-01**: Create `TeamMembership.js` Mongoose model with partial unique index enforcing **max 1 active LEAD_MENTOR** and **max 1 active TEAM_CAPTAIN** per `teamNumber`.
- [ ] **TASK-021-02**: Create `TeamAccessRequest.js` Mongoose model following `AccessRequest.js` schema pattern.
- [ ] **TASK-021-03**: Create `teamAccessRequestController.js` and `teamAccessRequestRoutes.js` with public `POST` endpoint and FTA/Admin-protected `GET`, `PATCH approve`, `PATCH reject` endpoints.
- [ ] **TASK-021-04**: Add role multiplicity check in `teamAccessRequestController.approveRequest` — reject if team already has an active Lead Mentor or Team Captain for the requested role.
- [ ] **TASK-021-05**: Add `requireFTAForEventOrAdmin` middleware enforcing that FTAs can only approve team requests for their assigned competition events.
- [ ] **TASK-021-06**: Create `canManageTeamIncident` middleware granting equal incident add, edit, and delete permissions to both Lead Mentors and Team Captains.
- [ ] **TASK-021-07**: Apply `canManageTeamIncident` to `PATCH /api/incidents/:id` and `DELETE /api/incidents/:id`.

---

## Frontend Tasks

- [ ] **TASK-021-08**: Build `TeamAccessRequestModal.vue` following `AccessRequestModal.vue` styling and pattern (`bg-black/50 backdrop-blur-sm`, `max-w-md`). Fields: name, email, password, confirm password, team number, team name, role (Lead Mentor / Team Captain / Team Member), event selection, notes.
- [ ] **TASK-021-09**: Add **"Register Team Access"** link to `LoginView.vue` footer alongside the existing FTA request link, wiring it to open `TeamAccessRequestModal.vue`.
- [ ] **TASK-021-10**: Export `TeamAccessRequestModal` from `frontend/src/components/index.js` barrel and import it in `LoginView.vue`.
- [ ] **TASK-021-11**: Add Pending Team Access Requests review table in `FTADashboardView.vue` filtered to the logged-in FTA's assigned event codes, with Approve/Reject actions.
- [ ] **TASK-021-12**: Update `IncidentCard.vue` and `IncidentDetailView.vue` to enable Edit and Delete actions for both Lead Mentors (`isLeadMentor`) and Team Captains (`isTeamCaptain`).
- [ ] **TASK-021-13**: Extend `useAuthStore` with `teamMemberships`, `activeTeamNumber`, `activeEventCode`, `isLeadMentor`, `isTeamCaptain`.

---

## Testing Tasks

- [ ] **TASK-021-14**: Write backend test verifying duplicate Lead Mentor / Team Captain creation is blocked.
- [ ] **TASK-021-15**: Write API test verifying both Lead Mentor and Team Captain can edit and delete team incidents.
- [ ] **TASK-021-16**: Run `npm run build` to verify clean production compilation.
