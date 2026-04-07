import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Squito Mobile",
  description: "Smart. Safe. Pest Control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans fixed inset-0 flex flex-col bg-gray-50 text-gray-900 antialiased">
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 scrollbar-hide">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
