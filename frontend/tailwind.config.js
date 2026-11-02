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
        // Theme 1: Letterboxd Dark Slate
        lbDark: {
          bg: '#14181c',       // Base background
          surface: '#1a2129',  // Card / surface
          card: '#1f2730',     // Card elevated
          border: '#2c3742',   // Borders & dividers
          hover: '#26303b',    // Hover states
          textMuted: '#7f93a6',// Subtitle text
          textMain: '#e6edf5', // Primary text
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
        // Accent colors
        brand: {
          green: '#00e054',    // Letterboxd signature neon green
          orange: '#ff8000',   // Letterboxd orange
          blue: '#40bcf4',     // Cyan / blue
          rust: '#bf532c',     // Warm rust for beige theme
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'Newsreader',
          'Georgia',
          'serif',
        ]
      },
      aspectRatio: {
        'poster': '2 / 3',
      },
      boxShadow: {
        'card-glow': '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
        'poster-hover': '0 12px 30px -6px rgba(0, 224, 84, 0.25)',
      }
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('light', ['html.light &', 'html:not(.dark) &']);
    }
  ],
}
