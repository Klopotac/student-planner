"use client";

import "./globals.css";
import Navbar from "./components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Student Planner",
  description: "A tool to organize your study schedule",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        <html lang="en">
          <body>
            
            {children}
          </body>
        </html>
      </GoogleOAuthProvider>
    </SessionProvider>
  );
}
