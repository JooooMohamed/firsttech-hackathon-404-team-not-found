/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#6C63FF", dark: "#5A52D5" },
        secondary: "#00C9A7",
        surface: "#FFFFFF",
        background: "#F8F9FE",
      },
    },
  },
  plugins: [],
};
