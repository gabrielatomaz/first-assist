# Requirements Specification: FEAT-029 — Dashboard Infinite Scroll & Progressive Loading

---

## 1. Functional Requirements

### FR-029-01: Infinite Scroll Trigger
* **Requirement**: Uses `IntersectionObserver` on a Sentinel element at the end of the incident grid in `DashboardView.vue`.
* **Condition**: When `Sentinel` becomes visible and `hasMorePages === true`, triggers `fetchNextPage()`.

### FR-029-02: Paginated Data Appending
* **Requirement**: Appends new incident array results from `GET /api/incidents?page=N&limit=10` to `incidents.value` without clearing existing items.

### FR-029-03: Filter Reset
* **Requirement**: Updating any filter (status, priority, event, team number search) resets `page = 1`, clears `incidents.value`, and fetches fresh page 1 results.
