import NextAuth, { NextAuthOptions, Session, User, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// Extend NextAuth's Session type to ensure user always has an email
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email: string; // Ensures email is always a string
      image?: string | null;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!session.user) {
        session.user = {} as Session["user"];
      }
      session.user.email = token.email as string ?? ""; // Ensures email is always a string
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.email = user.email as string ?? ""; // Ensures email is always a string
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
