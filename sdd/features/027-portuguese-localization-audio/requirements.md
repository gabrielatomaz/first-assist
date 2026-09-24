# Requirements Specification: FEAT-027 — Portuguese Localization & Audio Voice Transcription

---

## 1. Functional Requirements

### FR-027-01: Locale Switcher & Dictionary
* **Requirement**: App provides `en` and `pt-BR` dictionaries for all UI text strings.
* **Storage**: Locale choice saved in `localStorage.getItem('first_assist_locale')`.

### FR-027-02: Portuguese Audio Transcription
* **Requirement**: `useSpeechRecognition` composable dynamically sets:
  ```js
  recognition.lang = currentLocale.value === 'pt' ? 'pt-BR' : 'en-US';
  ```

### FR-027-03: Bilingual Gemini AI Prompts
* **Requirement**: Backend `generateDiagnosticSuggestion` incorporates user language preference into prompt context.
