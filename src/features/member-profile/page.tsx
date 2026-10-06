import { requireMember } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import UpdateClient from "./UpdateClient";
export default async function MyProfilePage() {
 const session = await requireMember();
 const record = session.user.alumniId ? await prisma.alumni.findUnique({where:{id:session.user.alumniId}}) : null;
 const initialValues = record ? {name:record.name,gradYear:record.gradYear,email:record.email ?? "",linkedInUrl:record.linkedInUrl ?? "",company:record.company ?? "",role:record.role ?? "",major:record.major ?? "",location:record.location ?? "",industry:record.industry ?? "",notes:record.notes ?? "",willingToMentor:record.willingToMentor,willingToSpeak:record.willingToSpeak} : {name:session.user.name ?? "",email:session.user.email ?? ""};
 return <UpdateClient initialValues={initialValues}/>;
}
