# Spec: Frontend Design System (Vue.js)

## 1. Overview
This specification outlines the visual design system for the FIRST Assist frontend. The color palette is derived directly from the visual identity presented in the academic paper's diagrams (Figure 1: DSR Stages, and Figures 2 & 3: Timelines).

## 2. Color Palette

The application will use a vibrant, modern aesthetic grounded by a clean, light background to ensure high readability during fast-paced FRC events.

### Primary Colors (Brand & Layout)
* **Dark Navy / Slate Blue** (e.g., `#2C3E50` or `#1F3A52`)
  * **Usage:** Top navigation bars, primary text, main headings, and structural borders. Derived from the "Conclusão" node and timeline text.
* **Teal / Ocean Blue** (e.g., `#3A8B8C`)
  * **Usage:** Primary buttons, active links, and timeline paths. Derived from the "Sugestão" node and timeline connecting lines.

### Accent & Alert Colors (Categorization & Status)
* **Coral / Red-Orange** (e.g., `#E66A4E`)
  * **Usage:** High-priority alerts, "OPEN" incident status badges, and destructive actions. Derived from the "Desenvolvimento" node and timeline dots.
* **Warm Yellow / Gold** (e.g., `#DCA951`)
  * **Usage:** Warning states, "INVESTIGATING" status badges. Derived from the "Conscientização" node.
* **Muted Purple / Mauve** (e.g., `#7A5B73`)
  * **Usage:** AI-related UI elements (e.g., `AISuggestionPanel`). Derived from the "Avaliação" node.
* **Light Blue** (e.g., `#D0E8EA`)
  * **Usage:** Secondary badges, tags, and subtle highlights. Derived from the timeline month indicator bubbles.

### Background Colors
* **Light Cream / Off-White** (e.g., `#F7F6F0`)
  * **Usage:** Main application background to reduce eye strain compared to pure white. Derived from the background of the timeline figures.
* **Pure White** (`#FFFFFF`)
  * **Usage:** Card backgrounds (e.g., `IncidentCard`), modal windows, and input fields to create contrast against the cream background.

## 3. Typography
* **Font Family:** A clean, modern sans-serif like **Inter** or **Roboto** (Google Fonts) to ensure clarity on mobile devices.
* **Headings:** Bold and colored in Dark Navy.
* **Body Text:** Standard weight, dark grey for maximum contrast against white/cream backgrounds.

## 4. UI Components Application
* **`IncidentCard.vue`**: White background with a subtle shadow, resting on the Light Cream app background. Status badges use the Accent colors (Coral for Open, Yellow for Investigating).
* **`AISuggestionPanel.vue`**: A soft Muted Purple border or background tint to visually distinguish AI suggestions from human comments.
* **Buttons**: Teal background with white text, transitioning to a darker shade on hover for interactivity.

## 5. CSS Framework Implementation
If using Tailwind CSS or standard Vanilla CSS with CSS Variables, the theme can be configured as follows:

```css
:root {
  --color-bg-main: #F7F6F0;
  --color-bg-card: #FFFFFF;
  --color-primary-navy: #1F3A52;
  --color-primary-teal: #3A8B8C;
  --color-accent-coral: #E66A4E;
  --color-accent-yellow: #DCA951;
  --color-accent-purple: #7A5B73;
  --color-accent-lightblue: #D0E8EA;
  --color-text-main: #2C3E50;
}
```
