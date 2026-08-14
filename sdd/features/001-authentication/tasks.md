# Implementation Tasks — User Authentication (FEAT-001)

These development tasks map the path to implementation.

* **Definition of Done**:
  * User schema exists and contains hashed password.
  * Login API endpoint exists and returns signed JWT.
  * Router intercepts pages when token is missing.
  * Unit tests cover login routes and middleware.

## Task Backlog

- [ ] **TASK-001-01: Create User Mongoose Schema**
  * Define fields: name, email, role, passwordHash, status. Add unique index to email.
- [ ] **TASK-001-02: Create Auth Routes & Controllers**
  * Map `POST /api/auth/login`. Compare password with database hash using bcrypt.
- [ ] **TASK-001-03: Create JWT Security Middleware**
  * Inspect `Authorization` headers, extract token, decode, and append user metadata (`req.user`) to request scopes.
- [ ] **TASK-001-04: Configure Environment Keys**
  * Load `<JWT_SECRET>` and MongoDB URI from env configuration variables.
- [ ] **TASK-001-05: Create Frontend Auth Store (Pinia)**
  * Maintain token state and define login / logout handlers.
- [ ] **TASK-001-06: Create LoginView Page**
  * Set input binds, form submit handler, and validation prompts.
- [ ] **TASK-001-07: Add Router Security Guards**
  * Protect dashboard and incident views from unauthenticated routing targets.
