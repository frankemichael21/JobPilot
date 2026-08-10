export function formatDatum(iso: string): string {
  const datum = new Date(iso + "T00:00:00");
  return datum.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatGehalt(betrag: number): string {
  return betrag.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function formatGehaltsspanne(
  von?: number,
  bis?: number,
  zeitraum: "Jahr" | "Monat" = "Jahr"
): string {
  const einheit = zeitraum === "Jahr" ? "Jahr" : "Monat";
  if (von && bis) return `${formatGehalt(von)} – ${formatGehalt(bis)} / ${einheit}`;
  if (von) return `ab ${formatGehalt(von)} / ${einheit}`;
  if (bis) return `bis ${formatGehalt(bis)} / ${einheit}`;
  return "Keine Angabe";
}
