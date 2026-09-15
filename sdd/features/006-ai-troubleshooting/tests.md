# Test Scope — AI Troubleshooting (FEAT-006)

Verification plans for diagnostics.

## Test Cases

### 1. Backend API
* **Test Case**: `POST /api/incidents/:id/ai-suggestions` calls LLM connectors and saves/returns generated diagnosis.
* **Test Case**: `GET /api/incidents/:id/ai-suggestions` retrieves existing saved suggestions from DB.
* **Test Case**: `POST /api/incidents` creates ticket immediately without waiting on LLM response.

### 2. UI Actions
* **Test Case**: "Generate AI Diagnosis" button displays when no suggestion exists.
* **Test Case**: Panel displays loading spinner while AI diagnosis is generating on button click.
