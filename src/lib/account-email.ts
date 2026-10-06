import { randomBytes, createHash } from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
export function emailConfigured() {return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.AUTH_URL);}
export async function sendAccountLink(email: string, kind: "verify" | "reset") {
 if(!emailConfigured()) throw new Error("Email is not configured");
 const token = randomBytes(32).toString("hex");
 const digest = createHash("sha256").update(token).digest("hex");
 const identifier = `${kind}:${email}`;
 // Retain earlier valid links until expiry so concurrent requests cannot invalidate an email already sent.
 await prisma.verificationToken.create({data:{identifier,token:digest,expires:new Date(Date.now()+30*60*1000)}});
 const url = new URL(`/auth/${kind}`,process.env.AUTH_URL!);url.searchParams.set("token",token);url.searchParams.set("email",email);
 const text = kind === "verify" ? "Verify your email to complete your chapter access request. An administrator must still approve your account before you can sign in." : "Reset your alumni portal password. If you did not request this, ignore this email.";
 const {error} = await new Resend(process.env.RESEND_API_KEY!).emails.send({from:process.env.EMAIL_FROM!,to:email,subject:kind === "verify" ? "Verify your AKPsi portal email" : "Reset your AKPsi portal password",text:`${text}\n\n${url.toString()}\n\nThis link expires in 30 minutes.`});
 if(error) {await prisma.verificationToken.deleteMany({where:{identifier,token:digest}});throw new Error("Email delivery failed");}
}
