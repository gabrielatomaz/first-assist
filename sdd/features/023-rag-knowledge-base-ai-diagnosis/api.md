# API Specification: FEAT-023 — RAG-Enhanced AI Troubleshooting via Knowledge Base

**Feature ID**: FEAT-023  
**Feature Name**: RAG-Enhanced AI Diagnostics API Contract  

---

## 1. Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/incidents/:id/ai-suggestions` | Triggers RAG retrieval & generates AI diagnosis | Yes (JWT) |
| `GET` | `/api/incidents/:id/ai-suggestions` | Retrieves cached AI diagnosis and citations | Yes (JWT) |

---

## 2. Detailed Endpoint Contracts

### `POST /api/incidents/:id/ai-suggestions`

Generates an AI diagnostic recommendation for the specified incident using the RAG Knowledge Base pipeline.

#### Request Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Path Parameters
* `id` (`String`, required): MongoDB ObjectId of the target incident ticket.

#### Request Body
None (Incident parameters are fetched server-side from the database).

#### Response Body (200 OK — Grounded Knowledge Base Match)
```json
{
  "suggestion": "Based on a similar issue resolved for Team 254 (Match Q12), the robot radio disconnect during high impact is likely caused by a loose RJ45 Ethernet cable missing its locking tab combined with a loose 12V barrel connector.\n\nRecommended Action Steps:\n1. Replace the RJ45 Ethernet cable with a molded boot locking cable.\n2. Power the radio via POE using a REV Radio Power Module (RPM).\n3. Anchor all radio cables to the chassis frame with zip-ties.",
  "isRagGrounded": true,
  "citedIncidents": [
    {
      "incidentId": "6a977e648cbb13f8c1ce95b6",
      "teamNumber": 254,
      "matchNumber": "Q12",
      "category": "RADIO_COMMS",
      "appliedSolution": "Replaced Ethernet cable with molded boot locking tab cable, installed REV Radio Power Module (RPM) with POE power delivery, and zip-tied cable connections to radio chassis."
    }
  ]
}
```

#### Response Body (200 OK — Fallback General Diagnosis)
```json
{
  "suggestion": "Probable Root Cause: CAN Bus communication failure. Motor controllers blinking magenta indicate loss of CAN hardware framing.\n\nRecommended Action Steps:\n1. Check yellow and green CAN wires at the roboRIO port with a multimeter (expect 60 ohms).\n2. Inspect energy chain pass-throughs for broken signal wires.",
  "isRagGrounded": false,
  "citedIncidents": []
}
```

#### Error Responses
* `401 Unauthorized`: Missing or invalid JWT auth token.
* `404 Not Found`: Incident ID does not exist in database.
* `500 Internal Server Error`: LLM service or database query error.

---

### `GET /api/incidents/:id/ai-suggestions`

Fetches the existing generated AI diagnostic recommendation for an incident ticket.

#### Request Headers
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Response Body (200 OK)
```json
{
  "suggestions": [
    {
      "_id": "6a977e648cbb13f8c1ce95f9",
      "incidentId": "6a977e648cbb13f8c1ce95a1",
      "suggestion": "...",
      "isRagGrounded": true,
      "citedIncidents": [
        {
          "incidentId": "6a977e648cbb13f8c1ce95b6",
          "teamNumber": 254,
          "matchNumber": "Q12",
          "category": "RADIO_COMMS",
          "appliedSolution": "..."
        }
      ],
      "rating": null,
      "createdAt": "2026-09-15T19:20:00.000Z"
    }
  ]
}
```
