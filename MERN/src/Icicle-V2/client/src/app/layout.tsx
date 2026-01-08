// client/src/app/layout.tsx
import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/font.config";
import { getCurrentUser } from "@/services/auth-server.service";
import { AuthProvider } from "@/providers/auth.provider";

export const metadata: Metadata = {
  title: { default: "Gia Lực", template: `Kaivian Template` },
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
      <body className={clsx("min-h-screen font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <AuthProvider initialData={userData}>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}