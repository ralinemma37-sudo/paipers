import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify",
          ].join(" "),
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // Quand l'utilisateur vient de se connecter avec Google
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : null;
        token.googleEmail = profile?.email ?? token.email;
      }

      return token;
    },

    async session({ session, token }) {
      // On expose l'accessToken Google côté client
      (session as any).accessToken = token.accessToken;
      (session.user as any).googleEmail = token.googleEmail;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
