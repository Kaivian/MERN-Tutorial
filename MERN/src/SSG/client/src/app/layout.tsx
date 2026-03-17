// client/src/app/layout.tsx
import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/font.config";
import { AuthProvider } from "@/providers/auth.provider";
import { Jersey_10 } from "next/font/google";
import { Suspense } from 'react'

const fontJersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jersey10",
});

export const metadata: Metadata = {
  title: { default: "FPT Unimate", template: `Kaivian Template` },
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={clsx(
          "min-h-screen font-jersey10 antialiased",
          fontSans.variable,
          fontMono.variable,
          fontJersey.variable
        )}
      >
        <Suspense fallback={<>...</>}>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <AuthProvider initialData={null}>
              {children}
            </AuthProvider>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
