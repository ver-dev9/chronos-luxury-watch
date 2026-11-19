/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080807',
        night: '#11100D',
        charcoal: '#171511',
        gold: '#C7A76B',
        'gold-light': '#E4C88D',
        ivory: '#F5F0E5',
        muted: '#A39B8A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { luxe: '0.42em', wide2: '0.24em' },
    },
  },
  plugins: [],
};
