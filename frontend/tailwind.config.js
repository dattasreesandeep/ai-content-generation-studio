/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C1B1A',
          soft: '#2A2826',
        },
        paper: {
          DEFAULT: '#FAF7F2',
          dim: '#F0EBE1',
        },
        violet: {
          DEFAULT: '#6B5CFF',
          dim: '#5747E0',
          light: '#ECE9FF',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          light: '#FFE4DB',
        },
        stone: {
          DEFAULT: '#8A8578',
          light: '#C9C4B6',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'cycle-fade': 'cycleFade 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cycleFade: {
          '0%, 100%': { opacity: '0' },
          '8%, 28%': { opacity: '1' },
          '36%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
