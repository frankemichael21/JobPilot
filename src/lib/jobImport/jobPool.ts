import { Job, Quelle } from "@/types";
import { RohJob } from "@/types/jobImport";
import { normalisiereJob } from "@/lib/jobImport/normalisierung";

// ---------------------------------------------------------------------------
// Job-Pool mit Duplikaterkennung.
//
// Bewusst als reine Funktion ohne eigenen Netzwerkzugriff: nimmt bereits
// abgerufene RohJobs entgegen (gruppiert nach der jeweiligen Quelle) und
// erzeugt daraus eine deduplizierte, in stabiler Reihenfolge sortierte
// Job-Liste. normalisiereJob() bleibt dabei vollständig unverändert und wird
// nur aufgerufen, nicht angepasst.
// ---------------------------------------------------------------------------

export interface RohJobGruppe {
  quelle: Quelle;
  rohJobs: RohJob[];
}

export interface JobPoolErgebnis {
  jobs: Job[];
  gesamtVerarbeitet: number;
  uebersprungen: number; // von normalisiereJob() verworfen (null), z. B. fehlender Titel/URL
  duplikate: number; // erkannte Duplikate, die nicht erneut aufgenommen wurden
}

/**
 * Bildet den Duplikat-Schlüssel für einen bereits normalisierten Job.
 *
 * Primärregel: quelleId + externeId (explizit wie gefordert).
 * Fallback, wenn externeId fehlt: der bereits von normalisiereJob() erzeugte
 * Job.id-Wert. Das ist KEINE neue erfundene ID – normalisiereJob() leitet
 * Job.id in diesem Fall bereits deterministisch aus der URL ab (siehe
 * src/lib/jobImport/normalisierung.ts, unverändert). Zwei Jobs ohne
 * externeId werden dadurch nur dann zusammengelegt, wenn sie exakt dieselbe
 * URL haben – nicht, weil wir etwas raten, sondern weil das bereits
 * bestehende, unveränderte Normalisierungsverhalten das so vorsieht.
 */
export function bildeDedupSchluessel(job: Job): string {
  if (job.quelleId && job.externeId) {
    return `quelleId+externeId::${job.quelleId}::${job.externeId}`;
  }
  return `job-id-fallback::${job.id}`;
}

/**
 * Baut den Job-Pool aus mehreren RohJob-Gruppen (z. B. mehrere Abrufseiten
 * derselben Quelle, oder künftig mehrere unterschiedliche Quellen).
 *
 * - Fehlerhafte/unvollständige Rohdatensätze werden übersprungen (über die
 *   bestehende, unveränderte normalisiereJob()-Logik).
 * - Duplikate (siehe bildeDedupSchluessel) werden nur einmal aufgenommen;
 *   die zuerst gesehene Version gewinnt.
 * - Die Reihenfolge im Ergebnis-Array entspricht der Reihenfolge des ersten
 *   Auftretens über alle Gruppen hinweg (stabil, keine Neusortierung).
 */
export function baueJobPool(gruppen: RohJobGruppe[]): JobPoolErgebnis {
  const pool = new Map<string, Job>();
  let gesamtVerarbeitet = 0;
  let uebersprungen = 0;
  let duplikate = 0;

  for (const gruppe of gruppen) {
    for (const rohJob of gruppe.rohJobs) {
      gesamtVerarbeitet++;

      const job = normalisiereJob(rohJob, gruppe.quelle);
      if (!job) {
        uebersprungen++;
        continue;
      }

      const schluessel = bildeDedupSchluessel(job);
      if (pool.has(schluessel)) {
        duplikate++;
        continue;
      }

      pool.set(schluessel, job);
    }
  }

  return {
    jobs: Array.from(pool.values()),
    gesamtVerarbeitet,
    uebersprungen,
    duplikate,
  };
}
