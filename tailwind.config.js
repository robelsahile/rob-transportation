
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0D47A1', // A deep, professional blue
        'brand-secondary': '#FFC107', // A vibrant, attention-grabbing yellow/amber
        'brand-bg': '#F8F9FA', // A very light grey for the background
        'brand-surface': '#FFFFFF', // For cards and surfaces
        'brand-text': '#212529', // Primary text color
        'brand-text-light': '#6C757D', // Lighter text for secondary info
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
