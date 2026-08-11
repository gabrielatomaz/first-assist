/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F7F6F0',
        bgCard: '#FFFFFF',
        primaryNavy: '#1F3A52',
        primaryTeal: '#3A8B8C',
        accentCoral: '#E66A4E',
        accentYellow: '#DCA951',
        accentPurple: '#7A5B73',
        accentLightblue: '#D0E8EA',
        textMain: '#2C3E50'
      }
    },
  },
  plugins: [],
}
