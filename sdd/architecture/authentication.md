# Authentication Architecture — FIRST Assist

This document details the authentication and authorization design of FIRST Assist.

## Design Highlights
* **Stateless Authentication**: JWT tokens are signed using a server-side HMAC secret (`<JWT_SECRET>`).
* **Cryptographic Strength**: User passwords are encrypted on the backend using `bcrypt` (10 rounds of salt generation) before persistence.
* **Token Storage**: The client stores the JWT in `localStorage` inside the browser sandbox.

## Security Layers

```text
HTTP Request with Header: Authorization: Bearer <Token>
                      │
                      ▼
            [authMiddleware.js]
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    [JWT Valid?]            [JWT Invalid?]
          │                       │
          ▼                       ▼
   Attach req.user          Return 401
          │
          ▼
   [roleMiddleware.js] (Check permissions)
          │
      ┌───┴───────────┐
      ▼               ▼
 [Authorized?]  [Unauthorized?]
      │               │
      ▼               ▼
Route Handler     Return 403
```

## Role Permissions Matrix

| Feature / Action | Admin | FTA | CSA |
| --- | --- | --- | --- |
| Create User Account | Yes | No | No |
| Deactivate User | Yes | No | No |
| Change User Roles | Yes | No | No |
| Submit Text/Voice Incident | Yes | Yes | Yes |
| Claim/Investigate Incident | Yes | Yes | Yes |
| Resolve Incident | Yes | Yes | Yes |
| Delete Incident Ticket | Yes | No | No |
| Add Comments | Yes | Yes | Yes |
| Rate AI Diagnostics | Yes | Yes | Yes |
| Search Knowledge Base | Yes | Yes | Yes |
