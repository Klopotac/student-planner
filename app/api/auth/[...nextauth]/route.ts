import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,  // Google Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,      // Google Client Secret
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Secret for NextAuth sessions
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
