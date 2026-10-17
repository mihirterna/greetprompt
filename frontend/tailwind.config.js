/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
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
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-up': 'scaleUp 0.25s ease-out',
      }
    },
  },
  plugins: [],
}
