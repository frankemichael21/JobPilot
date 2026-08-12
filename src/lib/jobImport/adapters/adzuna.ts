import { Quelle } from "@/types";
import { QuellenAdapter, RohJob } from "@/types/jobImport";

// ---------------------------------------------------------------------------
// Adzuna-Adapter (kostenlose Free-Tier-API, https://developer.adzuna.com).
//
// WICHTIG: Dieser Adapter liest niemals selbst process.env. Zugangsdaten
// werden ausschließlich als Parameter übergeben (siehe erzeugeAdzunaAdapter).
// Das hält die Datei serverunabhängig testbar und macht an dieser einen
// Stelle sichtbar, dass Zugangsdaten von außen kommen müssen – der
// tatsächliche Aufrufer (später ein Server-seitiger Code, z. B. ein Next.js
// Route Handler) ist dafür verantwortlich, die Werte aus process.env zu
// lesen und niemals an clientseitigen Code weiterzugeben.
// ---------------------------------------------------------------------------

const ADZUNA_LAND = "de";
const ADZUNA_BASIS_URL = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_MAX_ERGEBNISSE_PRO_SEITE = 50; // von Adzuna vorgegebenes Maximum
const STANDARD_ERGEBNISSE_PRO_SEITE = 20;
const ABBRUCH_TIMEOUT_MS = 10000;
// Kategorien ändern sich sehr selten - 24h-Cache reicht aus und vermeidet
// unnötige zusätzliche Adzuna-Aufrufe bei jedem Seitenaufruf/Mount.
const KATEGORIEN_REVALIDATE_SEKUNDEN = 86400;

export interface AdzunaZugangsdaten {
  appId: string;
  appKey: string;
}

// Bewusst neutrale, deutsche Parameternamen nach außen ("was"/"wo"/"kategorie"),
// damit der Rest der Anwendung nicht an Adzuna-spezifische Begriffe gebunden ist.
export interface AdzunaSuchparameter {
  was?: string;
  wo?: string;
  // Erwartet einen "tag"-Wert wie von holeAdzunaKategorien() geliefert
  // (z. B. "it-jobs"), wird 1:1 als Adzuna-Parameter "category" übergeben.
  kategorie?: string;
  seite?: number;
  anzahl?: number;
}

// Entspricht einem Eintrag aus der Adzuna-/categories-Antwort.
export interface AdzunaKategorie {
  tag: string;
  label: string;
}

interface AdzunaKategorieApiEintrag {
  tag?: string;
  label?: string;
}

interface AdzunaKategorienApiResponse {
  results?: AdzunaKategorieApiEintrag[];
}

// Nur die Felder, die wir tatsächlich verwenden – bewusst nicht die
// vollständige Adzuna-Antwortstruktur nachgebildet.
interface AdzunaApiJob {
  id?: string;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string | number | boolean;
  category?: { label?: string; tag?: string };
  contract_type?: string;
  contract_time?: string;
}

interface AdzunaApiResponse {
  results?: AdzunaApiJob[];
}

function istWahrheitswert(wert: string | number | boolean | undefined): boolean {
  return wert === true || wert === 1 || wert === "1";
}

/**
 * Bildet einen einzelnen Adzuna-Rohdatensatz auf RohJob ab.
 * Liefert `null`, wenn Titel oder Link fehlen (siehe normalisiereJob –
 * dieselbe Regel wird hier vorab angewendet, um unnötige Weiterarbeit an
 * unbrauchbaren Datensätzen zu vermeiden).
 * Erfindet keine Daten: Felder, die Adzuna nicht liefert, bleiben undefined.
 */
