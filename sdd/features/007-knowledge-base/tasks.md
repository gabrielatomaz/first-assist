# Implementation Tasks — Knowledge Base (FEAT-007)

## Tasks

- [ ] **TASK-007-01: Update Mongoose Schema text index**
  * Define a compound text index mapping Incident schema description, rootCause, and appliedSolution.
- [ ] **TASK-007-02: Create resolution controller**
  * Map `POST /api/incidents/:id/resolve` route. Verify fields are present before writing `RESOLVED` status.
- [ ] **TASK-007-03: Create search router endpoint**
  * Map `GET /api/incidents/search` query endpoint executing `$text` searches.
- [ ] **TASK-007-04: Build ResolveIncidentModal component**
  * Layout form validations, requiring text properties.
- [ ] **TASK-007-05: Build KnowledgeBaseView layout**
  * Create route `/knowledge-base`. Implement search input bar with debounced handlers.
