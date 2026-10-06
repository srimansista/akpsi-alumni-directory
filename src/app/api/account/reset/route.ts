import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tokenSchema, tokenDigest } from "@/lib/account-token";
import { consumeAttempt } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/password.mjs";
export async function POST(req:NextRequest) {
 const parsed=tokenSchema.extend({password:z.string().min(8).max(128)}).safeParse(await req.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Use a valid reset link and a password of at least 8 characters."},{status:400});
 try {
  const {email,token,password}=parsed.data;const identifier=`reset:${email}`;const digest=tokenDigest(token);if(!await consumeAttempt("reset-token",email,10)) return NextResponse.json({error:"Too many attempts. Try later."},{status:429});
  const record=await prisma.verificationToken.findUnique({where:{identifier_token:{identifier,token:digest}}});
  if(!record || record.expires <= new Date()) return NextResponse.json({error:"This reset link has expired or already been used."},{status:400});
  const passwordHash=await hashPassword(password);
  await prisma.$transaction(async tx=>{
   const used=await tx.verificationToken.deleteMany({where:{identifier,token:digest,expires:{gt:new Date()}}});
   if(used.count!==1) throw new Error("Invalid link");
   await tx.user.update({where:{email},data:{passwordHash,sessionVersion:{increment:1}}});
   await tx.verificationToken.deleteMany({where:{identifier}});
  });
  return NextResponse.json({message:"Password updated. Sign in with your new password."});
 } catch {return NextResponse.json({error:"This reset link has expired or already been used. Request a new link."},{status:400});}
}
