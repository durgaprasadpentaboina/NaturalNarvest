/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep lentil-leaf greens
        leaf: { 50: '#F1F7F2', 100: '#DDEBE0', 200: '#BBD7C3', 300: '#8FBB9D', 400: '#5E9A73', 500: '#3F7F57', 600: '#2F6646', 700: '#27523A', 800: '#1F4230', 900: '#17352A', 950: '#0E211A' },
        // Oat / cream surfaces
        oat: { 50: '#FDFBF6', 100: '#F8F3E6', 200: '#EFE6CF', 300: '#E2D5B3', 400: '#CFBD90' },
        // Earth browns
        bark: { 300: '#C4A582', 400: '#A98863', 500: '#8B6B4A', 600: '#6F533A', 700: '#563F2C', 800: '#3E2D20' },
        // Turmeric: the one warm accent
        turmeric: { 100: '#FBEFC8', 300: '#F0CF6A', 400: '#E7B93A', 500: '#D49A12', 600: '#B27C0A', 700: '#8A5F08' },
        danger: { 50: '#FDF2F0', 500: '#C0432F', 600: '#A63523', 700: '#852A1C' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23,53,42,.06), 0 8px 24px -12px rgba(23,53,42,.18)',
        lift: '0 2px 4px rgba(23,53,42,.06), 0 18px 36px -16px rgba(23,53,42,.28)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-in': { '0%': { opacity: 0, transform: 'translateX(24px)' }, '100%': { opacity: 1, transform: 'none' } },
        bump: { '0%,100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.28)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
        wheel: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fade-in .35s ease both',
        'slide-in': 'slide-in .3s ease both',
        bump: 'bump .45s ease',
        wheel: 'wheel 240s linear infinite',
      },
    },
  },
  plugins: [],
};
