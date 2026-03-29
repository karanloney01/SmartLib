/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm Minimalist Gray & Black Palette
        "surface-bright": "#ffffff",
        "surface": "#ffffff",
        "surface-container-low": "#fafafa",
        "surface-container": "#f4f4f5",
        "surface-variant": "#f4f4f5",
        "surface-dim": "#e4e4e7",
        
        "on-surface": "#09090b",
        "on-surface-variant": "#71717a",
        
        "primary": "#18181b", // zinc-900 (almost black)
        "primary-container": "#f4f4f5", // zinc-100
        "on-primary-container": "#09090b", // zinc-950
        "on-primary": "#ffffff",
        
        "secondary": "#71717a",
        "secondary-container": "#f4f4f5",
        "on-secondary": "#ffffff",
        
        "error": "#ef4444",
        "error-container": "#fee2e2",
        "on-error-container": "#7f1d1d",
        "on-error": "#ffffff",
        
        "outline-variant": "#e4e4e7", // zinc-200
        "outline": "#a1a1aa", // zinc-400

        // We remap the 'blue' palette to 'zinc' (gray/black) 
        // to immediately convert all blue buttons/badges into a sleek monochromatic style.
        blue: {
          50: '#fafafa',   // zinc-50
          100: '#f4f4f5',  // zinc-100
          200: '#e4e4e7',  // zinc-200
          300: '#d4d4d8',  // zinc-300
          400: '#a1a1aa',  // zinc-400
          500: '#52525b',  // zinc-600
          600: '#18181b',  // zinc-900 (Black for primary buttons!)
          700: '#09090b',  // zinc-950 (Hover black)
          800: '#09090b',  // fallback
          900: '#09090b',
          950: '#000000',
        },
        slate: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      },
      fontFamily: {
        "headline": ["Noto Serif", "serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Public Sans", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
