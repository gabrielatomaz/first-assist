/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#1C2633',
        bgCard: '#253344',
        primaryNavy: '#131C26',
        primaryTeal: '#38777E',
        accentCoral: '#E25C43',
        accentYellow: '#E5B25D',
        accentPurple: '#9D85C5',
        accentGreen: '#10B981',
        textMain: '#E2E8F0'
      }
    },
  },
  plugins: [],
}
