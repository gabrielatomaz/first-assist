# FEAT-004 — Usage Scenarios

## Scenario 1: CSA Opens Dashboard at Start of Competition Day

**Actor**: Maria (CSA)
**Precondition**: Maria has authenticated via FEAT-001 and has role `CSA`.

| Step | Action                                                                 | Expected Result                                                                                   |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1    | Maria opens the FIRST Assist app on her phone                          | Vue Router guard verifies JWT; loads DashboardView                                                |
| 2    | DashboardView mounts                                                   | `useIncidentStore().fetchIncidents()` dispatches GET `/api/incidents`                             |
| 3    | Loading spinner appears while request is in flight                     | Animated teal spinner with "Loading incidents..." text                                            |
| 4    | API returns empty array (no incidents yet on day 1)                    | Empty state: "No active incidents. The field is clear!" with green checkmark                      |
| 5    | Maria sees the status filter tabs: ALL (0), OPEN (0), INVESTIGATING (0), RESOLVED (0) | All tabs show zero count; ALL is selected by default                           |

---

## Scenario 2: FTA Reports Incident, CSA Sees It In Real-Time

**Actors**: John (FTA), Maria (CSA)
**Precondition**: Both are authenticated and on the Dashboard. WebSocket connections are active.

| Step | Actor | Action                                                                 | Expected Result                                                                      |
| ---- | ----- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1    | John  | Navigates to `/create` and submits an incident for Team 254, Match Q12 | POST `/api/incidents` returns 201; server emits `incident:created` via WebSocket     |
| 2    | Maria | Is viewing the Dashboard (did NOT refresh)                             | WebSocket `incident:created` event fires → Pinia store prepends incident to array    |
| 3    | Maria | Sees a new IncidentCard appear at the top of the grid                  | Card shows: Team 254, Match Q12, status badge "OPEN" (coral), truncated description  |
| 4    | Maria | Checks filter tab counts                                              | ALL (1), OPEN (1), INVESTIGATING (0), RESOLVED (0)                                  |

---

## Scenario 3: CSA Claims and Investigates an Incident

**Actor**: Maria (CSA)
**Precondition**: An OPEN incident for Team 254 exists on the dashboard.

| Step | Action                                                                              | Expected Result                                                                           |
| ---- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1    | Maria clicks the IncidentCard for Team 254                                          | Router navigates to `/incidents/665a1b2c3d4e5f6a7b8c9d0e`; IncidentDetailView loads      |
| 2    | Detail view fetches incident data                                                   | Full description displayed. Status dropdown shows "OPEN". Assignment dropdown shows "Unassigned" |
| 3    | Maria selects "INVESTIGATING" from the status dropdown                              | PATCH `/api/incidents/:id/status` fires with `{ status: "INVESTIGATING" }`                |
| 4    | Backend auto-assigns Maria (since she changed to INVESTIGATING and was unassigned)  | `assignedTo` set to Maria's user ID. WebSocket broadcasts `incident:updated`              |
| 5    | Maria sees the status badge change to yellow "INVESTIGATING"                        | Dropdown reflects new status. "Assigned to: Maria (CSA)" now visible                      |
| 6    | On John's Dashboard, the IncidentCard for Team 254 updates                          | Status badge changes from coral "OPEN" to yellow "INVESTIGATING" without page refresh     |

---

## Scenario 4: CSA Views Incident Detail with All Sections

**Actor**: Maria (CSA)
**Precondition**: Incident for Team 1678 exists with status INVESTIGATING, has AI suggestions and 2 comments.

| Step | Action                                                     | Expected Result                                                              |
| ---- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1    | Maria clicks the Team 1678 card on the Dashboard           | IncidentDetailView loads at `/incidents/:id`                                 |
| 2    | Page renders three sections below the incident header      | 🤖 AI Suggestions panel, 💬 Comments section, [Resolve Incident] button     |
| 3    | AI Suggestions panel shows cause and solution              | AISuggestionPanel.vue (FEAT-006) renders with thumbs up/down buttons         |
| 4    | Comments section shows 2 existing comments                 | CommentSection.vue (FEAT-005) renders comments chronologically               |
| 5    | Maria clicks "← Back to Dashboard"                         | Router navigates back to `/`; incident store still has cached data           |

