import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { CartProvider } from "@/lib/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
      <body className="font-sans min-h-[100dvh] w-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>
          <CartProvider>
            <SplashScreen />
            <AuthGate />
            <OnboardingWizard />
            <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 scrollbar-hide">
              {children}
            </main>
            <CartDrawer />
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
