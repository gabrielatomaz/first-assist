# Technical Design — Dashboard & Tracking (FEAT-005)

## Frontend Views

### 1. `DashboardView.vue`
* Exists. Enhance with status filters and active category counts.
* Incorporates refresh timer triggers or WebSockets (Socket.io) to pull database updates automatically.

### 2. `IncidentDetailView.vue`
* Displays single ticket details (teamNumber, matchNumber, description, reportedBy name, assignment dropdowns).
* Embeds `AISuggestionPanel.vue` and `CommentSection.vue`.
* Status modifications (dropdown change) send patch requests.

---

## Backend Modules

### 1. `incidentController.js`
* **`updateStatus`**: Exists. Extend validator check to handle assignment details (`assignedTo`).
* **WebSockets (Socket.io)**: Server broadcasts change alerts (`incident_updated`) on modification.
