/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#6D5EF6', light: '#9B6CF8' },
        ink: { DEFAULT: '#1B1830', soft: '#2A2342' },
        muted: { DEFAULT: '#6B6685', soft: '#857F9C', faint: '#A39EB8' },
        success: '#15B886',
        danger: '#E5484D',
        warn: '#F59E0B',
        info: '#3B82F6',
        surface: '#F6F5FB',
        line: '#EDEAF6',
        // dark purples
        dark: { 1: '#1C1633', 2: '#2A2150', 3: '#3B2F73' },
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        field: '12px',
      },
      boxShadow: {
        card: '0 8px 22px rgba(60,42,140,.04)',
        'card-lg': '0 10px 30px rgba(60,42,140,.05)',
        btn: '0 8px 20px rgba(109,94,246,.35)',
        'btn-hover': '0 14px 30px rgba(109,94,246,.45)',
        feature: '0 18px 40px rgba(109,94,246,.32)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #6D5EF6, #9B6CF8)',
      },
      maxWidth: {
        content: '1180px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(.2,.7,.3,1)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '60%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        ring: { '0%': { transform: 'scale(.7)', opacity: '.55' }, '100%': { transform: 'scale(2.1)', opacity: '0' } },
        rise: { '0%': { transform: 'translateY(18px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pop: 'pop .5s ease both',
        ring: 'ring 2.4s ease-out infinite',
        rise: 'rise .7s ease both',
      },
    },
  },
  plugins: [],
};
