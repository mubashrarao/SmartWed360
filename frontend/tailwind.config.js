/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF1F0',
          100: '#FFE1DF',
          200: '#FFC7C2',
          300: '#FFA099',
          400: '#FF6B61',
          500: '#F53A2E',
          600: '#D42A1F',
          700: '#B01E14',
          800: '#8B1A12',
          900: '#800020', // Maroon
        },
        gold: {
          50: '#FEF9E7',
          100: '#FDF0C9',
          200: '#FBE39B',
          300: '#F9D36A',
          400: '#F7C43C',
          500: '#D4AF37', // Gold
          600: '#B8860B',
          700: '#9A6D0A',
          800: '#7C5508',
          900: '#5E3F06',
        },
        cream: '#FFF5E6',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
        elegant: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        goldShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F7C43C 50%, #D4AF37 100%)',
      },
    },
  },
  plugins: [],
}