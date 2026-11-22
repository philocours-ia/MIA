import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIA — Malagasy Intelligent Assistant",
  description:
    "Votre assistante administrative bilingue pour rechercher, comprendre et préparer vos documents.",
  applicationName: "MIA"
};

export const viewport: Viewport = {
  themeColor: "#f5f7f6",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}