import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenSchema, tokenDigest } from "@/lib/account-token";
export async function POST(req:NextRequest) {
 const parsed=tokenSchema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Invalid verification link."},{status:400});
 try {
  const {email,token}=parsed.data;const identifier=`verify:${email}`;const digest=tokenDigest(token);
  await prisma.$transaction(async tx=>{
   const used=await tx.verificationToken.deleteMany({where:{identifier,token:digest,expires:{gt:new Date()}}});
   if(used.count!==1) throw new Error("Invalid link");
   await tx.user.update({where:{email},data:{emailVerified:new Date()}});
   await tx.verificationToken.deleteMany({where:{identifier}});
  });
  return NextResponse.json({message:"Email verified. Your chapter administrator must approve your account before you can sign in."});
 } catch {return NextResponse.json({error:"This verification link has expired or already been used. Request a new link."},{status:400});}
}
