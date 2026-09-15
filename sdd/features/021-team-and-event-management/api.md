# API Specifications: FEAT-021 — Multi-Team & Multi-Event Context & FTA Team Approval

---

## 1. Incident CRUD Endpoints for Team Leadership (Lead Mentor & Team Captain)

### 1.1 `POST /api/incidents`
Creates an incident ticket for active team and event context.

* **Auth**: Required (`LEAD_MENTOR`, `TEAM_CAPTAIN`, `TEAM_MEMBER` of active team, or global volunteer)
* **Request Body**:
```json
{
  "teamNumber": 1772,
  "eventCode": "brba",
  "matchNumber": "Q12",
  "description": "RoboRIO losing CAN communications during autonomous"
}
```
* **Response 201 Created**: Incident object created and attributed to creator.

---

### 1.2 `PATCH /api/incidents/:id`
Edits an existing incident ticket.

* **Auth**: Required (`LEAD_MENTOR` or `TEAM_CAPTAIN` of `incident.teamNumber`, or `ADMIN`/`FTA`/`CSA`)
* **Request Body**: `{ "description": "Updated CAN wire loose pin fix details" }`
* **Response 200 OK**: Updated incident object.
* **Response 403 Forbidden**: If user is a `TEAM_MEMBER` without Lead Mentor or Team Captain rights.

---

### 1.3 `DELETE /api/incidents/:id`
Deletes an incident ticket.

* **Auth**: Required (`LEAD_MENTOR` or `TEAM_CAPTAIN` of `incident.teamNumber`, or `ADMIN`/`FTA`)
* **Response 200 OK**: `{ "message": "Incident ticket deleted successfully" }`
* **Response 403 Forbidden**: If user is not authorized.

---

## 2. Role Limit Validation in Approvals

### 2.1 `PATCH /api/team-access-requests/:id/approve`
Approves a pending team access request. Enforces **Max 1 active Lead Mentor** and **Max 1 active Team Captain**.

* **Auth**: Required (`FTA` assigned to `request.eventCode`, or global `ADMIN`)
* **Error Response 400 Bad Request**:
```json
{
  "error": "Cannot approve request. Team 1772 already has an active Lead Mentor. Only 1 active Lead Mentor and 1 active Team Captain are permitted per team."
}
```
