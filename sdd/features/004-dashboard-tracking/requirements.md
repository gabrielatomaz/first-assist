# FEAT-004 — Requirements

## 1. Functional Requirements

### FR-006: View Dashboard

| ID        | Requirement                                                                                                  | Status                  |
| --------- | ------------------------------------------------------------------------------------------------------------ | ----------------------- |
| FR-006-01 | The system SHALL display all incidents in a responsive card grid sorted by `createdAt` descending.            | ✅ IMPLEMENTED           |
| FR-006-02 | Each incident card SHALL display: team number, match number (or "N/A"), description (truncated), status badge.| ✅ IMPLEMENTED           |
| FR-006-03 | Status badges SHALL use color coding: Coral (#E66A4E) for OPEN, Yellow (#DCA951) for INVESTIGATING, Teal (#3A8B8C) for RESOLVED. | ✅ IMPLEMENTED |
| FR-006-04 | The grid SHALL be responsive: 1 column ≤768px, 2 columns 768-1024px, 3 columns ≥1024px.                     | ✅ IMPLEMENTED           |
| FR-006-05 | The dashboard SHALL show a loading spinner while fetching incidents.                                          | ✅ IMPLEMENTED           |
| FR-006-06 | The dashboard SHALL show an error banner and fall back to mock data if the backend is unreachable.            | ✅ IMPLEMENTED           |
| FR-006-07 | The dashboard SHALL show "No active incidents. The field is clear!" when zero incidents exist.                | ✅ IMPLEMENTED           |
| FR-006-08 | The dashboard SHALL provide filter tabs to filter incidents by status: ALL, OPEN, INVESTIGATING, RESOLVED.    | ❌ NOT IMPLEMENTED       |
| FR-006-09 | The dashboard SHALL update in real-time when incidents are created, updated, or resolved by other users.       | ❌ NOT IMPLEMENTED       |
| FR-006-10 | Clicking an incident card SHALL navigate to the Incident Detail View at `/incidents/:id`.                     | ❌ NOT IMPLEMENTED       |
| FR-006-11 | The dashboard SHALL be protected by an authentication guard requiring a valid JWT.                            | ❌ NOT IMPLEMENTED       |
| FR-006-12 | The dashboard SHALL display the assigned CSA's name on each incident card (if assigned).                     | ❌ NOT IMPLEMENTED       |

### FR-007: Update Incident Status

| ID        | Requirement                                                                                                  | Status                  |
| --------- | ------------------------------------------------------------------------------------------------------------ | ----------------------- |
| FR-007-01 | The backend SHALL accept PATCH requests to `/api/incidents/:id/status` with a `status` field.                | ✅ IMPLEMENTED           |
| FR-007-02 | The backend SHALL validate that `status` is one of: OPEN, INVESTIGATING, RESOLVED.                           | ✅ IMPLEMENTED           |
| FR-007-03 | The backend SHALL return the updated incident document with `{ new: true }`.                                  | ✅ IMPLEMENTED           |
| FR-007-04 | The Incident Detail View SHALL provide a status dropdown allowing CSA/ADMIN to change status.                | ❌ NOT IMPLEMENTED       |
| FR-007-05 | Changing status to RESOLVED SHALL trigger the ResolveIncidentModal (FEAT-007 dependency) requiring rootCause and appliedSolution. | ❌ NOT IMPLEMENTED |
| FR-007-06 | The frontend SHALL optimistically update the local Pinia state before the API response arrives.               | ❌ NOT IMPLEMENTED       |
| FR-007-07 | Status updates SHALL be broadcast to all connected clients via WebSocket.                                     | ❌ NOT IMPLEMENTED       |
| FR-007-08 | Only users with role CSA or ADMIN SHALL be allowed to update incident status (backend middleware).            | ❌ NOT IMPLEMENTED       |

### FR-008: Assign Incident

| ID        | Requirement                                                                                                  | Status                  |
| --------- | ------------------------------------------------------------------------------------------------------------ | ----------------------- |
| FR-008-01 | The Incident model SHALL include an `assignedTo` field (ObjectId, ref: User, optional).                      | ❌ NOT IMPLEMENTED       |
| FR-008-02 | The PATCH `/api/incidents/:id/status` endpoint SHALL also accept an optional `assignedTo` field.              | ❌ NOT IMPLEMENTED       |
| FR-008-03 | The Incident Detail View SHALL display a CSA assignment dropdown listing users with role CSA.                 | ❌ NOT IMPLEMENTED       |
| FR-008-04 | When a CSA sets status to INVESTIGATING, the system SHALL auto-assign the incident to that CSA if unassigned. | ❌ NOT IMPLEMENTED       |
| FR-008-05 | Only FTA, CSA, and ADMIN roles SHALL be able to assign incidents.                                            | ❌ NOT IMPLEMENTED       |

## 2. Non-Functional Requirements

| ID         | Requirement                                                                                               | Category    |
| ---------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| NFR-004-01 | Dashboard initial load SHALL complete within 2 seconds on a 10 Mbps LAN (typical FRC venue network).     | Performance |
| NFR-004-02 | Real-time updates SHALL propagate to all clients within 1 second of the status change.                    | Performance |
| NFR-004-03 | The dashboard SHALL function offline using PWA cached data (read-only mode).                              | Reliability |
| NFR-004-04 | Status update API SHALL handle concurrent requests without data corruption (MongoDB atomic update).       | Reliability |
| NFR-004-05 | All API endpoints SHALL validate the JWT token and reject unauthenticated requests with HTTP 401.         | Security    |
| NFR-004-06 | Role-based access SHALL enforce that only CSA/ADMIN can modify incident status.                           | Security    |
| NFR-004-07 | The dashboard SHALL support at least 50 concurrent WebSocket connections per event.                       | Scalability |
| NFR-004-08 | API endpoints SHALL be documented with OpenAPI 3.0 / Swagger annotations.                                | Maintainability |

## 3. Data Requirements

### Incident Model — Current Fields (IMPLEMENTED)

```javascript
// file: backend/src/models/Incident.js
{
  teamNumber:  { type: Number, required: true },
  matchNumber: String,
  description: { type: String, required: true },
  status:      { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'], default: 'OPEN' }
  // timestamps: true → createdAt, updatedAt auto-generated
}
```

### Incident Model — Required Additional Fields (NOT IMPLEMENTED)

```javascript
{
  reportedBy:      { type: ObjectId, ref: 'User' },          // FEAT-001 dependency
  assignedTo:      { type: ObjectId, ref: 'User' },          // FR-008
  resolvedAt:      Date,                                      // FEAT-007 dependency
  rootCause:       String,                                    // FEAT-007 dependency
  appliedSolution: String                                     // FEAT-007 dependency
}
```

## 4. Interface Requirements

### API Endpoints Used by This Feature

| Method | Endpoint                        | Status         | Auth Required |
| ------ | ------------------------------- | -------------- | ------------- |
| GET    | `/api/incidents`                | ✅ IMPLEMENTED  | ❌ None (needs auth) |
| GET    | `/api/incidents/:id`            | ❌ NOT IMPLEMENTED | Yes (any role) |
| PATCH  | `/api/incidents/:id/status`     | ✅ IMPLEMENTED  | ❌ None (needs auth) |
| GET    | `/api/users?role=CSA`           | ❌ NOT IMPLEMENTED | Yes (FTA/CSA/ADMIN) |

### WebSocket Events

| Event              | Direction       | Payload                  | Status             |
| ------------------ | --------------- | ------------------------ | -------------------|
| `incident:created` | Server → Client | Full incident document   | ❌ NOT IMPLEMENTED  |
| `incident:updated` | Server → Client | Updated incident document| ❌ NOT IMPLEMENTED  |
| `incident:deleted` | Server → Client | `{ incidentId }`         | ❌ NOT IMPLEMENTED  |

## 5. Dependencies

| Dependency | Feature        | Nature                                                      |
| ---------- | -------------- | ----------------------------------------------------------- |
| Hard       | FEAT-001       | Authentication required for route guards, `reportedBy`, `assignedTo`, role-based status updates |
| Soft       | FEAT-005       | Comments displayed on Incident Detail View (can show empty state without) |
| Soft       | FEAT-006       | AI Suggestions displayed on Incident Detail View (can show empty state without) |
| Hard       | FEAT-007       | Resolve flow requires rootCause/appliedSolution modal       |
