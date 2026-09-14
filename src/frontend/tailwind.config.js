/** @type {import('tailwindcss').Config} */

function withAlpha(variableName, defaultAlpha = 1) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`
    }
    return `rgb(var(${variableName}) / ${defaultAlpha})`
  }
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#F4F6F9',
        surface: '#FFFFFF',
        cardBorder: '#E5EAEE',
        materialm: {
          brand: '#0085db',
          brandHover: '#0074c2',
          brandLight: '#EBF3FE',
          mint: '#13DEB9',
          mintLight: '#E6FFFA',
          coral: '#FA896B',
          coralLight: '#FDEDE8',
          purple: '#7352FF',
          purpleLight: '#F2EEFF',
          amber: '#FFAE1F',
          amberLight: '#FEF5E5',
          darkBg: '#111c2d',
          darkCard: '#172337',
          darkBorder: '#22334d'
        },
        obsidian: {
          DEFAULT: withAlpha('--color-obsidian-900'),
          900: withAlpha('--color-obsidian-900'),
          800: withAlpha('--color-obsidian-800'),
          700: withAlpha('--color-obsidian-700'),
          600: withAlpha('--color-obsidian-600')
        },
        line: withAlpha('--color-line-rgb', 'var(--color-line-alpha, 0.12)'),
        lineSoft: withAlpha('--color-line-soft-rgb', 'var(--color-line-soft-alpha, 0.20)'),
        ink: withAlpha('--color-ink-rgb'),
        inksoft: withAlpha('--color-inksoft-rgb'),
        brand: {
          DEFAULT: withAlpha('--color-brand-rgb'),
          deep: withAlpha('--color-brand-deep-rgb'),
          glow: withAlpha('--color-brand-glow-rgb')
        },
        teal: {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E'
        },
        violet: {
          DEFAULT: '#7C6CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#7C6CF6',
          600: '#6D5DF0',
          700: '#5B4BDB'
        },
        amber: {
          DEFAULT: withAlpha('--color-amber-rgb'),
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1'
        },
        crit: withAlpha('--color-crit-rgb'),
        ok: withAlpha('--color-ok-rgb'),
        marine: {
          abyss: '#0F172A',
          deep: '#1E293B',
          surface: '#334155',
          mist: '#F7F9FC',
          sky: '#F0F4F8',
          azure: '#0284C7',
          foam: '#E2E8F0'
        }
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['14.5px', { lineHeight: '1.55', fontWeight: '400' }],
        caption: ['12.5px', { lineHeight: '1.4', fontWeight: '500' }]
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        driftA: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        driftB: { from: { transform: 'translateX(-10%)' }, to: { transform: 'translateX(-60%)' } },
        sail: { '0%': { left: '-8%' }, '100%': { left: '104%' } },
        pulseDot: { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .5, transform: 'scale(1.4)' } },
        critGlow: { '0%,100%': { filter: 'drop-shadow(0 0 0 rgba(229,73,61,0))' }, '50%': { filter: 'drop-shadow(0 0 8px rgba(229,73,61,.65))' } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        borderGlow: { '0%,100%': { opacity: 0.5 }, '50%': { opacity: 1 } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        cardEnter: { from: { opacity: 0, transform: 'translateY(10px) scale(0.985)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } }
      },
      animation: {
        driftA: 'driftA 18s linear infinite',
        driftB: 'driftB 13s linear infinite',
        driftARev: 'driftA 22s linear infinite reverse',
        sail: 'sail 34s linear infinite',
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        critGlow: 'critGlow 1.6s ease-in-out infinite',
        fadeUp: 'fadeUp .4s cubic-bezier(0.16, 1, 0.3, 1) both',
        borderGlow: 'borderGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        cardEnter: 'cardEnter .38s cubic-bezier(0.16, 1, 0.3, 1) both'
      }
    }
  },
  plugins: []
}
