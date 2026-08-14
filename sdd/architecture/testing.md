# Testing Strategy — FIRST Assist

This document outlines the testing structure for the FIRST Assist project.

## Testing Levels

### 1. Unit Tests
* **Backend**: Validate individual business services (e.g. `incidentService.js` validation checks).
  * Framework: Jest / Vitest configuration.
  * Target files: `src/services/**/*.test.js`.
* **Frontend**: Unit test Pinia store mutations and state transitions.

### 2. Integration Tests
* **Database integrations**: Verify queries, relationships, and model indexing (e.g. `$text` search checks).
  * Method: Mocked MongoDB connection using `mongodb-memory-server` to keep test instances clean.

### 3. API Verification Tests
* Test REST controller endpoint actions and verify responses (e.g. 401 returns, invalid inputs).
  * Tool: `supertest`.
  * Target files: `src/controllers/__tests__/*.test.js`.

---

## Folder Conventions
Tests should map 1:1 with source files where technically meaningful.
* Production: `src/services/incidentService.js`
* Test: `src/services/__tests__/incidentService.test.js` or `tests/services/incidentService.test.js`
