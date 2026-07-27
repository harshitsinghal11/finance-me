import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

import { Toaster } from "sonner";
import { GlobalHelp } from "@/src/components/GlobalHelp";
import NextTopLoader from 'nextjs-toploader';

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
      <body className="font-quicksand">
        <NextTopLoader
          color="#0f52ba"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0f52ba,0 0 5px #0f52ba"
        />
        <main>
          {children}
        </main>
        <Toaster position="bottom-right" richColors />
        <GlobalHelp />
      </body>
    </html>
  );
}
