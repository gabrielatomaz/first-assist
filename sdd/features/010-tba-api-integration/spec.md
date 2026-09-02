# Feature Specification: The Blue Alliance (TBA) API Integration (FEAT-010)

## Feature Overview
- **Feature ID**: FEAT-010
- **Feature Name**: Automatic Team & FRC Event Sync via The Blue Alliance API
- **Status**: Specified (Pending Implementation)
- **Target Role**: FTA, Admin

## Purpose & Goal
Integrate FIRST Assist with **The Blue Alliance (TBA) REST API v3** (`https://www.thebluealliance.com/api/v3`). FTAs can fetch official FRC Team details (team nickname, city, state, country, rookie year) and **official FRC Event details** (official event name, location, dates, competition year, and full attending team rosters) directly from TBA to streamline registration without manual data entry errors.

## User Stories
- **US-TBA-001 (Import Team from TBA)**: As an FTA, when I type an FRC team number in the registration form, I want the system to auto-fill official team data from The Blue Alliance API so I can register the team with one click.
- **US-TBA-002 (Import FRC Event from TBA)**: As an FTA, when I enter a TBA event key (e.g. `2026brsp`) or select a year, I want the system to fetch official FRC event metadata (event name, location, start/end dates) directly from TBA.
- **US-TBA-003 (Bulk Sync Event Team Roster)**: As an FTA, when importing an FRC event from TBA, I want the system to automatically import all registered team numbers for that event and populate the event-team linkage roster instantly.

## Functional Requirements
- **FR-TBA-001**: Backend service `tbaService.js` shall handle HTTP calls to TBA API v3 using header `X-TBA-Auth-Key: process.env.TBA_API_KEY`.
- **FR-TBA-002**: `GET /api/tba/teams/:teamNumber` returns `{ number, name, city, state_prov, country, rookie_year }`.
- **FR-TBA-003**: `GET /api/tba/events/:eventKey` returns event details (`{ name, event_code, location_name, start_date, end_date, year }`).
- **FR-TBA-004**: `GET /api/tba/events/year/:year` returns list of all official FRC events for a given competition season.
- **FR-TBA-005**: `POST /api/tba/import-event/:eventKey` imports the event metadata into the database and bulk-fetches all team keys (`/event/{event_key}/teams/keys`), linking them automatically to the event roster.
- **FR-TBA-006**: If TBA API is unreachable or `X-TBA-Auth-Key` is unconfigured, system gracefully falls back to manual entry mode.

## Key API Endpoints
- `GET /api/tba/teams/:teamNumber` - Lookup official FRC team info from TBA.
- `GET /api/tba/events/:eventKey` - Lookup official FRC event info and team roster from TBA.
- `GET /api/tba/events/year/:year` - Fetch all official FRC events for a specific season.
- `POST /api/tba/import-event/:eventKey` - One-click import FRC event and all attending teams into database.
