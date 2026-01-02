// client/src/app/layout.tsx
import "@/styles/globals.css";

import clsx from "clsx";
import { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/font";
import AuthGuard from "@/components/guards/AuthGuard";

export const metadata: Metadata = {
  title: {
    default: "Gia Lực",
    template: `Kaivian Template`,
  },
  description: "Next.js + Tailwind v4 + HeroUI",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        {/* Providers contain AuthProvider inside */}
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          
          {/* AuthGuard must be a child of Providers to access AuthContext */}
          <AuthGuard>
            {children}
          </AuthGuard>
          
        </Providers>
      </body>
    </html>
  );
}