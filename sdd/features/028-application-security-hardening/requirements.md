# Requirements Specification: FEAT-028 — End-to-End Application Security Enforcement & Hardening

---

## 1. Non-Functional & Security Requirements

### SR-028-01: Express Security Middleware
* **Helmet.js**: Activated with default security headers + custom CSP rules.
* **CORS**: Restricted strictly to configured `CLIENT_URL` domain.

### SR-028-02: Rate Limiting
* `/api/auth/login`: Max 5 requests per 15 minutes per IP.
* `/api/incidents`: Max 30 requests per minute per IP.
* `/api/ai-suggestions`: Max 10 requests per minute per user.

### SR-028-03: NoSQL Injection & XSS Sanitization
* All incoming `req.body`, `req.query`, `req.params` sanitized with `express-mongo-sanitize`.
