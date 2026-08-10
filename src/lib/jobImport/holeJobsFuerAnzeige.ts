import { Job, Quelle } from "@/types";
import { holeAdzunaJobPool } from "@/lib/jobImport/holeJobPool";
import { jobs as beispielJobs } from "@/data/jobs";

// ---------------------------------------------------------------------------
// Serverseitige Beschaffung der Jobs für die Jobs-Seite.
//
// WICHTIG: Diese Datei darf ausschließlich von Server Components importiert
// werden (z. B. src/app/jobs/page.tsx), NIEMALS von "use client"-Dateien wie
// JobsContent.tsx. Next.js trennt Server-/Client-Bundles anhand des
// Import-Graphen: solange keine Client-Komponente diese Datei importiert,
// gelangt ihr Code (inkl. process.env-Zugriff) nie ins Browser-Bundle.
//
// process.env.ADZUNA_APP_ID / ADZUNA_APP_KEY werden ausschließlich hier
// gelesen und verlassen diese Funktion nie – zurückgegeben wird
// ausschließlich reine Job-/Hinweis-Daten, keine Zugangsdaten.
// ---------------------------------------------------------------------------

const ADZUNA_QUELLE: Quelle = { id: "q-adzuna", name: "Adzuna", typ: "API", aktiv: true };
const ANZAHL_PRO_ABRUF = 25; // ein einzelner, kontrollierter Abruf – keine Schleife über mehrere Seiten

export interface JobsFuerAnzeigeErgebnis {
  jobs: Job[];
  hinweis?: string;
}

export async function holeJobsFuerAnzeige(): Promise<JobsFuerAnzeigeErgebnis> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return {
      jobs: beispielJobs,
      hinweis:
        "Adzuna-Zugangsdaten sind nicht konfiguriert – es werden lokale Beispieldaten angezeigt.",
    };
  }

  try {
    const ergebnis = await holeAdzunaJobPool(
      ADZUNA_QUELLE,
      { appId, appKey },
      { anzahl: ANZAHL_PRO_ABRUF }
    );

    if (ergebnis.jobs.length === 0) {
      return {
        jobs: beispielJobs,
        hinweis:
          "Aktuell keine Live-Jobs von Adzuna erhalten – es werden lokale Beispieldaten angezeigt.",
      };
    }

    return { jobs: ergebnis.jobs };
  } catch (fehler) {
    // holeAdzunaJobPool()/erzeugeAdzunaAdapter() fangen bereits die meisten
    // Fehler selbst ab und werfen praktisch nie – dieser try/catch ist eine
    // zusätzliche Absicherung, damit die Seite unter keinen Umständen abstürzt.
    console.error("[holeJobsFuerAnzeige] Unerwarteter Fehler beim Adzuna-Abruf:", fehler);
    return {
      jobs: beispielJobs,
      hinweis: "Live-Jobsuche aktuell nicht verfügbar – es werden lokale Beispieldaten angezeigt.",
    };
  }
}
