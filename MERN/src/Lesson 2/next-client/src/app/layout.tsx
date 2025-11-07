import type { Metadata } from "next";

import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MERN Frontend",
  description: "Next.js + Tailwind v4 + HeroUI template",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}