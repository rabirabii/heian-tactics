import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Heian Tactics",
  description: "Advanced Meta Lineup Builder and Matchup Scenarios for Onmyoji.",
};

import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#FFD700" showSpinner={false} height={3} />
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
