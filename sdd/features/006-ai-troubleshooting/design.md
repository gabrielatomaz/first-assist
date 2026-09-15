# Technical Design — AI Troubleshooting (FEAT-006)

## Frontend Components

### 1. `AISuggestionPanel.vue`
* Embedded in the detail view.
* Displays a "Generate AI Diagnosis" trigger button when no suggestion is available.
* Displays a loading state spinner during LLM suggestion generation upon button click.
* Renders suggested cause and suggested solution in structured format.
* Renders feedback triggers (thumbs-up and thumbs-down button widgets) that toggle active colors when selected.

---

## Backend Modules

### 1. `aiSuggestionRepository.js`
* Exists. Houses database queries (`findByIncidentId`, `create`).

### 2. `incidentService.js`
* **`generateAISuggestions`**: Invokes `generateDiagnosticSuggestion` on-demand for a given incident ID, fetching related resolved tickets for context and saving/updating the DB record.
* **`createIncident`**: Creates the incident ticket immediately without waiting for AI diagnostic generation.
