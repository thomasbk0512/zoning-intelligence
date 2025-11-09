/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          weak: 'var(--color-primary-weak)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        'focus-ring': 'var(--color-focus-ring)',
      },
      borderRadius: {
        '1': 'var(--radius-1)',
        '2': 'var(--radius-2)',
        '3': 'var(--radius-3)',
        '4': 'var(--radius-4)',
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
      },
      fontFamily: {
        sans: ['var(--font-family)'],
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: '1.5' }],
        sm: ['var(--font-size-sm)', { lineHeight: '1.5' }],
        base: ['var(--font-size-base)', { lineHeight: '1.5' }],
        lg: ['var(--font-size-lg)', { lineHeight: '1.5' }],
        xl: ['var(--font-size-xl)', { lineHeight: '1.5' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: '1.4' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: '1.3' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: '1.2' }],
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
    },
  },
  plugins: [],
}

