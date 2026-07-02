/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0A0E16",
        surface: "#121826",
        "surface-2": "#1A2233",
        line: "#232D42",
        ink: "#EDF1F7",
        "ink-dim": "#8A96AC",
        "ink-faint": "#5A657C",
        alert: "#FF6B5C",
        amber: "#FFB020",
        good: "#3DDC97",
        teal: "#2DD4BF",
        violet: "#A78BFA",
        blue: "#5B9DFF",
        pink: "#F472B6",
        cyan: "#38E1D6",
        lime: "#B4E24C",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
