# Scenarios & Acceptance Tests: FEAT-021 — Multi-Team & Multi-Event Management Context

---

## Scenario 1: Multi-Team Context Switch
```gherkin
Given a user "Gabriela" who is "LEAD_MENTOR" for Team 1772 and "TEAM_CAPTAIN" for Team 9999
When Gabriela selects "Team 9999" in the context switcher
Then the active team context changes to "Team 9999"
And the incident dashboard displays only incidents associated with Team 9999
And her team role resolves to "TEAM_CAPTAIN"
```

## Scenario 2: Multi-Event Incident Preservation
```gherkin
Given Team 1772 participated in Event "brba" and Event "brmp"
When Team 1772 reports Incident #101 at Event "brba"
And Team 1772 reports Incident #102 at Event "brmp"
Then Incident #101 is linked to (teamNumber: 1772, eventCode: "brba")
And Incident #102 is linked to (teamNumber: 1772, eventCode: "brmp")
When a CSA filters Knowledge Base by Event "brba"
Then Incident #101 is returned and Incident #102 is excluded
```

## Scenario 3: Preventing Cross-Team Data Leakage
```gherkin
Given User A is a member of Team 1772 only
When User A attempts to submit an incident for Team 9999
Then the backend rejects the request with HTTP 403 Forbidden
And an error message "User is not authorized for Team 9999" is returned
```

## Scenario 4: Reusing Canonical Team Across Multiple Events
```gherkin
Given canonical Team 1772 exists in the database
When FTA imports Event "brmp" containing Team 1772
Then no duplicate Team 1772 document is created in MongoDB
And Event "brmp" adds 1772 to its "teams" array
```
