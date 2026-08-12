"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Check, ExternalLink, Info, MapPin, Search } from "lucide-react";
import { profil as initialProfil } from "@/data/profil";
import { berechneMatch } from "@/lib/matching";
import { ladeGespeichertesProfil } from "@/lib/profilStorage";
import {
  bewerbungExistiertFuerJob,
  erzeugeBewerbungAusJob,
  ladeGespeicherteBewerbungen,
  speichereBewerbungen,
} from "@/lib/bewerbungenStorage";
import { sucheJobsServerseitig } from "@/lib/jobImport/sucheJobsServerseitig";
import { holeKategorienServerseitig } from "@/lib/jobImport/holeKategorienServerseitig";
import type { AdzunaKategorie } from "@/lib/jobImport/adapters/adzuna";
import { ArbeitsModell, Job, Profil } from "@/types";
import { Card } from "@/components/ui/Card";
import { MatchBadge } from "@/components/ui/Badge";
import { formatDatum, formatGehaltsspanne } from "@/lib/format";
import { cn } from "@/lib/utils";

type ArbeitsmodellFilter = "Alle" | ArbeitsModell;
type MatchFilter = "Alle" | "Ab 60%" | "Ab 80%";

const arbeitsmodellOptionen: ArbeitsmodellFilter[] = [
  "Alle",
  "Remote",
  "Hybrid",
  "Vor Ort",
];

const matchOptionen: MatchFilter[] = ["Alle", "Ab 60%", "Ab 80%"];

const SUCHE_DEBOUNCE_MS = 400;
const SUCHE_MINDESTLAENGE = 2;

interface JobsContentProps {
  jobs: Job[];
  hinweis?: string;
}

