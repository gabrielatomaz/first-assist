# Test Scope — Knowledge Base (FEAT-007)

## Test Cases

### 1. API Verification
* **Test Case**: `POST /api/incidents/:id/resolve` returns 400 Bad Request when missing root cause inputs.
* **Test Case**: `GET /api/incidents/search` queries correctly matching keywords.

### 2. UI Actions
* **Test Case**: Search queries are debounced properly, limiting REST requests.
