import { BewerbungsStatus } from "@/types";
import { statusStile } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: BewerbungsStatus }) {
  const stil = statusStile[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        stil.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", stil.dot)} />
      {status}
    </span>
  );
}

export function MatchBadge({ prozent }: { prozent: number }) {
  const farbe =
    prozent >= 85
      ? "text-emerald-700 bg-emerald-100"
      : prozent >= 65
        ? "text-accent-600 bg-accent-100"
        : "text-amber-700 bg-amber-100";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        farbe
      )}
    >
      {prozent}% Match
    </span>
  );
}
