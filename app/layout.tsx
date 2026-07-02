import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meu Extrato — para onde vai o dinheiro",
  description: "Suba seu extrato e veja com clareza onde está gastando demais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-base text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
