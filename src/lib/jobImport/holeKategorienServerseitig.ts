"use server";

import { AdzunaKategorie, holeAdzunaKategorien } from "@/lib/jobImport/adapters/adzuna";

// ---------------------------------------------------------------------------
// Server Action zum Laden der Adzuna-Kategorienliste für das
// Kategorie-Dropdown auf der Jobs-Seite.
//
// process.env.ADZUNA_APP_ID/KEY werden ausschließlich hier gelesen -
// "use server" stellt sicher, dass diese Datei serverseitig bleibt, auch
// wenn JobsContent.tsx (Client Component) die Funktion direkt aufruft.
// Analog zu sucheJobsServerseitig.ts bewusst als eigene, kleine Datei
// gehalten statt in eine bestehende Datei eingemischt zu werden.
//
// Fehler jeder Art (fehlende Credentials, Netzwerkfehler, HTTP-Fehler,
// unerwartete Antwortstruktur) führen NIE zu einem Absturz - siehe bereits
// in holeAdzunaKategorien() implementiertes robustes Fallback-Verhalten
// (leeres Array). Diese Datei reicht das unverändert durch.
// ---------------------------------------------------------------------------

export interface KategorienErgebnis {
  kategorien: AdzunaKategorie[];
}

export async function holeKategorienServerseitig(): Promise<KategorienErgebnis> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return { kategorien: [] };
  }

  try {
    const kategorien = await holeAdzunaKategorien({ appId, appKey });
    return { kategorien };
  } catch (fehler) {
    console.error("[holeKategorienServerseitig] Unerwarteter Fehler beim Kategorien-Abruf:", fehler);
    return { kategorien: [] };
  }
}
