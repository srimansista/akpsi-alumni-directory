import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password.mjs";
import { consumeAttempt } from "@/lib/rate-limit";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
 adapter: PrismaAdapter(prisma),
 providers: [
  Credentials({credentials:{email:{type:"email"},password:{type:"password"}},async authorize(credentials) {
   const parsed = z.object({email:z.string().trim().toLowerCase().email(),password:z.string().min(1).max(128)}).safeParse(credentials);
   if (!parsed.success) return null;
   if (!await consumeAttempt("signin", parsed.data.email)) return null;
   const user = await prisma.user.findUnique({where:{email:parsed.data.email}});
   if (!user || user.accessStatus !== "APPROVED" || !await verifyPassword(parsed.data.password,user.passwordHash)) return null;
   return user;
  }}),
 ],
 callbacks: {
  async signIn({user}) {
   if(!user.email) return false;
   const member = await prisma.user.findUnique({where:{email:user.email.trim().toLowerCase()}});
   return member?.accessStatus === "APPROVED";
  },
  async jwt({token,user}) {
   if(user) {
    token.sub = user.id;
    const member = await prisma.user.findUnique({where:{id:user.id},select:{sessionVersion:true}});
    token.sessionVersion = member?.sessionVersion;
   }
   return token;
  },
  async session({session,token}) {
   // Re-read approval and role on every request so revocation takes effect immediately.
   const user = token.sub ? await prisma.user.findUnique({where:{id:token.sub},select:{id:true,name:true,email:true,role:true,accessStatus:true,alumniId:true,sessionVersion:true}}) : null;
   if(session.user) {
    session.user.id = user?.accessStatus === "APPROVED" && token.sessionVersion === user.sessionVersion ? user.id : "";
    session.user.role = user?.role ?? "VIEWER";
    session.user.accessStatus = user?.accessStatus ?? "REJECTED";
    session.user.alumniId = user?.alumniId ?? null;
    session.user.name = user?.name ?? null;
    session.user.email = user?.email ?? "";
   }
   return session;
  },
 },
 pages:{signIn:"/auth/signin",error:"/auth/signin"},
 session:{strategy:"jwt",maxAge:7*24*60*60},
});
