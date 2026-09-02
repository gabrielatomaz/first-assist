# Feature Specification: FTA Management Panel (FEAT-008)

## Feature Overview
- **Feature ID**: FEAT-008
- **Feature Name**: FTA Dedicated Operational Control Panel & CSA Event Assignment
- **Status**: Specified (Pending Implementation)
- **Target Role**: FTA (FIRST Technical Advisor), Admin

## Purpose & Goal
Restructure event and team operational management into a dedicated **FTA Panel**. FTAs will be able to navigate sub-views via a dropdown menu/tab system to:
1. **Register FRC Teams** (integrated with The Blue Alliance API for 1-click lookup).
2. **Register FRC Events** (integrated with The Blue Alliance API for 1-click event & roster import).
3. **Manage Event Teams** (Paginated list with search, add team to event, and remove team from event).
4. **Assign CSA Event Contexts** (Set active competition event specifically for each Control System Advisor).

## User Stories
- **US-FTA-001 (Navigation)**: As an FTA, I want a dedicated control panel with a dropdown/navigation menu so I can switch seamlessly between team registration, event registration, event-team associations, and CSA event assignments.
- **US-FTA-002 (TBA FRC Event Import)**: As an FTA, I want to search and import official FRC Events directly from The Blue Alliance API so I don't have to manually type event codes, dates, and locations.
- **US-FTA-003 (Paginated Event Team Management)**: As an FTA, I want to view a paginated list of teams linked to an event, search for teams by number or name, and easily add or remove teams from the event.
- **US-FTA-004 (CSA Event Context Assignment)**: As an FTA, I want to set the active competition event for each CSA individually, so that CSAs automatically see incidents for their assigned event when they log in.

## Functional Requirements
- **FR-FTA-001**: System shall provide `/fta` route accessible only by `FTA` and `ADMIN` roles.
- **FR-FTA-002**: Dropdown/tab navigation shall contain: `Add Team`, `Add Event`, `Manage Event Teams`, `Assign CSA Events`.
- **FR-FTA-003**: The `Add Event` sub-view shall feature a TBA event search bar (by year or event code) to import official FRC event data + attending teams in one click.
- **FR-FTA-004**: The `Manage Event Teams` view shall feature pagination (10 teams per page), keyword search filter, "Add Team to Event" action, and "Remove Team from Event" action with immediate UI update.
- **FR-FTA-005**: System shall allow FTA to update `user.assignedEventCode` for any user with role `CSA`.

## Key API Endpoints
- `GET /api/events/:code/teams?page=1&limit=10&search=254` - Paginated & searchable list of teams in an event.
- `POST /api/events/:code/teams` - Add team to event link.
- `DELETE /api/events/:code/teams/:teamNumber` - Remove team from event link.
- `PATCH /api/users/:userId/assigned-event` - FTA sets active event context for a CSA.
- `POST /api/tba/import-event/:eventKey` - Import FRC event & team roster from TBA.
