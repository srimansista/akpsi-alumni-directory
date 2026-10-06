"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function AccountTokenForm({kind}:{kind:"verify"|"reset"}) {
 const [link,setLink]=useState({email:"",token:""});const [message,setMessage]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 useEffect(()=>{const q=new URLSearchParams(window.location.search);setLink({email:q.get("email")??"",token:q.get("token")??""});},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setError("");const password=new FormData(e.currentTarget).get("password");try{const res=await fetch(`/api/account/${kind}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...link,...(kind==="reset"?{password}:{})})});const data=await res.json();if(!res.ok)throw new Error(data.error);setMessage(data.message);window.history.replaceState(null,"",`/auth/${kind}`);}catch(e){setError(e instanceof Error?e.message:"Could not complete this request.");}finally{setLoading(false);}}
 return <div className="workspace-page flex items-center justify-center py-16"><section className="auth-panel w-full max-w-md"><h2>{message?"You’re all set.":kind==="verify"?"Verify your email.":"Choose a new password."}</h2>{message?<><p role="status">{message}</p><Link className="solid-action" href="/auth/signin">Back to sign in</Link></>:<form onSubmit={submit} className="space-y-5"><p>{kind==="verify"?"Confirm your email address to complete your access request. Chapter approval is still required.":"Use a password of at least 12 characters."}</p>{kind==="reset"&&<div><Label htmlFor="password">New password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></div>}{error&&<p role="alert" className="form-error">{error}</p>}<Button type="submit" disabled={loading||!link.token} className="w-full h-12">{loading?"Working…":kind==="verify"?"Verify email":"Save password"}</Button><Link href={`/auth/help?kind=${kind}`}>Request a new link</Link></form>}</section></div>;
}
