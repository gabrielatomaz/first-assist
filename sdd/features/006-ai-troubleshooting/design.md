# Technical Design — AI Troubleshooting (FEAT-006)

## Frontend Components

### 1. `AISuggestionPanel.vue`
* Embedded in the detail view.
* Displays a loading state spinner during transit.
* Renders suggested cause and suggested solution in structured markdown format.
* Renders feedback triggers (thumbs-up and thumbs-down button widgets) that toggle active colors when selected.

---

## Backend Modules

### 1. `aiSuggestionRepository.js`
* Exists. Houses database queries (`findByIncidentId`, `create`).

### 2. `incidentService.js`
* **`getAISuggestionsForIncident`**: Exists. Extend simulation pattern to integrate API requests targeting a configured LLM service (e.g. Gemini API).
