import Link from "next/link";
import { Rocket } from "lucide-react";
import { NavLinks } from "./NavLinks";

export function Sidebar() {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col bg-navy-900 border-r border-white/10">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-navy-950">
            <Rocket size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">JobPilot</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-xs text-navy-100/50">
        Lokale Demo-Daten – keine externen Verbindungen
      </div>
    </aside>
  );
}
