# Feature Specification & Fix: Report Incident Team & Match Autocomplete Comboboxes (FIX-017)

## Feature Overview
- **Feature ID**: FIX-017
- **Feature Name**: Incident Reporting Autocomplete Dropdowns with Manual Write-In Support
- **Status**: Specified (Pending Implementation)
- **Target Role**: FTA, CSA, Technical Volunteer

## Purpose & Goal
Improve `IncidentCreateView.vue` by converting Team Number and Match Number fields into hybrid **Combobox / Autocomplete Dropdowns**:
1. **Team Number**: Pre-populates a dropdown menu with teams registered for the active competition event context, while allowing the user to type/write-in any team number manually.
2. **Match Number**: Pre-populates a dropdown menu with standard FRC match suggestions (`Q1` through `Q100`, `Practice`, `Playoff`), while allowing the user to type/write-in any custom match identifier manually.

## User Stories
- **US-REP-001 (Active Event Team Select or Write-In)**: As a volunteer reporting an incident, I want to select a team from a dropdown of attending teams for the active event, or type a custom team number if the team is not on the list.
- **US-REP-002 (Match Number Autocomplete or Write-In)**: As a volunteer, I want to pick a match number from a list of suggestions or type a custom match label (e.g. `Q14`, `P2`, `Test Match`).

## Functional Requirements
- **FR-REP-001**: Team Number field shall fetch teams for the active event context (`GET /api/events/active` -> `GET /api/events/:code/teams`).
- **FR-REP-002**: Team input component shall use HTML5 `<datalist>` or a custom combobox component that renders dropdown suggestions while preserving `<input type="number">` or free text entry.
- **FR-REP-003**: Match Number input component shall render suggested match prefixes (`Q1`, `Q2`... `Q60`, `Practice 1`, `Playoff 1`) via `<datalist>` or combobox, while allowing free text write-in.
