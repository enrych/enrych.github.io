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
