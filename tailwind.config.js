/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        body: {
          DEFAULT: "#A6DBFF",
        },
        primary: {
          DEFAULT: "#DFF6FF",
        },
        secondary: {
          DEFAULT: "#06283D",
        },
      },
    },
  },
  plugins: [],
};
