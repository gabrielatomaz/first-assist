# Feature Specification: FEAT-027 — Portuguese Localization & Audio Voice Transcription

**Feature ID**: FEAT-027  
**Feature Name**: Portuguese Localization (pt-BR) & Audio Voice Transcription  
**Status**: Specified  
**Priority**: High  
**Related Requirements**: FR-004 (Incident Reporting), FR-006 (AI Troubleshooting)  

---

## 1. Overview & Purpose

FIRST Robotics Competition events in Brazil (Offseason and Regional competitions like *FIRST Robotics Competition Offseason Brazil*) require full support for Portuguese (`pt-BR`).

This feature introduces **Full Portuguese Localization & Audio Transcription**:
1. **Locale Switcher (EN / PT-BR)**: Header language dropdown / toggle persisting selection in `localStorage` (`first_assist_locale`).
2. **UI Internationalization (i18n)**: All titles, buttons, status badges, categories, and error messages translated to Portuguese.
3. **Portuguese Speech-to-Text (`useSpeechRecognition`)**: Sets Web Speech API recognition language to `pt-BR` when Portuguese is active, accurately transcribing spoken Portuguese descriptions (e.g. *"Robô perdeu comunicação CAN no motor de tração"*).
4. **Bilingual AI Diagnostics (`aiService.js`)**: Configures Gemini AI prompts to inspect user locale and respond in fluent Portuguese when requested.

---

## 2. User Stories

* **US-27.1 (Portuguese Interface)**: As a Brazilian volunteer or team representative, I want the app interface in Portuguese so that I can report and triage incidents comfortably.
* **US-27.2 (Portuguese Voice Reporting)**: As a user at a Brazilian regional, I want to speak incident descriptions in Portuguese so that speech-to-text transcribes my words correctly.

---

## 3. Acceptance Criteria

* Switching locale to `PT` updates all navigation links, form labels, and status badges.
* Voice recording uses `webkitSpeechRecognition.lang = 'pt-BR'` when Portuguese is active.
* AI diagnostic recommendations return in Portuguese when requested in Portuguese locale.
