import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:  '#080C17',
          surface:  '#0E1425',
          elevated: '#141C30',
          glass:    'rgba(255,255,255,0.04)',
        },
        accent: {
          violet: '#7C3AED',
          cyan:   '#06B6D4',
          indigo: '#4F46E5',
        },
        border: {
          glass:  'rgba(255,255,255,0.08)',
          glow:   'rgba(124,58,237,0.5)',
        },
        text: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'scan-gradient': 'conic-gradient(from 0deg, transparent, rgba(124,58,237,0.8), transparent)',
      },
      keyframes: {
        'scan-rotate': { to: { transform: 'rotate(360deg)' } },
        'pulse-glow':  { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
        'float':       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'shimmer':     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'fade-up':     { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in':    { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        'scan-rotate': 'scan-rotate 2s linear infinite',
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'float':       'float 4s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'fade-up':     'fade-up 0.5s ease-out forwards',
        'slide-in':    'slide-in 0.4s ease-out forwards',
      },
      boxShadow: {
        'glow-violet': '0 0 30px rgba(124,58,237,0.4)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.4)',
        'glow-sm':     '0 0 12px rgba(124,58,237,0.3)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
