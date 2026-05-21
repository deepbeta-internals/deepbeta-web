import type { Metadata } from "next";
import "@fontsource/inter/latin.css";
import "@fontsource/space-grotesk/latin.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepbeta.co | Quantitative Intelligence, Engineered.",
  description:
    "Deepbeta.co builds quantitative machine learning systems across equities, crypto, FX, and derivatives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
