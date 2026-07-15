/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: '#101828',
        muted: '#667085',
        line: '#d9e7ec',
        aqua: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#11b8c9',
          600: '#0891a3',
          700: '#0e7490',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)',
        panel: '0 10px 34px rgba(14, 116, 144, 0.10)',
      },
    },
  },
  plugins: [],
};