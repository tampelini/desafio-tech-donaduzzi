/** @type {import('tailwindcss').Config} */
// As cores vêm de variáveis CSS (definidas pelo painel administrativo),
// permitindo trocar a paleta pelo manual oficial sem recompilar.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: v('brand'),
        cream: v('cream'),
        heading: v('heading'),
        bg: v('bg'),
        surface: v('surface'),
        primary: v('primary'),
        accent: v('accent'),
        success: v('success'),
        danger: v('danger'),
        gold: v('gold'),
        ink: v('ink'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
