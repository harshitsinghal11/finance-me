import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

import { Toaster } from "sonner";
import { GlobalHelp } from "@/src/components/GlobalHelp";
import { Footer } from "@/src/components/Footer";

export const metadata: Metadata = {
  title: "Finance Me",
  description: "Micro-finance member management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${quicksand.variable} antialiased`}
    >
      <body>
        <main>
          {children}
        </main>
        <Toaster position="bottom-right" richColors />
        <GlobalHelp />
        <Footer />
      </body>
    </html>
  );
}
