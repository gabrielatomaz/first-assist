# Feature Specification: FEAT-026 — FTA & CSA First-Use Onboarding Tutorial

**Feature ID**: FEAT-026  
**Feature Name**: FTA & CSA First-Use Onboarding Tutorial  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-001 (User Login), FR-003 (Role-Based Access Control)  

---

## 1. Overview & Purpose

When a newly approved FIRST Technical Advisor (FTA) or Control System Advisor (CSA) logs into FirstAssist for the first time, they need to quickly master the workflow tools without reading external manuals.

This feature introduces an **Interactive First-Use Onboarding Tutorial**:
1. **First-Login Trigger**: Detects `user.hasCompletedOnboarding === false` upon login for `FTA` and `CSA` roles.
2. **Interactive Modal Tour (`OnboardingTutorialModal.vue`)**: Presents a guided 4-step walkthrough:
   - **Step 1: Active Board & In Triage Queues** — Explains ticket screening and queue management.
   - **Step 2: Rapid Incident Submission & Voice Transcription** — Demonstrates microphone audio reporting.
   - **Step 3: AI Assistant Diagnosis & Historical KB** — Highlights RAG AI suggestions and solution grounding.
   - **Step 4: Regional Event Context & TBA Sync** — Explains active event selection and team roster imports.
3. **Completion Persistence**: Updates `user.hasCompletedOnboarding = true` via `PATCH /api/users/profile` so the modal only appears once.
4. **On-Demand Replay**: Users can re-launch the tutorial anytime from `ProfileView.vue`.

---

## 2. User Stories

* **US-26.1 (Guided Onboarding)**: As a newly appointed FTA or CSA logging in for the first time, I want a quick visual walkthrough of the key features so that I can immediately triage incidents at my competition event.
* **US-26.2 (Tutorial Replay)**: As a user needing a refresher, I want to re-open the tutorial from my profile page whenever needed.

---

## 3. Acceptance Criteria

* `OnboardingTutorialModal` appears automatically on first login for FTA/CSA roles.
* Step counter progress bar and "Next / Skip / Finish" actions function correctly.
* Completing or skipping the tutorial updates `user.hasCompletedOnboarding = true`.
