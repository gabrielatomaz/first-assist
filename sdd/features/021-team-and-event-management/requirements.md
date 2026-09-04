# Requirements Specification: FEAT-021 — Multi-Team & Multi-Event Management Context

---

## 1. Functional Requirements

### FR-021-01: Canonical Team Management
* **Requirement**: Teams must exist as unique, canonical records identified by `teamNumber`.
* **Actor**: ADMIN, FTA, Lead Mentor.
* **Preconditions**: User is authenticated.
* **Main Flow**:
  1. System checks if `Team` with `number` exists.
  2. If not present, creates canonical `Team` record with `number`, `name`, `rookieYear`.
  3. If present, returns existing canonical `Team` reference.
* **Business Rules**:
  - `teamNumber` is unique and indexed.
  - Participating in multiple events links the event to the same canonical `teamNumber`.
* **Acceptance Criteria**: Creating or importing an event with Team 1772 reuses existing Team 1772 record.

---

### FR-021-02: Team Membership & Team-Scoped Roles
* **Requirement**: Users can be linked to multiple teams with a team-specific role (`LEAD_MENTOR`, `TEAM_CAPTAIN`, `TEAM_MEMBER`).
* **Actor**: ADMIN, Lead Mentor.
* **Preconditions**: User and Team exist.
* **Main Flow**:
  1. Lead Mentor or Admin opens Team Roster management.
  2. Selects user by email or ID and assigns team role (`LEAD_MENTOR`, `TEAM_CAPTAIN`, or `TEAM_MEMBER`).
  3. System records `TeamMembership` record or updates `user.teamMemberships` array.
* **Business Rules**:
  - A user can be `LEAD_MENTOR` on Team 1772 and `TEAM_CAPTAIN` on Team 9999.
  - Team roles do not grant global volunteer permissions (`FTA`/`CSA`).
* **Acceptance Criteria**: User profile displays list of team memberships with respective team roles.

---

### FR-021-03: Event-Team Association
* **Requirement**: An event contains a list of participating team numbers (`teams: [Number]`).
* **Actor**: ADMIN, FTA.
* **Main Flow**:
  1. FTA imports event via TBA API or registers event manually.
  2. System populates `event.teams` array with participating team numbers.
  3. Teams can query events they are participating in (`GET /api/events?teamNumber=1772`).
* **Acceptance Criteria**: Querying Team 1772 events returns all competition events Team 1772 is registered for.

---

### FR-021-04: Active Context Switcher (Frontend & Backend State)
* **Requirement**: Multi-team users can toggle their `activeTeamNumber` and `activeEventCode`.
* **Actor**: All Authenticated Team Users.
* **Main Flow**:
  1. User selects team from top-nav dropdown (`activeTeamNumber`).
  2. System filters event selector to events associated with the selected team.
  3. Dashboard, Incident reporting form, and Knowledge Base default to selected `(activeTeamNumber, activeEventCode)`.
* **Acceptance Criteria**: Changing active team instantly updates incident views and limits scope to selected team.

---

### FR-021-05: Incident Context Isolation & Historical Tracking
* **Requirement**: Incidents store both `teamNumber` and `eventCode` to preserve event history.
* **Actor**: Team User, CSA, FTA.
* **Main Flow**:
  1. Incident is submitted with `teamNumber` and `eventCode`.
  2. Incident is persisted in MongoDB with `(teamNumber, eventCode)` index.
  3. Historical queries can retrieve all incidents for Team 1772 at Event A vs Event B.
* **Acceptance Criteria**: Knowledge Base and Incident detail views display event context badge (e.g. `brba 2026`).

---

## 2. Non-Functional Requirements

* **NFR-021-01 (Performance)**: Active context switching must re-render dashboard in `< 200ms`.
* **NFR-021-02 (Security)**: API middleware must verify user membership before returning team-private incidents.
* **NFR-021-03 (Data Integrity)**: Cascade deletes are disabled; removing a team membership does not delete past incidents.
