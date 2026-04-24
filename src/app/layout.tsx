import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep Analytica — Consultoría estratégica, marketing e IA aplicada",
  description: "Resolvemos problemas estratégicos con performance marketing, agentes de IA y transferencia de capacidades para organizaciones públicas y privadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark" className="dark">
      <body className="antialiased min-h-screen bg-bg text-fg-1">
        {children}
      </body>
    </html>
  );
}
