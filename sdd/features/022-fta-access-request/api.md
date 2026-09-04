# API Specifications: FEAT-022 — FTA Event Access Request System

---

## 1. Endpoints

### 1.1 `POST /api/access-requests`
Submits a new FTA event access request (Public endpoint).

* **Auth**: None (Public)
* **Request Body**:
```json
{
  "name": "Alex Volunteer",
  "email": "alex.volunteer@firstinspires.org",
  "requestedEventCodes": ["brba", "brmp"],
  "notes": "Assigned as FTA for SESI Festival SESI de Educação 2026."
}
```
* **Response 201 Created**:
```json
{
  "message": "FTA access request submitted successfully. An administrator will review your request shortly.",
  "requestId": "65d999888777666555444333"
}
```

---

### 1.2 `GET /api/access-requests`
Retrieves access requests for review.

* **Auth**: Required (`ADMIN` role)
* **Query Parameters**: `status` (Optional: `PENDING`, `APPROVED`, `REJECTED`)
* **Response 200 OK**:
```json
[
  {
    "_id": "65d999888777666555444333",
    "name": "Alex Volunteer",
    "email": "alex.volunteer@firstinspires.org",
    "requestedEventCodes": ["brba", "brmp"],
    "notes": "Assigned as FTA for SESI Festival SESI de Educação 2026.",
    "status": "PENDING",
    "createdAt": "2026-09-03T18:00:00.000Z"
  }
]
```

---

### 1.3 `PATCH /api/access-requests/:id/approve`
Approves a pending FTA access request.

* **Auth**: Required (`ADMIN` role)
* **Response 200 OK**:
```json
{
  "message": "Access request approved. Target user updated with FTA permissions.",
  "request": {
    "_id": "65d999888777666555444333",
    "status": "APPROVED",
    "reviewedAt": "2026-09-03T18:05:00.000Z"
  }
}
```

---

### 1.4 `PATCH /api/access-requests/:id/reject`
Rejects a pending FTA access request.

* **Auth**: Required (`ADMIN` role)
* **Request Body**:
```json
{
  "rejectionReason": "Event credentials unverified."
}
```
* **Response 200 OK**:
```json
{
  "message": "Access request rejected.",
  "request": {
    "_id": "65d999888777666555444333",
    "status": "REJECTED"
  }
}
```
