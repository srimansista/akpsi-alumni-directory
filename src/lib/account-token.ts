import { createHash } from "node:crypto";
import { z } from "zod";
export const tokenSchema=z.object({email:z.string().trim().toLowerCase().email(),token:z.string().regex(/^[a-f0-9]{64}$/)});
export function tokenDigest(token:string) {return createHash("sha256").update(token).digest("hex");}
