# Feature Specification & Bug Fix: Incident Detail View Smart Polling (FEAT-011)

## Root Cause Analysis (Why the Incident Detail page keeps refreshing)
- **Problem**: In `IncidentDetailView.vue`, a `setInterval(fetchDetails, 3000)` was configured to achieve real-time status updates (**US-REALTIME-002**).
- **Impact**: Every 3 seconds, `fetchDetails()` executes `loading.value = true` or overwrites `incident.value`, causing Vue to destroy and re-render DOM nodes. This interrupts active text input in diagnosis notes, clears typing focus, resets local state (`editingDiagnosis`, comment drafts), and causes visible screen flickering.

## Feature Goal & Technical Fix
Replace aggressive 3-second blanket re-fetching with **Smart State Diffing & Active Editing Pause Guard**:
1. **Pause-on-Edit Guard**: If the user is currently typing diagnosis notes (`editingDiagnosis === true`) or typing a comment draft (`newComment.length > 0`), the background auto-refresh is temporarily paused.
2. **Deep Diffing Before Assignment**: Do not set `loading.value = true` on periodic background polling. Compare fetched JSON with `incident.value` using key comparison; only update reactive properties if values actually changed on the server.
3. **Optimistic Updates**: Comments and status updates modify Pinia/component state immediately, rendering instant feedback without needing full view reload.

## User Stories
- **US-FIX-001 (Uninterrupted Note Editing)**: As a CSA or FTA, when I am typing diagnosis notes or adding a comment on an incident detail page, I want the page to NOT refresh or steal my focus so I can write without losing my text.
- **US-FIX-002 (Flicker-Free Live Updates)**: As a volunteer, I want live status updates to update seamlessly in the background without screen flickering or reloading indicator spinners.

## Functional Requirements
- **FR-FIX-001**: Background polling interval shall run silently without toggling `loading = true`.
- **FR-FIX-002**: Polling loop shall check `if (isUserEditing) return;` before executing network fetch.
- **FR-FIX-003**: Reactive state shall update only modified properties (`status`, `assignedTo`, `comments`), preserving cursor position and open modal states.
