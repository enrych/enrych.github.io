import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        leixo: ["var(--font-leixo)", "sans-serif"],
        sans: ["'Inter Variable'", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["'Newsreader Variable'", "Georgia", "serif"],
      },
      colors: {
        night: "#0F1126",
        ink: "#181B3A",
        haze: "#8A8FB3",
        dust: "#C7CADB",
        starlight: "#F3F1EA",
        glow: "#E9DCC4",
      },
      content: {
        hyphen: "'\u2014'",
        quote: "'\u201C'",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "70%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      objectPosition: {
        center: "50% 50%",
      },
    },
  },
  plugins: [],
};
export default config;
