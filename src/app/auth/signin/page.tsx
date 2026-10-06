import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInClient from "./SignInClient";
export default async function SignInPage() {
 const session = await auth();
 if(session?.user.id && session.user.accessStatus === "APPROVED") redirect("/directory");
 return <SignInClient/>;
}
