import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Эфирная Сага",
  description: "3D RPG с аниме-стилистикой — исследуй мир магии!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}