# Test Plan: FEAT-021 — Multi-Team & Multi-Event Context & FTA Team Approval

---

## 1. Backend Unit & Integration Tests

* **`teamMembership.test.js`**:
  * Test creating first `LEAD_MENTOR` for Team 1772 succeeds.
  * Test creating second `LEAD_MENTOR` for Team 1772 fails with duplicate key error.
  * Test creating first `TEAM_CAPTAIN` for Team 1772 succeeds.
  * Test creating second `TEAM_CAPTAIN` for Team 1772 fails with duplicate key error.

* **`incidentAuthorization.test.js`**:
  * Test `LEAD_MENTOR` can edit (`PATCH`) and delete (`DELETE`) incident for their team.
  * Test `TEAM_CAPTAIN` can edit (`PATCH`) and delete (`DELETE`) incident for their team.
  * Test `TEAM_MEMBER` attempting edit/delete receives HTTP 403 Forbidden.

---

## 2. End-to-End Acceptance Tests

* **Scenario**:
  * Verify assigned FTA cannot approve a request for a second active Lead Mentor or Team Captain on Team 1772.
  * Verify both active Lead Mentor and Team Captain have complete incident management capability for Team 1772.
