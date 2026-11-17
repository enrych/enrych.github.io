import localFont from "next/font/local";

// Inter is self-hosted via @fontsource-variable/inter (imported in layout), so builds need no network.
export const leixo = localFont({
  src: "../../public/assets/fonts/Leixo.ttf",
  display: "swap",
  variable: "--font-leixo",
});
