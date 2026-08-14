# Technical Design — Incident Reporting (FEAT-004)

## Frontend Views

### 1. `IncidentCreateView.vue`
* Input forms for Team Number and Match Number.
* Select option toggles between standard text textarea and microphone recording.
* Includes dynamic state management bindings to hide/show `VoiceRecorder.vue`.

### 2. `VoiceRecorder.vue`
* Utilizes browser `navigator.mediaDevices.getUserMedia` checks.
* Renders visual indicators (recording state and timers).
* Emits resulting audio file blob to parent container.

---

## Backend Modules

### 1. `incidentController.js`
* **`createIncident`**: Exists. Needs extension to append auth properties (`reportedBy` User reference).
* **`createVoiceIncident`**: Needs creation. Receives multipart payloads, stores raw audio, calls Speech-to-Text APIs, and saves.
