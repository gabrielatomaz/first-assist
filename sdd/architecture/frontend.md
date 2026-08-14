# Frontend Architecture — FIRST Assist

This document details the Vue 3 frontend architecture of the FIRST Assist Progressive Web Application.

## Current Architecture
* **Framework**: Vue 3 using the Composition API (`<script setup>`).
* **Bundler**: Vite.
* **Styling**: Tailwind CSS.
* **Current Navigation**: Structured using Vue Router with two configured pages:
  * `/` (DashboardView): Fetches active incidents directly via `fetch`. Fallback loads mock data.
  * `/create` (IncidentCreateView): Form to report text incidents. Fallbacks simulate routing success.
* **Component Layer**: Direct import/export pattern via barrel exports.
* **State**: Locally maintained in View refs. Pinia is integrated but unused.

---

## Planned Architecture Upgrades
To support Spec-Driven Development and the newly specified Epics, the architecture will be structured into:

```text
frontend/src/
├── main.js             # Entry Point + SW registration
├── App.vue             # Root component with Nav
├── assets/             # Core style definitions
├── components/         # Reusable UI widgets
│   ├── IncidentCard.vue
│   ├── AISuggestionPanel.vue
│   ├── CommentSection.vue
│   ├── VoiceRecorder.vue
│   └── ResolveIncidentModal.vue
├── views/              # Page components
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── IncidentCreateView.vue
│   ├── IncidentDetailView.vue
│   └── KnowledgeBaseView.vue
├── router/             # Guard-controlled navigation
├── stores/             # Pinia state stores
│   ├── auth.js         # JWT, current user profile
│   └── incidents.js    # Active list, current details
└── services/           # Backend REST API wrappers
    └── api.js          # Unified fetch controller
```

### State Management (Pinia)
Stores resolve local caching and status changes.
* **authStore**: Tracks token validity and exports user role information (e.g. for showing edit buttons only to Admin or CSA).
* **incidentStore**: Maintains local arrays, sorting by priority state.

### Routing & Security
Vue Router checks `beforeEach` routes. Routes requiring authorization query the `authStore` before mounting.
```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = authStore.token;
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

### Design System Colors
Defined within [tailwind.config.js](file:///home/gabriela/Documents/codes/first-assist/frontend/tailwind.config.js):
* **Dark Navy / Slate Blue**: `#1F3A52` — Main Navigation headers.
* **Teal / Ocean Blue**: `#3A8B8C` — Buttons, action paths.
* **Coral / Red-Orange**: `#E66A4E` — High priority alerts, OPEN state status.
* **Warm Yellow / Gold**: `#DCA951` — INVESTIGATING state status.
* **Muted Purple / Mauve**: `#7A5B73` — AI Suggestions widgets.
* **Light Blue**: `#D0E8EA` — Secondary tags.
* **Light Cream**: `#F7F6F0` — App background layout.
