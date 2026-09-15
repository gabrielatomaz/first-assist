# Requirements Specification: FEAT-021 — Multi-Team & Multi-Event Management Context & FTA Team Approval

---

## 1. Functional Requirements

### FR-021-01: Canonical Team Entity Management
* **Requirement**: Teams must exist as unique, canonical records identified by `teamNumber` (e.g., FRC 1772).
* **Actor**: ADMIN, FTA, Lead Mentor.
* **Acceptance Criteria**: Participating in multiple events (Event A, Event B) reuses the same canonical `Team` document.

---

### FR-021-02: Team Role Multiplicity Constraints (Max 1 Lead Mentor & Max 1 Team Captain)
* **Requirement**: System must enforce that each canonical team has at most **1 active Lead Mentor (`LEAD_MENTOR`)** and at most **1 active Team Captain (`TEAM_CAPTAIN`)**.
* **Actor**: ADMIN, FTA, Lead Mentor.
* **Main Flow**:
  1. User/FTA requests creation or promotion of a user to `LEAD_MENTOR` or `TEAM_CAPTAIN` for `teamNumber`.
  2. System checks `TeamMembership.findOne({ teamNumber, teamRole, isActive: true })`.
  3. If an active membership exists for that role on `teamNumber`, system rejects with `HTTP 400 Bad Request`: `"Team [teamNumber] already has an active [role]. Only 1 active Lead Mentor and 1 active Team Captain are permitted per team."`
* **Acceptance Criteria**: A team cannot have 2 active Lead Mentors or 2 active Team Captains concurrently.

---

### FR-021-03: Shared Incident Control for Lead Mentors & Team Captains
* **Requirement**: Both Lead Mentors and Team Captains have equal permission to create, edit, and delete incident records for their team at an event.
* **Actor**: Lead Mentor, Team Captain.
* **Main Flow**:
  1. Authenticated user with role `LEAD_MENTOR` or `TEAM_CAPTAIN` for `activeTeamNumber` requests incident operation:
     - `POST /api/incidents` (Create)
     - `PATCH /api/incidents/:id` (Edit / Update)
     - `DELETE /api/incidents/:id` (Delete)
  2. Authorization middleware verifies `(req.user.teamNumber === incident.teamNumber)` and `['LEAD_MENTOR', 'TEAM_CAPTAIN'].includes(userTeamRole)`.
  3. Operation executes and records user ID in incident audit trail.
* **Acceptance Criteria**: Both Lead Mentor and Team Captain can modify and delete incidents belonging to their team.

---

### FR-021-04: Team Access Request Submission (FTA Pattern)
* **Requirement**: Team representatives can submit a public access request to register their team for a competition event.
* **Actor**: Public / Unauthenticated / Authenticated Team Users.
* **Acceptance Criteria**: Pending request is stored and ready for FTA/Admin review.

---

### FR-021-05: FTA Event-Scoped Team Approval & Role Limit Enforcement
* **Requirement**: An FTA can review and approve team access requests for any event the FTA is registered/assigned to, enforcing role multiplicity limits upon approval.
* **Actor**: FTA, ADMIN.
* **Acceptance Criteria**: FTAs can approve team requests for their assigned events; backend prevents approving duplicate active Lead Mentors or Team Captains.

---

## 2. Non-Functional Requirements

* **NFR-021-01 (Authorization Security)**: API endpoints verifying team access must ensure `req.user` holds an active `TeamMembership` for `teamNumber` or possesses a global volunteer role (`ADMIN`, `FTA`, `CSA`).
* **NFR-021-02 (Audit Trail Integrity)**: Any incident creation, edit, or deletion by a Lead Mentor or Team Captain must be logged in the incident audit timeline with user attribution.
