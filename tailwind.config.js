/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Boutique / Moda: Tons beges, rosês e terrosos para Claudemar Modas
        brand: {
          50: '#fcfaf9',
          100: '#f6f2ef',
          200: '#efe6df',
          300: '#e3d4ca',
          400: '#d0baa8',
          500: '#bc9d87',
          600: '#a88169',
          700: '#8c6853',
          800: '#735747',
          900: '#5e483b',
        },
        primary: '#bc9d87', // Tom principal elegante
        secondary: '#e3d4ca',
        surface: '#faf8f6', // Fundo principal off-white
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(94, 72, 59, 0.08)',
        'glow': '0 0 15px rgba(188, 157, 135, 0.3)',
      }
    },
  },
  plugins: [],
}
