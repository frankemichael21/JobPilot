import { Quelle } from "@/types";

// Beispielhafte Übersicht möglicher Quellen für die spätere automatische Stellensuche.
// Alle Einträge sind zunächst deaktiviert (aktiv: false) und dienen nur der Vorschau.
export const quellen: Quelle[] = [
  { id: "q-1", name: "StepStone", typ: "Jobbörse", aktiv: false },
  { id: "q-2", name: "Indeed", typ: "Jobbörse", aktiv: false },
  { id: "q-3", name: "LinkedIn Jobs", typ: "Jobbörse", aktiv: false },
  { id: "q-4", name: "Unternehmens-Karriereseiten (allgemein)", typ: "Unternehmens-Karriereseite", aktiv: false },
  { id: "q-5", name: "Öffentliche Job-APIs", typ: "API", aktiv: false },
  { id: "q-6", name: "RSS-Feeds von Karriereseiten", typ: "RSS-Feed", aktiv: false },
];
