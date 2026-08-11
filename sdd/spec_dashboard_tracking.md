# Spec: Real-Time Dashboard & Tracking

## 1. Overview
The real-time dashboard is the central hub for the FRC event's technical health. It displays all open incidents, allows CSAs to claim tickets (update status to `INVESTIGATING`), and supports commenting for coordination.

## 2. Data Models
### `Incident` (Mongoose Schema) - Tracking fields
* `status`: String (Enum: `['OPEN', 'INVESTIGATING', 'RESOLVED']`)
* `assignedTo`: ObjectId (Ref: `User`, Optional)

### `Comment` (Mongoose Schema)
* `_id`: ObjectId
* `incidentId`: ObjectId (Ref: `Incident`)
* `authorId`: ObjectId (Ref: `User`)
* `text`: String
* `createdAt`: Date

## 3. Backend (Node.js/Express)
### `GET /api/incidents`
* **Purpose:** Fetch active incidents. Supports query parameters (e.g., `?status=OPEN,INVESTIGATING`).
### `PATCH /api/incidents/:id/status`
* **Purpose:** Update the status of a specific ticket.
* **Payload:** `{ "status": "INVESTIGATING", "assignedTo": "user-id" }`
### `POST /api/incidents/:id/comments`
* **Purpose:** Add a comment to an incident.
### WebSockets (Socket.io)
* The Node.js server emits events (`incident_created`, `incident_updated`) to all connected clients whenever a modification occurs.

## 4. Frontend (Vue.js)
### Views
* **`DashboardView.vue`**: Displays a grid/list of `IncidentCard.vue` components. Connects to the Socket.io server to listen for real-time updates and merges them into the Pinia state.
* **`IncidentDetailView.vue`**: Shows full details. Includes a status dropdown to change the incident state.
### Components
* **`CommentSection.vue`**: Renders a list of comments and provides an input form.
* **`IncidentCard.vue`**: Uses color coding (e.g., Red = OPEN, Yellow = INVESTIGATING).

## 5. Acceptance Criteria
1. The dashboard automatically updates without a manual page refresh when a new incident is created by someone else.
2. A CSA can change an incident's status to `INVESTIGATING`, which visibly updates the ticket across all clients.
3. Users can add a comment to a ticket, and it appears immediately in the comment thread.
