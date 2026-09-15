# Scenarios: FEAT-023 — RAG-Enhanced AI Troubleshooting via Knowledge Base

**Feature ID**: FEAT-023  
**Feature Name**: Gherkin Acceptance Scenarios for RAG AI Diagnostics  

---

## Feature: RAG-Enhanced AI Troubleshooting Diagnostics

  As a technical volunteer (CSA / FTA) investigating a robot issue at an FRC event,
  I want the AI Assistant to query historical Knowledge Base resolutions first,
  So that diagnostic suggestions are grounded in real, proven competition fixes.

---

### Scenario 1: Generate AI Diagnosis with Relevant Knowledge Base Match
  Given an active incident ticket for Team 1860 with category "RADIO_COMMS" and description "Radio dropping link during collision"
  And the Knowledge Base contains a resolved incident for Team 254 with category "RADIO_COMMS" and root cause "Loose RJ45 Ethernet cable"
  When the CSA clicks "Generate AI Diagnosis" on the incident details page
  Then the backend executes a RAG search against resolved Knowledge Base incidents
  And the Gemini AI prompt is constructed containing Team 254's historical root cause and applied fix
  And the generated AI suggestion references Team 254's resolution
  And the UI displays a "Grounded in Knowledge Base" badge and citation details

---

### Scenario 2: Generate AI Diagnosis when No Knowledge Base Matches Exist
  Given an active incident ticket with a novel category or description with 0 matching Knowledge Base records
  When the CSA clicks "Generate AI Diagnosis"
  Then the backend RAG search returns 0 relevant historical records
  And the system automatically falls back to general FRC technical troubleshooting reasoning
  And the response sets `isRagGrounded` to false
  And the UI displays the general diagnosis without throwing errors

---

### Scenario 3: Re-generating AI Diagnosis After New Tickets are Resolved
  Given an incident ticket for Team 7033 with an un-diagnosed CAN Bus issue
  And a technician recently resolved a similar CAN Bus ticket for Team 148 in the Knowledge Base
  When the CSA clicks "Generate AI Diagnosis" (or "Re-generate")
  Then the RAG retrieval pipeline immediately retrieves Team 148's new resolved record
  And the generated AI recommendation incorporates Team 148's solution

---

### Scenario 4: Error Handling when Gemini LLM Service Times Out
  Given an active incident ticket
  And the Google Gemini API service is unreachable or timing out
  When the CSA clicks "Generate AI Diagnosis"
  Then the system returns a HTTP 503 error with message "AI Diagnostic Service unavailable. Please try again."
  And the UI displays an error alert with a retry button
