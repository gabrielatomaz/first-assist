# Feature Specification: FEAT-029 — Dashboard Infinite Scroll & Progressive Loading

**Feature ID**: FEAT-029  
**Feature Name**: Dashboard Infinite Scroll & Progressive Loading  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-004 (Dashboard Tracking), NFR-002 (Performance)  

---

## 1. Overview & Purpose

During large regional competitions with dozens of reported issues, fetching and rendering all active incidents in a single payload can slow down mobile web clients on field Wi-Fi or cellular networks.

This feature implements **Dashboard Infinite Scroll & Progressive Loading**:
1. **Intersection Observer Infinite Scroll**: `useInfiniteScroll` composable detects when the user scrolls within 200px of the bottom of the `DashboardView.vue` page.
2. **Paginated API Fetching**: Fetches next chunk of incidents (`GET /api/incidents?page=N&limit=10`) progressively without reloading existing rendered cards.
3. **Smooth Loading & End Indicators**: Displays a discreet spinner at the bottom while loading more tickets, and an "All incidents loaded" badge when the last page is reached.
4. **Preserved Filter State**: Changing filters (status, category, priority, search) resets pagination to page 1 cleanly.

---

## 2. User Stories

* **US-29.1 (Smooth Scroll Loading)**: As an FTA scrolling through a long list of incidents on my mobile phone, I want new tickets to load automatically as I reach the bottom of the page so that the dashboard loads fast and stays responsive.
* **US-29.2 (Filter Reset)**: As a user, I want changing a filter to reset scroll position and load page 1 immediately so that results stay relevant.

---

## 3. Acceptance Criteria

* `DashboardView.vue` loads initial 10 incidents.
* Scrolling near bottom triggers automatic fetch of next page.
* Cards append smoothly to incident grid without layout shift or page reload.