export function bildeAdzunaRohJobAb(apiJob: AdzunaApiJob, quelleId: string): RohJob | null {
  const titel = apiJob.title;
  const url = apiJob.redirect_url;

  if (!titel || !url) {
    return null;
  }

  const gehaltIstGeschaetzt = istWahrheitswert(apiJob.salary_is_predicted);

  return {
    quelleId,
    externeId: apiJob.id,
    titel,
    unternehmen: apiJob.company?.display_name,
    ort: apiJob.location?.display_name,
    url,
    beschreibung: apiJob.description,
    veroeffentlichtAm: apiJob.created?.slice(0, 10),
    // Nur tatsächlich angegebene, nicht von Adzuna selbst geschätzte
    // Gehälter übernehmen (salary_is_predicted = von Adzuna berechnet,
    // nicht aus der Originalanzeige) – keine erfundene Genauigkeit vortäuschen.
    gehaltVon: gehaltIstGeschaetzt ? undefined : apiJob.salary_min,
    gehaltBis: gehaltIstGeschaetzt ? undefined : apiJob.salary_max,
    branche: apiJob.category?.label,
    tags: apiJob.category?.tag ? [apiJob.category.tag] : undefined,
    // contract_time/contract_type sind Adzunas eigene, klar definierte
    // Kategorien – keine Interpretation von Freitext, sondern direkte
    // Übernahme kategorialer Werte.
    vollzeit: apiJob.contract_time === "full_time" ? true : undefined,
    teilzeit: apiJob.contract_time === "part_time" ? true : undefined,
    befristet:
      apiJob.contract_type === "contract"
        ? true
        : apiJob.contract_type === "permanent"
          ? false
          : undefined,
    // Adzuna liefert kein Arbeitsmodell-/Remote-Feld – bewusst NICHT gesetzt.
    // normalisiereJob() wendet in diesem Fall seinen bestehenden,
    // dokumentierten Standardwert an ("Vor Ort").
  };
}

/**
 * Erzeugt einen QuellenAdapter für Adzuna, kompatibel mit dem bestehenden
 * QuellenAdapter-Interface (hole(): Promise<RohJob[]>, keine Parameter).
 *
 * Suchparameter (was/wo/seite/anzahl) werden bewusst NICHT an hole()
 * übergeben, sondern beim Erzeugen des Adapters festgelegt und per Closure
 * gebunden. So bleibt das bestehende Interface unverändert, während der
 * Adapter trotzdem parametrisierbar ist.
 */
export function erzeugeAdzunaAdapter(
  quelle: Quelle,
  zugangsdaten: AdzunaZugangsdaten,
  suchparameter: AdzunaSuchparameter = {}
): QuellenAdapter {
  const seite = suchparameter.seite && suchparameter.seite > 0 ? suchparameter.seite : 1;
  const anzahl = Math.min(
    suchparameter.anzahl && suchparameter.anzahl > 0
      ? suchparameter.anzahl
      : STANDARD_ERGEBNISSE_PRO_SEITE,
    ADZUNA_MAX_ERGEBNISSE_PRO_SEITE
  );

  return {
    quelle,
    async hole(): Promise<RohJob[]> {
      if (!zugangsdaten.appId || !zugangsdaten.appKey) {
        console.error("[Adzuna-Adapter] Fehlende API-Zugangsdaten – Abruf übersprungen.");
        return [];
      }

      const url = new URL(`${ADZUNA_BASIS_URL}/${ADZUNA_LAND}/search/${seite}`);
      url.searchParams.set("app_id", zugangsdaten.appId);
      url.searchParams.set("app_key", zugangsdaten.appKey);
      url.searchParams.set("results_per_page", String(anzahl));
      url.searchParams.set("content-type", "application/json");
      if (suchparameter.was) {
        url.searchParams.set("what", suchparameter.was);
      }
      if (suchparameter.wo) {
        url.searchParams.set("where", suchparameter.wo);
      }
      if (suchparameter.kategorie) {
        url.searchParams.set("category", suchparameter.kategorie);
      }

      const abbruch = new AbortController();
      const timeoutId = setTimeout(() => abbruch.abort(), ABBRUCH_TIMEOUT_MS);

      let antwort: Response;
      try {
        antwort = await fetch(url.toString(), { signal: abbruch.signal });
      } catch (fehler) {
        console.error("[Adzuna-Adapter] Netzwerkfehler oder Timeout beim Abruf:", fehler);
        return [];
      } finally {
        clearTimeout(timeoutId);
      }

      if (!antwort.ok) {
        console.error(`[Adzuna-Adapter] HTTP-Fehler ${antwort.status} ${antwort.statusText}`);
        return [];
      }

      let daten: unknown;
      try {
        daten = await antwort.json();
      } catch (fehler) {
        console.error("[Adzuna-Adapter] Antwort ist kein gültiges JSON:", fehler);
        return [];
      }

      if (
        typeof daten !== "object" ||
        daten === null ||
        !Array.isArray((daten as AdzunaApiResponse).results)
      ) {
        console.error("[Adzuna-Adapter] Unerwartete Antwortstruktur (kein results-Array).");
        return [];
      }

      const ergebnisse = (daten as AdzunaApiResponse).results ?? [];
      const rohJobs: RohJob[] = [];

      for (const apiJob of ergebnisse) {
        const rohJob = bildeAdzunaRohJobAb(apiJob, quelle.id);
        if (rohJob) {
          rohJobs.push(rohJob);
        }
        // einzelne unvollständige Datensätze werden übersprungen,
        // nicht die gesamte Liste verworfen
      }

      return rohJobs;
    },
  };
}

