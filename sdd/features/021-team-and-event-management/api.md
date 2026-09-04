# API Specifications: FEAT-021 — Multi-Team & Multi-Event Management Context

---

## 1. Endpoints

### 1.1 `GET /api/teams/my-teams`
Retrieves all teams the authenticated user belongs to, including their team-scoped roles.

* **Auth**: Required (`Bearer <token>`)
* **Response 200 OK**:
```json
[
  {
    "teamNumber": 1772,
    "teamName": "The Brazilian Trail Blazers",
    "teamRole": "LEAD_MENTOR",
    "joinedAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "teamNumber": 9999,
    "teamName": "Robotics Academy",
    "teamRole": "TEAM_CAPTAIN",
    "joinedAt": "2026-02-01T14:30:00.000Z"
  }
]
```

---

### 1.2 `GET /api/teams/:number/members`
Retrieves the roster of members for a specific team.

* **Auth**: Required (`Bearer <token>`)
* **Path Parameters**: `number` (Number) - FRC Team Number
* **Response 200 OK**:
```json
[
  {
    "userId": "65d123456789abcdef012345",
    "name": "Gabriela Tomaz",
    "email": "gabriela@team1772.com",
    "teamRole": "LEAD_MENTOR",
    "joinedAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "userId": "65d987654321fedcba543210",
    "name": "Alex Student",
    "email": "alex@team1772.com",
    "teamRole": "TEAM_CAPTAIN",
    "joinedAt": "2026-01-20T11:00:00.000Z"
  }
]
```

---

### 1.3 `POST /api/teams/:number/members`
Adds a user to a team with a team-scoped role.

* **Auth**: Required (`LEAD_MENTOR` on target team, or global `ADMIN`)
* **Request Body**:
```json
{
  "email": "newstudent@team1772.com",
  "teamRole": "TEAM_CAPTAIN"
}
```
* **Response 201 Created**:
```json
{
  "message": "User added to team roster successfully",
  "membership": {
    "userId": "65d111222333444555666777",
    "teamNumber": 1772,
    "teamRole": "TEAM_CAPTAIN"
  }
}
```

---

### 1.4 `GET /api/teams/:number/events`
Returns all registered competition events for a team.

* **Auth**: Required
* **Response 200 OK**:
```json
[
  {
    "code": "brba",
    "name": "Regional Brazil - Festival SESI de Educação",
    "location": "Brasília, DF",
    "isActive": true
  },
  {
    "code": "brmp",
    "name": "Regional São Paulo",
    "location": "São Paulo, SP",
    "isActive": false
  }
]
```
