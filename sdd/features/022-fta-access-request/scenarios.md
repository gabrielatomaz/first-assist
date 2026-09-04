# Scenarios & Acceptance Tests: FEAT-022 — FTA Event Access Request System

---

## Scenario 1: Submitting an FTA Access Request from Login Screen
```gherkin
Given a user is on the login page ("/login")
When the user clicks "Request FTA Event Access"
And enters name "Alex Volunteer", email "alex@first.org", and selects event "brba"
And clicks "Submit Request"
Then a request document is created in MongoDB with status "PENDING"
And a success modal confirms the request was sent to administrators
```

## Scenario 2: Admin Approving Pending Access Request
```gherkin
Given an Admin is on "AdminDashboardView.vue"
And an access request from "alex@first.org" for event "brba" is pending
When the Admin clicks "Approve"
Then the request status updates to "APPROVED"
And the target user "alex@first.org" receives role "FTA"
And event "brba" is added to the user's "assignedEventCodes"
```

## Scenario 3: Preventing Duplicate Pending Submissions
```gherkin
Given a pending request from "alex@first.org" for event "brba" exists
When "alex@first.org" attempts to submit another request for "brba"
Then the system rejects the submission with message "A pending request for this event already exists"
```
