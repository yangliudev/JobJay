import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "JobJay",
  description: "Stay motivated during your job search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={interTight.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
