import { ArbeitsModell, Job, JobAnforderungen, Quelle } from "@/types";
import { RohJob } from "@/types/jobImport";

// Bewusst klar als Platzhalter erkennbar – keine erfundenen Fakten, nur ein
// ehrliches "nicht bekannt"-Label, da Job.unternehmen/standort Pflichtfelder
// ohne "unbekannt"-Option sind.
const UNBEKANNTES_UNTERNEHMEN = "Unbekanntes Unternehmen";
const UNBEKANNTER_STANDORT = "Unbekannter Standort";

// Einfacher, deterministischer String-Hash ohne externe Abhängigkeit.
// Nur zur stabilen ID-Bildung, wenn keine externeId vorhanden ist.
function einfacherHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function erzeugeJobId(quelleId: string, externeId: string | undefined, url: string): string {
  if (externeId) {
    return `${quelleId}-${externeId}`;
  }
  return `${quelleId}-${einfacherHash(url)}`;
}

// Grobe, konservative Ableitung des Arbeitsmodells aus Freitext.
// ArbeitsModell kennt keinen "unbekannt"-Wert (siehe Bericht) – ohne jeden
// Hinweis wird "Vor Ort" als vorsichtigste Annahme verwendet.
function leiteArbeitsmodellAb(rohText: string | undefined): ArbeitsModell {
  if (!rohText) {
    return "Vor Ort";
  }
  const text = rohText.toLowerCase();
  if (text.includes("hybrid")) {
    return "Hybrid";
  }
  if (text.includes("remote") || text.includes("homeoffice") || text.includes("home office")) {
    return "Remote";
  }
  return "Vor Ort";
}

function heuteAlsIsoDatum(): string {
  return new Date().toISOString().slice(0, 10);
}

function erzeugeAnforderungen(rohJob: RohJob): JobAnforderungen | undefined {
  const hatAnforderungsdaten =
    (rohJob.erforderlicheFaehigkeiten !== undefined && rohJob.erforderlicheFaehigkeiten.length > 0) ||
    (rohJob.wuenschenswerteFaehigkeiten !== undefined && rohJob.wuenschenswerteFaehigkeiten.length > 0) ||
    rohJob.mindestBerufserfahrungJahre !== undefined;

  if (!hatAnforderungsdaten) {
    return undefined;
  }

  return {
    erforderlicheFaehigkeiten: rohJob.erforderlicheFaehigkeiten ?? [],
    wuenschenswerteFaehigkeiten: rohJob.wuenschenswerteFaehigkeiten ?? [],
    mindestBerufserfahrungJahre: rohJob.mindestBerufserfahrungJahre,
  };
}

/**
 * Wandelt einen RohJob in den einheitlichen Job-Typ um.
 *
 * Gibt `null` zurück, wenn nicht genug Daten für einen sinnvollen
 * Job-Eintrag vorhanden sind (siehe Bericht: Titel und URL sind die einzigen
 * beiden Felder, bei deren Fehlen wir den Datensatz verwerfen, statt Daten
 * zu erfinden). Alle anderen fehlenden Felder werden mit ehrlichen,
 * klar erkennbaren Platzhaltern oder mit `undefined` (bei ohnehin optionalen
 * Job-Feldern) behandelt.
 */
export function normalisiereJob(rohJob: RohJob, quelle: Quelle): Job | null {
  const titel = rohJob.titel?.trim();
  const url = rohJob.url?.trim();

  if (!titel || !url) {
    return null;
  }

  return {
    id: erzeugeJobId(rohJob.quelleId, rohJob.externeId, url),
    titel,
    unternehmen: rohJob.unternehmen?.trim() || UNBEKANNTES_UNTERNEHMEN,
    standort: rohJob.ort?.trim() || UNBEKANNTER_STANDORT,
    arbeitsmodell: leiteArbeitsmodellAb(rohJob.arbeitsmodellRoh),
    gehaltVon: rohJob.gehaltVon,
    gehaltBis: rohJob.gehaltBis,
    matchProzent: 0, // Platzhalter – wird nicht mehr genutzt, da JobsContent.tsx bereits live berechneMatch() verwendet
    quelle: quelle.name,
    quelleUrl: url,
    veroeffentlichtAm: rohJob.veroeffentlichtAm?.trim() || heuteAlsIsoDatum(),
    tags: rohJob.tags ?? [],
    beschreibung: rohJob.beschreibung?.trim() ?? "",
    quelleId: rohJob.quelleId,
    externeId: rohJob.externeId,
    branche: rohJob.branche,
    vollzeit: rohJob.vollzeit,
    teilzeit: rohJob.teilzeit,
    befristet: rohJob.befristet,
    anforderungen: erzeugeAnforderungen(rohJob),
  };
}
