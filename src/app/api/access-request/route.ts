import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeAttempt } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/password.mjs";
import { sendAccountLink, emailConfigured } from "@/lib/account-email";
export const runtime = "nodejs";
const schema = z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().toLowerCase().email().max(254),password:z.string().min(12).max(128)});
export async function POST(req: NextRequest) {
 if(req.headers.get("origin") !== new URL(process.env.AUTH_URL ?? req.url).origin) return NextResponse.json({error:"Invalid request origin"},{status:403});
 const parsed = schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Enter your name, email, and a password of at least 12 characters."},{status:400});
 if(!emailConfigured()) return NextResponse.json({error:"Account registration is awaiting email setup. Please contact the chapter administrator."},{status:503});
 try {
  const {password,...data} = parsed.data;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if(!await consumeAttempt("access-email",data.email,3) || !await consumeAttempt("access-ip",ip,10)) return NextResponse.json({error:"Too many requests. Please try again in 15 minutes."},{status:429});
  const existing = await prisma.user.findUnique({where:{email:data.email}});
  if(!existing) {
   await prisma.user.create({data:{...data,passwordHash:await hashPassword(password),accessStatus:"PENDING",role:"VIEWER"}});
   await sendAccountLink(data.email,"verify");
  } else if(!existing.emailVerified) await sendAccountLink(data.email,"verify");
  // Existing account credentials are never overwritten by a public request.
  return NextResponse.json({message:"If this email can be registered, a verification link has been sent. Check your inbox; chapter approval is also required."},{status:202});
 } catch(error) {
  if((error as {code?:string}).code === "P2002") return NextResponse.json({message:"Check your email to continue."},{status:202});
  return NextResponse.json({error:"Could not send your verification email. Your request may be saved; use Resend verification to try again."},{status:503});
 }
}