/**
 * Lädt die von Adzuna für Deutschland definierte Kategorienliste
 * (.../jobs/de/categories). Liefert bei jedem Fehler (fehlende
 * Zugangsdaten, Netzwerkfehler, HTTP-Fehler, unerwartete Antwortstruktur)
 * bewusst ein leeres Array statt zu werfen - ein fehlgeschlagener
 * Kategorien-Abruf darf die Jobs-Seite niemals zum Absturz bringen, das
 * Kategorie-Dropdown zeigt in diesem Fall lediglich keine Optionen an.
 *
 * Cache: 24h (siehe KATEGORIEN_REVALIDATE_SEKUNDEN) - Kategorien ändern
 * sich praktisch nie, ein häufigerer Abruf wäre unnötiger Verbrauch des
 * Adzuna-Free-Tier-Kontingents. Betrifft ausschließlich diesen Abruf, nicht
 * den eigentlichen Job-Suche-Request oben (der bleibt uncached/live).
 */
export async function holeAdzunaKategorien(
  zugangsdaten: AdzunaZugangsdaten
): Promise<AdzunaKategorie[]> {
  if (!zugangsdaten.appId || !zugangsdaten.appKey) {
    console.error("[Adzuna-Adapter] Fehlende API-Zugangsdaten – Kategorien-Abruf übersprungen.");
    return [];
  }

  const url = new URL(`${ADZUNA_BASIS_URL}/${ADZUNA_LAND}/categories`);
  url.searchParams.set("app_id", zugangsdaten.appId);
  url.searchParams.set("app_key", zugangsdaten.appKey);
  url.searchParams.set("content-type", "application/json");

  const abbruch = new AbortController();
  const timeoutId = setTimeout(() => abbruch.abort(), ABBRUCH_TIMEOUT_MS);

  let antwort: Response;
  try {
    antwort = await fetch(url.toString(), {
      signal: abbruch.signal,
      next: { revalidate: KATEGORIEN_REVALIDATE_SEKUNDEN },
    });
  } catch (fehler) {
    console.error("[Adzuna-Adapter] Netzwerkfehler oder Timeout beim Kategorien-Abruf:", fehler);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }

  if (!antwort.ok) {
    console.error(`[Adzuna-Adapter] HTTP-Fehler ${antwort.status} ${antwort.statusText} (Kategorien)`);
    return [];
  }

  let daten: unknown;
  try {
    daten = await antwort.json();
  } catch (fehler) {
    console.error("[Adzuna-Adapter] Kategorien-Antwort ist kein gültiges JSON:", fehler);
    return [];
  }

  if (
    typeof daten !== "object" ||
    daten === null ||
    !Array.isArray((daten as AdzunaKategorienApiResponse).results)
  ) {
    console.error("[Adzuna-Adapter] Unerwartete Antwortstruktur (kein results-Array, Kategorien).");
    return [];
  }

  const ergebnisse = (daten as AdzunaKategorienApiResponse).results ?? [];
  const kategorien: AdzunaKategorie[] = [];

  for (const eintrag of ergebnisse) {
    if (eintrag.tag && eintrag.label) {
      kategorien.push({ tag: eintrag.tag, label: eintrag.label });
    }
    // Einträge ohne tag oder label werden übersprungen - ohne tag ist eine
    // Kategorie nicht suchbar, ohne label nicht sinnvoll anzeigbar.
  }

  return kategorien;
}
