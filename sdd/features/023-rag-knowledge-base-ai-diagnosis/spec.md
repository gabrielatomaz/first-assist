# Feature Specification: FEAT-023 — RAG-Enhanced AI Troubleshooting via Knowledge Base

**Feature ID**: FEAT-023  
**Feature Name**: Retrieval-Augmented Generation (RAG) AI Diagnostics using Knowledge Base Context  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-006 (AI Troubleshooting), FR-007 (Knowledge Base)  

---

## 1. Overview & Purpose

In FIRST Robotics Competition (FRC) events, rapid and accurate technical troubleshooting is critical to keeping robots operational on the field. The FIRST Assist platform maintains a **Knowledge Base** of verified, resolved competition incidents containing proven root causes and applied fixes.

Currently, the AI Assistant generates troubleshooting recommendations using general LLM knowledge. This feature introduces a **Retrieval-Augmented Generation (RAG)** pipeline:
1. **Knowledge Base Retrieval**: When a technician clicks **"Generate AI Diagnosis"** on an incident, the system first queries the MongoDB Knowledge Base for historically resolved or closed tickets (`status: { $in: ['RESOLVED', 'CLOSED'] }`) matching the current ticket's category, priority, description keywords, and event context.
2. **Context-Grounded Prompting**: If relevant historical resolutions are found, the system injects these exact past root causes and applied solutions into the Gemini LLM prompt as authoritative reference context.
3. **Cited Diagnostic Output**: The AI generates a tailored recommendation that explicitly cites past team resolutions when applicable (e.g., *"Based on a similar issue resolved for Team 254 (Match Q12)..."*).
4. **Intelligent Fallback**: If no relevant Knowledge Base records exist (or confidence score is below threshold), the AI seamlessly falls back to general FRC technical troubleshooting reasoning while notifying the user of the general source.

---

## 2. Actors & Target Roles

* **CSA (Control System Advisor)**: Triggers AI diagnosis on active incidents to quickly identify fixes based on past competition history.
* **FTA (FIRST Technical Advisor)**: Reviews AI recommendations to verify team root causes against historical event patterns.
* **System (RAG Pipeline & Gemini API)**: Retrieves relevant Knowledge Base context, constructs augmented prompts, and formats cited diagnostic recommendations.

---

## 3. User Stories

* **US-23.1 (RAG Retrieval on Trigger)**: As a CSA investigating a robot issue, I want the AI Assistant to automatically search the Knowledge Base when I request an AI diagnosis so that recommendations are grounded in real FRC competition fixes.
* **US-23.2 (Cited Knowledge Attribution)**: As a technician, I want to see which past team incidents informed the AI's diagnosis so that I can reference proven historical fixes.
* **US-23.3 (Fallback for Unique Issues)**: As a technician encountering a novel issue without prior Knowledge Base matches, I want the AI to provide general diagnostic troubleshooting steps without failing.
* **US-23.4 (Re-generation with Fresh KB Data)**: As a technician, when new tickets are resolved in the Knowledge Base, re-triggering AI diagnosis should pull the latest resolved context.

---

## 4. Workflows & Functional Flows

### Main Flow: RAG-Enhanced AI Diagnosis
1. User opens an incident detail view (`IncidentDetailView.vue`) and clicks **"Generate AI Diagnosis"**.
2. Frontend sends request `POST /api/incidents/:id/ai-suggestions`.
3. Backend service fetches target incident details (`category`, `description`, `teamNumber`, `eventCode`).
4. **Retrieval Step**: Backend executes a text and field search query on the `Incident` collection filtering for `status: { $in: ['RESOLVED', 'CLOSED'] }` and matching category/keywords.
5. **Context Evaluation**:
   - **If matches found (Score >= Threshold)**: Extract top-N (N=3) records (`teamNumber`, `matchNumber`, `description`, `rootCause`, `appliedSolution`). Build RAG prompt with past incident references.
   - **If no matches found**: Build general FRC troubleshooting prompt.
6. **Generation Step**: Call Gemini LLM API (`gemini-2.5-flash`) with the constructed prompt.
7. **Persistence & Response**: Save generated diagnosis into `AISuggestion` collection with `isRagGrounded` boolean and array of `citedIncidents`.
8. Frontend `AISuggestionPanel.vue` renders the structured diagnosis along with a **"Grounded in Knowledge Base"** badge and clickable citations.

---

## 5. Acceptance Criteria

* [ ] Clicking "Generate AI Diagnosis" triggers a RAG retrieval query against resolved Knowledge Base records (`status: RESOLVED` or `CLOSED`).
* [ ] Top relevant matches (up to 3) are injected as context into the Gemini LLM prompt.
* [ ] When KB context is present, the AI response references past resolutions and sets `isRagGrounded: true`.
* [ ] The UI (`AISuggestionPanel.vue`) displays a "Grounded in Knowledge Base" badge when historical context was utilized.
* [ ] If no relevant KB records match, the AI gracefully falls back to general reasoning without throwing errors (`isRagGrounded: false`).
* [ ] API execution completes within 2.5 seconds.
