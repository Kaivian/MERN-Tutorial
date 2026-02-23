// client/src/app/layout.tsx
import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/font.config";
import { getCurrentUser } from "@/services/auth-server.service";
import { AuthProvider } from "@/providers/auth.provider";
import { Pixelify_Sans } from "next/font/google";

const fontPixel = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify",
});

export const metadata: Metadata = {
  title: { default: "FPT Unimate", template: `Kaivian Template` },
  icons: { icon: "/favicon.png" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getCurrentUser();

  return (
    <html suppressHydrationWarning lang="en">
      <body 
        className={clsx(
          "min-h-screen font-pixelify antialiased", 
          fontSans.variable, 
          fontMono.variable,
          fontPixel.variable 
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <AuthProvider initialData={userData}>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}