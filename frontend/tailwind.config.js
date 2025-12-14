/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#228B22', // Forest Green for farm feel
        secondary: '#90EE90', // Light green
        accent: '#FFD700', // Gold for highlights
      },
    },
  },
  plugins: [],
}