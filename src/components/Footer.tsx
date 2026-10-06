import Link from "next/link";
export default function Footer() {
 return <footer className="chapter-footer"><span>© {new Date().getFullYear()} Alpha Kappa Psi · Omega Theta</span><div><Link href="/directory">Directory</Link><span>University of Maryland</span></div></footer>;
}
