# Feature Specification & Fix: FTA Active Event Activation & Direct Creation Navigation (FIX-018)

## Feature Overview
- **Feature ID**: FIX-018
- **Feature Name**: FTA Panel Event Activation & Auto-Navigation on Creation/Import
- **Status**: Specified (Pending Implementation)
- **Target Role**: FTA (FIRST Technical Advisor), Admin

## Purpose & Goal
Address two workflow UX improvements in `FTADashboardView.vue`:
1. **Event Activation Action**: FTAs can mark any event in their listed events as the **Active Event Context** directly from the FTA Panel.
2. **Direct Navigation on Event Creation/Import**: When an event is created manually or imported from The Blue Alliance API, the UI displays success feedback and **automatically switches the FTA Panel active tab directly to `Manage Event Teams`** with the newly created/imported event pre-selected!

## User Stories
- **US-FTA-005 (Set Event Active)**: As an FTA, I want to see an "Activate Event" button on listed events so I can set the current competition context without leaving the FTA Panel.
- **US-FTA-006 (Auto-Navigate to Roster on Import/Creation)**: As an FTA, after I import an event from TBA or create one manually, I want the system to immediately take me to the `Manage Event Teams` view for that event so I can review its roster right away.

## Functional Requirements
- **FR-FTA-006**: In `FTADashboardView.vue`, each listed event shall feature a `Set Active Context` button that calls `PATCH /api/events/:code/active` and updates global active event state.
- **FR-FTA-007**: Upon successful execution of `handleImportTBAEvent` or `handleCreateEvent`:
  - System selects the newly created/imported `event.code`.
  - System automatically switches `activeTab.value = 'manage-teams'`.
  - System automatically calls `loadEventTeams(1)` for that event code.
  - Feedback alert confirms creation and roster count.
