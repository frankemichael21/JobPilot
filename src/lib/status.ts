import { BewerbungsStatus } from "@/types";

interface StatusStil {
  badge: string;
  dot: string;
}

export const statusStile: Record<BewerbungsStatus, StatusStil> = {
  Interessant: { badge: "bg-navy-100 text-navy-700", dot: "bg-navy-600" },
  Entwurf: { badge: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  Prüfung: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  Beworben: { badge: "bg-accent-100 text-accent-600", dot: "bg-accent-500" },
  Antwort: { badge: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
  Interview: { badge: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  Angebot: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-600" },
  Absage: { badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export function matchFarbe(prozent: number): string {
  if (prozent >= 85) return "text-emerald-600 bg-emerald-100";
  if (prozent >= 65) return "text-accent-600 bg-accent-100";
  return "text-amber-700 bg-amber-100";
}
