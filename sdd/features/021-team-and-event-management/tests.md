# Test Plan: FEAT-021 — Multi-Team & Multi-Event Management Context

---

## 1. Backend Unit & Integration Tests

* **`teamService.test.js`**:
  * Test creating canonical team when team number does not exist.
  * Test reusing existing team when registering new event.
  * Test assigning user as `LEAD_MENTOR` and `TEAM_CAPTAIN` to different teams.
  * Test `GET /api/teams/my-teams` returns correct team-scoped roles.

* **`contextMiddleware.test.js`**:
  * Test request with valid team membership passes through.
  * Test request for un-affiliated team number returns HTTP 403 Forbidden.
  * Test global volunteer roles (`ADMIN`, `FTA`, `CSA`) bypass team membership restriction.

---

## 2. Frontend Component & Store Tests

* **`authStore.test.js`**:
  * Test `setActiveTeam()` updates `activeTeamNumber` and computes `isLeadMentor` / `isTeamCaptain` correctly.
  * Test `setActiveEvent()` updates `activeEventCode`.

* **`ContextSwitcher.spec.js`**:
  * Test rendering team options for user with multiple team memberships.
  * Test selecting a new team updates `authStore.activeTeamNumber` and emits change event.

---

## 3. End-to-End Acceptance Tests

* **Scenario**: Logged-in Lead Mentor of Team 1772 switches active context to Team 9999.
  * Verify incident creation defaults to Team 9999 and selected active event code.
  * Verify historical incidents from Event A vs Event B remain preserved and correctly tagged.
