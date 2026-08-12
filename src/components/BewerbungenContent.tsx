"use client";

import { useEffect, useState } from "react";
import { FileEdit, Lock, X } from "lucide-react";
import { bewerbungen as initialBewerbungen } from "@/data/bewerbungen";
import { AnschreibenFelder, BEWERBUNGS_STATI, Bewerbung, BewerbungsStatus } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatDatum } from "@/lib/format";
import { statusStile } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  erzeugeLeeresAnschreiben,
  ladeGespeicherteBewerbungen,
  speichereBewerbungen,
} from "@/lib/bewerbungenStorage";
import { AnschreibenFormular } from "@/components/DokumenteContent";

export function BewerbungenContent() {
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>(initialBewerbungen);

  // Anschreiben-Editor: `bearbeiteId` verweist auf die Bewerbung, deren
  // Anschreiben gerade bearbeitet wird; `entwurf` ist der noch NICHT
  // gespeicherte Arbeitsstand. Erst ein expliziter Klick auf "Speichern"
  // schreibt den Entwurf in `bewerbungen`/localStorage - Tippen im Formular
  // allein persistiert nichts.
  const [bearbeiteId, setBearbeiteId] = useState<string | null>(null);
  const [entwurf, setEntwurf] = useState<AnschreibenFelder | null>(null);

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

  // Öffnet den Anschreiben-Editor für eine konkrete Bewerbung. Der Entwurf
  // wird bewusst aus `bewerbungen` (nicht neu aus dem Storage) gelesen, da
  // das der aktuell angezeigte, garantiert korrekte Stand ist.
  function anschreibenBearbeiten(bewerbung: Bewerbung) {
    setEntwurf(bewerbung.anschreiben ?? erzeugeLeeresAnschreiben(bewerbung));
    setBearbeiteId(bewerbung.id);
  }

  function entwurfFeldAendern<K extends keyof AnschreibenFelder>(
    feld: K,
    wert: AnschreibenFelder[K]
  ) {
    setEntwurf((prev) => (prev ? { ...prev, [feld]: wert } : prev));
  }

  function anschreibenSpeichern() {
    if (!bearbeiteId || !entwurf) {
      return;
    }
    setBewerbungen((prev) => {
      const aktualisiert = prev.map((b) =>
        b.id === bearbeiteId
          ? {
              ...b,
              anschreiben: entwurf,
              aktualisiertAm: new Date().toISOString().slice(0, 10),
            }
          : b
      );
      speichereBewerbungen(aktualisiert);
      return aktualisiert;
    });
    setBearbeiteId(null);
    setEntwurf(null);
  }

  function anschreibenAbbrechen() {
    setBearbeiteId(null);
    setEntwurf(null);
  }

  const bearbeiteteBewerbung = bewerbungen.find((b) => b.id === bearbeiteId);

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

      {bearbeiteId && entwurf && bearbeiteteBewerbung && (
        <Card>
          <CardHeader
            title={
              bearbeiteteBewerbung.anschreiben
                ? "Anschreiben bearbeiten"
                : "Anschreiben erstellen"
            }
            description={`${bearbeiteteBewerbung.titel} · ${bearbeiteteBewerbung.unternehmen}`}
          />

          <AnschreibenFormular werte={entwurf} aufFeldAendern={entwurfFeldAendern} />

          <div className="flex items-center justify-end gap-2 border-t border-navy-100 p-4">
            <button
              type="button"
              onClick={anschreibenAbbrechen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy-100 px-3 py-2 text-xs font-medium text-navy-900/70 hover:bg-navy-100/60"
            >
              <X size={14} aria-hidden="true" />
              Abbrechen
            </button>
            <button
              type="button"
              onClick={anschreibenSpeichern}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-900/90"
            >
              Speichern
            </button>
          </div>
        </Card>
      )}

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

                    <button
                      type="button"
                      onClick={() => anschreibenBearbeiten(bewerbung)}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-navy-100 px-2 py-1.5 text-xs font-medium text-navy-900/70 hover:bg-navy-100/60"
                    >
                      <FileEdit size={13} aria-hidden="true" />
                      {bewerbung.anschreiben ? "Anschreiben bearbeiten" : "Anschreiben erstellen"}
                    </button>
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
