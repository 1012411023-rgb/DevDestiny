/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B0F19', // Level 0
          900: '#111827', // Level 1 (BG)
          850: '#1A212E', // Subtle panel
          800: '#1F2937', // Level 2 (Cards)
          700: '#374151', // Level 3 (Inputs)
          600: '#4B5563', // Borders
          500: '#6B7280', // Neutral/Processing
        },
        steel: '#374151',
        brand: {
          primary: '#3B82F6', // Accent blue
          secondary: '#8B5CF6', // Purple
        },
        status: {
          pass: '#059669',
          fail: '#DC2626',
          anomaly: '#F59E0B',
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
    },
  },

  plugins: [],
}
