# Requirements Detail — AI Troubleshooting (FEAT-006)

Details requirements FR-012 and FR-013.

## FR-012 — Rate AI Suggestion
* **Actor**: CSA, FTA
* **Validation**: Validates feedback values: `['HELPFUL', 'NOT_HELPFUL', 'UNRATED']`.
* **HTTP Route**: `PATCH /api/ai-suggestions/:id/rating`

## FR-013 — Generate AI Suggestions
* **Actor**: User (manual button click trigger)
* **Preconditions**: Ticket exists.
* **HTTP Route**: `POST /api/incidents/:id/ai-suggestions`
* **Flow**: User opens detail page → frontend checks for existing suggestions via `GET /api/incidents/:id/ai-suggestions` → if user clicks "Generate AI Diagnosis" button → frontend sends `POST /api/incidents/:id/ai-suggestions` → server invokes LLM → parses result → saves suggestion to DB → returns payload.
