# FEAT-004 — API Specification

## Base URL

```
http://192.168.15.8:3000/api
```

> [!NOTE]
> The base URL is hardcoded in the current frontend. The design specifies moving to `import.meta.env.VITE_API_URL` via the `incidentService.js` wrapper.

---

## 1. GET /api/incidents

**Status**: ✅ IMPLEMENTED

Retrieves all incidents sorted by creation date (newest first).

### Request

```http
GET /api/incidents HTTP/1.1
Host: 192.168.15.8:3000
Authorization: Bearer <JWT_TOKEN>
```

| Query Param | Type   | Required | Description                                         | Status             |
| ----------- | ------ | -------- | --------------------------------------------------- | -------------------|
| `status`    | String | No       | Filter by status. Comma-separated: `OPEN,INVESTIGATING` | ❌ NOT IMPLEMENTED |

### Response — 200 OK

```json
[
  {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "teamNumber": 254,
    "matchNumber": "Q12",
    "description": "Robot cannot connect to field. Radio LED blinking amber.",
    "status": "OPEN",
    "createdAt": "2026-08-13T18:30:00.000Z",
    "updatedAt": "2026-08-13T18:30:00.000Z"
  },
  {
    "_id": "665a1b2c3d4e5f6a7b8c9d0f",
    "teamNumber": 1678,
    "matchNumber": "Q15",
    "description": "CAN bus disconnection. Motor controllers blinking orange.",
    "status": "INVESTIGATING",
    "createdAt": "2026-08-13T18:25:00.000Z",
    "updatedAt": "2026-08-13T18:28:00.000Z"
  }
]
```

> **Current behavior**: Returns all fields from the Incident model. The response does NOT currently include `reportedBy` or `assignedTo` because those fields are not yet on the model.

### Response — 500 Internal Server Error

```json
{
  "error": "Database connection failed"
}
```

### Implementation Reference

