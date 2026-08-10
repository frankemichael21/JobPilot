"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Info, Search } from "lucide-react";
import { profil as initialProfil } from "@/data/profil";
import { berechneMatch } from "@/lib/matching";
import { ladeGespeichertesProfil } from "@/lib/profilStorage";
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

interface JobsContentProps {
  jobs: Job[];
  hinweis?: string;
}

export function JobsContent({ jobs, hinweis }: JobsContentProps) {
  const [suche, setSuche] = useState("");
  const [arbeitsmodell, setArbeitsmodell] = useState<ArbeitsmodellFilter>("Alle");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("Alle");
  const [profil, setProfil] = useState<Profil>(initialProfil);

  useEffect(() => {
    const gespeichert = ladeGespeichertesProfil();
    if (gespeichert) {
      setProfil(gespeichert);
    }
  }, []);

  const berechneteMatches = useMemo(() => {
    const werte = new Map<string, number>();
    for (const job of jobs) {
      werte.set(job.id, berechneMatch(job, profil));
    }
    return werte;
  }, [jobs, profil]);

  const gefilterteJobs = useMemo(() => {
    const suchbegriff = suche.trim().toLowerCase();
    const mindestMatch =
      matchFilter === "Ab 80%" ? 80 : matchFilter === "Ab 60%" ? 60 : 0;

    return jobs
      .filter((job) => {
        const passtSuche =
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
  }, [jobs, suche, arbeitsmodell, matchFilter, berechneteMatches]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Jobs</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Durchsuche die gefundenen Stellenangebote und filtere nach deinen
          Wünschen.
        </p>
      </div>

      {hinweis && (
        <Card className="flex items-start gap-3 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <Info size={16} aria-hidden="true" />
          </span>
          <p className="text-sm text-navy-900/70">{hinweis}</p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
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
        {gefilterteJobs.length}{" "}
        {gefilterteJobs.length === 1 ? "Job gefunden" : "Jobs gefunden"}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {gefilterteJobs.map((job) => (
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
          </Card>
        ))}

        {gefilterteJobs.length === 0 && (
          <Card className="col-span-full p-8 text-center text-sm text-navy-900/50">
            Keine Jobs gefunden. Passe deine Suche oder Filter an.
          </Card>
        )}
      </div>
    </div>
  );
}
