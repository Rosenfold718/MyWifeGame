import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Эфирная Сага — Aetherial Saga",
  description: "3D RPG game built with Next.js, React Three Fiber, and TypeScript. Explore enchanted forests, crystal deserts, and frozen tundras.",
  keywords: ["game", "RPG", "3D", "Next.js", "React Three Fiber", "TypeScript", "Aetherial Saga"],
  authors: [{ name: "Rosenfold718" }],
  openGraph: {
    title: "Эфирная Сага — Aetherial Saga",
    description: "3D RPG game — explore, fight, and discover magic!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
