import { AnschreibenFelder, Bewerbung, Job } from "@/types";

const BEWERBUNGEN_STORAGE_KEY = "jobpilot.bewerbungen";

const PFLICHTFELDER: (keyof Bewerbung)[] = [
  "id",
  "jobId",
  "titel",
  "unternehmen",
  "status",
  "erstelltAm",
  "aktualisiertAm",
];

function istBewerbungsListe(wert: unknown): wert is Bewerbung[] {
  return (
    Array.isArray(wert) &&
    wert.every(
      (eintrag) =>
        typeof eintrag === "object" &&
        eintrag !== null &&
        PFLICHTFELDER.every((feld) => feld in (eintrag as Record<string, unknown>))
    )
  );
}

export function ladeGespeicherteBewerbungen(): Bewerbung[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const gespeichert = window.localStorage.getItem(BEWERBUNGEN_STORAGE_KEY);
  if (!gespeichert) {
    return null;
  }

  try {
    const geparst: unknown = JSON.parse(gespeichert);
    return istBewerbungsListe(geparst) ? geparst : null;
  } catch {
    return null;
  }
}

export function speichereBewerbungen(bewerbungen: Bewerbung[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(BEWERBUNGEN_STORAGE_KEY, JSON.stringify(bewerbungen));
  } catch {
    // z. B. Speicherkontingent überschritten – Persistenz ist hier bewusst best-effort
  }
}

export function bewerbungExistiertFuerJob(jobId: string, bewerbungen: Bewerbung[]): boolean {
  return bewerbungen.some((b) => b.jobId === jobId);
}

/**
 * Erzeugt eine neue Bewerbung mit Status "Interessant" aus einem Job.
 * Kopiert die für die Übersicht relevanten Felder als Snapshot (siehe
 * Bewerbung-Interface), da Jobs selbst nicht persistiert werden und nach
 * einem Reload nicht mehr über `jobId` nachschlagbar wären.
 */
export function erzeugeBewerbungAusJob(job: Job, matchProzent?: number): Bewerbung {
  const heute = new Date().toISOString().slice(0, 10);

  return {
    id: `bew-${job.id}-${Date.now()}`,
    jobId: job.id,
    titel: job.titel,
    unternehmen: job.unternehmen,
    status: "Interessant",
    erstelltAm: heute,
    aktualisiertAm: heute,
    quelleUrl: job.quelleUrl,
    standort: job.standort,
    arbeitsmodell: job.arbeitsmodell,
    gehaltVon: job.gehaltVon,
    gehaltBis: job.gehaltBis,
    matchProzentBeiUebernahme: matchProzent,
  };
}

/**
 * Liefert einen leeren Anschreiben-Entwurf für eine Bewerbung, vorbelegt mit
 * den einzigen Feldern, für die zuverlässige Daten aus der Bewerbung/dem
 * Job-Snapshot vorliegen (Firma, Betreff aus dem Jobtitel). Alle anderen
 * Felder bleiben bewusst leer statt mit erfundenen Angaben (Adresse,
 * Ansprechpartner) oder einem generischen Demo-Text gefüllt zu werden.
 */
export function erzeugeLeeresAnschreiben(bewerbung: Bewerbung): AnschreibenFelder {
  return {
    empfaengerFirma: bewerbung.unternehmen,
    firmenadresse: "",
    ansprechpartner: "",
    datum: new Date().toISOString().slice(0, 10),
    betreff: `Bewerbung als ${bewerbung.titel}`,
    anrede: "",
    text: "",
  };
}
