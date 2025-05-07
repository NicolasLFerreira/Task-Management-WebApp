/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./app/**/*.{js,ts,jsx,tsx}"],
    darkMode: "media",
    theme: {
      extend: {
        fontFamily: {
          sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        },
      },
    },
    plugins: [],
  }
  