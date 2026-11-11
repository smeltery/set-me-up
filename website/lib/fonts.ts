import localFont from "next/font/local";

import { cn } from "@/lib/utils";

const sans = localFont({
  src: "../public/fonts/schibsted-grotesk.ttf",
  variable: "--font-sans",
  display: "swap",
});
const mono = localFont({
  src: "../public/fonts/jetbrainsmono.ttf",
  variable: "--font-mono",
  display: "swap",
});
const glyphs = localFont({
  src: "../public/fonts/cascadiamono.ttf",
  variable: "--font-glyphs",
  display: "swap",
  preload: false,
});
export const fontVariables = cn(sans.variable, mono.variable, glyphs.variable);
