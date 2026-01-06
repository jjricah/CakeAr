/** @type {import('tailwindcss').Config} */
export default {
  // ⬇️ ADD THIS LINE ⬇️
  darkMode: 'class', 
  // ⬆️ ADD THIS LINE ⬆️
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}