# Test Scope — AI Troubleshooting (FEAT-006)

Verification plans for diagnostics.

## Test Cases

### 1. Backend API
* **Test Case**: `PATCH /api/ai-suggestions/:id/rating` updates the database document.
* **Test Case**: `GET /api/incidents/:id/ai-suggestions` calls LLM connectors when database caches are empty.

### 2. UI Actions
* **Test Case**: Panel displays loading spinners while inputs remain in transit.
