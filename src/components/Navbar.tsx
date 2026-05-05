"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/events", label: "Events" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/update", label: "Submit Update" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[#1e3a5f] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center font-bold text-[#1e3a5f] text-sm">
              ΑΚΨ
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-tight">AKPsi Omega Theta</p>
              <p className="text-[#c9a84c] text-xs leading-tight">Alumni Portal</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[#c9a84c] text-[#1e3a5f]"
                    : "text-gray-300 hover:bg-[#2a4f7c] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-[#c9a84c] text-[#1e3a5f]"
                    : "text-gray-300 hover:bg-[#2a4f7c] hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">{session.user?.name ?? session.user?.email}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-500 text-gray-300 hover:bg-[#2a4f7c] hover:text-white bg-transparent"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-[#c9a84c] text-[#1e3a5f] hover:bg-[#b8963d] font-semibold"
                onClick={() => signIn()}
              >
                Sign In
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-[#2a4f7c]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#162d4a] border-t border-[#2a4f7c]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? "bg-[#c9a84c] text-[#1e3a5f]"
                    : "text-gray-300 hover:bg-[#2a4f7c] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-[#2a4f7c] hover:text-white"
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
            <div className="pt-2 border-t border-[#2a4f7c]">
              {session ? (
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Sign Out ({session.user?.email})
                </button>
              ) : (
                <button
                  onClick={() => { signIn(); setOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm text-[#c9a84c] font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
