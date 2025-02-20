/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false, // Completely disable dark mode
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007bff", // Adjust this to match your design
        secondary: "#000000",
        textColor: "#000000",
      },
    },
  },
  plugins: [],
};
