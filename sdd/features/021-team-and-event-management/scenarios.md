# Scenarios & Acceptance Tests: FEAT-021 — Multi-Team & Multi-Event Management Context & FTA Team Approval

---

## Scenario 1: Enforcing Max 1 Active Lead Mentor per Team
```gherkin
Given Team 1772 already has an active "LEAD_MENTOR" (User A)
When an FTA attempts to approve a Team Access Request for User B as "LEAD_MENTOR" on Team 1772
Then the system blocks the approval with HTTP 400 Bad Request
And returns "Team 1772 already has an active Lead Mentor. Only 1 active Lead Mentor and 1 active Team Captain are permitted per team."
```

---

## Scenario 2: Shared Incident Control for Lead Mentor and Team Captain
```gherkin
Given Incident #505 belongs to Team 1772 at event "brba"
And User A is the "LEAD_MENTOR" of Team 1772
And User B is the "TEAM_CAPTAIN" of Team 1772
When User B (Team Captain) sends PATCH /api/incidents/505 to update the description
Then the update succeeds with HTTP 200 OK
When User A (Lead Mentor) sends DELETE /api/incidents/505
Then the incident is deleted successfully with HTTP 200 OK
```

---

## Scenario 3: Restricting Incident Delete Rights for Regular Team Members
```gherkin
Given Incident #505 belongs to Team 1772
And User C is a regular "TEAM_MEMBER" of Team 1772
When User C sends DELETE /api/incidents/505
Then the request is rejected with HTTP 403 Forbidden
And returns "Forbidden. Only the active Lead Mentor or Team Captain can edit or delete team incidents."
```
