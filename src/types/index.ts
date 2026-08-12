// Zentrale Typdefinitionen für JobPilot

export type ArbeitsModell = "Remote" | "Hybrid" | "Vor Ort";

export type BewerbungsStatus =
  | "Interessant"
  | "Entwurf"
  | "Prüfung"
  | "Beworben"
  | "Antwort"
  | "Interview"
  | "Angebot"
  | "Absage";

export const BEWERBUNGS_STATI: BewerbungsStatus[] = [
  "Interessant",
  "Entwurf",
  "Prüfung",
  "Beworben",
  "Antwort",
  "Interview",
  "Angebot",
  "Absage",
];

export type DokumentKategorie = "Lebenslauf" | "Anschreiben" | "Zeugnis";

export type Gehaltszeitraum = "Jahr" | "Monat";

export interface JobAnforderungen {
  erforderlicheFaehigkeiten: string[];
  wuenschenswerteFaehigkeiten: string[];
  mindestBerufserfahrungJahre?: number;
}

export interface Job {
  id: string;
  titel: string;
  unternehmen: string;
  standort: string;
  arbeitsmodell: ArbeitsModell;
  gehaltVon?: number;
  gehaltBis?: number;
  matchProzent: number;
  quelle: string;
  quelleUrl: string;
  veroeffentlichtAm: string;
  tags: string[];
  beschreibung: string;
  neu?: boolean;
  quelleId?: string;
  externeId?: string;
  branche?: string;
  vollzeit?: boolean;
  teilzeit?: boolean;
  befristet?: boolean;
  anforderungen?: JobAnforderungen;
}

// Snapshot-Felder (optional): werden beim Übernehmen eines Jobs als
// "Bewerbung vorbereiten" einmalig aus dem Job kopiert, da Jobs selbst nicht
// persistiert werden (weder Demo- noch Live-Suchergebnisse überleben einen
// Reload). Ohne diesen Snapshot gingen Standort/Gehalt/Link nach einem
// Reload verloren, obwohl die Bewerbung selbst weiterhin existiert.
export interface Bewerbung {
  id: string;
  jobId: string;
  titel: string;
  unternehmen: string;
  status: BewerbungsStatus;
  erstelltAm: string;
  aktualisiertAm: string;
  beworbenAm?: string;
  naechsterSchritt?: string;
  notizen?: string;
  quelleUrl?: string;
  standort?: string;
  arbeitsmodell?: ArbeitsModell;
  gehaltVon?: number;
  gehaltBis?: number;
  matchProzentBeiUebernahme?: number;
  // Eigenes Anschreiben dieser Bewerbung (Option A: direkt eingebettet statt
  // separater anschreibenId/Store - siehe Analyse). Optional, damit bereits
  // gespeicherte Bewerbungen ohne Anschreiben weiterhin gültig bleiben.
  anschreiben?: AnschreibenFelder;
}

export interface Dokument {
  id: string;
  kategorie: DokumentKategorie;
  name: string;
  dateiname?: string;
  aktualisiertAm?: string;
  vorhanden: boolean;
}

export interface AnschreibenFelder {
  empfaengerFirma: string;
  firmenadresse: string;
  ansprechpartner: string;
  datum: string;
  betreff: string;
  anrede: string;
  text: string;
}

export interface PersoenlicheAngaben {
  vollerName: string;
  beruf: string;
  standort: string;
  email: string;
  telefon: string;
  ueberMich: string;
}

export interface BerufUndQualifikation {
  berufserfahrungJahre: number;
  ausbildung: string;
  fuehrerschein: boolean;
}

export interface FaehigkeitenUndKenntnisse {
  faehigkeiten: string[];
  kenntnisse: string[];
  sprachen: string[];
}

export interface Wunschberufe {
  wunschjobs: string[];
  alternativeBerufe: string[];
}

export interface Jobsuche {
  wunschorte: string[];
  suchradiusKm: number;
  remoteErlaubt: boolean;
  hybridErlaubt: boolean;
  vorOrtErlaubt: boolean;
}

export interface Arbeitszeit {
  vollzeit: boolean;
  teilzeit: boolean;
  schichtarbeitAkzeptieren: boolean;
  wochenendarbeitAkzeptieren: boolean;
  befristeteStellenAkzeptieren: boolean;
}

export interface Gehaltsvorstellung {
  mindestgehalt: number;
  wunschgehalt: number;
  zeitraum: Gehaltszeitraum;
}

export interface Ausschlusskriterien {
  auszuschliessendeBerufe: string[];
  auszuschliessendeBranchen: string[];
  auszuschliessendeSuchbegriffe: string[];
  schichtarbeitAusschliessen: boolean;
  wochenendarbeitAusschliessen: boolean;
  befristeteStellenAusschliessen: boolean;
}

export type JobPrioritaet =
  | "Tätigkeit"
  | "Gehalt"
  | "Entfernung"
  | "Remote"
  | "Arbeitszeit"
  | "Karrierechance";

export const JOB_PRIORITAETEN: JobPrioritaet[] = [
  "Tätigkeit",
  "Gehalt",
  "Entfernung",
  "Remote",
  "Arbeitszeit",
  "Karrierechance",
];

export interface KiSuchpraeferenzen {
  quereinsteigerBeruecksichtigen: boolean;
  aehnlicheBerufeBeruecksichtigen: boolean;
  aehnlicheTaetigkeitenBeruecksichtigen: boolean;
  trotzFehlenderAnforderungenVorschlagen: boolean;
  prioritaeten: JobPrioritaet[];
}

export interface Profil {
  persoenlicheAngaben: PersoenlicheAngaben;
  berufUndQualifikation: BerufUndQualifikation;
  faehigkeitenUndKenntnisse: FaehigkeitenUndKenntnisse;
  wunschberufe: Wunschberufe;
  jobsuche: Jobsuche;
  arbeitszeit: Arbeitszeit;
  gehalt: Gehaltsvorstellung;
  ausschlusskriterien: Ausschlusskriterien;
  kiSuchpraeferenzen: KiSuchpraeferenzen;
}

export interface NaechsteAufgabe {
  id: string;
  titel: string;
  beschreibung: string;
  faelligAm: string;
  erledigt: boolean;
  bewerbungId?: string;
}

export interface Quelle {
  id: string;
  name: string;
  typ: "Jobbörse" | "Unternehmens-Karriereseite" | "API" | "RSS-Feed";
  aktiv: boolean;
}
