/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        trufitBlue: "#1A3673",
        trufitRed: "#D82B21",
      },
    },
  },
  plugins: [],
};
