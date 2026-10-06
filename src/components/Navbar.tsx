"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
export default function Navbar() {
 const pathname = usePathname();
 const {data:session} = useSession();
 const [open,setOpen] = useState(false);
 const approved = session?.user?.accessStatus === "APPROVED" && !!session.user.id;
 const links = approved ? [{href:"/directory",label:"Directory"},...(session.user.role==="ADMIN" ? [{href:"/admin",label:"Administration"}] : [])] : [{href:"/auth/signin",label:"Sign in"},{href:"/auth/register",label:"Request access"}];
 return <nav className={`chapter-nav ${open ? "is-open" : ""}`} aria-label="Main navigation"><div className="top-nav-inner">
 <Link href={approved ? "/directory" : "/auth/signin"} className="chapter-brand"><span className="chapter-mark">ΑΚΨ</span><span>OMEGA THETA<small>ALUMNI COLLECTIVE</small></span></Link>
 <button className="chapter-menu" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
 <div className="chapter-nav-body"><div className="chapter-links">{links.map(({href,label})=><Link key={href} href={href} onClick={()=>setOpen(false)} aria-current={pathname===href?"page":undefined} className={pathname===href || (href==="/directory" && pathname.startsWith("/alumni/")) ? "active" : ""}>{label}</Link>)}</div>{approved && <div className="chapter-account"><span className="account-name">{session.user.name ?? session.user.email}</span><button aria-label="Sign out" onClick={()=>signOut({callbackUrl:"/auth/signin"})}><LogOut size={16}/></button></div>}</div>
 </div></nav>;
}
