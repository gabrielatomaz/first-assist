# Feature Spec — Incident Reporting (FEAT-004)

* **Status**: Partially Implemented (Text is implemented, Voice is specified only)
* **Priority**: Critical

## Purpose
Allows field operators (FTAs, CSAs) to report technical anomalies using forms or voice recordings.

## User Stories

### US-INC-001 — Create Incident (Text)
* **Story**: As an FTA, I want to create a new incident ticket by filling out a structured form (team number, match number, issue type) so that the problem is properly documented.
* **Acceptance Criteria**: Form validates Team Number and Description.

### US-INC-002 — Create Incident (Voice)
* **Story**: As an FTA/CSA in the field, I want to open an incident ticket using voice recording (audio to text) so that I can quickly report an issue without having to type while attending to a robot.
* **Acceptance Criteria**: Shows "Processing Transcription..." during transcription.
