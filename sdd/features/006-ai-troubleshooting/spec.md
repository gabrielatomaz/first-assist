# Feature Spec — AI-Powered Troubleshooting (FEAT-006)

* **Status**: Partially Implemented (Mock generator routes exist, rating endpoints and display panels do not)
* **Priority**: High

## Purpose
Provides automated diagnostic suggestions based on reported issue descriptions to accelerate troubleshooting and helps evaluate suggestion accuracy.

## User Stories

### US-AI-001 — Get Suggestions
* **Story**: As a CSA investigating an incident, I want to trigger AI diagnosis recommendations on-demand using a button on the incident details page so that incident creation is instant and AI diagnosis is generated only when explicitly requested.
* **Acceptance Criteria**: Renders cause and solution text suggestions after user initiates generation via button click on incident details by ID.

### US-AI-002 — Rate Suggestions
* **Story**: As a CSA, I want to rate or provide feedback on the AI's suggestions so that the model can improve its accuracy for future events.
* **Acceptance Criteria**: Feedback ratings are persisted to database document parameters.
