# Scenarios — AI Troubleshooting (FEAT-006)

BDD test specs for AI diagnostic features.

## Scenarios

### Scenario 1: Trigger AI diagnosis on demand
* **Given** an authenticated user opens the Incident Detail View
* **When** the user clicks the "Generate AI Diagnosis" button
* **Then** the client sends a POST request to `/api/incidents/:id/ai-suggestions`
* **And** displays a loading spinner while generating
* **And** renders the generated suggestions once returned

### Scenario 2: Rate suggestions as helpful
* **Given** an active troubleshooting suggestion displays on screen
* **When** the CSA clicks the thumbs-up button
* **Then** the client sends a PATCH request to `/api/ai-suggestions/:id/rating` with value "HELPFUL"
* **And** the UI highlights the thumbs-up indicator
