"use client"; // This is a Client Component

import { SessionProvider } from "next-auth/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <SessionProvider>{children}</SessionProvider>
    </GoogleOAuthProvider>
  );
}
