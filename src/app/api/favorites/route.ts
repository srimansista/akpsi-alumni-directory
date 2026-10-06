import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isApproved } from "@/lib/access";
import { prisma } from "@/lib/prisma";
export async function GET() {
 const session = await auth();
 if(!isApproved(session)) return NextResponse.json({error:"Unauthorized"},{status:401});
 const records = await prisma.favorite.findMany({where:{userId:session!.user.id},select:{alumniId:true}});
 return NextResponse.json(records.map(r=>r.alumniId));
}
