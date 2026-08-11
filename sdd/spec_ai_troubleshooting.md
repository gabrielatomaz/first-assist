# Spec: AI-Powered Troubleshooting

## 1. Overview
To speed up resolution times during FRC events, FIRST Assist uses Artificial Intelligence to analyze an incident's description and suggest possible root causes and solutions based on historical data and FRC documentation.

## 2. Data Models
### `AISuggestion` (Mongoose Schema)
* `_id`: ObjectId
* `incidentId`: ObjectId (Ref: `Incident`)
* `suggestedCause`: String
* `suggestedSolution`: String
* `rating`: String (Enum: `['HELPFUL', 'NOT_HELPFUL', 'UNRATED']`, Default: `'UNRATED'`)
* `createdAt`: Date

## 3. Backend (Node.js/Express)
### `GET /api/incidents/:id/ai-suggestions`
* **Purpose:** Generate or retrieve AI suggestions for a specific incident.
* **Behavior:** 
  1. Check if an `AISuggestion` already exists for this `incidentId`. If yes, return it.
  2. If no, the Node.js server sends a prompt containing the incident `description` to an LLM provider (e.g., Google Gemini API).
  3. The LLM response is parsed, saved as a new `AISuggestion` document, and returned to the client.
### `PATCH /api/ai-suggestions/:id/rating`
* **Purpose:** Allow CSAs to rate the quality of the AI suggestion.
* **Payload:** `{ "rating": "HELPFUL" }`

## 4. Frontend (Vue.js)
### Components
* **`AISuggestionPanel.vue`**: 
  * Displays a loading spinner while fetching suggestions.
  * Renders the `suggestedCause` and `suggestedSolution`.
  * Provides two buttons: 👍 (Helpful) and 👎 (Not Helpful). Clicking one triggers the rating API and visually highlights the selection.

## 5. Acceptance Criteria
1. Opening an incident detail view triggers an automatic request for AI suggestions if they haven't been generated yet.
2. The Node.js backend successfully communicates with the external LLM API and handles timeout/error gracefully.
3. A CSA can rate the suggestion, and the rating is successfully persisted in the MongoDB database.
