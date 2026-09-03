# Feature Specification: FontAwesome Icon Migration (FEAT-020)

## Feature Overview
- **Feature ID**: FEAT-020
- **Feature Name**: Global FontAwesome Icon & Emoji Standardization
- **Status**: Specified (Pending Implementation)
- **Target Component**: Entire Frontend UI (`frontend/src/`)

## Purpose & Goal
Replace all scattered raw text emojis (e.g. `🤖`, `🏆`, `🎯`, `📋`, `⚠️`, `📌`, `🔔`, `🎤`, `💡`, `💬`, `➕`, `🔍`) and redundant inline SVG paths across Vue components with official, consistent **FontAwesome 6 Vector Icons** (`@fortawesome/vue-fontawesome` & `@fortawesome/free-solid-svg-icons`). This establishes a unified, scalable design system with crisp vector rendering at any resolution or pixel density.

## User Stories
- **US-ICON-001 (Consistent Vector Rendering)**: As a user accessing FIRST Assist on high-density displays (retina / mobile), I want crisp vector icons instead of platform-dependent OS emojis so that the interface looks professional and uniform across iOS, Android, macOS, Windows, and Linux.
- **US-ICON-002 (Accessible & Screen-Reader Friendly)**: As an assistive technology user, I want icons to have standard ARIA attributes (`aria-hidden="true"` or titled wrappers) rather than decorative emojis so screen readers process content cleanly.

## Scope of Icon Replacement

### 1. Header & Navigation (`App.vue`)
- `🏆` (Active Event) → `fa-trophy`
- `➕` (Report Incident) → `fa-plus`
- `🔔` (Notifications) → `fa-bell`
- `👤` (User Profile) → `fa-user-circle` / `fa-user`
- `Log Out` action → `fa-right-from-bracket`
- Hamburger menu → `fa-bars` / `fa-xmark`

### 2. Incident Dashboard (`DashboardView.vue`)
- Sync dropdown refresh → `fa-rotate` (or `fa-arrows-rotate`)
- Status Badges → `fa-circle-dot` / `fa-clock` / `fa-check-circle`
- Filters → `fa-filter`

### 3. Incident Creation View (`IncidentCreateView.vue`)
- Voice recording → `fa-microphone`
- Form fields → `fa-hashtag` (Match), `fa-users` (Team), `fa-layer-group` (Category), `fa-triangle-exclamation` (Severity)

### 4. Incident Detail View & Components (`IncidentDetailView.vue`, `CommentSection.vue`, `AISuggestionPanel.vue`)
- Attachment → `fa-paperclip`
- Edit comment → `fa-pen-to-square`
- Delete comment → `fa-trash-can`
- Warning modal → `fa-triangle-exclamation`
- AI Troubleshooting → `fa-wand-magic-sparkles` / `fa-robot` / `fa-lightbulb`
- Technical Assignee → `fa-user-gear`
- Audit Timeline header → `fa-clock-rotate-left` / `fa-history`
- Chevron toggle → `fa-chevron-down` / `fa-chevron-up`

### 5. FTA Control Panel (`FTADashboardView.vue`)
- Manage Event Teams → `fa-users-gear`
- Register Team (TBA Sync) → `fa-robot` / `fa-user-plus`
- Register Event (TBA Sync) → `fa-trophy`
- Assign CSA Contexts → `fa-bullseye` / `fa-user-tag`

## Technical Approach & Package Strategy
- Install FontAwesome Vue 3 integration:
  - `@fortawesome/fontawesome-svg-core`
  - `@fortawesome/free-solid-svg-icons`
  - `@fortawesome/free-regular-svg-icons`
  - `@fortawesome/vue-fontawesome@latest`
- Register `<font-awesome-icon>` component globally in `frontend/src/main.js` or import specific icons locally for minimal bundle footprint.

## Verification & Acceptance Criteria
- Zero raw emoji strings remain in template headers, options, buttons, or badges.
- All inline SVG duplicates are replaced with `<font-awesome-icon :icon="['fas', '...']" />`.
- Production build `npm run build` passes with zero warnings or missing icon imports.