- Route: [incidentRoutes.js#L6](file:///home/gabriela/Documents/codes/first-assist/backend/src/routes/incidentRoutes.js#L6)
- Controller: [incidentController.getIncidents](file:///home/gabriela/Documents/codes/first-assist/backend/src/controllers/incidentController.js#L4-L11)
- Service: [incidentService.getAllIncidents](file:///home/gabriela/Documents/codes/first-assist/backend/src/services/incidentService.js#L5-L7)
- Repository: [incidentRepository.findAll](file:///home/gabriela/Documents/codes/first-assist/backend/src/repositories/incidentRepository.js#L4-L6)

---

## 2. GET /api/incidents/:id

**Status**: ❌ NOT IMPLEMENTED

Retrieves a single incident by ID with populated user references.

### Request

```http
GET /api/incidents/665a1b2c3d4e5f6a7b8c9d0e HTTP/1.1
Host: 192.168.15.8:3000
Authorization: Bearer <JWT_TOKEN>
```

| Path Param | Type     | Required | Description               |
| ---------- | -------- | -------- | ------------------------- |
| `id`       | ObjectId | Yes      | MongoDB ObjectId of the incident |

### Response — 200 OK

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "teamNumber": 254,
  "matchNumber": "Q12",
  "description": "Robot cannot connect to field. Radio LED blinking amber. Team reports the issue started after a hard hit in the previous match. Already tried power cycling the radio.",
  "status": "INVESTIGATING",
  "reportedBy": {
    "_id": "665a1aaa1111111111111111",
    "name": "John Smith",
    "role": "FTA"
  },
  "assignedTo": {
    "_id": "665a1aaa2222222222222222",
    "name": "Jane Doe",
    "role": "CSA"
  },
  "createdAt": "2026-08-13T18:30:00.000Z",
  "updatedAt": "2026-08-13T18:35:00.000Z"
}
```

### Response — 404 Not Found

```json
{
  "error": "Incident not found"
}
```

### Response — 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### Implementation Plan

```javascript
// Route
router.get('/:id', authMiddleware, incidentController.getIncidentById)

// Repository
findById: async (id) => {
  return await Incident.findById(id)
    .populate('reportedBy', 'name role')
    .populate('assignedTo', 'name role')
}
```

---

## 3. PATCH /api/incidents/:id/status

**Status**: ✅ PARTIALLY IMPLEMENTED

Updates the status of an incident. Current implementation only accepts `status`. Enhancement adds `assignedTo` support and WebSocket broadcast.

### Request

```http
PATCH /api/incidents/665a1b2c3d4e5f6a7b8c9d0e/status HTTP/1.1
Host: 192.168.15.8:3000
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Current payload** (implemented):

```json
{
  "status": "INVESTIGATING"
}
```

**Enhanced payload** (planned):

```json
{
  "status": "INVESTIGATING",
  "assignedTo": "665a1aaa2222222222222222"
}
```

| Body Field   | Type     | Required | Description                                              | Status             |
| ------------ | -------- | -------- | -------------------------------------------------------- | -------------------|
| `status`     | String   | Yes      | New status. Enum: `OPEN`, `INVESTIGATING`, `RESOLVED`    | ✅ IMPLEMENTED      |
| `assignedTo` | ObjectId | No       | User ID to assign the incident to. Must have role CSA.   | ❌ NOT IMPLEMENTED  |

### Response — 200 OK

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "teamNumber": 254,
  "matchNumber": "Q12",
  "description": "Robot cannot connect to field. Radio LED blinking amber.",
  "status": "INVESTIGATING",
  "createdAt": "2026-08-13T18:30:00.000Z",
  "updatedAt": "2026-08-13T18:36:00.000Z"
}
```

### Response — 400 Bad Request

```json
{
  "error": "Invalid status"
}
```

### Validation Rules

1. `status` MUST be one of `OPEN`, `INVESTIGATING`, `RESOLVED` (currently validated in service layer)
2. If `status` is `RESOLVED`, the request SHOULD be rejected here — resolution must go through `POST /api/incidents/:id/resolve` (FEAT-007) to enforce `rootCause` and `appliedSolution`
3. `assignedTo` (when implemented) MUST reference a valid User with role `CSA`
4. Only users with role `CSA` or `ADMIN` may call this endpoint (when auth is implemented)

### Implementation Reference

- Route: [incidentRoutes.js#L8](file:///home/gabriela/Documents/codes/first-assist/backend/src/routes/incidentRoutes.js#L8)
- Controller: [incidentController.updateStatus](file:///home/gabriela/Documents/codes/first-assist/backend/src/controllers/incidentController.js#L22-L29)
- Service: [incidentService.updateIncidentStatus](file:///home/gabriela/Documents/codes/first-assist/backend/src/services/incidentService.js#L16-L21)
- Repository: [incidentRepository.updateStatus](file:///home/gabriela/Documents/codes/first-assist/backend/src/repositories/incidentRepository.js#L13-L15)

---

## 4. WebSocket Events

**Status**: ❌ NOT IMPLEMENTED

### Connection

```javascript
// Client connects to Socket.io server
const socket = io('http://192.168.15.8:3000')
```

### Events Emitted by Server

#### `incident:created`

Emitted when a new incident is created via `POST /api/incidents`.

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d10",
  "teamNumber": 971,
  "matchNumber": "Q20",
  "description": "Brownout during autonomous. Battery voltage dropped below 7V.",
  "status": "OPEN",
  "reportedBy": {
    "_id": "665a1aaa1111111111111111",
    "name": "John Smith",
    "role": "FTA"
  },
  "createdAt": "2026-08-13T19:00:00.000Z"
}
```

#### `incident:updated`

Emitted when an incident's status or assignment changes.

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "teamNumber": 254,
  "matchNumber": "Q12",
  "description": "Robot cannot connect to field. Radio LED blinking amber.",
  "status": "INVESTIGATING",
  "assignedTo": {
    "_id": "665a1aaa2222222222222222",
    "name": "Jane Doe",
    "role": "CSA"
  },
  "createdAt": "2026-08-13T18:30:00.000Z",
  "updatedAt": "2026-08-13T18:36:00.000Z"
}
```

---

## 5. Error Codes Summary

| HTTP Code | Condition                                     | Endpoint(s)                        |
| --------- | --------------------------------------------- | ---------------------------------- |
| 200       | Success                                       | GET, PATCH                         |
| 400       | Invalid status value or malformed request body| PATCH /status                      |
| 401       | Missing or invalid JWT token                  | All (when auth implemented)        |
| 403       | User role not authorized for this action      | PATCH /status (when auth implemented) |
| 404       | Incident ID not found in database             | GET /:id, PATCH /:id/status        |
| 500       | Database error or unhandled exception         | All                                |

---

## 6. Swagger / OpenAPI 3.0

**Status**: ❌ NOT IMPLEMENTED

All endpoints above should be documented using `swagger-jsdoc` annotations in the route files and served via `swagger-ui-express` at `/api-docs`.

```javascript
// Example annotation for GET /api/incidents
/**
 * @openapi
 * /api/incidents:
 *   get:
 *     summary: List all incidents
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Comma-separated status filter
 *     responses:
 *       200:
 *         description: Array of incidents sorted by creation date descending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Incident'
 */
```
