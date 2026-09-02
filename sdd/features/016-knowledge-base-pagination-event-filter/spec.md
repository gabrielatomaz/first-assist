# Feature Specification: Knowledge Base Event Filtering & Pagination (FEAT-016)

## Feature Overview
- **Feature ID**: FEAT-016
- **Feature Name**: Knowledge Base Server-Side Pagination & Event Filter
- **Status**: Specified (Pending Implementation)
- **Target Role**: All Users

## Purpose & Goal
Enhance `KnowledgeBaseView.vue` with event-level filtering and server-side pagination (10 resolved records per page). Volunteers can filter historical solutions specifically by FRC Event Code (e.g. `2026brsp`) to see how issues were solved at a specific venue.

## User Stories
- **US-KB-001 (Event Filter)**: As a volunteer, I want to filter the Knowledge Base by competition event code so I can review solutions recorded at my current event or past regionals.
- **US-KB-002 (Paginated Results)**: As a user, I want search results in the Knowledge Base to be paginated (10 results per page) with Previous/Next controls and a total count indicator.

## Functional Requirements
- **FR-KB-001**: `KnowledgeBaseView.vue` search bar area shall include an "Event" select menu listing all events + "All Events" option.
- **FR-KB-002**: Backend endpoint `GET /api/incidents/search` shall accept query parameters:
  - `q`: Keyword search term
  - `category`: Category filter
  - `priority`: Priority filter
  - `teamNumber`: Team number filter
  - `eventCode`: Competition event code filter
  - `page`: Page number (default `1`)
  - `limit`: Limit per page (default `10`)
- **FR-KB-003**: Backend response structure:
  ```json
  {
    "incidents": [...],
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
  ```
- **FR-KB-004**: Pagination UI buttons (`← Prev`, `Next →`) shall update results and disable appropriately on first/last pages.
