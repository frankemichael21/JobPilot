"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { profil as initialProfil } from "@/data/profil";
import { ladeGespeichertesProfil, speichereProfil } from "@/lib/profilStorage";
import { Gehaltszeitraum, JOB_PRIORITAETEN, JobPrioritaet, Profil } from "@/types";
import { Card } from "@/components/ui/Card";
import { CollapsibleCard } from "@/components/ui/CollapsibleCard";
import { Checkbox } from "@/components/ui/Checkbox";
import { TagInput } from "@/components/ui/TagInput";

const zeitraeume: Gehaltszeitraum[] = ["Jahr", "Monat"];

function PrioritaetenAuswahl({
  ausgewaehlt,
  onChange,
}: {
  ausgewaehlt: JobPrioritaet[];
  onChange: (werte: JobPrioritaet[]) => void;
}) {
  const uebrige = JOB_PRIORITAETEN.filter((p) => !ausgewaehlt.includes(p));

  function hinzufuegen(p: JobPrioritaet) {
    onChange([...ausgewaehlt, p]);
  }

  function entfernen(p: JobPrioritaet) {
    onChange(ausgewaehlt.filter((x) => x !== p));
  }

  return (
    <div className="space-y-3">
      {ausgewaehlt.length > 0 && (
        <ol className="flex flex-wrap gap-2">
          {ausgewaehlt.map((p, index) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => entfernen(p)}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1 text-xs font-medium text-navy-950"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/40 text-[10px]">
                  {index + 1}
                </span>
                {p}
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}
      {uebrige.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uebrige.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => hinzufuegen(p)}
              className="rounded-full border border-navy-100 px-3 py-1 text-xs text-navy-900/70 hover:bg-navy-100/60"
            >
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfilContent() {
  const [profil, setProfil] = useState<Profil>(initialProfil);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    const gespeichert = ladeGespeichertesProfil();
    if (gespeichert) {
      setProfil(gespeichert);
    }
    setGeladen(true);
  }, []);

  useEffect(() => {
    if (!geladen) return;
    speichereProfil(profil);
  }, [profil, geladen]);

  function abschnittAendern<S extends keyof Profil>(abschnitt: S) {
    return function <K extends keyof Profil[S]>(feld: K, wert: Profil[S][K]) {
      setProfil((prev) => ({
        ...prev,
        [abschnitt]: { ...prev[abschnitt], [feld]: wert },
      }));
    };
  }

  const persoenlichAendern = abschnittAendern("persoenlicheAngaben");
  const qualifikationAendern = abschnittAendern("berufUndQualifikation");
  const faehigkeitenAendern = abschnittAendern("faehigkeitenUndKenntnisse");
  const wunschberufeAendern = abschnittAendern("wunschberufe");
  const jobsucheAendern = abschnittAendern("jobsuche");
  const arbeitszeitAendern = abschnittAendern("arbeitszeit");
  const gehaltAendern = abschnittAendern("gehalt");
  const ausschlussAendern = abschnittAendern("ausschlusskriterien");
  const kiAendern = abschnittAendern("kiSuchpraeferenzen");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Profil</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Dieses Bewerber- und Job-Suchprofil bildet die Grundlage für den
          Match-Prozent-Wert bei Jobs, für automatisch erstellte Anschreiben
          und später für KI-Matching sowie die automatische Stellensuche.
        </p>
      </div>

      <Card className="flex items-start gap-3 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
          <Info size={16} aria-hidden="true" />
        </span>
        <p className="text-sm text-navy-900/70">
          Diese Angaben werden automatisch in deinem Browser gespeichert und
          bleiben auch nach dem Neuladen der Seite erhalten. Es werden keine
          Daten an einen Server gesendet.
        </p>
      </Card>

      <CollapsibleCard title="Persönliche Angaben">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">Name</span>
            <input
              type="text"
              value={profil.persoenlicheAngaben.vollerName}
              onChange={(e) => persoenlichAendern("vollerName", e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">Beruf</span>
            <input
              type="text"
              value={profil.persoenlicheAngaben.beruf}
              onChange={(e) => persoenlichAendern("beruf", e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">Standort</span>
            <input
              type="text"
              value={profil.persoenlicheAngaben.standort}
              onChange={(e) => persoenlichAendern("standort", e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">E-Mail</span>
            <input
              type="email"
              value={profil.persoenlicheAngaben.email}
              onChange={(e) => persoenlichAendern("email", e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-navy-900">Telefon</span>
            <input
              type="tel"
              value={profil.persoenlicheAngaben.telefon}
              onChange={(e) => persoenlichAendern("telefon", e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-navy-900">Über mich</span>
            <textarea
              value={profil.persoenlicheAngaben.ueberMich}
              onChange={(e) => persoenlichAendern("ueberMich", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Beruf & Qualifikation">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">
              Berufserfahrung (Jahre)
            </span>
            <input
              type="number"
              min={0}
              value={profil.berufUndQualifikation.berufserfahrungJahre}
              onChange={(e) =>
                qualifikationAendern("berufserfahrungJahre", Number(e.target.value))
              }
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">
              Ausbildung / Qualifikation
            </span>
            <input
              type="text"
              value={profil.berufUndQualifikation.ausbildung}
              onChange={(e) => qualifikationAendern("ausbildung", e.target.value)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <div className="sm:col-span-2">
            <Checkbox
              label="Führerschein vorhanden"
              checked={profil.berufUndQualifikation.fuehrerschein}
              onChange={(checked) => qualifikationAendern("fuehrerschein", checked)}
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Fähigkeiten & Kenntnisse">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Fähigkeiten
            </span>
            <TagInput
              values={profil.faehigkeitenUndKenntnisse.faehigkeiten}
              onChange={(werte) => faehigkeitenAendern("faehigkeiten", werte)}
              placeholder="Fähigkeit hinzufügen …"
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Kenntnisse
            </span>
            <TagInput
              values={profil.faehigkeitenUndKenntnisse.kenntnisse}
              onChange={(werte) => faehigkeitenAendern("kenntnisse", werte)}
              placeholder="Kenntnis hinzufügen …"
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Sprachen
            </span>
            <TagInput
              values={profil.faehigkeitenUndKenntnisse.sprachen}
              onChange={(werte) => faehigkeitenAendern("sprachen", werte)}
              placeholder="Sprache hinzufügen …"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Wunschberufe">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Wunschberufe
            </span>
            <TagInput
              values={profil.wunschberufe.wunschjobs}
              onChange={(werte) => wunschberufeAendern("wunschjobs", werte)}
              placeholder="Wunschberuf hinzufügen …"
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Alternative / ähnliche Berufe
            </span>
            <TagInput
              values={profil.wunschberufe.alternativeBerufe}
              onChange={(werte) => wunschberufeAendern("alternativeBerufe", werte)}
              placeholder="Alternativen Beruf hinzufügen …"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Jobsuche" description="Wo und wie du arbeiten möchtest">
        <div className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Wunschorte
            </span>
            <TagInput
              values={profil.jobsuche.wunschorte}
              onChange={(werte) => jobsucheAendern("wunschorte", werte)}
              placeholder="Ort hinzufügen …"
            />
          </div>

          <label className="block text-sm sm:max-w-xs">
            <span className="mb-1 block font-medium text-navy-900">
              Maximaler Suchradius (km)
            </span>
            <input
              type="number"
              min={0}
              step={5}
              value={profil.jobsuche.suchradiusKm}
              onChange={(e) => jobsucheAendern("suchradiusKm", Number(e.target.value))}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Remote erlaubt"
              checked={profil.jobsuche.remoteErlaubt}
              onChange={(checked) => jobsucheAendern("remoteErlaubt", checked)}
            />
            <Checkbox
              label="Hybrid erlaubt"
              checked={profil.jobsuche.hybridErlaubt}
              onChange={(checked) => jobsucheAendern("hybridErlaubt", checked)}
            />
            <Checkbox
              label="Vor Ort erlaubt"
              checked={profil.jobsuche.vorOrtErlaubt}
              onChange={(checked) => jobsucheAendern("vorOrtErlaubt", checked)}
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Arbeitszeit">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Vollzeit"
              checked={profil.arbeitszeit.vollzeit}
              onChange={(checked) => arbeitszeitAendern("vollzeit", checked)}
            />
            <Checkbox
              label="Teilzeit"
              checked={profil.arbeitszeit.teilzeit}
              onChange={(checked) => arbeitszeitAendern("teilzeit", checked)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Schichtarbeit akzeptieren"
              checked={profil.arbeitszeit.schichtarbeitAkzeptieren}
              onChange={(checked) =>
                arbeitszeitAendern("schichtarbeitAkzeptieren", checked)
              }
            />
            <Checkbox
              label="Wochenendarbeit akzeptieren"
              checked={profil.arbeitszeit.wochenendarbeitAkzeptieren}
              onChange={(checked) =>
                arbeitszeitAendern("wochenendarbeitAkzeptieren", checked)
              }
            />
            <Checkbox
              label="Befristete Stellen akzeptieren"
              checked={profil.arbeitszeit.befristeteStellenAkzeptieren}
              onChange={(checked) =>
                arbeitszeitAendern("befristeteStellenAkzeptieren", checked)
              }
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Gehalt">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">
              Mindestgehalt (€)
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={profil.gehalt.mindestgehalt}
              onChange={(e) => gehaltAendern("mindestgehalt", Number(e.target.value))}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">
              Wunschgehalt (€)
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={profil.gehalt.wunschgehalt}
              onChange={(e) => gehaltAendern("wunschgehalt", Number(e.target.value))}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-900">Zeitraum</span>
            <select
              value={profil.gehalt.zeitraum}
              onChange={(e) => gehaltAendern("zeitraum", e.target.value as Gehaltszeitraum)}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            >
              {zeitraeume.map((zeitraum) => (
                <option key={zeitraum} value={zeitraum}>
                  {zeitraum}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="Ausschlusskriterien"
        description="Was bei der Jobsuche später ausgeschlossen werden soll"
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <span className="mb-2 block text-sm font-medium text-navy-900">
                Auszuschließende Berufe
              </span>
              <TagInput
                values={profil.ausschlusskriterien.auszuschliessendeBerufe}
                onChange={(werte) => ausschlussAendern("auszuschliessendeBerufe", werte)}
                placeholder="Beruf hinzufügen …"
              />
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-navy-900">
                Auszuschließende Branchen
              </span>
              <TagInput
                values={profil.ausschlusskriterien.auszuschliessendeBranchen}
                onChange={(werte) => ausschlussAendern("auszuschliessendeBranchen", werte)}
                placeholder="Branche hinzufügen …"
              />
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-navy-900">
                Auszuschließende Suchbegriffe
              </span>
              <TagInput
                values={profil.ausschlusskriterien.auszuschliessendeSuchbegriffe}
                onChange={(werte) =>
                  ausschlussAendern("auszuschliessendeSuchbegriffe", werte)
                }
                placeholder="Suchbegriff hinzufügen …"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Schichtarbeit grundsätzlich ausschließen"
              checked={profil.ausschlusskriterien.schichtarbeitAusschliessen}
              onChange={(checked) =>
                ausschlussAendern("schichtarbeitAusschliessen", checked)
              }
            />
            <Checkbox
              label="Wochenendarbeit grundsätzlich ausschließen"
              checked={profil.ausschlusskriterien.wochenendarbeitAusschliessen}
              onChange={(checked) =>
                ausschlussAendern("wochenendarbeitAusschliessen", checked)
              }
            />
            <Checkbox
              label="Befristete Stellen grundsätzlich ausschließen"
              checked={profil.ausschlusskriterien.befristeteStellenAusschliessen}
              onChange={(checked) =>
                ausschlussAendern("befristeteStellenAusschliessen", checked)
              }
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        title="KI-Suchpräferenzen"
        description="Regeln für das spätere KI-Matching bei der Stellensuche"
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Quereinsteiger-Stellen berücksichtigen"
              checked={profil.kiSuchpraeferenzen.quereinsteigerBeruecksichtigen}
              onChange={(checked) =>
                kiAendern("quereinsteigerBeruecksichtigen", checked)
              }
            />
            <Checkbox
              label="Ähnliche Berufe berücksichtigen"
              checked={profil.kiSuchpraeferenzen.aehnlicheBerufeBeruecksichtigen}
              onChange={(checked) =>
                kiAendern("aehnlicheBerufeBeruecksichtigen", checked)
              }
            />
            <Checkbox
              label="Stellen mit ähnlichen Tätigkeiten berücksichtigen"
              checked={profil.kiSuchpraeferenzen.aehnlicheTaetigkeitenBeruecksichtigen}
              onChange={(checked) =>
                kiAendern("aehnlicheTaetigkeitenBeruecksichtigen", checked)
              }
            />
            <Checkbox
              label="Stellen mit einzelnen fehlenden Anforderungen trotzdem vorschlagen"
              checked={profil.kiSuchpraeferenzen.trotzFehlenderAnforderungenVorschlagen}
              onChange={(checked) =>
                kiAendern("trotzFehlenderAnforderungenVorschlagen", checked)
              }
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-navy-900">
              Was ist mir bei einem Job besonders wichtig? (Reihenfolge = Priorität)
            </span>
            <PrioritaetenAuswahl
              ausgewaehlt={profil.kiSuchpraeferenzen.prioritaeten}
              onChange={(werte) => kiAendern("prioritaeten", werte)}
            />
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
