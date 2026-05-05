import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#c9a84c] font-bold text-lg mb-3">AKPsi Omega Theta</h3>
            <p className="text-sm leading-relaxed">
              Alpha Kappa Psi — Omega Theta Chapter<br />
              University of Maryland
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Founded to further the individual welfare of its members and to foster scientific research in the fields of commerce, accounts, and finance.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/directory" className="hover:text-[#c9a84c] transition-colors">Alumni Directory</Link></li>
              <li><Link href="/events" className="hover:text-[#c9a84c] transition-colors">Events</Link></li>
              <li><Link href="/newsletter" className="hover:text-[#c9a84c] transition-colors">Newsletter</Link></li>
              <li><Link href="/update" className="hover:text-[#c9a84c] transition-colors">Submit Alumni Update</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Connect</h4>
            <p className="text-sm">Stay connected with the brotherhood and the chapter.</p>
            <p className="text-sm mt-2">
              Questions? Contact the VP of Alumni Relations.
            </p>
          </div>
        </div>

        <div className="border-t border-[#2a4f7c] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Alpha Kappa Psi — Omega Theta Chapter. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Alumni portal built to keep the brotherhood connected.
          </p>
        </div>
      </div>
    </footer>
  );
}
