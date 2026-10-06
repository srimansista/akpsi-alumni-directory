import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isApproved } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({ status: z.enum(["WANT_TO_TALK", "TALKED_TO"]) }).strict();
type Context = { params: { id: string } };

export async function GET(_req: Request, { params }: Context) {
  const session = await auth();
  if (!isApproved(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const saved = await prisma.favorite.findUnique({
    where: { userId_alumniId: { userId: session!.user.id, alumniId: params.id } },
    select: { status: true },
  });
  return NextResponse.json({ status: saved?.status ?? null });
}

export async function PATCH(req: Request, { params }: Context) {
  const session = await auth();
  if (!isApproved(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(process.env.AUTH_URL ?? req.url).origin)
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid contact status." }, { status: 400 });
  if (!await prisma.alumni.findUnique({ where: { id: params.id }, select: { id: true } }))
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  const record = await prisma.favorite.upsert({
    where: { userId_alumniId: { userId: session!.user.id, alumniId: params.id } },
    create: { userId: session!.user.id, alumniId: params.id, status: parsed.data.status },
    update: { status: parsed.data.status },
    select: { alumniId: true, status: true },
  });
  return NextResponse.json(record);
}

export async function DELETE(req: Request, { params }: Context) {
  const session = await auth();
  if (!isApproved(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(process.env.AUTH_URL ?? req.url).origin)
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  await prisma.favorite.deleteMany({ where: { userId: session!.user.id, alumniId: params.id } });
  return NextResponse.json({ status: null });
}
