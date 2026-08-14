# Feature Spec — Dashboard & Tracking (FEAT-005)

* **Status**: Partially Implemented (Basic layout and get/patch routes exist, status updates and detail screens do not)
* **Priority**: Critical

## Purpose
Provides a central dashboard interface mapping all active incident cards, allowing CSAs to claim tickets and track operational progress in real-time.

## User Stories

### US-DASH-001 — View Dashboard
* **Story**: As a volunteer, I want to view a real-time dashboard of all open incidents so that I am aware of the current technical health of the competition.
* **Acceptance Criteria**: Shows status tags with corresponding color coding.

### US-DASH-002 — Update Status
* **Story**: As a CSA, I want to update the status of an incident (e.g., Open, Investigating, Resolved) so that other volunteers know it is being handled.
* **Acceptance Criteria**: Changing status updates database values.

### US-DASH-003 — Claim/Assign Incident
* **Story**: As an FTA/CSA, I want to assign an incident to a specific CSA so that the appropriate person can take action.
