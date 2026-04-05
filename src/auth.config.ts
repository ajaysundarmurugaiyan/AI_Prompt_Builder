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
                         nextUrl.pathname.startsWith("/forgot-password") ||
                         nextUrl.pathname.startsWith("/reset-password");

      // Allow access to auth pages when not logged in
      if (isAuthPage) {
        if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
          // Redirect logged-in users away from login page
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Protect all other pages - require login
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
