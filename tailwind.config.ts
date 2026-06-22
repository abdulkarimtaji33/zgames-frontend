import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#ffffff',
        card: '#111118',
        muted: '#a0aec0',
        accent: {
          DEFAULT: '#e53e3e',
          orange: '#ff6b35',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-rajdhani)', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '320px',
        sm: '375px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
        '2xl': '1920px',
      },
    },
  },
  plugins: [],
};

export default config;
