// Typen für die spätere Job-Import-Architektur (Etappe 1: nur Fundament).
// Bewusst getrennt von src/types/index.ts, da RohJob ein reiner
// Zwischenzustand ist (bevor Normalisierung), nicht der einheitliche
// JobPilot-Job-Typ.

import { Quelle } from "@/types";

// ---------------------------------------------------------------------------
// RohJob: das, was eine Quelle tatsächlich liefert – bewusst fast
// vollständig optional, da externe Quellen sehr unterschiedlich
// unvollständig sein können. Nur `quelleId` ist verpflichtend, weil dieser
// Wert nicht aus dem Quellinhalt geparst wird, sondern vom aufrufenden
// Adapter selbst gesetzt wird (der Adapter weiß immer, welche Quelle er
// gerade abfragt).
// ---------------------------------------------------------------------------

export interface RohJob {
  quelleId: string;

  // Alles Weitere kommt aus dem Quellinhalt und kann fehlen.
  externeId?: string;
  titel?: string;
  unternehmen?: string;
  ort?: string;
  url?: string;
  beschreibung?: string;
  veroeffentlichtAm?: string;
  gehaltVon?: number;
  gehaltBis?: number;

  // Freitext der Quelle (z. B. "Home Office möglich", "100% remote vor Ort
  // in Ausnahmefällen"). Wird in der Normalisierung interpretiert, nicht
  // direkt als ArbeitsModell übernommen, da Quellen keine einheitliche
  // Terminologie garantieren.
  arbeitsmodellRoh?: string;

  branche?: string;
  tags?: string[];
  vollzeit?: boolean;
  teilzeit?: boolean;
  befristet?: boolean;

  erforderlicheFaehigkeiten?: string[];
  wuenschenswerteFaehigkeiten?: string[];
  mindestBerufserfahrungJahre?: number;
}

// ---------------------------------------------------------------------------
// Adapter-Interface: gemeinsamer Vertrag für spätere Quellen-Adapter.
// In dieser Etappe nur definiert, keine Implementierung, kein echter Abruf.
// ---------------------------------------------------------------------------

export interface QuellenAdapter {
  quelle: Quelle;
  hole(): Promise<RohJob[]>;
}
