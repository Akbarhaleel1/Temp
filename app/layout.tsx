import type { Metadata, Viewport } from "next";
import { Dancing_Script, Cormorant_Garamond } from "next/font/google";
import { CONFIG } from "@/lib/config";
import "./globals.css";

const script = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-script" });
const serif = Cormorant_Garamond({
  subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-serif",
});

export const metadata: Metadata = { title: `Happy Birthday, ${CONFIG.name}` };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
