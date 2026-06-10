import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import MainSiteVisitTracker from "@/components/tracking/MainSiteVisitTracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assessment Center",
  description: "Unified assessment platform for students, parents, and organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MainSiteVisitTracker />
        {children}
      </body>
    </html>
  );
}
