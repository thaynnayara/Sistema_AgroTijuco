/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agro-bg': '#f8faf7',
        'agro-primary': '#2d6a4f',
        'agro-primary-hover': '#1b4332',
        'agro-secondary': '#d8f3dc',
        'agro-secondary-dark': '#b7e4c7',
        'agro-accent': '#d97706',
        'agro-accent-light': '#fef3c7',
        'agro-dark': '#1e293b',
        'agro-forest': '#16281e',
        'agro-light': '#52b788',
        'agro-border': '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'agro': '0 4px 20px -2px rgba(45, 106, 79, 0.08)',
        'agro-lg': '0 10px 30px -4px rgba(45, 106, 79, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
