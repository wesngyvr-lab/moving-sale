import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moving Sale",
  description: "Reserve furniture and manage your moving sale list.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
