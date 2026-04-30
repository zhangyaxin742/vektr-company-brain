import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Vektr",
    template: "%s | Vektr",
  },
  description: "The company brain for AI agents.",
  openGraph: {
    title: "Vektr",
    description:
      "Vektr turns Slack threads, emails, docs, and tickets into a living operating graph, then generates executable skills for AI agents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground flex flex-col">{children}</body>
    </html>
  );
}
