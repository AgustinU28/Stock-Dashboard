import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mostrador — Panel de ventas y stock",
  description: "Panel en tiempo real de ventas y stock del almacen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
