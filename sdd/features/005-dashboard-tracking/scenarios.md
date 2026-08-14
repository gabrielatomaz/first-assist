# Scenarios — Dashboard & Tracking (FEAT-005)

## Scenarios

### Scenario 1: Claim an Incident
* **Given** an authenticated CSA is on the Incident Detail View for a ticket with status `OPEN`
* **When** they click "Claim Issue"
* **Then** the client sends a PATCH request to `/api/incidents/:id/status` with status value "INVESTIGATING" and their userId
* **And** the status badge changes to "INVESTIGATING" (Yellow color accent)
* **And** their name is registered under the assignee tag

### Scenario 2: Real-time update updates dashboard
* **Given** an authenticated volunteer is viewing the Dashboard
* **When** another user creates or updates a ticket status
* **Then** the dashboard state updates the card grid automatically
