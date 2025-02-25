import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { adminDb } from "../../../../lib/firebaseAdmin"; // Adjust the path if needed
import { NextAuthOptions } from "next-auth";

// Extend the Session type to include a "paid" flag
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      paid?: boolean;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        const userDoc = await adminDb
          .collection("users")
          .doc(session.user.email)
          .get();
        session.user.paid = userDoc.exists ? userDoc.data()?.paid || false : false;
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email) {
        const userRef = adminDb.collection("users").doc(user.email);
        const doc = await userRef.get();
        if (!doc.exists) {
          await userRef.set({ paid: false });
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
