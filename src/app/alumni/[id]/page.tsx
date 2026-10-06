import { classifyField } from "@/lib/core-fields";
import { ConnectionTracker } from "@/components/ConnectionTracker";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/access";
import { safeLinkedIn } from "@/lib/links";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function AlumniProfilePage({params}:{params:{id:string}}) {
 await requireMember();
 const member = await prisma.alumni.findUnique({where:{id:params.id}});
 if(!member) notFound();
 const linkedIn = safeLinkedIn(member.linkedInUrl);
 const classification = classifyField(member);
 const details = [{label:"Class",value:member.gradYear?String(member.gradYear):null},{label:"Education",value:member.major},{label:classification.source === "role" ? "Field · from role" : "Field · from education",value:classification.fields.join(" · ")},{label:"Based in",value:member.location}].filter(item=>item.value?.trim());
 return <div className="workspace-page useful-profile"><Link href="/directory" className="profile-back"><ArrowLeft size={15}/>Back to directory</Link><header className="useful-profile-header"><div className="profile-monogram" aria-hidden="true">{member.name.split(/\s+/).slice(0,2).map(n=>n[0]).join("")}</div><div className="flex-1"><p className="edition-label">OMEGA THETA ALUMNUS</p><h1>{member.name}</h1>{(member.role||member.company)&&<p className="profile-position">{[member.role,member.company].filter(Boolean).join(" at ")}</p>}{member.location&&<p className="profile-location"><MapPin size={13}/>{member.location}</p>}</div></header>
 <div className="useful-profile-layout"><section><div className="section-line"><h2>About {member.name.split(" ")[0]}</h2></div>{details.length>0&&<dl className="profile-facts">{details.map(d=><div key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>)}</dl>}{!!member.pastCompanies.length&&<div className="profile-past"><span>Previously at</span><p>{member.pastCompanies.join(" · ")}</p></div>}{member.notes&&<div className="profile-about"><p>{member.notes}</p></div>}{member.willingToMentor&&<div className="mentor-note"><MessageCircle size={20}/><div><strong>Open to mentoring</strong><p>Reach out with a short introduction and what you’d like advice on.</p></div></div>}{member.willingToSpeak&&<p className="text-sm text-slate-500 mt-5">Available to speak at chapter events or panels.</p>}{!details.length&&!member.notes&&!member.pastCompanies.length&&!member.willingToMentor&&!member.willingToSpeak&&<p className="text-sm text-slate-500 leading-7">A fellow Omega Theta brother. Use the contact details to reconnect or make an introduction.</p>}</section><aside className="profile-connect"><ConnectionTracker alumniId={member.id} name={member.name}/><p className="edition-label">START A CONVERSATION</p><h2>Make the connection.</h2>{member.email&&<a href={`mailto:${member.email}?subject=${encodeURIComponent("AKPsi Omega Theta — introduction")}`} className="profile-contact-action"><Mail size={17}/><span>Email {member.name.split(" ")[0]}<small>{member.email}</small></span><ArrowUpRight size={16}/></a>}{linkedIn&&<a href={linkedIn} target="_blank" rel="noopener noreferrer" className="profile-contact-action"><span>Connect on LinkedIn</span><ArrowUpRight size={16}/></a>}{!member.email&&!linkedIn&&<p className="text-sm text-slate-500">Contact details haven’t been shared yet.</p>}<p className="profile-connect-note">A personal introduction goes a long way. Mention your connection to the chapter.</p></aside></div></div>;
}
