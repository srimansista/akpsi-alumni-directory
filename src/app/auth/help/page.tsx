import Link from "next/link";
export default function AccountHelp() {
 return <div className="workspace-page auth-simple"><section className="auth-panel"><h1>Reset your password</h1><p>Contact the chapter administrator at <a href="mailto:alumni.akpsiot@gmail.com">alumni.akpsiot@gmail.com</a> to request a password reset.</p><div className="auth-request"><Link href="/auth/signin">Back to sign in</Link></div></section></div>;
}
