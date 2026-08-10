import { Mail, Sparkles, Search, ShieldCheck, Rss } from "lucide-react";
import { quellen } from "@/data/quellen";
import { Card, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";

function VorbereiteterBereich({
  icon: Icon,
  titel,
  beschreibung,
  hinweis,
  children,
}: {
  icon: typeof Mail;
  titel: string;
  beschreibung: string;
  hinweis: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="opacity-90">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <Icon size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-navy-900">{titel}</h3>
            <p className="mt-0.5 text-sm text-navy-900/60">{beschreibung}</p>
          </div>
        </div>
        <Toggle checked={false} />
      </div>

      {children && <div className="border-t border-navy-100 px-5 py-4">{children}</div>}

      <div className="border-t border-navy-100 bg-navy-100/30 px-5 py-3">
        <p className="text-xs text-navy-900/50">{hinweis}</p>
      </div>
    </Card>
  );
}

export function EinstellungenContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Einstellungen</h1>
        <p className="mt-1 text-sm text-navy-900/60">
          Diese Bereiche sind bereits vorbereitet, aber noch nicht aktiv. Du
          entscheidest später selbst, wann sie eingeschaltet werden.
        </p>
      </div>

      <Card className="flex items-start gap-3 border-accent-500/30 bg-accent-100/40 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-accent-600">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-navy-900">
            Einzelfreigabe vor jedem Versand
          </p>
          <p className="mt-0.5 text-sm text-navy-900/70">
            Auch wenn automatische Funktionen aktiviert werden, wird niemals
            automatisch eine Bewerbung verschickt. Jede Bewerbung muss vor dem
            Versand einzeln von dir ausdrücklich freigegeben werden. Diese
            Regel ist fest hinterlegt und nicht abschaltbar.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <VorbereiteterBereich
          icon={Mail}
          titel="Gmail-Verbindung"
          beschreibung="Erkennt automatisch Antworten und Einladungen zu Bewerbungen in deinem Postfach."
          hinweis="Noch nicht verfügbar – es besteht aktuell keine Verbindung zu einem E-Mail-Konto."
        />

        <VorbereiteterBereich
          icon={Sparkles}
          titel="KI-Unterstützung"
          beschreibung="Unterstützt beim Formulieren von Anschreiben und beim Berechnen des Match-Prozent-Werts."
          hinweis="Noch nicht verfügbar – es ist aktuell kein API-Schlüssel hinterlegt."
        />
      </div>

      <VorbereiteterBereich
        icon={Search}
        titel="Tägliche Stellensuche"
        beschreibung="Durchsucht täglich automatisch alle aktivierten Quellen nach neuen, passenden Jobs."
        hinweis="Noch nicht aktiv – es werden aktuell nur lokale Beispieldaten angezeigt."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-navy-900/60">
          <span className="rounded-lg border border-navy-100 px-3 py-1.5">
            Uhrzeit: 08:00 Uhr
          </span>
          <span className="rounded-lg border border-navy-100 px-3 py-1.5">
            Häufigkeit: Täglich
          </span>
        </div>
      </VorbereiteterBereich>

      <Card>
        <CardHeader
          title="Quellen für die Stellensuche"
          description="Jobbörsen, Unternehmens-Karriereseiten, APIs und RSS-Feeds – erweiterbar, sobald die automatische Suche aktiviert wird"
        />
        <ul className="divide-y divide-navy-100">
          {quellen.map((quelle) => (
            <li key={quelle.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
                <Rss size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy-900">{quelle.name}</p>
                <p className="text-xs text-navy-900/50">{quelle.typ}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                  quelle.aktiv
                    ? "bg-accent-100 text-accent-600"
                    : "bg-navy-100 text-navy-900/50"
                )}
              >
                {quelle.aktiv ? "Aktiv" : "Deaktiviert"}
              </span>
              <Toggle checked={quelle.aktiv} />
            </li>
          ))}
        </ul>
        <div className="border-t border-navy-100 px-5 py-3">
          <p className="text-xs text-navy-900/50">
            Weitere Quellen lassen sich hier künftig ergänzen, sobald die
            automatische Stellensuche eingerichtet wird.
          </p>
        </div>
      </Card>
    </div>
  );
}
