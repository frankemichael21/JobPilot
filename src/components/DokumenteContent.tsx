"use client";

import { useState } from "react";
import { FileText, GraduationCap, Upload } from "lucide-react";
import { dokumente, anschreibenBeispiel } from "@/data/dokumente";
import { profil } from "@/data/profil";
import { AnschreibenFelder, Dokument, DokumentKategorie } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatDatum } from "@/lib/format";
import { cn } from "@/lib/utils";

function DokumentListe({
  kategorie,
  icon: Icon,
}: {
  kategorie: DokumentKategorie;
  icon: typeof FileText;
}) {
  const eintraege = dokumente.filter((d) => d.kategorie === kategorie);

  return (
    <ul className="divide-y divide-navy-100">
      {eintraege.map((dokument: Dokument) => (
        <li key={dokument.id} className="flex items-center gap-3 px-5 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <Icon size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-900">{dokument.name}</p>
            <p className="truncate text-xs text-navy-900/50">
              {dokument.vorhanden && dokument.aktualisiertAm
                ? `${dokument.dateiname ?? "Datei hinterlegt"} · aktualisiert am ${formatDatum(dokument.aktualisiertAm)}`
                : "Noch keine Datei hinterlegt"}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
              dokument.vorhanden
                ? "bg-accent-100 text-accent-600"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {dokument.vorhanden ? "Hinterlegt" : "Fehlt noch"}
          </span>
          <button
            type="button"
            disabled
            title="Datei-Upload folgt in einer späteren Version"
            className="ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-navy-100 px-3 py-1.5 text-xs font-medium text-navy-900/40 cursor-not-allowed"
          >
            <Upload size={14} aria-hidden="true" />
            {dokument.vorhanden ? "Ersetzen" : "Hochladen"}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function DokumenteContent() {
  const [anschreiben, setAnschreiben] = useState<AnschreibenFelder>(anschreibenBeispiel);

  function feldAendern<K extends keyof AnschreibenFelder>(
    feld: K,
    wert: AnschreibenFelder[K]
  ) {
    setAnschreiben((prev) => ({ ...prev, [feld]: wert }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Dokumente</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Verwalte Lebenslauf, Zeugnisse und erstelle individuelle Anschreiben.
          Der Datei-Upload ist aktuell nur als Platzhalter vorbereitet.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Lebenslauf" description="Deine aktuelle Version" />
          <DokumentListe kategorie="Lebenslauf" icon={FileText} />
        </Card>

        <Card>
          <CardHeader title="Zeugnisse" description="Arbeits- und Ausbildungszeugnisse" />
          <DokumentListe kategorie="Zeugnis" icon={GraduationCap} />
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Anschreiben erstellen"
          description="Alle Angaben lassen sich einzeln bearbeiten und werden direkt in der Vorschau übernommen"
        />

        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-navy-900">
                  Empfängerfirma
                </span>
                <input
                  type="text"
                  value={anschreiben.empfaengerFirma}
                  onChange={(e) => feldAendern("empfaengerFirma", e.target.value)}
                  className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-navy-900">
                  Ansprechpartner
                </span>
                <input
                  type="text"
                  value={anschreiben.ansprechpartner}
                  onChange={(e) => feldAendern("ansprechpartner", e.target.value)}
                  className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-navy-900">
                Firmenadresse
              </span>
              <textarea
                value={anschreiben.firmenadresse}
                onChange={(e) => feldAendern("firmenadresse", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-navy-900">Datum</span>
                <input
                  type="date"
                  value={anschreiben.datum}
                  onChange={(e) => feldAendern("datum", e.target.value)}
                  className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-navy-900">Anrede</span>
                <input
                  type="text"
                  value={anschreiben.anrede}
                  onChange={(e) => feldAendern("anrede", e.target.value)}
                  className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-navy-900">Betreff</span>
              <input
                type="text"
                value={anschreiben.betreff}
                onChange={(e) => feldAendern("betreff", e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-navy-900">Haupttext</span>
              <textarea
                value={anschreiben.text}
                onChange={(e) => feldAendern("text", e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>
          </div>

          <div className="rounded-xl border border-navy-100 bg-navy-100/20 p-6">
            <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm text-sm text-navy-900">
              <p className="whitespace-pre-line text-navy-900/80">
                {anschreiben.empfaengerFirma}
                {anschreiben.firmenadresse ? `\n${anschreiben.firmenadresse}` : ""}
              </p>
              {anschreiben.ansprechpartner && (
                <p className="mt-1 text-navy-900/80">
                  z. Hd. {anschreiben.ansprechpartner}
                </p>
              )}

              <p className="mt-6 text-right text-navy-900/60">
                {anschreiben.datum ? formatDatum(anschreiben.datum) : ""}
              </p>

              <p className="mt-6 font-semibold">{anschreiben.betreff}</p>

              <p className="mt-4">{anschreiben.anrede}</p>

              <p className="mt-4 whitespace-pre-line leading-relaxed">
                {anschreiben.text}
              </p>

              <p className="mt-6">Mit freundlichen Grüßen</p>
              <p className="mt-1 font-medium">{profil.persoenlicheAngaben.vollerName}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
