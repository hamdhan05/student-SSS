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
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        brand: {
          DEFAULT: '#2563EB',
          orange: '#FF5722',
          light: '#EFF6FF',
          dark: '#1E40AF',
        },
        secondary: '#64748B',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        'card-border': '#E2E8F0',
      },
    },
  },
  plugins: [],
}
