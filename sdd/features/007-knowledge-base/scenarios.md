# Scenarios — Knowledge Base (FEAT-007)

## Scenarios

### Scenario 1: Resolve incident with mandatory documentation
* **Given** an authenticated CSA is on the Incident Detail View
* **When** they change status to "RESOLVED"
* **Then** the Resolve Incident Modal overlays the view
* **When** they fill in "Bad ethernet patch cable" and "Replaced ethernet cable"
* **And** click submit
* **Then** the client sends a POST request to `/api/incidents/:id/resolve`
* **And** the ticket transitions to `RESOLVED` status

### Scenario 2: Search by keyword debounces
* **Given** a volunteer is on the Knowledge Base search page
* **When** they type "radio" in the search input
* **Then** the client debounces input keypresses for 300ms before making the API request
* **And** displays matched incident cards on success
