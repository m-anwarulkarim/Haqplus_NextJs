import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@/types/next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Anwarul Karim Admin Master Account
        if (
          normalizedEmail === "dev.anwarul@gmail.com" &&
          password === "dev.anwarul"
        ) {
          return {
            id: "usr-anwarul-admin",
            name: "Anwarul Karim",
            email: "dev.anwarul@gmail.com",
            image:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            role: "ADMIN" as UserRole,
          };
        }

        // 2. Default Demo Admin
        if (
          normalizedEmail === "admin@apexstore.com" &&
          password === "admin123456"
        ) {
          return {
            id: "usr-apex-admin",
            name: "Apex Administrator",
            email: "admin@apexstore.com",
            image:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: "ADMIN" as UserRole,
          };
        }

        // 3. Demo Customer Account
        if (
          normalizedEmail === "customer@apexstore.com" &&
          password === "customer123"
        ) {
          return {
            id: "usr-demo-customer",
            name: "Tanzim Ahmed",
            email: "customer@apexstore.com",
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            role: "CUSTOMER" as UserRole,
          };
        }

        // 4. Query PostgreSQL Database
        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role as UserRole,
          };
        } catch (dbErr) {
          console.warn("Database connection issue during authentication:", dbErr);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = token.role as UserRole;
        }
      }
      return session;
    },
  },
});
