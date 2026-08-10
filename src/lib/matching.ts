import { Job, Profil } from "@/types";

// Gewichtung der einzelnen Kriterien (Summe = 100). Zentral an einer Stelle
// dokumentiert, damit sie sich später leicht anpassen lässt.
const GEWICHTUNG = {
  faehigkeitenErforderlich: 25,
  faehigkeitenWuenschenswert: 10,
  faehigkeitenFallbackTags: 35, // wird genutzt, wenn `anforderungen` fehlt
  arbeitsmodell: 12,
  standort: 8,
  gehalt: 15,
  arbeitszeitUmfang: 10,
  befristungPraeferenz: 5,
  berufserfahrung: 10,
  wunschberufNaehe: 5,
} as const;

function normalisiere(text: string): string {
  return text.trim().toLowerCase();
}

function enthaeltBegriff(haystack: string, begriff: string): boolean {
  return normalisiere(haystack).includes(normalisiere(begriff));
}

// ---------------------------------------------------------------------------
// Ausschlusslogik – bei Treffer sofort 0, keine weitere Berechnung
// ---------------------------------------------------------------------------

function istAusgeschlossen(job: Job, profil: Profil): boolean {
  const { ausschlusskriterien } = profil;

  if (
    job.branche &&
    ausschlusskriterien.auszuschliessendeBranchen.some((branche) =>
      enthaeltBegriff(job.branche as string, branche)
    )
  ) {
    return true;
  }

  if (
    ausschlusskriterien.auszuschliessendeBerufe.some((beruf) =>
      enthaeltBegriff(job.titel, beruf)
    )
  ) {
    return true;
  }

  const suchtext = [job.titel, job.beschreibung, ...job.tags].join(" ");
  if (
    ausschlusskriterien.auszuschliessendeSuchbegriffe.some((begriff) =>
      enthaeltBegriff(suchtext, begriff)
    )
  ) {
    return true;
  }

  if (job.befristet === true && ausschlusskriterien.befristeteStellenAusschliessen) {
    return true;
  }

  // Hinweis: `schichtarbeitAusschliessen` und `wochenendarbeitAusschliessen`
  // können mit dem aktuellen Job-Datenmodell nicht ausgewertet werden, da
  // Job keine entsprechenden Felder besitzt. Bewusst nicht implementiert,
  // um die Typen nicht eigenmächtig zu ändern.

  return false;
}

// ---------------------------------------------------------------------------
// Einzelkriterien
// ---------------------------------------------------------------------------

function faehigkeitenPunkte(job: Job, profil: Profil): number {
  const kandidatenPool = [
    ...profil.faehigkeitenUndKenntnisse.faehigkeiten,
    ...profil.faehigkeitenUndKenntnisse.kenntnisse,
  ].map(normalisiere);

  if (!job.anforderungen) {
    if (job.tags.length === 0) {
      return GEWICHTUNG.faehigkeitenFallbackTags / 2;
    }
    const treffer = job.tags.filter((tag) =>
      kandidatenPool.includes(normalisiere(tag))
    ).length;
    return (treffer / job.tags.length) * GEWICHTUNG.faehigkeitenFallbackTags;
  }

  const { erforderlicheFaehigkeiten, wuenschenswerteFaehigkeiten } = job.anforderungen;

  const erforderlichPunkte =
    erforderlicheFaehigkeiten.length === 0
      ? GEWICHTUNG.faehigkeitenErforderlich
      : (erforderlicheFaehigkeiten.filter((f) => kandidatenPool.includes(normalisiere(f)))
          .length /
          erforderlicheFaehigkeiten.length) *
        GEWICHTUNG.faehigkeitenErforderlich;

  const wuenschenswertPunkte =
    wuenschenswerteFaehigkeiten.length === 0
      ? GEWICHTUNG.faehigkeitenWuenschenswert
      : (wuenschenswerteFaehigkeiten.filter((f) => kandidatenPool.includes(normalisiere(f)))
          .length /
          wuenschenswerteFaehigkeiten.length) *
        GEWICHTUNG.faehigkeitenWuenschenswert;

  return erforderlichPunkte + wuenschenswertPunkte;
}

function standortUndArbeitsmodellPunkte(job: Job, profil: Profil): number {
  const { jobsuche } = profil;

  const arbeitsmodellErlaubt =
    (job.arbeitsmodell === "Remote" && jobsuche.remoteErlaubt) ||
    (job.arbeitsmodell === "Hybrid" && jobsuche.hybridErlaubt) ||
    (job.arbeitsmodell === "Vor Ort" && jobsuche.vorOrtErlaubt);

  const arbeitsmodellPunkte = arbeitsmodellErlaubt ? GEWICHTUNG.arbeitsmodell : 0;

  const remoteOhneOrtsbindung = job.arbeitsmodell === "Remote" && jobsuche.remoteErlaubt;
  const ortPasst =
    remoteOhneOrtsbindung ||
    jobsuche.wunschorte.some((ort) => enthaeltBegriff(job.standort, ort));

  const standortPunkte = ortPasst ? GEWICHTUNG.standort : 0;

  return arbeitsmodellPunkte + standortPunkte;
}

