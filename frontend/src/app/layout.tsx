import type { Metadata } from "next";
import "./globals.css";
import "../styles/tokens.css";
import { ReduxProvider } from "@/store/Provider";

export const metadata: Metadata = {
  title: "Trade | Real-Time Stock Trading Platform",
  description:
    "Professional-grade stock trading platform with real-time market data, interactive charts, and advanced watchlist management.",
  keywords: [
    "trading",
    "stocks",
    "market",
    "finance",
    "investment",
    "real-time",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
