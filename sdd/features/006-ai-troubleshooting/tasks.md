# Implementation Tasks — AI Troubleshooting (FEAT-006)

Tasks to complete AI diagnostic options.

## Task Backlog

- [x] **TASK-006-01: Decouple AI generation from incident creation**
  * Remove synchronous Gemini LLM call from `incidentService.createIncident`.
- [x] **TASK-006-02: Add POST endpoint for on-demand diagnosis generation**
  * Create `POST /api/incidents/:id/ai-suggestions` route and controller handler.
- [x] **TASK-006-03: Add trigger button & loading state in AISuggestionPanel**
  * Implement "Generate AI Diagnosis" button in frontend component.
