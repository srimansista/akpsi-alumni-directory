import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD ?? "akpsi-admin-2024";

        if (
          parsed.data.email === adminEmail &&
          parsed.data.password === adminPassword
        ) {
          let user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: parsed.data.email,
                name: "Admin",
                role: "ADMIN",
              },
            });
          }
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        if (user) {
          session.user.id = user.id;
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          session.user.role = dbUser?.role ?? "VIEWER";
        } else if (token) {
          session.user.id = token.sub ?? "";
          session.user.role = (token.role as string) ?? "VIEWER";
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "VIEWER";
      }
      return token;
    },
    async signIn({ user }) {
      if (user?.email) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (user.email === adminEmail) {
          await prisma.user.updateMany({
            where: { email: user.email },
            data: { role: "ADMIN" },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});
