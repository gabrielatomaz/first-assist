# Feature Specification: FEAT-025 — Dashboard Team Number & Text Search Filter

**Feature ID**: FEAT-025  
**Feature Name**: Dashboard Team Number & Text Search Filter  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-004 (Dashboard Tracking), FR-005 (Incident Search)  

---

## 1. Overview & Purpose

In fast-paced FIRST Robotics Competition regionals, FTAs and CSAs need to quickly find all reported incidents for a specific team (e.g. Team `254` or `1678`) or filter by match number directly on the primary Active Board dashboard.

This feature adds an inline, real-time **Team Number & Keyword Search Filter** to `DashboardView.vue`:
1. **Interactive Search Input**: Positioned alongside Category, Priority, and Event filter controls on the Dashboard header.
2. **Team Number Filtering**: Accepts numeric team inputs (e.g. `254`) and filters the Active Board & In Triage lists immediately.
3. **API & Client Query Integration**: Sends `teamNumber` and text `q` parameters to `GET /api/incidents` and updates tab counts dynamically.
4. **URL State Synchronization**: Synchronizes search term in the URL query parameters (`?search=254`) for easy sharing.

---

## 2. User Stories

* **US-25.1 (Instant Team Search)**: As an FTA or CSA on the pit floor, I want to type a team number into the dashboard search bar so that I can instantly see all active tickets reported for that team.
* **US-25.2 (Match & Text Search)**: As a user, I want to filter incidents by match number (e.g., `Q12`) or keyword so that I can isolate issues occurring during specific matches.

---

## 3. Acceptance Criteria

* `SearchBar` component rendered on `DashboardView.vue` above the incident grid.
* Typing team number `254` filters displayed cards and updates `activeBoardCount` and `pendingScreeningCount`.
* Clearing the search bar resets the view to show all incidents for the selected status tab.
