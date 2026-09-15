# Requirements: FEAT-023 — RAG-Enhanced AI Troubleshooting via Knowledge Base

**Feature ID**: FEAT-023  
**Feature Name**: RAG-Enhanced AI Diagnostics using Knowledge Base Context  

---

## 1. Functional Requirements

### FR-RAG-001: Knowledge Base Search Retrieval
* **Description**: The system MUST query resolved and closed incident records (`status` IN `['RESOLVED', 'CLOSED']`) upon receiving a request to generate AI suggestions for an active incident.
* **Filter Parameters**: Search MUST match target incident `category` and perform text matching on `description`, `rootCause`, and `appliedSolution`.
* **Limit**: The retrieval step MUST limit context records to top-3 highest-relevance matches to prevent context window clutter.

### FR-RAG-002: Grounded Prompt Construction
* **Description**: The backend prompt builder MUST format retrieved past incident records into a structured context block:
  ```text
  [KNOWLEDGE BASE RELEVANT HISTORICAL RESOLUTIONS]
  1. Team {teamNumber} (Match {matchNumber}):
     - Issue: {description}
     - Root Cause: {rootCause}
     - Applied Fix: {appliedSolution}
  ...
  ```
* **Instruction Constraint**: The prompt MUST instruct the model to prioritize solutions and root causes supported by the provided Knowledge Base context when diagnosing the current incident.

### FR-RAG-003: Graceful Fallback Strategy
* **Description**: If no relevant resolved incidents match the query (or if Knowledge Base has 0 records for the category), the system MUST switch to standard FRC technical troubleshooting prompt generation.
* **Flag Indicator**: The API response MUST explicitly set `isRagGrounded: false` when falling back.

### FR-RAG-004: Cited Sources Metadata
* **Description**: When RAG context is used, the system MUST persist the array of cited incident IDs (`citedIncidentIds`) and metadata (`teamNumber`, `matchNumber`) inside the `AISuggestion` document.
* **UI Attribution**: The frontend component `AISuggestionPanel.vue` MUST render a badge indicating *"Grounded in Knowledge Base"* and list the referenced historical team tickets.

### FR-RAG-005: On-Demand Re-generation
* **Description**: Clicking "Re-generate" on `AISuggestionPanel.vue` MUST re-execute the RAG pipeline, ensuring newly resolved tickets in the Knowledge Base are immediately incorporated into subsequent diagnoses.

---

## 2. Non-Functional Requirements

### NFR-RAG-001: Performance & Latency
* **Retrieval Latency**: MongoDB text search retrieval MUST complete in `< 200ms`.
* **Total Response Time**: End-to-end API execution (`POST /api/incidents/:id/ai-suggestions`) MUST complete in `< 2.5 seconds` using `gemini-2.5-flash`.

### NFR-RAG-002: Data Privacy & Anonymization
* **PII Exclusions**: The prompt builder MUST NOT include personal phone numbers or user email addresses from historical audit logs into the LLM context prompt. Only technical parameters (`teamNumber`, `matchNumber`, `category`, `description`, `rootCause`, `appliedSolution`) are sent.

### NFR-RAG-003: Reliability & Error Resilience
* **LLM Failures**: If the Gemini API endpoint times out or returns an error, the system MUST return a fallback structured suggestion or informative retry message without crashing the application.
* **Database Index**: The `Incident` schema text index (`description`, `category`, `rootCause`, `appliedSolution`) MUST be present in MongoDB to support fast text scoring.
