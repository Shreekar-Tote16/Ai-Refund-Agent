import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Refund Agent",
  description: "Customer support refund agent with admin reasoning logs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
