"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function AccessRequestPage() {
 const [submitted,setSubmitted]=useState(false); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault();setLoading(true);setError("");const data=Object.fromEntries(new FormData(e.currentTarget));
  try {const res=await fetch("/api/access-request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await res.json();if(!res.ok) throw new Error(result.error);setSubmitted(true);} catch(e){setError(e instanceof Error?e.message:"Could not request access.");}finally{setLoading(false);}
 }
 return <div className="workspace-page auth-simple"><section className="auth-panel"><h1>{submitted?"Request received":"Request access"}</h1>{submitted?<><p role="status">Check your inbox for a verification link. After verification, the chapter administrator must approve your account before you can sign in.</p><Link href="/auth/signin" className="solid-action">Back to sign in</Link><p className="mt-4"><Link href="/auth/help?kind=verify">Resend verification email</Link></p></>:<form onSubmit={submit} className="space-y-5"><div><Label htmlFor="name">Full name</Label><Input id="name" name="name" autoComplete="name" maxLength={100} required/></div><div><Label htmlFor="email">Contact email</Label><Input id="email" name="email" type="email" autoComplete="email" required/></div><div><Label htmlFor="password">Create a password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/><p className="field-hint">At least 12 characters.</p></div>{error&&<div role="alert" className="form-error">{error}<br/><Link href="/auth/help?kind=verify">Resend verification</Link></div>}<Button type="submit" disabled={loading} className="w-full h-12">{loading?"Sending request…":"Request access"}</Button><p className="field-hint">Email verification and chapter approval are required.</p></form>}{!submitted&&<div className="auth-request"><Link href="/auth/signin">Back to sign in</Link></div>}</section></div>;
}
