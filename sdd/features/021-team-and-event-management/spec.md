# Feature Specification: FEAT-021 — Multi-Team & Multi-Event Management Context

**Feature ID**: FEAT-021  
**Feature Name**: Multi-Team & Multi-Event Management Context  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-001, FR-003, FR-004, FR-006, FR-010  

---

## 1. Overview & Purpose

**FIRST Assist** serves technical volunteers (FTAs, CSAs) and team representatives (Lead Mentors, Team Captains, Team Members) during FIRST Robotics Competition (FRC) events.

This specification defines the domain model and application architecture for **Team and Event Management with Multi-Team / Multi-Event user relationships**:
1. **Canonical Team Entity**: Teams exist as unique canonical records identified by `teamNumber` (e.g. FRC 1772). Teams participate in multiple `Event`s without duplicating team data.
2. **Team-Scoped Roles**: Users can be associated with multiple teams. A user's role is scoped per team relationship (e.g., `LEAD_MENTOR` for Team 1772, `TEAM_CAPTAIN` for Team 9999).
3. **Event-Scoped Incident Context**: Incidents are bound to a composite `(teamNumber, eventCode)` context. Incidents from Event A vs Event B remain isolated and preserved for historical knowledge management.
4. **Active Context Switching**: Multi-team users switch between their active team (`activeTeamNumber`) and active event (`activeEventCode`) context to prevent accidental cross-team/event modifications.

---

## 2. Actors & Target Roles

* **Team Users**:
  * **Lead Mentor**: Primary adult mentor registered to a team; full management access for their team's incidents and roster.
  * **Team Captain**: Student leadership role; creates, tracks, and updates incidents for their team.
  * **Team Member**: Student/Mentor; reports technical issues for their team.
* **Event Volunteer Roles** (Global Context):
  * **FTA (FIRST Technical Advisor)**: Manages event rosters, active competition events, and assigns CSAs.
  * **CSA (Control System Advisor)**: Assists teams with control system troubleshooting across active event contexts.
  * **ADMIN (System Administrator)**: Oversees system users, global team rosters, and event registrations.

---

## 3. User Stories

* **US-21.1 (Multi-Team Membership)**: As a user affiliated with multiple FRC teams (e.g. Lead Mentor of Team 1772 and Team Captain of Team 9999), I want to switch my active team context so I can view and manage incidents for the correct team without mixing data.
* **US-21.2 (Multi-Event Context)**: As a team member, I want my team's incidents to be tied to the specific event where they occurred (e.g., Event A vs Event B) so our technical history is accurately preserved over time.
* **US-21.3 (Team Roster Management)**: As a Lead Mentor or Admin, I want to add users to my team with specific team-scoped roles (`LEAD_MENTOR`, `TEAM_CAPTAIN`, `TEAM_MEMBER`).
* **US-21.4 (Event Roster Association)**: As an FTA or Admin, I want to register teams to an event so that all team members participating in that event can submit and track incidents within that event's context.

---

## 4. Workflows & Functional Flows

### Main Flow: Active Context Selection & Incident Reporting
1. User logs in to FIRST Assist.
2. The system loads the user's team memberships (`memberships: [{ teamNumber, role }]`) and accessible events.
3. If the user has multiple team memberships, the system sets `activeTeamNumber` (defaulting to the primary/first team or last selected team).
4. The system sets `activeEventCode` based on the user's active team's registered events or active competition event.
5. When creating an incident:
   - `teamNumber` is automatically set to `activeTeamNumber`.
   - `eventCode` is automatically set to `activeEventCode`.
6. Dashboard filters display incidents matching `activeTeamNumber` and/or `activeEventCode`.

### Context Switching Flow
1. User clicks the Team/Event Context Switcher in the top navigation header.
2. User selects a different team from their associated teams list.
3. Frontend updates `authStore.activeTeamNumber` and loads available events for the new team.
4. UI updates instantly to show incidents, rosters, and stats strictly for the selected team/event pair.

---

## 5. Security & Isolation Rules

1. **Role Scoping**: Global roles (`ADMIN`, `FTA`, `CSA`) retain cross-team visibility within assigned event contexts. Team roles (`LEAD_MENTOR`, `TEAM_CAPTAIN`, `TEAM_MEMBER`) are restricted to incidents where `teamNumber === activeTeamNumber`.
2. **Context Validation**: API endpoints validating incident creation or modification check that `req.user` has active membership for the incident's `teamNumber` (or holds a global volunteer role).
3. **Data Integrity**: Team records (`number`, `name`, `rookieYear`) are unique and immutable across events.

---

## 6. Acceptance Criteria

* [ ] A user can belong to multiple teams with different team-scoped roles.
* [ ] Switching the active team context updates the incident board to show only that team's incidents.
* [ ] Incidents created preserve both `teamNumber` and `eventCode` in their document.
* [ ] Participating in a new event does not duplicate the canonical `Team` document.
* [ ] API prevents team users from reading or writing incidents belonging to teams they do not belong to.
