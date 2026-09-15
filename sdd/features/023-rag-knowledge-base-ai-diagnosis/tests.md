# Test Specification: FEAT-023 — RAG-Enhanced AI Troubleshooting via Knowledge Base

**Feature ID**: FEAT-023  
**Feature Name**: RAG AI Diagnostics Test Specification  

---

## 1. Test Strategy

Testing covers:
1. **Unit Tests**:
   - `aiService.test.js`: RAG retrieval query construction, text search filtering, and prompt context formatting.
2. **Integration Tests**:
   - `incidentRoutes.test.js`: `POST /api/incidents/:id/ai-suggestions` endpoint returns `isRagGrounded` and `citedIncidents` when resolved KB tickets exist.
3. **Frontend Component Tests**:
   - `AISuggestionPanel.spec.js`: Correct rendering of "Grounded in Knowledge Base" badge and citation details.

---

## 2. Test Cases

### TC-RAG-001: Knowledge Base Match Injection (Unit)
* **Preconditions**: Target incident category is `RADIO_COMMS`, description mentions "Radio disconnect".
* **Mock Data**: DB contains 2 resolved tickets with category `RADIO_COMMS`.
* **Action**: Invoke `buildRAGPrompt(incident, kbMatches)`.
* **Expected Result**: Generated prompt string contains `[VERIFIED KNOWLEDGE BASE COMPETITION RESOLUTIONS]` section with root causes and fixes from the 2 mock tickets.

### TC-RAG-002: Zero Match Fallback (Unit)
* **Preconditions**: Target incident category is `OTHER`, Knowledge Base has 0 matching records.
* **Action**: Invoke `generateRAGSuggestions(incidentId)`.
* **Expected Result**: Retrieval returns empty array `[]`, prompt falls back to standard FRC prompt, and output has `isRagGrounded: false`.

### TC-RAG-003: API End-to-End RAG Generation (Integration)
* **Action**: Send HTTP `POST /api/incidents/:id/ai-suggestions` with valid JWT token.
* **Expected Result**: Returns HTTP 200 OK with schema containing `suggestion`, `isRagGrounded`, and `citedIncidents`.

### TC-RAG-004: UI Citation Display (Frontend)
* **Action**: Mount `AISuggestionPanel.vue` with mock props `isRagGrounded = true` and `citedIncidents = [{ teamNumber: 254, matchNumber: 'Q12' }]`.
* **Expected Result**: Badge displays "Grounded in Knowledge Base", and ticket reference "Team 254 (Match Q12)" is rendered.
