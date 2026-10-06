import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeAttempt } from "@/lib/rate-limit";
import { sendAccountLink, emailConfigured } from "@/lib/account-email";
export async function POST(req:NextRequest) {
 if(req.headers.get("origin") !== new URL(process.env.AUTH_URL ?? req.url).origin) return NextResponse.json({error:"Invalid request origin"},{status:403});
 const parsed=z.object({email:z.string().trim().toLowerCase().email(),kind:z.enum(["verify","reset"])}).safeParse(await req.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Enter a valid email."},{status:400});
 if(!emailConfigured()) return NextResponse.json({error:"Account email is awaiting setup. Contact the chapter administrator."},{status:503});
 try {
  const {email,kind}=parsed.data;
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if(!await consumeAttempt("email-link",email,3) || !await consumeAttempt("email-ip",ip,10)) return NextResponse.json({error:"Too many requests. Try again in 15 minutes."},{status:429});
  const user=await prisma.user.findUnique({where:{email}});
  if(user && (kind==="reset" || !user.emailVerified)) await sendAccountLink(email,kind);
  return NextResponse.json({message:"If an eligible account exists, a link has been sent. Check your inbox."});
 } catch {return NextResponse.json({error:"Could not send email. Please try again later."},{status:503});}
}
