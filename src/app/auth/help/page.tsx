"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function AccountHelp() {
 const [kind,setKind]=useState<"verify"|"reset">("reset");const [message,setMessage]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 useEffect(()=>{if(new URLSearchParams(window.location.search).get("kind")==="verify")setKind("verify");},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");setMessage("");const email=new FormData(e.currentTarget).get("email");try{const res=await fetch("/api/account/email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,kind})});const data=await res.json();if(!res.ok)throw new Error(data.error);setMessage(data.message);}catch(e){setError(e instanceof Error?e.message:"Could not send email.");}finally{setLoading(false);}}
 return <div className="workspace-page flex items-center justify-center py-16"><section className="auth-panel w-full max-w-md"><h2>{kind==="verify"?"Verify your email.":"Reset your password."}</h2><p>Enter your account email and we’ll send you a link.</p><form onSubmit={submit} className="space-y-5"><div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required/></div>{error&&<p role="alert" className="form-error">{error}</p>}{message&&<p role="status">{message}</p>}<Button type="submit" disabled={loading} className="w-full h-12">{loading?"Sending…":"Send email"}</Button></form><div className="auth-request"><Link href="/auth/signin">Back to sign in</Link></div></section></div>;
}
