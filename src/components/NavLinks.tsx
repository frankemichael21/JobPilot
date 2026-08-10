"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  onNavigate?: () => void;
  className?: string;
}

export function NavLinks({ onNavigate, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-500/15 text-accent-400"
                  : "text-navy-100/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
