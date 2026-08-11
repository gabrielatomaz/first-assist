# Spec: Incident Reporting (Text & Voice)

## 1. Overview
This specification covers how FTAs and CSAs create new technical incident tickets. To accommodate the fast-paced environment of an FRC event, users can submit incidents via a standard text form or by recording a voice memo that is transcribed automatically.

## 2. Data Models
### `Incident` (Mongoose Schema) - Creation fields
* `_id`: ObjectId
* `teamNumber`: Number (Required)
* `matchNumber`: String (Optional)
* `description`: String (Required)
* `audioUrl`: String (Optional)
* `status`: String (Default: `'OPEN'`)
* `reportedBy`: ObjectId (Ref: `User`)

## 3. Backend (Node.js/Express)
### `POST /api/incidents`
* **Purpose:** Create a text-based incident.
* **Headers:** `Authorization: Bearer <token>`
* **Payload:** 
  ```json
  { "teamNumber": 254, "matchNumber": "Q12", "description": "Robot lost comms mid-match." }
  ```
* **Success Response (201 Created):** Returns the created Incident object.

### `POST /api/incidents/voice`
* **Purpose:** Upload a voice memo, transcribe it, and create an incident.
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Payload:** FormData containing an `audio` Blob, plus `teamNumber` and `matchNumber`.
* **Behavior:** Node.js uploads the audio to a storage bucket (e.g., AWS S3), calls a Speech-to-Text API (e.g., Google Cloud Speech-to-Text), uses the transcription for the `description`, and saves the Incident.

## 4. Frontend (Vue.js)
### Views
* **`IncidentCreateView.vue`**: Contains input fields for Team Number and Match Number. Offers a toggle between "Text Description" and "Voice Record".
### Components
* **`VoiceRecorder.vue`**: Uses the `MediaRecorder` web API. Displays a pulsating recording indicator and a timer. Emits an audio `Blob` when recording stops.

## 5. Acceptance Criteria
1. An FTA can successfully create a ticket using only text.
2. A user can record audio from their device microphone.
3. Submitting audio displays a "Processing Transcription..." loading state.
4. The newly created incident defaults to the `OPEN` status.
