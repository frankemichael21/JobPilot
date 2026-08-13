import { BEWERBUNGS_STATI, Bewerbung, BewerbungsStatus } from "@/types";

// Reine Berechnungsfunktionen für Dashboard-Kennzahlen. Nehmen ausschließlich
// bereits geladene Bewerbungen entgegen (kein eigener localStorage-Zugriff,
// keine eigene Persistenz) - Datenquelle bleibt ausschließlich
// bewerbungenStorage.ts, hier wird nur aus den vorhandenen Feldern abgeleitet.

export interface StatusZaehlung {
  status: BewerbungsStatus;
  anzahl: number;
}

export function berechneStatusZaehlung(bewerbungen: Bewerbung[]): StatusZaehlung[] {
  return BEWERBUNGS_STATI.map((status) => ({
    status,
    anzahl: bewerbungen.filter((b) => b.status === status).length,
  }));
}

export function zaehleAnschreibenVorhanden(bewerbungen: Bewerbung[]): number {
  return bewerbungen.filter((b) => b.anschreiben !== undefined).length;
}

export function zaehleAnschreibenFehlt(bewerbungen: Bewerbung[]): number {
  return bewerbungen.length - zaehleAnschreibenVorhanden(bewerbungen);
}

// Montag der Kalenderwoche von `referenz`, als ISO-Datum (YYYY-MM-DD).
// Nutzt bewusst dieselbe `toISOString().slice(0, 10)`-Konvention wie
// erzeugeBewerbungAusJob()/erzeugeLeeresAnschreiben() in bewerbungenStorage.ts,
// damit die Vergleichswerte konsistent zu den gespeicherten `erstelltAm`-
// Werten gebildet werden.
function montagDerWocheAlsIso(referenz: Date): string {
  const wochentag = referenz.getDay(); // 0 = Sonntag, 1 = Montag, ...
  const versatzZuMontag = wochentag === 0 ? -6 : 1 - wochentag;
  const montag = new Date(referenz);
  montag.setDate(referenz.getDate() + versatzZuMontag);
  return montag.toISOString().slice(0, 10);
}

function sonntagDerWocheAlsIso(referenz: Date): string {
  const montag = new Date(montagDerWocheAlsIso(referenz));
  const sonntag = new Date(montag);
  sonntag.setDate(montag.getDate() + 6);
  return sonntag.toISOString().slice(0, 10);
}

/**
 * Zählt Bewerbungen, deren `erstelltAm` in die aktuelle Kalenderwoche
 * (Montag bis Sonntag) von `referenz` fällt. String-Vergleich auf
 * ISO-Datumsformat (YYYY-MM-DD) ist hier zuverlässig, da dieses Format
 * lexikografisch identisch zur chronologischen Reihenfolge sortiert.
 */
export function zaehleBewerbungenDieseWoche(
  bewerbungen: Bewerbung[],
  referenz: Date = new Date()
): number {
  const montagIso = montagDerWocheAlsIso(referenz);
  const sonntagIso = sonntagDerWocheAlsIso(referenz);
  return bewerbungen.filter((b) => b.erstelltAm >= montagIso && b.erstelltAm <= sonntagIso).length;
}

/**
 * Zählt Bewerbungen, deren `erstelltAm` in denselben Kalendermonat wie
 * `referenz` fällt (Vergleich über das "YYYY-MM"-Präfix des ISO-Datums).
 */
export function zaehleBewerbungenDiesenMonat(
  bewerbungen: Bewerbung[],
  referenz: Date = new Date()
): number {
  const monatPraefix = referenz.toISOString().slice(0, 7);
  return bewerbungen.filter((b) => b.erstelltAm.startsWith(monatPraefix)).length;
}
