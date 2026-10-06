import { requireMember } from "@/lib/access";
import { getAlumni } from "@/lib/alumni-data";
import { DirectoryClient } from "./DirectoryClient";
export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  await requireMember();
  const alumni = await getAlumni();

  return (
    <div className="workspace-page directory-page">
      <div className="page-kicker">THE COLLECTIVE / DIRECTORY</div>
      <header className="workspace-heading"><div><p className="edition-label">PEOPLE MAKE THE NETWORK.</p><h1>Alumni directory<span>.</span></h1><p>A familiar face or your next introduction. Find your connection.</p></div><div className="directory-total"><strong>{alumni.length}</strong><span>MEMBERS</span></div></header>
      <DirectoryClient alumni={alumni} />
    </div>
  );
}
