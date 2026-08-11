"use server";

import { Quelle } from "@/types";
import { holeAdzunaJobPool } from "@/lib/jobImport/holeJobPool";
import type { JobsFuerAnzeigeErgebnis } from "@/lib/jobImport/holeJobsFuerAnzeige";

// ---------------------------------------------------------------------------
// Server Action für die aktive Jobsuche.
//
// Bewusst GETRENNT von holeJobsFuerAnzeige() (die für den initialen
// /jobs-Aufruf unverändert bleibt): Diese Funktion importiert die 8
// lokalen Beispieljobs NICHT und gibt sie unter keinen Umständen zurück -
// bei einer aktiven Suche sollen niemals themenfremde Demo-Jobs erscheinen.
//
// Nutzt das bereits bestehende, unveränderte holeAdzunaJobPool() (inkl.
// Normalisierung und Duplikaterkennung). process.env.ADZUNA_APP_ID/KEY
// werden ausschließlich hier gelesen - "use server" stellt sicher, dass
// diese Datei serverseitig bleibt, auch wenn JobsContent.tsx (Client
// Component) die Funktion direkt aufruft.
//
// `standort` ist ein zusätzlicher, optionaler zweiter Parameter (nutzt den
// bereits im Adzuna-Adapter vorhandenen "wo"-Parameter). Suchbegriff und
// Standort sind unabhängig voneinander optional und beliebig kombinierbar -
// nur wenn BEIDE leer sind, wird gar nicht gesucht.
// ---------------------------------------------------------------------------

const ADZUNA_QUELLE: Quelle = { id: "q-adzuna", name: "Adzuna", typ: "API", aktiv: true };
const ANZAHL_PRO_SUCHE = 25;

export async function sucheJobsServerseitig(
  suchbegriff: string,
  standort?: string
): Promise<JobsFuerAnzeigeErgebnis> {
  const begriff = suchbegriff.trim();
  const ort = (standort ?? "").trim();

  if (begriff.length === 0 && ort.length === 0) {
    return { jobs: [] };
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return {
      jobs: [],
      hinweis: "Adzuna-Zugangsdaten sind nicht konfiguriert – Suche aktuell nicht möglich.",
    };
  }

  const beschreibungDerSuche = beschreibeSuche(begriff, ort);

  try {
    const ergebnis = await holeAdzunaJobPool(
      ADZUNA_QUELLE,
      { appId, appKey },
      {
        was: begriff.length > 0 ? begriff : undefined,
        wo: ort.length > 0 ? ort : undefined,
        anzahl: ANZAHL_PRO_SUCHE,
      }
    );

    if (ergebnis.jobs.length === 0) {
      return { jobs: [], hinweis: `Keine Treffer für ${beschreibungDerSuche}.` };
    }

    return { jobs: ergebnis.jobs };
  } catch (fehler) {
    console.error("[sucheJobsServerseitig] Fehler bei der Live-Suche:", fehler);
    return {
      jobs: [],
      hinweis: "Live-Suche aktuell nicht verfügbar. Bitte versuche es erneut.",
    };
  }
}

function beschreibeSuche(begriff: string, ort: string): string {
  if (begriff.length > 0 && ort.length > 0) {
    return `„${begriff}" in „${ort}"`;
  }
  if (begriff.length > 0) {
    return `„${begriff}"`;
  }
  return `„${ort}"`;
}
