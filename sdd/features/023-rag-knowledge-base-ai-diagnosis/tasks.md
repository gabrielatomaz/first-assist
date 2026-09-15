# Task Breakdown: FEAT-023 — RAG-Enhanced AI Troubleshooting via Knowledge Base

**Feature ID**: FEAT-023  
**Feature Name**: Implementation Task Breakdown  

---

## 1. Backend Tasks

- [ ] **TASK-23.1 (Schema & Model Extension)**: Extend `AISuggestion` schema (`backend/src/models/AISuggestion.js`) with `isRagGrounded` (`Boolean`) and `citedIncidents` array fields.
- [ ] **TASK-23.2 (Knowledge Base Retriever Service)**: Implement `searchKnowledgeBaseForRAG(incident)` in `backend/src/services/aiService.js` or `incidentService.js` to query top-3 resolved/closed incidents matching category and text keywords.
- [ ] **TASK-23.3 (RAG Prompt Builder)**: Implement `buildRAGPrompt(targetIncident, kbMatches)` in `aiService.js` to inject retrieved `description`, `rootCause`, and `appliedSolution` into Gemini 2.5 prompt.
- [ ] **TASK-23.4 (Controller & Endpoint Integration)**: Update `generateAISuggestions` controller in `backend/src/controllers/incidentController.js` to run the RAG pipeline on `POST /api/incidents/:id/ai-suggestions`.
- [ ] **TASK-23.5 (Fallback Logic)**: Add logic to handle zero-match scenarios seamlessly by falling back to standard LLM troubleshooting.

---

## 2. Frontend Tasks

- [ ] **TASK-23.6 (UI Citations & Grounded Badge)**: Update `AISuggestionPanel.vue` (`frontend/src/components/AISuggestionPanel.vue`) to render:
  - **"Grounded in Knowledge Base"** badge (`isRagGrounded === true`).
  - Accordion / list of **Cited Knowledge Base Tickets** (Team Number, Match Number, Applied Solution) linked to historical records.
- [ ] **TASK-23.7 (Loading & Error States)**: Add clean loading spinner and retry error banner during RAG generation.

---

## 3. Verification & Documentation Tasks

- [ ] **TASK-23.8 (Unit & Integration Tests)**: Add tests for `searchKnowledgeBaseForRAG` retriever and RAG prompt builder.
- [ ] **TASK-23.9 (Build Verification)**: Run `npm run build` in `frontend/` and `node --check` across backend files.
- [ ] **TASK-23.10 (Walkthrough Artifact Update)**: Document completion in `walkthrough.md`.
