/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bgMain: 'var(--color-bg-main, #1C2633)',
        bgCard: 'var(--color-bg-card, #253344)',
        bgInput: 'var(--color-bg-input, #1C2633)',
        primaryNavy: 'var(--color-primary-navy, #131C26)',
        primaryTeal: 'var(--color-primary-teal, #38777E)',
        accentCoral: 'var(--color-accent-coral, #E25C43)',
        accentYellow: 'var(--color-accent-yellow, #E5B25D)',
        accentPurple: 'var(--color-accent-purple, #9D85C5)',
        accentGreen: 'var(--color-accent-green, #10B981)',
        accentLightblue: 'var(--color-accent-lightblue, #D0E8EA)',
        textMain: 'var(--color-text-main, #E2E8F0)',
        textMuted: 'var(--color-text-muted, #94A3B8)',
        borderDefault: 'var(--color-border-default, #334155)',
        borderSubtle: 'var(--color-border-subtle, #1E293B)',
      }
    },
  },
  plugins: [],
}
