import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
export async function requireMember() {
 const session = await auth();
 if (!session?.user?.id || session.user.accessStatus !== "APPROVED") redirect("/auth/signin");
 return session;
}
export function isApproved(session: Session | null) {
 return !!session?.user?.id && session.user.accessStatus === "APPROVED";
}
