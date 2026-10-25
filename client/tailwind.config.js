/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soviet: {
          dark: '#121316',
          panel: '#1C1E24',
          metal: '#2A2D37',
          border: '#3F4452',
          yellow: '#FFD600',
          red: '#FF2A2A',
          green: '#00FF66',
          amber: '#FF9900',
          cyan: '#00F0FF',
          cream: '#F4E8C1'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'monospace'],
        display: ['"Impact"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'glow-yellow': '0 0 15px rgba(255, 214, 0, 0.4)',
        'glow-red': '0 0 15px rgba(255, 42, 42, 0.5)',
        'glow-green': '0 0 15px rgba(0, 255, 102, 0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.4s ease-in-out',
        'flicker': 'flicker 2s infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px) rotate(-1deg)' },
          '40%, 80%': { transform: 'translateX(6px) rotate(1deg)' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '1' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}
