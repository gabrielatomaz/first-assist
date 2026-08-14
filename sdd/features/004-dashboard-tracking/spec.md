# FEAT-004 — Dashboard & Incident Tracking

| Field             | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| **Feature ID**    | FEAT-004                                                     |
| **Title**         | Real-Time Dashboard & Incident Tracking                      |
| **Status**        | PARTIALLY IMPLEMENTED                                        |
| **Priority**      | Critical                                                     |
| **Related FRs**   | FR-006 (View Dashboard), FR-007 (Update Status), FR-008 (Assign Incident) |
| **Epic**          | Epic 3 — Real-Time Tracking & Communication                  |
| **Dependencies**  | FEAT-001 (Authentication & Roles)                            |

---

## 1. Purpose

The Dashboard is the **central command hub** for monitoring the technical health of an FRC event in real-time. During a competition, dozens of robots rotate through qualification and elimination matches. Hardware failures — dead radios, loose CAN bus wires, brownouts, firmware mismatches — happen continuously. The Dashboard gives FTA and CSA volunteers a single-screen overview of every active incident so nothing falls through the cracks between matches.

This feature provides:
- A real-time grid of all incidents sorted by recency (newest first)
- Click-through to a detailed incident view with full context
- Status update controls (OPEN → INVESTIGATING → RESOLVED)
- Incident assignment to specific CSA volunteers
- Live updates so all connected volunteers see changes instantly

## 2. Actors

| Actor   | Role in this Feature                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| **FTA** | Views the dashboard to monitor event health. Can click into incidents they created. Read-only status access. |
| **CSA** | Views the dashboard, claims incidents (sets status to INVESTIGATING), updates status, assigns to self/other CSAs. |
| **ADMIN** | Full access. Can reassign incidents and override status.                                                  |

## 3. User Stories

- **US3.1**: As a volunteer, I want to view a real-time dashboard of all open incidents so that I am aware of the current technical health of the competition.
- **US3.3**: As a CSA, I want to update the status of an incident (Open → Investigating → Resolved) so that other volunteers know it is being handled.
- **US2.3**: As an FTA, I want to assign an incident to a specific CSA so that the appropriate person can take action immediately.

## 4. Main Flow

```
1. Authenticated user navigates to "/" (Dashboard)
2. Vue Router guard verifies JWT token (FEAT-001 dependency)
3. DashboardView mounts → Pinia store dispatches fetchIncidents()
4. incidentService.getAll() calls GET /api/incidents
5. Incidents render as IncidentCard grid, sorted newest-first
6. Status filter tabs (ALL / OPEN / INVESTIGATING / RESOLVED) allow filtering
7. User clicks an IncidentCard → router pushes to /incidents/:id
8. IncidentDetailView loads → fetches single incident + comments + AI suggestions
9. CSA selects new status from dropdown → PATCH /api/incidents/:id/status
10. Status change broadcasts via WebSocket to all connected clients
11. All dashboards update in real-time without manual refresh
```

## 5. Implementation Status

### ✅ IMPLEMENTED
- [DashboardView.vue](file:///home/gabriela/Documents/codes/first-assist/frontend/src/views/DashboardView.vue) — Fetches incidents from backend, renders IncidentCard grid, loading/error/empty states, manual refresh button, falls back to mock data when backend is unavailable
- [IncidentCard.vue](file:///home/gabriela/Documents/codes/first-assist/frontend/src/components/IncidentCard.vue) — Displays team number, match number, description (2-line clamp), status badge with color coding (Coral=OPEN, Yellow=INVESTIGATING, Teal=RESOLVED), "View Details →" button (non-functional)
- [GET /api/incidents](file:///home/gabriela/Documents/codes/first-assist/backend/src/routes/incidentRoutes.js#L6) — Returns all incidents sorted by `createdAt` descending
- [PATCH /api/incidents/:id/status](file:///home/gabriela/Documents/codes/first-assist/backend/src/routes/incidentRoutes.js#L8) — Updates incident status with enum validation
- [incidentRepository.findAll()](file:///home/gabriela/Documents/codes/first-assist/backend/src/repositories/incidentRepository.js#L4-L6) — MongoDB query with descending sort
- [incidentRepository.updateStatus()](file:///home/gabriela/Documents/codes/first-assist/backend/src/repositories/incidentRepository.js#L13-L15) — `findByIdAndUpdate` with `{ new: true }`

### ❌ NOT IMPLEMENTED
- **IncidentDetailView.vue** — No detail view exists; "View Details →" button on IncidentCard does nothing
- **Status update UI** — No dropdown or buttons in the frontend to trigger status changes
- **Incident assignment** — No `assignedTo` field on the Incident model, no UI for assignment
- **Real-time updates** — No WebSocket/Socket.io, no polling; only manual "↻ Refresh" button
- **Status filtering** — No filter tabs on the dashboard; all statuses shown together
- **Pinia store** — Pinia is installed (`package.json`) but no stores are defined; state lives in component `ref()`
- **API service layer** — Raw `fetch('http://localhost:3000/api/incidents')` calls directly in views
- **Auth protection** — No route guards, no JWT verification, no role-based access
- **Swagger documentation** — No OpenAPI spec for any endpoint
- **Tests** — No unit or integration tests for dashboard functionality

## 6. Acceptance Criteria

| ID       | Criterion                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| AC-004-1 | The dashboard loads all incidents within 2 seconds on a standard LAN connection at an FRC venue.               |
| AC-004-2 | Incidents display in a responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop (already implemented).  |
| AC-004-3 | Clicking an IncidentCard navigates to `/incidents/:id` and displays the full incident detail view.             |
| AC-004-4 | A CSA can change an incident status via a dropdown and the change persists to MongoDB.                         |
| AC-004-5 | Status changes propagate to all connected dashboard clients within 1 second via WebSocket.                     |
| AC-004-6 | Filter tabs (ALL / OPEN / INVESTIGATING / RESOLVED) correctly filter the displayed incidents.                  |
| AC-004-7 | An authenticated FTA or CSA can assign an incident to a specific CSA from a dropdown.                         |
| AC-004-8 | Unauthenticated users are redirected to `/login` (requires FEAT-001).                                        |
| AC-004-9 | The dashboard gracefully handles backend unavailability by showing cached/mock data with a warning banner.     |

## 7. Constraints & Assumptions

- **Network**: FRC venues often have constrained Wi-Fi. The dashboard must function on spotty connections and cache data locally via the PWA service worker.
- **Concurrency**: Multiple CSAs may attempt to claim the same incident. The backend must handle concurrent status updates gracefully (last-write-wins is acceptable for MVP).
- **Data volume**: A typical FRC regional has 30-60 teams with 80-120 matches. Peak incident count is unlikely to exceed 200 per event, so pagination is not required for MVP.
- **Dependency**: Full functionality requires FEAT-001 (authentication) to be implemented first. Without auth, `assignedTo` and role-based access controls cannot function.
