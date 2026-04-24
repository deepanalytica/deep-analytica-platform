import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep Analytica — Consulting & Data",
  description: "Datos que responden preguntas de negocio. Consultoría, Análisis e IA aplicada.",
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
