/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        apple: {
          gray: '#86868b',
          lightgray: '#f5f5f7',
          blue: '#0071e3',
        }
      },
      boxShadow: {
        'apple': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
