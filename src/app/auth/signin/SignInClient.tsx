"use client";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function SignInClient() {
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [callbackUrl,setCallbackUrl]=useState("/directory");
 useEffect(()=>{const q=new URLSearchParams(window.location.search);const target=q.get("callbackUrl");if(target?.startsWith("/")&&!target.startsWith("//")&&!target.startsWith("/auth"))setCallbackUrl(target);if(q.has("error"))setError("We couldn’t sign you in. Try again or contact the chapter administrator.");},[]);
 async function login(e:React.FormEvent) {e.preventDefault();setLoading(true);setError("");try{const result=await signIn("credentials",{email,password,callbackUrl,redirect:false});if(result?.error)setError("Could not sign in. Check your email and password, and make sure your account has been approved.");else if(result?.url)window.location.assign(result.url);}catch{setError("Sign-in is temporarily unavailable.");}finally{setLoading(false);}}
 return <div className="workspace-page auth-simple"><section className="auth-panel"><h1>Sign in</h1><form onSubmit={login} className="space-y-5"><div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required/></div>{error&&<p role="alert" className="form-error">{error}</p>}<Button type="submit" disabled={loading} className="w-full h-12">{loading?"Signing in…":"Sign in"}</Button></form><div className="account-help-links"><Link href="/auth/help?kind=reset">Forgot password?</Link></div><div className="auth-request"><Link href="/auth/register">Request access</Link></div></section></div>;
}
