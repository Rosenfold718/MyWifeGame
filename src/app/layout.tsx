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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Philosopher:wght@700;900&family=Rubik:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --bg-deep: #0a0015;
                --bg-dark: #1a0a2e;
                --bg-panel: rgba(10, 0, 21, 0.85);
                --accent-purple: #c77dff;
                --accent-pink: #ff9de2;
                --accent-cyan: #7eb8ff;
                --text-primary: #f0e6ff;
                --text-dim: rgba(240, 230, 255, 0.5);
                --text-faint: rgba(240, 230, 255, 0.25);
                --border-glow: rgba(199, 125, 255, 0.3);
                --border-subtle: rgba(199, 125, 255, 0.12);
                --font-title: 'Philosopher', serif;
                --font-ui: 'Rubik', sans-serif;
              }

              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }

              body {
                background: #000;
                color: var(--text-primary);
                font-family: var(--font-ui);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                overflow: hidden;
              }

              ::-webkit-scrollbar {
                width: 4px;
              }
              ::-webkit-scrollbar-track {
                background: transparent;
              }
              ::-webkit-scrollbar-thumb {
                background: var(--border-glow);
                border-radius: 2px;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}