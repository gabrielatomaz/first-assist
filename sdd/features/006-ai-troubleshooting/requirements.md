# Requirements Detail — AI Troubleshooting (FEAT-006)

Details requirements FR-012 and FR-013.

## FR-012 — Rate AI Suggestion
* **Actor**: CSA, FTA
* **Validation**: Validates feedback values: `['HELPFUL', 'NOT_HELPFUL', 'UNRATED']`.
* **HTTP Route**: `PATCH /api/ai-suggestions/:id/rating`

## FR-013 — Generate AI Suggestions
* **Actor**: System (automatic trigger)
* **Preconditions**: Ticket exists.
* **Flow**: User opens detail page → frontend calls `GET /api/incidents/:id/ai-suggestions` → server checks database cache → calls LLM if empty → parses result → saves suggestion → returns payload.
