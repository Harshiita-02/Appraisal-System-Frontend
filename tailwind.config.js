/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand violet — matched to the reference screenshot's exact hues:
        // vivid violet for active states/CTAs, light lavender for card fills.
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          150: '#e6e0fb',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Neutral surface scale used for backgrounds/cards/borders.
        // In dark mode these map to deep purple-tinted near-blacks
        // rather than flat gray, to stay on theme.
        surface: {
          0: '#ffffff',
          50: '#faf9fc',
          100: '#f3f1f8',
          200: '#e9e6f2',
          800: '#211a32',
          900: '#16101f',
          950: '#0d0815',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(76, 29, 149, 0.04), 0 1px 3px 0 rgba(76, 29, 149, 0.08)',
      },
    },
  },
  plugins: [],
}
