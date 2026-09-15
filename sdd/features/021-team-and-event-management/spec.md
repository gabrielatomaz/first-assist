# Feature Specification: FEAT-021 — Multi-Team & Multi-Event Management Context & FTA Team Approval

**Feature ID**: FEAT-021  
**Feature Name**: Multi-Team & Multi-Event Management Context & FTA Team Approval  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-001, FR-003, FR-004, FR-006, FR-010  

---

## 1. Executive Summary & Business Context

**FIRST Assist** is a technical-support and knowledge-management application built for the **FIRST Robotics Competition (FRC)**. It empowers FRC teams and technical volunteers (FTAs, CSAs) to register, investigate, manage, diagnose, and resolve technical incidents during competition events, while preserving historical incident knowledge for future troubleshooting.

### 1.1 Team Roles & Strict Role Limits
An FRC team consists of users accessing FIRST Assist under team-scoped roles:
* **Lead Mentor**: Primary adult mentor for a team.
* **Team Captain**: Student leadership role.
* **Team Member**: Student or mentor participating on the team.

#### **Role Multiplicity Constraint**:
* **Maximum 1 Active Lead Mentor per Team**: Each canonical team can have **at most 1 active Lead Mentor (`LEAD_MENTOR`)** at any given time.
* **Maximum 1 Active Team Captain per Team**: Each canonical team can have **at most 1 active Team Captain (`TEAM_CAPTAIN`)** at any given time.
* **Team Members (`TEAM_MEMBER`)**: Uncapped number of additional students and mentors.

### 1.2 Shared Incident Responsibilities
Both the **Lead Mentor** and **Team Captain** hold **equal authority and responsibilities** for managing technical incidents for their team:
* **Create Incidents**: Submit technical issue reports for their `(activeTeamNumber, activeEventCode)`.
* **Edit Incidents**: Update incident description, severity, status, match number, or technical details.
* **Delete / Close Incidents**: Delete or resolve/close technical incident tickets for their team.

### 1.3 Team-Scoped Roles & Multi-Team Membership
Users are **not restricted to a single team**. A user can belong to multiple FRC teams, and their role is **scoped per team relationship**:
* *Example*: A user can be **Lead Mentor** for **Team 1772** (where no other Lead Mentor is active) and **Team Captain** for **Team 9999** (where no other Team Captain is active).

### 1.4 Event Preservation & Canonical Teams
* **Canonical Teams**: A team (e.g. FRC 1772) is a canonical system entity with a unique `teamNumber`. Participating in multiple events (**Event A**, **Event B**) links the event to the same canonical team record without creating duplicate team documents.
* **Event-Scoped Incident Context**: Incidents belong to a composite `(teamNumber, eventCode)` context. Incidents from **Event A** vs **Event B** are isolated per event to preserve historical records while remaining searchable in the Knowledge Base.

### 1.5 Team Access & FTA Approval Workflow (Following the FTA Pattern)
To ensure system security and event alignment, team onboarding follows the **FTA Access Request pattern**:
1. Team users submit a **Team Access Request** from the **Login page** (`LoginView.vue`) via a public modal (`TeamAccessRequestModal.vue`), following the same pattern as the existing FTA Access Request link/modal. The link appears in the login page footer alongside the FTA request link.
2. **FTA Event-Scoped Approval**: An **FTA (FIRST Technical Advisor)** can review and **approve/accept** pending team requests **for any competition event the FTA is registered/assigned to** (`fta.assignedEventCodes.includes(request.eventCode)` or `ADMIN`).
3. **Role Limit Validation**: When approving a request for a `LEAD_MENTOR` or `TEAM_CAPTAIN`, the system checks that the team does not already have an active user in that role. If one exists, the approval is rejected.

---

## 2. Actors & Target Roles

| Actor | Role Scope | Multiplicity Limit | Incident Permissions |
| :--- | :--- | :--- | :--- |
| **Lead Mentor** | Team-Scoped | **Max 1 per team** | Full Incident Control (Add, Edit, Delete, Resolve) |
| **Team Captain** | Team-Scoped | **Max 1 per team** | Full Incident Control (Add, Edit, Delete, Resolve) |
| **Team Member** | Team-Scoped | Uncapped | View and Add Incidents for team |
| **FTA** | Event-Scoped / Global | Uncapped | Event roster management, approve team requests for assigned events |
| **CSA** | Event-Scoped / Global | Uncapped | Diagnostic, investigation, and status update across event teams |
| **ADMIN** | System-Wide | Uncapped | Full global system oversight and approval |

---

## 3. User Stories

* **US-21.1 (Multi-Team Membership)**: As a user affiliated with multiple teams, I want to switch my active team context so I can view and manage incidents for the correct team without mixing data.
* **US-21.2 (Lead Mentor & Team Captain Shared Authority)**: As a Lead Mentor or Team Captain, I want equal ability to create, edit, and delete incident tickets for my team so we can respond quickly during matches.
* **US-21.3 (Role Limit Enforcement)**: As an FTA or Admin, I want the system to enforce that a team has at most 1 active Lead Mentor and 1 active Team Captain to prevent conflicting team leadership.
* **US-21.4 (Team Access Request - FTA Pattern)**: As a Lead Mentor or Team Captain, I want to submit a team access request for a specific event so our team can participate in FIRST Assist.
* **US-21.5 (FTA Event-Scoped Approval)**: As an FTA, I want to review and approve team access requests for events I am assigned to.

---

## 4. Acceptance Criteria

* [ ] A canonical team can have at most **1 active Lead Mentor** and **1 active Team Captain** at any time.
* [ ] Attempting to assign a second active `LEAD_MENTOR` or `TEAM_CAPTAIN` to a team returns a validation error.
* [ ] Both **Lead Mentor** and **Team Captain** can add, edit, and delete incidents for their active team context.
* [ ] Team access requests follow the FTA request pattern via a public modal.
* [ ] FTAs can approve pending team requests for any event they are registered/assigned to.
* [ ] Incidents store both `teamNumber` and `eventCode`, maintaining historical isolation.
