# Feature Specification: Customizable Dashboard Auto-Refresh Timer (FEAT-015)

## Feature Overview
- **Feature ID**: FEAT-015
- **Feature Name**: User-Configurable Dashboard Refresh Interval Selector
- **Status**: Specified (Pending Implementation)
- **Target Role**: All Users (CSA, FTA, Admin)

## Purpose & Goal
Provide users with control over dashboard auto-refresh rates. Adjacent to the "Refresh" button on `DashboardView.vue`, a dropdown selector will allow choosing auto-refresh intervals ranging from manual-only to 15 minutes. The user's preference is saved in `localStorage` across sessions.

## User Stories
- **US-REF-001 (Configurable Interval)**: As a volunteer, I want to select how frequently the dashboard auto-refreshes (Manual, 5s, 15s, 30s, 1min, 5min, 15min) so I can balance real-time updates with network battery usage.
- **US-REF-002 (Manual Trigger)**: As a user, I want clicking the "Refresh" button to immediately trigger an instant data fetch without resetting my selected interval timer.

## Functional Requirements
- **FR-REF-001**: `DashboardView.vue` shall feature an auto-refresh dropdown with options:
  - `0` / `OFF`: "Manual Refresh Only"
  - `5000`: "Every 5 sec"
  - `15000`: "Every 15 sec" (Default)
  - `30000`: "Every 30 sec"
  - `60000`: "Every 1 min"
  - `300000`: "Every 5 min"
  - `900000`: "Every 15 min"
- **FR-REF-002**: Selected interval choice shall be persisted in `localStorage.setItem('first_assist_refresh_rate', value)`.
- **FR-REF-003**: Selecting `Manual Refresh Only` clears any active `setInterval`. Changing intervals dynamically restarts timer with the new duration.
