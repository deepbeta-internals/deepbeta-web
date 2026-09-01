import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep Beta Technology LLC | Advanced Analytics & AI Solutions",
  description:
    "Deep Beta Technology LLC delivers advanced analytics, backtesting on financial products, and AI solutions to enterprises. Quantitative ML research and systematic strategies.",
  alternates: {
    languages: {
      en: "/",
      mn: "/mn",
      ko: "/ko",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
