import { Profil } from "@/types";

const PROFIL_STORAGE_KEY = "jobpilot.profil";

const PFLICHT_ABSCHNITTE: (keyof Profil)[] = [
  "persoenlicheAngaben",
  "berufUndQualifikation",
  "faehigkeitenUndKenntnisse",
  "wunschberufe",
  "jobsuche",
  "arbeitszeit",
  "gehalt",
  "ausschlusskriterien",
  "kiSuchpraeferenzen",
];

function istProfil(wert: unknown): wert is Profil {
  if (typeof wert !== "object" || wert === null) {
    return false;
  }
  const wertObjekt = wert as Record<string, unknown>;
  return PFLICHT_ABSCHNITTE.every(
    (abschnitt) =>
      typeof wertObjekt[abschnitt] === "object" && wertObjekt[abschnitt] !== null
  );
}

export function ladeGespeichertesProfil(): Profil | null {
  if (typeof window === "undefined") {
    return null;
  }

  const gespeichert = window.localStorage.getItem(PROFIL_STORAGE_KEY);
  if (!gespeichert) {
    return null;
  }

  try {
    const geparst: unknown = JSON.parse(gespeichert);
    return istProfil(geparst) ? geparst : null;
  } catch {
    return null;
  }
}

export function speichereProfil(profil: Profil): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PROFIL_STORAGE_KEY, JSON.stringify(profil));
  } catch {
    // z. B. Speicherkontingent überschritten – Persistenz ist hier bewusst best-effort
  }
}
