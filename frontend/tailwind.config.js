/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#22303F',
        bgCard: '#2B3B4E',
        primaryNavy: '#16202B',
        primaryTeal: '#4F7F82',
        accentCoral: '#E85B2F',
        accentYellow: '#DAAB52',
        accentPurple: '#6E5F70',
        accentGreen: '#10B981',
        textMain: '#E4E4E4'
      }
    },
  },
  plugins: [],
}
