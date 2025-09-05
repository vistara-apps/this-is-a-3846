/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(214, 20%, 98%)',
        text: 'hsl(210, 20%, 15%)',
        accent: 'hsl(130, 70%, 45%)',
        primary: 'hsl(210, 80%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
      },
      borderRadius: {
        'lg': '16px',
        'md': '10px',
        'sm': '6px',
      },
      spacing: {
        'lg': '20px',
        'md': '12px',
        'sm': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 20%, 15%, 0.08)',
        'modal': '0 16px 48px hsla(210, 20%, 15%, 0.16)',
      },
    },
  },
  plugins: [],
}