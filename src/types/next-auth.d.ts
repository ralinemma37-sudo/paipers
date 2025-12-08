import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      googleEmail?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    googleEmail?: string;
  }
}
