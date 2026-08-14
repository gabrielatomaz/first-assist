# Test Scope — Incident Reporting (FEAT-004)

Verification scopes for reporting.

## Test Cases

### 1. API Contracts
* **Test Case**: `POST /api/incidents` succeeds with valid text, returning 201.
* **Test Case**: `POST /api/incidents` without description fails, returning 400.
* **Test Case**: `POST /api/incidents/voice` processes mock voice files and outputs translated text, returning 201.

### 2. UI Validations
* **Test Case**: Voice recorder triggers state indicators when clicked.
