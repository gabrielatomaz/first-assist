# Scenarios — Incident Reporting (FEAT-004)

BDD test specs for ticket creation.

## Scenarios

### Scenario 1: Report a text incident successfully
* **Given** an authenticated user is on the Incident Creation View
* **When** they fill in valid team number, match number, and description
* **And** click submit
* **Then** the client sends a POST request to `/api/incidents`
* **And** the server creates the ticket with status `OPEN` and redirects to the dashboard

### Scenario 2: Report voice incident successfully
* **Given** an authenticated user is using the Voice Recorder
* **When** they speak "Radio power drops on collision" and stop recording
* **And** submit the audio ticket
* **Then** the client uploads the payload to `/api/incidents/voice`
* **And** the server processes speech-to-text transcription
* **And** saves the incident with translated text
