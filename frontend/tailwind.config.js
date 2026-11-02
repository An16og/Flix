/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme 1: Letterboxd & Criterion Dark Slate
        lbDark: {
          bg: '#0e1115',       // Deep cinematic charcoal slate
          surface: '#151a21',  // Card / surface
          card: '#1b222c',     // Card elevated
          border: '#26313f',   // Borders & dividers
          hover: '#222b37',    // Hover states
          textMuted: '#8b9bb0',// Subtitle text
          textMain: '#f1f5f9', // Primary text
        },
        // Theme 2: Editorial Beige & Off-White
        lbBeige: {
          bg: '#faf7f2',       // Warm cream background
          surface: '#f2ece2',  // Card / surface
          card: '#ebe3d5',     // Card elevated
          border: '#ded5c5',   // Borders & dividers
          hover: '#e5dcce',    // Hover states
          textMuted: '#786e60',// Subtitle text
          textMain: '#24201a', // Primary text
        },
        // Accent colors - Prestige Cinema Gold & Warm Amber
        brand: {
          gold: '#e5a93c',     // Prestige Cinema Gold
          amber: '#f59e0b',    // Warm Amber
          green: '#e5a93c',    // Aliased to Cinema Gold so existing classes gracefully adopt warm gold!
          rust: '#bf532c',     // Warm Rust for beige theme
          orange: '#f97316',   // Warm Orange
          blue: '#38bdf8',     // Sky Blue
        }
      },
      fontFamily: {
        sans: [
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ]
      },
      aspectRatio: {
        'poster': '2 / 3',
      },
      boxShadow: {
        'card-glow': '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
        'poster-hover': '0 12px 30px -6px rgba(229, 169, 60, 0.35)',
        'gold-glow': '0 0 25px -4px rgba(229, 169, 60, 0.4)',
      }
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('light', ['html.light &', 'html:not(.dark) &']);
    }
  ],
}