function gehaltPunkte(job: Job, profil: Profil): number {
  if (job.gehaltVon === undefined && job.gehaltBis === undefined) {
    return GEWICHTUNG.gehalt / 2;
  }

  const jobGehalt = job.gehaltBis ?? job.gehaltVon ?? 0;
  const faktor = profil.gehalt.zeitraum === "Monat" ? 12 : 1;
  const mindestgehalt = profil.gehalt.mindestgehalt * faktor;
  const wunschgehalt = profil.gehalt.wunschgehalt * faktor;

  if (jobGehalt >= wunschgehalt) {
    return GEWICHTUNG.gehalt;
  }
  if (jobGehalt < mindestgehalt) {
    return 0;
  }
  if (wunschgehalt === mindestgehalt) {
    return GEWICHTUNG.gehalt;
  }

  const anteil = (jobGehalt - mindestgehalt) / (wunschgehalt - mindestgehalt);
  return anteil * GEWICHTUNG.gehalt;
}

function arbeitszeitPunkte(job: Job, profil: Profil): number {
  const { arbeitszeit } = profil;

  let umfangPunkte: number = GEWICHTUNG.arbeitszeitUmfang;
  if (job.vollzeit !== undefined || job.teilzeit !== undefined) {
    const passtVollzeit = job.vollzeit === true && arbeitszeit.vollzeit;
    const passtTeilzeit = job.teilzeit === true && arbeitszeit.teilzeit;
    umfangPunkte = passtVollzeit || passtTeilzeit ? GEWICHTUNG.arbeitszeitUmfang : 0;
  }

  // Unbefristete Jobs (oder Jobs ohne Angabe) passen immer zur Präferenz.
  // Befristete Jobs passen nur, wenn befristete Stellen akzeptiert werden.
  const befristungPunkte =
    job.befristet !== true || arbeitszeit.befristeteStellenAkzeptieren
      ? GEWICHTUNG.befristungPraeferenz
      : 0;

  return umfangPunkte + befristungPunkte;
}

function berufserfahrungPunkte(job: Job, profil: Profil): number {
  const erforderlich = job.anforderungen?.mindestBerufserfahrungJahre;
  if (erforderlich === undefined || erforderlich <= 0) {
    return GEWICHTUNG.berufserfahrung;
  }

  const vorhanden = profil.berufUndQualifikation.berufserfahrungJahre;
  const anteil = Math.min(vorhanden / erforderlich, 1);
  return anteil * GEWICHTUNG.berufserfahrung;
}

function wunschberufNaehePunkte(job: Job, profil: Profil): number {
  const { wunschjobs, alternativeBerufe } = profil.wunschberufe;

  if (wunschjobs.some((beruf) => enthaeltBegriff(job.titel, beruf))) {
    return GEWICHTUNG.wunschberufNaehe;
  }
  if (alternativeBerufe.some((beruf) => enthaeltBegriff(job.titel, beruf))) {
    return GEWICHTUNG.wunschberufNaehe * 0.6;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------------

export interface MatchDetails {
  gesamt: number;
  ausgeschlossen: boolean;
  faehigkeiten: number;
  standortUndArbeitsmodell: number;
  gehalt: number;
  arbeitszeit: number;
  berufserfahrung: number;
  wunschberufNaehe: number;
}

export function berechneMatchDetails(job: Job, profil: Profil): MatchDetails {
  if (istAusgeschlossen(job, profil)) {
    return {
      gesamt: 0,
      ausgeschlossen: true,
      faehigkeiten: 0,
      standortUndArbeitsmodell: 0,
      gehalt: 0,
      arbeitszeit: 0,
      berufserfahrung: 0,
      wunschberufNaehe: 0,
    };
  }

  const faehigkeiten = faehigkeitenPunkte(job, profil);
  const standortUndArbeitsmodell = standortUndArbeitsmodellPunkte(job, profil);
  const gehalt = gehaltPunkte(job, profil);
  const arbeitszeit = arbeitszeitPunkte(job, profil);
  const berufserfahrung = berufserfahrungPunkte(job, profil);
  const wunschberufNaehe = wunschberufNaehePunkte(job, profil);

  const gesamt = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        faehigkeiten +
          standortUndArbeitsmodell +
          gehalt +
          arbeitszeit +
          berufserfahrung +
          wunschberufNaehe
      )
    )
  );

  return {
    gesamt,
    ausgeschlossen: false,
    faehigkeiten,
    standortUndArbeitsmodell,
    gehalt,
    arbeitszeit,
    berufserfahrung,
    wunschberufNaehe,
  };
}

export function berechneMatch(job: Job, profil: Profil): number {
  return berechneMatchDetails(job, profil).gesamt;
}
