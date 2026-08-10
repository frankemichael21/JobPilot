import { Quelle } from "@/types";
import {
  AdzunaSuchparameter,
  AdzunaZugangsdaten,
  erzeugeAdzunaAdapter,
} from "@/lib/jobImport/adapters/adzuna";
import { baueJobPool, JobPoolErgebnis } from "@/lib/jobImport/jobPool";

// ---------------------------------------------------------------------------
// Beispielhafte Verdrahtung: Adzuna als erste Quelle des Job-Pools.
// Ruft ausschließlich den bereits bestehenden, unveränderten Adzuna-Adapter
// auf und übergibt dessen Ergebnis an den (ebenfalls unveränderten) Pool.
// Kein direkter Netzwerkcode hier, keine neue Fetch-Logik.
// ---------------------------------------------------------------------------

export async function holeAdzunaJobPool(
  quelle: Quelle,
  zugangsdaten: AdzunaZugangsdaten,
  suchparameter: AdzunaSuchparameter = {}
): Promise<JobPoolErgebnis> {
  const adapter = erzeugeAdzunaAdapter(quelle, zugangsdaten, suchparameter);
  const rohJobs = await adapter.hole();

  return baueJobPool([{ quelle, rohJobs }]);
}
