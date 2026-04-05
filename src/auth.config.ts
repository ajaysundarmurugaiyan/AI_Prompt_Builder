import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login") || 
                         nextUrl.pathname.startsWith("/signup") ||
                         nextUrl.pathname.startsWith("/forgot-password");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false; // This will trigger a redirect to the signIn page defined above
      }

      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
