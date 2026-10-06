import { requireMember } from "@/lib/access";
export default async function MemberLayout({children}:{children:React.ReactNode}) {
 await requireMember();
 return <>{children}</>;
}
