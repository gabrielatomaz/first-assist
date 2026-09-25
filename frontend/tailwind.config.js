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
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        stretchLoad: {
          '0%': { transform: 'scaleY(0.4) scaleX(0.9)', opacity: '0.4' },
          '40%': { transform: 'scaleY(1.5) scaleX(1.1)', opacity: '1' },
          '70%': { transform: 'scaleY(0.85) scaleX(0.95)', opacity: '1' },
          '100%': { transform: 'scaleY(1) scaleX(1)', opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        stretch: 'stretchLoad 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    },
  },
  plugins: [],
}
