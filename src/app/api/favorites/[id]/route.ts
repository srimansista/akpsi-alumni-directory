import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isApproved } from "@/lib/access";
import { prisma } from "@/lib/prisma";
async function change(id: string, add: boolean) {
 const session = await auth();
 if(!isApproved(session)) return NextResponse.json({error:"Unauthorized"},{status:401});
 try {
  if(add) await prisma.favorite.upsert({where:{userId_alumniId:{userId:session!.user.id,alumniId:id}},create:{userId:session!.user.id,alumniId:id},update:{}});
  else await prisma.favorite.deleteMany({where:{userId:session!.user.id,alumniId:id}});
  return NextResponse.json({saved:add});
 } catch {return NextResponse.json({error:"Could not save favorite."},{status:400});}
}
export async function PUT(_req:Request,{params}:{params:{id:string}}) {return change(params.id,true);}
export async function DELETE(_req:Request,{params}:{params:{id:string}}) {return change(params.id,false);}
