# Requirements Specification: FEAT-025 — Dashboard Team Number & Text Search Filter

---

## 1. Functional Requirements

### FR-025-01: Dashboard Search Bar Integration
* **Requirement**: `DashboardView.vue` must embed `SearchBar.vue` in the filter control header.
* **Filter Capabilities**:
  - Matches exact or partial `teamNumber` (e.g., `254`).
  - Matches `matchNumber` substring (e.g., `Q12`).
  - Matches incident `description` and `category`.

### FR-025-02: Backend Search Support
* **Requirement**: `GET /api/incidents` query parser accepts `teamNumber` and `q` search query parameters.
* **Acceptance Criteria**: Endpoint filters Mongoose `Incident.find()` query by numeric team match or regex text search.
