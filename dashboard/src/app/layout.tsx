import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PH-Pulse | Philippine Socioeconomic Dashboard",
  description:
    "Interactive dashboard tracking poverty incidence across Philippine regions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSerif.variable} ${dmSans.variable} font-[family-name:var(--font-body)] antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
