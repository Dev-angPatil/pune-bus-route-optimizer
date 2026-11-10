/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pune: {
          dark: '#080c14',
          card: '#0f172a',
          card2: '#131e33',
          border: '#1e293b',
          accent: '#06b6d4',
          accentGlow: '#22d3ee',
          emerald: '#10b981',
          danger: '#ef4444',
          amber: '#f59e0b',
          purple: '#a855f7'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 3px rgba(6,182,212,0.2))' }
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(6px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
