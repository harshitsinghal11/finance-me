import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

import { Toaster } from "sonner";
import { GlobalHelp } from "@/src/components/GlobalHelp";

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
      className={`${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        {children}
        <Toaster position="bottom-right" richColors />
        <GlobalHelp />
      </body>
    </html>
  );
}
