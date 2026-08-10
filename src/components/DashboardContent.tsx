import Link from "next/link";
import { Briefcase, CheckSquare, ClipboardList, ArrowRight } from "lucide-react";
import { jobs } from "@/data/jobs";
import { bewerbungen } from "@/data/bewerbungen";
import { naechsteAufgaben } from "@/data/aufgaben";
import { BEWERBUNGS_STATI } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { MatchBadge } from "@/components/ui/Badge";
import { formatDatum } from "@/lib/format";
import { statusStile } from "@/lib/status";
import { cn } from "@/lib/utils";

export function DashboardContent() {
  const neueJobs = jobs.filter((job) => job.neu);
  const offeneBewerbungen = bewerbungen.filter((b) => b.status !== "Absage");
  const offeneAufgaben = naechsteAufgaben
    .filter((a) => !a.erledigt)
    .sort((a, b) => a.faelligAm.localeCompare(b.faelligAm));

  const statusZaehlung = BEWERBUNGS_STATI.map((status) => ({
    status,
    anzahl: bewerbungen.filter((b) => b.status === status).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Willkommen zurück! Hier ist deine Übersicht über neue Jobs, offene
          Bewerbungen und anstehende Aufgaben.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Neue Jobs"
          value={neueJobs.length}
          hinweis="Seit deinem letzten Besuch"
          icon={Briefcase}
        />
        <StatCard
          label="Offene Bewerbungen"
          value={offeneBewerbungen.length}
          hinweis="Noch in Bearbeitung"
          icon={ClipboardList}
        />
        <StatCard
          label="Anstehende Aufgaben"
          value={offeneAufgaben.length}
          hinweis="Noch nicht erledigt"
          icon={CheckSquare}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Neue Jobs"
            description="Zuletzt gefundene Stellen mit hoher Übereinstimmung"
            action={
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-500"
              >
                Alle Jobs
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="divide-y divide-navy-100">
            {neueJobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-900">{job.titel}</p>
                  <p className="truncate text-xs text-navy-900/60">
                    {job.unternehmen} · {job.standort}
                  </p>
                </div>
                <MatchBadge prozent={job.matchProzent} />
              </li>
            ))}
            {neueJobs.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-navy-900/50">
                Aktuell keine neuen Jobs.
              </li>
            )}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Nächste Aufgaben"
            description="Was als Nächstes ansteht"
            action={
              <Link
                href="/bewerbungen"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-500"
              >
                Bewerbungen
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="divide-y divide-navy-100">
            {offeneAufgaben.slice(0, 6).map((aufgabe) => (
              <li key={aufgabe.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-navy-900">{aufgabe.titel}</p>
                  <span className="shrink-0 text-xs text-navy-900/50">
                    {formatDatum(aufgabe.faelligAm)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-navy-900/60">{aufgabe.beschreibung}</p>
              </li>
            ))}
            {offeneAufgaben.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-navy-900/50">
                Keine offenen Aufgaben.
              </li>
            )}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Bewerbungen im Überblick"
          description="Anzahl der Bewerbungen je Status"
        />
        <div className="flex flex-wrap gap-3 px-5 py-4">
          {statusZaehlung.map(({ status, anzahl }) => (
            <Link
              key={status}
              href="/bewerbungen"
              className="flex items-center gap-2 rounded-lg border border-navy-100 px-3 py-2 hover:bg-navy-100/40"
            >
              <span className={cn("h-2 w-2 rounded-full", statusStile[status].dot)} />
              <span className="text-sm text-navy-900">{status}</span>
              <span className="text-sm font-semibold text-navy-900">{anzahl}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
