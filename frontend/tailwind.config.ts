import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palmetto brand palette — derived from palmetto.com
        primary: {
          DEFAULT: '#D94829', // coral-red (CTA buttons, accents)
          hover:   '#BF3D22',
          light:   '#F3C5BA',
        },
        neutral: {
          cream:   '#F5F1EA', // page background
          charcoal:'#1C1C1C', // primary text / nav
          mid:     '#6B6B6B', // secondary text
          border:  '#E2DDD6', // subtle borders
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
