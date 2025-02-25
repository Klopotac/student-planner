"use client";

import { SessionProvider } from "next-auth/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        {children}
      </GoogleOAuthProvider>
    </SessionProvider>
  );
}
