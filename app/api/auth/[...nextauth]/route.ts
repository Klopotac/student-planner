// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,  // Google Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,      // Google Client Secret
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user info to session
      if (session.user) {
        session.user.id = user.id;
        
        // Check if user has an active subscription
        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        });
        
        session.user.hasPro = subscription?.status === 'active';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for NextAuth sessions
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };