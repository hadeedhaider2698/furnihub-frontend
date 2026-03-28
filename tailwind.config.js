/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A2E',
        accent: '#E8A87C',
        'accent-2': '#C75B39',
        surface: '#F8F6F0',
        'surface-2': '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        border: '#E5E0D8',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(232, 168, 124, 0.1)',
        'warm-lg': '0 10px 25px -5px rgba(232, 168, 124, 0.15)',
      }
    },
  },
  plugins: [],
}
