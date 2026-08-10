import { cn } from "@/lib/utils";

// Rein visueller Schalter für vorbereitete, aber noch nicht aktivierte
// Funktionen. Bewusst ohne Interaktion, da die zugehörigen Funktionen
// (Gmail, KI, tägliche Stellensuche) noch nicht implementiert sind.
export function Toggle({ checked = false }: { checked?: boolean }) {
  return (
    <span
      role="img"
      aria-label={checked ? "Aktiviert" : "Deaktiviert"}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full transition-colors",
        checked ? "bg-accent-500/40" : "bg-navy-100"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </span>
  );
}
