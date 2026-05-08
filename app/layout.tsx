
import { Orbitron, Exo_2 } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
});

import { AuthProvider } from "@/contexts/auth-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className={`${orbitron.variable} ${exo2.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" theme="dark" />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
