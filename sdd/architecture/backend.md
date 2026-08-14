# Backend Architecture — FIRST Assist

This document details the layered Node.js / Express backend architecture of the FIRST Assist API.

## Layered Pattern
To support academic readability and simple maintenance, the backend uses a strict **Controller → Service → Repository → Model** architectural pattern:

```text
HTTP Request
     │
     ▼
[Route Layer] ────────► [Middleware / Auth / Validation]
                             │
                             ▼
                        [Controller]
                             │
                             ▼
                         [Service] (Business Logic)
                             │
                             ▼
                        [Repository] (Data Access)
                             │
                             ▼
                         [Mongoose] ──► MongoDB
```

### Layer Responsibilities
1. **Routes**: Expose HTTP endpoints and map incoming requests to appropriate controllers. Responsible for registering security middleware.
2. **Controllers**: Parse query limits, path variables, and body values. Return normalized HTTP status messages (200, 201, 400, 500).
3. **Services**: Contain business rules, validate input presence (e.g. description presence), coordinate integrations (e.g. speech-to-text, LLM calls).
4. **Repositories**: Encapsulate MongoDB query logic. Isolate direct Mongoose schema queries (e.g., `.find().sort()`).
5. **Models**: Define collection structures, indices, field types, and default values.

---

## Planned Architecture Upgrades

### 1. Centralized Error Handling Middleware
Introduce a central error-handling class in Express to capture validation failures and DB timeouts, avoiding repetitive `try-catch` structures inside controllers.

### 2. Environment Configuration
Move secret parameters (specifically the hardcoded MongoDB Atlas URL) to a separate `.env` file, loaded using the `dotenv` library during initiation:
```javascript
const MONGODB_URI = process.env.MONGODB_URI;
```

### 3. Authentication & Authorization Middleware
Create middleware that decodes incoming authorization headers (`Bearer <token>`) using JWT and attaches the decrypted credentials (`req.user`) to protected route handlers.
