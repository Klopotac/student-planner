// app/layout.tsx
import "./globals.css";
import { Metadata } from "next";
import ClientProvider from "./components/ClientProvider"; // We create this below

export const metadata: Metadata = {
  title: "Student Planner",
  description: "A tool to organize your study schedule",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider> {/* Wrap children with ClientProvider */}
      </body>
    </html>
  );
}
