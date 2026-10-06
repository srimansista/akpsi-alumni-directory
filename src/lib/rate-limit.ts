import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
export async function consumeAttempt(action: string, identifier: string, limit = 10) {
 const now = Date.now();
 const window = Math.floor(now / (15 * 60 * 1000));
 const key = createHash("sha256").update(`${action}:${identifier.toLowerCase()}:${window}`).digest("hex");
 const result = await prisma.authAttempt.upsert({where:{key},create:{key,count:1,expiresAt:new Date((window+1)*15*60*1000)},update:{count:{increment:1}}});
 return result.count <= limit;
}
