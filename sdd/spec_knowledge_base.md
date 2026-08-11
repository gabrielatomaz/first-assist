# Spec: Knowledge Base & History

## 1. Overview
The Knowledge Base ensures that the technical solutions discovered during an event are preserved. By enforcing documentation upon incident resolution, volunteers can later search a historical database to solve recurring issues quickly.

## 2. Data Models
### `Incident` (Mongoose Schema) - Resolution fields
* `status`: Reaches `'RESOLVED'`
* `resolvedAt`: Date
* `rootCause`: String
* `appliedSolution`: String

## 3. Backend (Node.js/Express)
### `POST /api/incidents/:id/resolve`
* **Purpose:** Mark an incident as resolved and document the fix.
* **Payload:** 
  ```json
  { "rootCause": "Radio lost power", "appliedSolution": "Replaced POE cable" }
  ```
### `GET /api/incidents/search`
* **Purpose:** Search through resolved incidents.
* **Query Params:** `?q=radio+power`
* **Behavior:** Node.js executes a MongoDB Text Search (`$text: { $search: query }`) against the `description`, `rootCause`, and `appliedSolution` fields.

## 4. Frontend (Vue.js)
### Views
* **`KnowledgeBaseView.vue`**: Contains a search input bar. Displays a list of results (resolved incidents) matching the query.
### Components
* **`ResolveIncidentModal.vue`**: A popup form that appears when a CSA tries to change an incident status to `RESOLVED`. It enforces that the `rootCause` and `appliedSolution` text areas are filled out before submission.

## 5. Acceptance Criteria
1. A CSA cannot change an incident's status to `RESOLVED` without providing both a root cause and an applied solution.
2. The search endpoint returns relevant resolved incidents based on keyword matching.
3. The frontend properly debounces the search input (e.g., waits 300ms after typing stops) before calling the backend API to prevent excessive network requests.