export function JobsContent({ jobs, hinweis }: JobsContentProps) {
  const [suche, setSuche] = useState("");
  const [standort, setStandort] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [kategorien, setKategorien] = useState<AdzunaKategorie[]>([]);
  const [arbeitsmodell, setArbeitsmodell] = useState<ArbeitsmodellFilter>("Alle");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("Alle");
  const [profil, setProfil] = useState<Profil>(initialProfil);
  const [vorgemerkteJobIds, setVorgemerkteJobIds] = useState<Set<string>>(new Set());

  // Aktuell angezeigte Jobs: entweder die ursprünglichen 25 (bzw. Beispiel-)
  // Jobs aus dem initialen serverseitigen Aufruf, oder das Ergebnis einer
  // aktiven Live-Suche. Die ursprüngliche `jobs`-Prop bleibt dabei
  // unangetastet - bei leerer Suche wird einfach wieder zu ihr zurückgekehrt.
  const [angezeigteJobs, setAngezeigteJobs] = useState<Job[]>(jobs);
  const [aktuellerHinweis, setAktuellerHinweis] = useState<string | undefined>(hinweis);
  const [istServerSuche, setIstServerSuche] = useState(false);
  const [suchtGerade, setSuchtGerade] = useState(false);

  useEffect(() => {
    const gespeichert = ladeGespeichertesProfil();
    if (gespeichert) {
      setProfil(gespeichert);
    }
  }, []);

  // Bereits als Bewerbung vorgemerkte Jobs einmalig beim Mount aus dem
  // localStorage laden, damit der Button-Zustand auch nach einem Reload
  // korrekt "Bereits vorgemerkt" anzeigt (siehe bewerbungenStorage.ts).
  useEffect(() => {
    const gespeichert = ladeGespeicherteBewerbungen() ?? [];
    setVorgemerkteJobIds(new Set(gespeichert.map((b) => b.jobId)));
  }, []);

  // Kategorienliste einmalig beim Mount laden (kein Freitext, daher kein
  // Debounce nötig - die Liste ändert sich während einer Sitzung nicht).
  // Fehler jeder Art führen serverseitig bereits zu einer leeren Liste
  // (siehe holeKategorienServerseitig) - hier keine zusätzliche Fehlerbehandlung
  // nötig, das Dropdown zeigt in diesem Fall lediglich nur "Alle Kategorien".
  useEffect(() => {
    let abgebrochen = false;

    holeKategorienServerseitig().then((ergebnis) => {
      if (!abgebrochen) {
        setKategorien(ergebnis.kategorien);
      }
    });

    return () => {
      abgebrochen = true;
    };
  }, []);

  // Debounced Live-Suche: Suchbegriff, Standort und Kategorie sind
  // unabhängig voneinander optional und beliebig kombinierbar. Nur wenn
  // ALLE DREI leer/zu kurz bzw. nicht ausgewählt sind, wird zur
  // ursprünglichen Job-Liste zurückgekehrt (kein Adzuna-Aufruf). Sonst wird
  // nach einer kurzen Tipppause gezielt bei Adzuna gesucht.
  useEffect(() => {
    const begriff = suche.trim();
    const ort = standort.trim();
    const kategorieTag = kategorie.trim();
    const begriffAktiv = begriff.length >= SUCHE_MINDESTLAENGE;
    const ortAktiv = ort.length >= SUCHE_MINDESTLAENGE;
    const kategorieAktiv = kategorieTag.length > 0;

    if (!begriffAktiv && !ortAktiv && !kategorieAktiv) {
      setAngezeigteJobs(jobs);
      setAktuellerHinweis(hinweis);
      setIstServerSuche(false);
      setSuchtGerade(false);
      return;
    }

    setSuchtGerade(true);
    const timeoutId = setTimeout(() => {
      let abgebrochen = false;

      sucheJobsServerseitig(
        begriffAktiv ? begriff : "",
        ortAktiv ? ort : "",
        kategorieAktiv ? kategorieTag : ""
      ).then((ergebnis) => {
        // Race-Schutz: Ergebnis nur übernehmen, wenn sich Suchbegriff/
        // Standort/Kategorie zwischenzeitlich nicht schon wieder geändert haben.
        if (
          abgebrochen ||
          suche.trim() !== begriff ||
          standort.trim() !== ort ||
          kategorie.trim() !== kategorieTag
        ) {
          return;
        }
        setAngezeigteJobs(ergebnis.jobs);
        setAktuellerHinweis(ergebnis.hinweis);
        setIstServerSuche(true);
        setSuchtGerade(false);
      });

      return () => {
        abgebrochen = true;
      };
    }, SUCHE_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suche, standort, kategorie]);

  const berechneteMatches = useMemo(() => {
    const werte = new Map<string, number>();
    for (const job of angezeigteJobs) {
      werte.set(job.id, berechneMatch(job, profil));
    }
    return werte;
  }, [angezeigteJobs, profil]);

  const gefilterteJobs = useMemo(() => {
    const suchbegriff = suche.trim().toLowerCase();
    const mindestMatch =
      matchFilter === "Ab 80%" ? 80 : matchFilter === "Ab 60%" ? 60 : 0;

    return angezeigteJobs
      .filter((job) => {
        // Bei einer aktiven Server-Suche hat Adzuna bereits nach Begriff/
        // Standort gefiltert (auch in Feldern wie der Beschreibung, die der
        // clientseitige Text-Filter gar nicht durchsucht) - ein erneutes
        // Herausfiltern hier würde sonst korrekte Treffer wieder verstecken.
        const passtSuche =
          istServerSuche ||
          suchbegriff.length === 0 ||
          job.titel.toLowerCase().includes(suchbegriff) ||
          job.unternehmen.toLowerCase().includes(suchbegriff) ||
          job.standort.toLowerCase().includes(suchbegriff) ||
          job.tags.some((tag) => tag.toLowerCase().includes(suchbegriff));

        const parstArbeitsmodell =
          arbeitsmodell === "Alle" || job.arbeitsmodell === arbeitsmodell;

        const jobMatch = berechneteMatches.get(job.id) ?? job.matchProzent;
        const parstMatch = jobMatch >= mindestMatch;

        return passtSuche && parstArbeitsmodell && parstMatch;
      })
      .sort((a, b) => {
        const matchA = berechneteMatches.get(a.id) ?? a.matchProzent;
        const matchB = berechneteMatches.get(b.id) ?? b.matchProzent;
        return matchB - matchA;
      });
  }, [angezeigteJobs, suche, arbeitsmodell, matchFilter, berechneteMatches, istServerSuche]);

  // Übernimmt einen Job als neue Bewerbung mit Status "Interessant".
  // Liest den aktuellen Stand bewusst frisch aus dem localStorage (nicht aus
  // einem eigenen Bewerbungen-State), da JobsContent und BewerbungenContent
  // unabhängige Routen ohne gemeinsamen React-State sind - localStorage ist
  // der einzige Kommunikationskanal zwischen beiden.
  function bewerbungVorbereiten(job: Job) {
    const bestehende = ladeGespeicherteBewerbungen() ?? [];

    if (bewerbungExistiertFuerJob(job.id, bestehende)) {
      setVorgemerkteJobIds((prev) => new Set(prev).add(job.id));
      return;
    }

    const matchProzent = berechneteMatches.get(job.id) ?? job.matchProzent;
    const neueBewerbung = erzeugeBewerbungAusJob(job, matchProzent);
    speichereBewerbungen([...bestehende, neueBewerbung]);
    setVorgemerkteJobIds((prev) => new Set(prev).add(job.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Jobs</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Durchsuche die gefundenen Stellenangebote und filtere nach deinen
          Wünschen.
        </p>
      </div>

      {aktuellerHinweis && (
        <Card className="flex items-start gap-3 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <Info size={16} aria-hidden="true" />
          </span>
          <p className="text-sm text-navy-900/70">{aktuellerHinweis}</p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row md:max-w-2xl">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40"
                aria-hidden="true"
              />
              <input
                type="search"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Suche nach Titel, Unternehmen, Ort oder Tag …"
                className="w-full rounded-lg border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-navy-900/40 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <div className="relative w-full sm:max-w-[220px]">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40"
                aria-hidden="true"
              />
              <input
                type="search"
                value={standort}
                onChange={(e) => setStandort(e.target.value)}
                placeholder="Standort …"
                className="w-full rounded-lg border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-navy-900/40 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <div className="relative w-full sm:max-w-[220px]">
              <select
                value={kategorie}
                onChange={(e) => setKategorie(e.target.value)}
                className="w-full rounded-lg border border-navy-100 bg-white py-2 px-3 text-sm text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              >
                <option value="">Alle Kategorien</option>
                {kategorien.map((option) => (
                  <option key={option.tag} value={option.tag}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg border border-navy-100 p-1">
              {arbeitsmodellOptionen.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setArbeitsmodell(option)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    arbeitsmodell === option
                      ? "bg-navy-900 text-white"
                      : "text-navy-900/60 hover:bg-navy-100/60"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border border-navy-100 p-1">
              {matchOptionen.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMatchFilter(option)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    matchFilter === option
                      ? "bg-accent-500 text-navy-950"
                      : "text-navy-900/60 hover:bg-navy-100/60"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <p className="text-sm text-navy-900/60">
        {suchtGerade
          ? "Suche läuft …"
          : `${gefilterteJobs.length} ${gefilterteJobs.length === 1 ? "Job gefunden" : "Jobs gefunden"}`}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {gefilterteJobs.map((job) => {
          const istVorgemerkt = vorgemerkteJobIds.has(job.id);

          return (
            <Card key={job.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-navy-900">
                      {job.titel}
                    </h2>
                    {job.neu && (
                      <span className="shrink-0 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-600">
                        Neu
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-navy-900/70">
                    {job.unternehmen} · {job.standort}
                  </p>
                </div>
                <MatchBadge prozent={berechneteMatches.get(job.id) ?? job.matchProzent} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-navy-900/60">
                <span className="rounded-full bg-navy-100 px-2.5 py-1 text-navy-700">
                  {job.arbeitsmodell}
                </span>
                <span>{formatGehaltsspanne(job.gehaltVon, job.gehaltBis)}</span>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-navy-900/70">
                {job.beschreibung}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-navy-100 px-2 py-0.5 text-[11px] text-navy-900/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3 text-xs text-navy-900/50">
                <span>
                  {job.quelle} · veröffentlicht am {formatDatum(job.veroeffentlichtAm)}
                </span>
                <a
                  href={job.quelleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-accent-600 hover:text-accent-500"
                >
                  Quelle öffnen
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>

              <button
                type="button"
                disabled={istVorgemerkt}
                onClick={() => bewerbungVorbereiten(job)}
                className={cn(
                  "mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  istVorgemerkt
                    ? "cursor-default bg-emerald-100 text-emerald-700"
                    : "bg-navy-900 text-white hover:bg-navy-900/90"
                )}
              >
                {istVorgemerkt ? (
                  <>
                    <Check size={14} aria-hidden="true" />
                    Als Bewerbung vorgemerkt
                  </>
                ) : (
                  <>
                    <Briefcase size={14} aria-hidden="true" />
                    Bewerbung vorbereiten
                  </>
                )}
              </button>
            </Card>
          );
        })}

        {gefilterteJobs.length === 0 && (
          <Card className="col-span-full p-8 text-center text-sm text-navy-900/50">
            Keine Jobs gefunden. Passe deine Suche oder Filter an.
          </Card>
        )}
      </div>
    </div>
  );
}
