"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Rocket, X } from "lucide-react";
import { NavLinks } from "./NavLinks";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Menü automatisch schließen, wenn sich die Seite ändert
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body-Scroll sperren, solange das Menü geöffnet ist
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-navy-900 px-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-navy-950">
            <Rocket size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">JobPilot</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menü öffnen"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/60"
          />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-navy-900 shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <span className="text-lg font-semibold text-white">Menü</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menü schließen"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
