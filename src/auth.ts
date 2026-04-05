import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/db/supabase";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toString().toLowerCase();
        
        // Fetch user from Supabase using the administrative client
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user) {
          console.error('Auth User Not Found:', error);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
