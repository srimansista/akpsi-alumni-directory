import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isApproved } from "@/lib/access";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function GET() {
 const session = await auth();
 if(!isApproved(session) || session?.user.role !== "ADMIN") return NextResponse.json({error:"Forbidden"},{status:403});
 const members = await prisma.user.findMany({orderBy:{createdAt:"desc"},select:{id:true,name:true,email:true,role:true,accessStatus:true,approvedAt:true,createdAt:true,alumniId:true}});
 return NextResponse.json(members);
}
