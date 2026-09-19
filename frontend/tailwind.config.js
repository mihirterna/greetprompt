/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        festive: {
          gold: '#FFD700',
          amber: '#FFA726',
          saffron: '#FF6F00',
          crimson: '#D81B60',
          emerald: '#004D40',
          midnight: '#0D1117',
        }
      },
      fontFamily: {
        festive: ['"Rozha One"', '"Cinzel"', 'serif'],
        devanagari: ['"Yatra One"', '"Rozha One"', 'sans-serif'],
        cursive: ['"Great Vibes"', 'cursive'],
        editorial: ['"Playfair Display"', 'serif'],
        quote: ['"Kalam"', 'cursive'],
        sans: ['"Poppins"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
