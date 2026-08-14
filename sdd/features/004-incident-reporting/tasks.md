# Implementation Tasks — Incident Reporting (FEAT-004)

Tasks to build and improve incident reporting.

## Task Backlog

- [ ] **TASK-004-01: Update existing POST route with authentication**
  * Require JWT validation on `POST /api/incidents`. Connect incoming `req.user.userId` to model fields.
- [ ] **TASK-004-02: Build voice upload controller**
  * Create `POST /api/incidents/voice` handler to upload audio, call mock Speech-to-Text translation service, and save.
- [ ] **TASK-004-03: Create VoiceRecorder component**
  * Build browser microphone hooks, capture blob state, and emit recording buffers.
- [ ] **TASK-004-04: Connect frontend views to voice workflows**
  * Integrate toggles, loading state parameters, and link forms.
