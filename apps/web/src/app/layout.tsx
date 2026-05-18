import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReNTAI Teleconsultoria",
  description: "Modulo de teleconsultoria com validacao inteligente de documentos."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
