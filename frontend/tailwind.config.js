/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#9AFF3D',
          dim: '#6FCC1F',
          glow: '#C4FF7A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 24px -4px rgba(154, 255, 61, 0.45)',
        'neon-sm': '0 0 12px -2px rgba(154, 255, 61, 0.35)',
      },
    },
  },
  plugins: [],
};
