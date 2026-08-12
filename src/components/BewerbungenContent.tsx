"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { bewerbungen as initialBewerbungen } from "@/data/bewerbungen";
import { BEWERBUNGS_STATI, Bewerbung, BewerbungsStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { formatDatum } from "@/lib/format";
import { statusStile } from "@/lib/status";
import { cn } from "@/lib/utils";
import { ladeGespeicherteBewerbungen, speichereBewerbungen } from "@/lib/bewerbungenStorage";

export function BewerbungenContent() {
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>(initialBewerbungen);

  // Gespeicherten Stand einmalig beim Mount laden. Ist noch nichts im
  // localStorage hinterlegt (allererster Aufruf), bleiben die Demo-Daten aus
  // initialBewerbungen als Anzeige bestehen - erst eine tatsächliche
  // Änderung (z. B. Statuswechsel oder eine neue, aus JobsContent übernommene
  // Bewerbung) schreibt in den localStorage.
  useEffect(() => {
    const gespeichert = ladeGespeicherteBewerbungen();
    if (gespeichert) {
      setBewerbungen(gespeichert);
    }
  }, []);

  function statusAendern(id: string, neuerStatus: BewerbungsStatus) {
    setBewerbungen((prev) => {
      const aktualisiert = prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: neuerStatus,
              aktualisiertAm: new Date().toISOString().slice(0, 10),
            }
          : b
      );
      speichereBewerbungen(aktualisiert);
      return aktualisiert;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Bewerbungen</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Behalte den Überblick über alle Bewerbungen – von der ersten Idee
          bis zur Rückmeldung.
        </p>
      </div>

      <Card className="flex items-start gap-3 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <Lock size={16} aria-hidden="true" />
        </span>
        <p className="text-sm text-navy-900/70">
          Der automatische Versand von Bewerbungen ist noch deaktiviert. Jede
          Bewerbung muss später einzeln und ausdrücklich freigegeben werden,
          bevor sie verschickt wird.
        </p>
      </Card>

      <div className="scroll-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {BEWERBUNGS_STATI.map((status) => {
          const spalte = bewerbungen.filter((b) => b.status === status);

          return (
            <div key={status} className="flex w-72 shrink-0 flex-col">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn("h-2 w-2 rounded-full", statusStile[status].dot)} />
                <h2 className="text-sm font-semibold text-navy-900">{status}</h2>
                <span className="ml-auto text-xs text-navy-900/50">
                  {spalte.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {spalte.map((bewerbung) => (
                  <Card key={bewerbung.id} className="p-4">
                    <p className="text-sm font-medium text-navy-900">
                      {bewerbung.titel}
                    </p>
                    <p className="mt-0.5 text-xs text-navy-900/60">
                      {bewerbung.unternehmen}
                    </p>

                    {bewerbung.naechsterSchritt && (
                      <p className="mt-2 text-xs text-navy-900/70">
                        {bewerbung.naechsterSchritt}
                      </p>
                    )}

                    {bewerbung.notizen && (
                      <p className="mt-2 text-xs italic text-navy-900/50">
                        {bewerbung.notizen}
                      </p>
                    )}

                    <p className="mt-2 text-[11px] text-navy-900/40">
                      Aktualisiert am {formatDatum(bewerbung.aktualisiertAm)}
                    </p>

                    <label className="mt-3 block">
                      <span className="sr-only">Status ändern</span>
                      <select
                        value={bewerbung.status}
                        onChange={(e) =>
                          statusAendern(
                            bewerbung.id,
                            e.target.value as BewerbungsStatus
                          )
                        }
                        className="w-full rounded-md border border-navy-100 bg-white px-2 py-1.5 text-xs text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                      >
                        {BEWERBUNGS_STATI.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </Card>
                ))}

                {spalte.length === 0 && (
                  <div className="rounded-lg border border-dashed border-navy-100 p-4 text-center text-xs text-navy-900/40">
                    Keine Bewerbungen
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
