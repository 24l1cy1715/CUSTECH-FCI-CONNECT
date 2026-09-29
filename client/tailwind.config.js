/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /* ── Brand Colors ─────────────────────────────────────────────────── */
      colors: {
        primary: {
          DEFAULT: '#14213D',
          50:  '#E8ECF3',
          100: '#C5CFDF',
          200: '#9EAEC9',
          300: '#778DB3',
          400: '#5A779F',
          500: '#3E618C',
          600: '#2E4E74',
          700: '#1F3B5C',
          800: '#14213D',
          900: '#0A1223',
          950: '#060A14',
        },
        accent: {
          DEFAULT: '#FCA311',
          50:  '#FFF8E7',
          100: '#FEEEC3',
          200: '#FDE09B',
          300: '#FDD173',
          400: '#FCC34A',
          500: '#FCA311',
          600: '#E08A00',
          700: '#B86F00',
          800: '#905500',
          900: '#683C00',
        },
        gray: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        /* semantic tokens — map to CSS vars */
        bg:             'var(--color-bg)',
        surface:        'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        border:         'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        text:           'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':   'var(--color-text-muted)',
      },

      /* ── Typography ───────────────────────────────────────────────────── */
      fontFamily: {
        /* Segoe UI stack — feels native on Windows, clean on Mac/Linux */
        display: ['"Segoe UI"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        body:    ['"Segoe UI"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono:    ['"Segoe UI Mono"', '"JetBrains Mono"', 'Consolas', '"Courier New"', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        '3xs': ['0.5625rem', { lineHeight: '0.875rem' }],
      },

      /* ── Breakpoints ──────────────────────────────────────────────────── */
      screens: {
        'xs': '480px',
        /* sm=640, md=768, lg=1024, xl=1280 are Tailwind defaults */
      },

      /* ── Spacing ──────────────────────────────────────────────────────── */
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },

      /* ── Border radius ────────────────────────────────────────────────── */
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'lg': '0.625rem',
        'xl': '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        '5xl': '2rem',
      },

      /* ── Shadows ──────────────────────────────────────────────────────── */
      boxShadow: {
        xs:   'var(--shadow-xs)',
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        card: 'var(--shadow-card)',
      },

      /* ── Animations ───────────────────────────────────────────────────── */
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in-95': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-from-top-2': {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'marquee':              'marquee 30s linear infinite',
        'marquee-slow':         'marquee 50s linear infinite',
        'marquee-fast':         'marquee 15s linear infinite',
        'marquee-reverse':      'marquee-reverse 30s linear infinite',
        'fade-in':              'fade-in 0.25s ease-out forwards',
        'fade-up':              'fade-up 0.4s ease-out forwards',
        'zoom-in-95':           'zoom-in-95 0.2s ease-out forwards',
        'slide-in-from-top-2':  'slide-in-from-top-2 0.2s ease-out forwards',
        'shimmer':              'shimmer 2s linear infinite',
        'pulse':                'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      borderWidth: {
        '0.5': '0.5px',
      },

      /* spacing tokens from CSS vars */
      spacing: {
        'page-x': 'var(--page-x)',
      },
    },
  },
  plugins: [],
}
