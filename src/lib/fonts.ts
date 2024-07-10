import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({ subsets: ["latin"] });

export const leixo = localFont({
  src: "../../public/assets/fonts/Leixo.ttf",
  display: "swap",
  variable: "--font-leixo",
});
