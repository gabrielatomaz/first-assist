# API Architecture — FIRST Assist

This document details the HTTP/REST API contracts for FIRST Assist.

## Authentication Header
Protected endpoints require:
`Authorization: Bearer <JWT_TOKEN>`

---

## Endpoint Specifications

### 1. Authentication

#### `POST /api/auth/login`
* **Purpose**: Authenticate user and issue token.
* **Auth**: None.
* **Payload**:
  ```json
  {
    "email": "csa@example.com",
    "password": "securepassword"
  }
  ```
* **Success (200 OK)**:
  ```json
  {
    "token": "jwt.string.here",
    "user": { "_id": "...", "name": "CSA User", "role": "CSA" }
  }
  ```

---

### 2. Incident Management

#### `GET /api/incidents`
* **Purpose**: Retrieve active incidents.
* **Auth**: Required.
* **Success (200 OK)**: Array of Incident objects.

#### `POST /api/incidents`
* **Purpose**: Create text-based incident.
* **Auth**: Required.
* **Payload**:
  ```json
  {
    "teamNumber": 1772,
    "matchNumber": "Q1",
    "description": "Robot radio rebooted mid-match."
  }
  ```
* **Success (201 Created)**: Created Incident object.

#### `PATCH /api/incidents/:id/status`
* **Purpose**: Update ticket status.
* **Auth**: Required.
* **Payload**:
  ```json
  {
    "status": "INVESTIGATING"
  }
  ```

#### `POST /api/incidents/:id/resolve`
* **Purpose**: Mark incident as resolved and document root cause.
* **Auth**: Required (CSA/Admin).
* **Payload**:
  ```json
  {
    "rootCause": "Loose radio POE cable connection",
    "appliedSolution": "Reseated cable and secured with zip-tie."
  }
  ```

#### `GET /api/incidents/search`
* **Purpose**: Search resolved incidents.
* **Auth**: Required.
* **Query Params**: `q=radio`

---

### 3. AI Suggestions

#### `GET /api/incidents/:id/ai-suggestions`
* **Purpose**: Fetch suggestions.
* **Auth**: Required.
* **Success (200 OK)**:
  ```json
  {
    "suggestions": [
      {
        "_id": "...",
        "suggestedCause": "Description matches power loss indications.",
        "suggestedSolution": "Check radio power path."
      }
    ]
  }
  ```

---

## Swagger / OpenAPI Plan
To maintain standard API docs:
1. Integrate `swagger-jsdoc` and `swagger-ui-express`.
2. Expose the interactive UI at `/api-docs` during development.
3. Annotate controllers and routes using JSDoc.
