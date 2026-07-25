/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f3eada',
          300: '#e7d8bf',
          400: '#d7c1a0',
          500: '#c5a782',
          600: '#b18f6d',
          700: '#947257',
          800: '#795d49',
          900: '#634c3c',
        }
      }
    },
  },
  plugins: [],
}
