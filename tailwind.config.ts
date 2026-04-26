import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0e1218",
        panel: "#161c25",
        panel2: "#1c2330",
        border: "#2a3342",
        muted: "#8a96a8",
        accent: "#5b8def",
        accent2: "#62d394",
        warning: "#f0a93b",
        danger: "#ef5b5b",
        hover: "#232c3b",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
