/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1ff",
          100: "#e0e4ff",
          500: "#4a5fe0",
          600: "#3c4fc9",
          700: "#31419e",
        },
      },
    },
  },
  plugins: [],
};
