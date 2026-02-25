import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "maturIAté — Diagnostic de maturité IA",
  description:
    "Évaluez et suivez la maturité IA de vos équipes de développement avec des diagnostics structurés, des dashboards et des benchmarks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
