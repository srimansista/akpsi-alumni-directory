import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isApproved } from "@/lib/access";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function PATCH(req: NextRequest,{params}:{params:{id:string}}) {
 const session = await auth();
 if(!isApproved(session) || session?.user.role !== "ADMIN") return NextResponse.json({error:"Forbidden"},{status:403});
 const parsed = z.object({accessStatus:z.enum(["APPROVED","REJECTED"])}).safeParse(await req.json().catch(()=>null));
 if(!parsed.success) return NextResponse.json({error:"Invalid status"},{status:400});
 if(params.id === session.user.id) return NextResponse.json({error:"You cannot change your own access."},{status:400});
 try {
  const result = await prisma.$transaction(async tx=>{
   const user = await tx.user.findUnique({where:{id:params.id}});
   if(!user) throw new Error("NOT_FOUND");
   if(user.role === "ADMIN") throw new Error("ADMIN_ACCOUNT");
   let alumniId = user.alumniId;
   if(parsed.data.accessStatus === "APPROVED" && !alumniId) {
    const record = await tx.alumni.findFirst({where:{email:{equals:user.email,mode:"insensitive"}}});
    const alumnus = record ?? await tx.alumni.create({data:{name:user.name ?? "Member",email:user.email}});
    alumniId = alumnus.id;
   }
   const updated = await tx.user.update({where:{id:user.id},data:{accessStatus:parsed.data.accessStatus,approvedAt:parsed.data.accessStatus === "APPROVED" ? new Date() : null,approvedBy:session.user.id,alumniId,sessionVersion:{increment:1}},select:{id:true,accessStatus:true}});
   await tx.auditLog.create({data:{action:parsed.data.accessStatus,entity:"User",entityId:user.id,userId:session.user.id}});
   return updated;
  });
  return NextResponse.json(result);
 } catch(error) {
  const message = (error as Error).message;
  return NextResponse.json({error:message === "NOT_FOUND" ? "Member not found" : message === "ADMIN_ACCOUNT" ? "Admin access is managed by the account owner." : "Could not update access."},{status:message === "NOT_FOUND" ? 404 : 400});
 }
}
