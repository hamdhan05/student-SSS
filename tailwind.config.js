/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        // Clean Campus Theme
        brand: '#4F46E5',
        'brand-light': '#E0E7FF',
        accent: '#F59E0B',
        canvas: '#F9FAFB',
        surface: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
