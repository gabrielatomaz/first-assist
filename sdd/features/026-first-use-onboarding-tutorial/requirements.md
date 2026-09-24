# Requirements Specification: FEAT-026 — FTA & CSA First-Use Onboarding Tutorial

---

## 1. Functional Requirements

### FR-026-01: First-Use Detection & Modal Launch
* **Requirement**: App layout check inspects `authStore.user.hasCompletedOnboarding`.
* **Condition**: If `false` and `role` is `FTA` or `CSA`, triggers `OnboardingTutorialModal.vue`.

### FR-026-02: Tutorial Content Steps
* **Step 1**: Triage & Queue Management Overview.
* **Step 2**: Voice Recording & Speech-to-Text Reporting.
* **Step 3**: AI Diagnostic Suggestions & KB Grounding.
* **Step 4**: Event Management & TBA Roster Imports.

### FR-026-03: Onboarding Completion API Update
* **Requirement**: `PATCH /api/users/profile` updates `{ hasCompletedOnboarding: true }`.