---

## Scenario 5: Dashboard Status Filtering

**Actor**: Maria (CSA)
**Precondition**: Dashboard has 3 OPEN, 2 INVESTIGATING, and 5 RESOLVED incidents.

| Step | Action                                       | Expected Result                                                             |
| ---- | -------------------------------------------- | --------------------------------------------------------------------------- |
| 1    | Maria views the Dashboard (ALL tab active)   | Grid shows all 10 incidents, sorted newest first                            |
| 2    | Maria clicks "OPEN" tab                      | Grid shows only 3 OPEN incidents. Tab counts unchanged: ALL(10), OPEN(3)    |
| 3    | Maria clicks "INVESTIGATING" tab             | Grid shows only 2 INVESTIGATING incidents                                   |
| 4    | Maria clicks "RESOLVED" tab                  | Grid shows 5 RESOLVED incidents (with teal status badges)                   |
| 5    | Maria clicks "ALL" tab                       | Grid returns to showing all 10 incidents                                    |
| 6    | While on OPEN tab, a new incident is created (WebSocket) | New card appears in grid. Tab count updates: OPEN(4), ALL(11)     |

---

## Scenario 6: Backend Unavailable — Graceful Degradation

**Actor**: Maria (CSA)
**Precondition**: Backend server is down (common during FRC venue setup).

| Step | Action                                               | Expected Result                                                                                  |
| ---- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1    | Maria opens the Dashboard                            | GET `/api/incidents` fails with network error                                                    |
| 2    | Catch block triggers in the Pinia store action        | `store.error` is set to "Failed to fetch incidents. Showing cached data."                        |
| 3    | If PWA cache has previous data                       | Service worker returns cached response; incidents display normally                                |
| 4    | If no cached data and no PWA cache                   | Error banner shows: "Backend unavailable. Showing mock data." Mock incidents displayed (current behavior) |
| 5    | Maria clicks "↻ Refresh"                             | Retries the API call. If backend came back up, incidents load normally                            |

---

## Scenario 7: Concurrent Status Update Conflict

**Actors**: Maria (CSA), Carlos (CSA)
**Precondition**: Same incident for Team 971 is OPEN. Both Maria and Carlos are viewing its detail page.

| Step | Actor  | Action                                               | Expected Result                                                               |
| ---- | ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | Maria  | Changes status to INVESTIGATING                      | PATCH succeeds. WebSocket broadcasts update. Maria's UI shows INVESTIGATING   |
| 2    | Carlos | (0.5s later) Also changes status to INVESTIGATING    | PATCH succeeds (last-write-wins). No conflict since same target status        |
| 3    | Maria  | Receives WebSocket `incident:updated`                | Pinia store merges update — still shows INVESTIGATING, `assignedTo` may change to Carlos |
| 4    | Carlos | Sees his own update reflected                        | Status shows INVESTIGATING, assigned to Carlos                                |

> **Note**: For MVP, last-write-wins is acceptable. Optimistic locking (using `updatedAt` as a version field) can be added in a future iteration.

---

## Scenario 8: Mobile Usage at FRC Pit Area

**Actor**: Carlos (CSA) on mobile phone
**Precondition**: Carlos is walking between pit areas helping teams.

| Step | Action                                                    | Expected Result                                                      |
| ---- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| 1    | Carlos opens FIRST Assist from his phone's home screen    | PWA opens in standalone mode (no browser chrome)                     |
| 2    | Dashboard loads in single-column layout                   | Responsive grid collapses to 1 column. Cards are full-width         |
| 3    | Carlos taps an IncidentCard for Team 6328                 | Navigates to detail view. Full description visible. Scrollable      |
| 4    | Carlos changes status to INVESTIGATING from dropdown      | PATCH fires. Status updates. Carlos is auto-assigned                |
| 5    | Carlos puts phone away, walks to Team 6328's pit          | PWA stays in background. WebSocket connection maintained             |
| 6    | Carlos reopens app 5 minutes later                        | App is still on the detail view. Data may be slightly stale         |
| 7    | Carlos pulls to refresh (or taps refresh)                 | Latest data fetched from API                                         |
