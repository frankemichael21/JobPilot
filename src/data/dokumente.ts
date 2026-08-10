import { AnschreibenFelder, Dokument } from "@/types";

export const dokumente: Dokument[] = [
  {
    id: "dok-1",
    kategorie: "Lebenslauf",
    name: "Lebenslauf 2026",
    dateiname: "lebenslauf-2026.pdf",
    aktualisiertAm: "2026-07-15",
    vorhanden: true,
  },
  {
    id: "dok-2",
    kategorie: "Anschreiben",
    name: "Anschreiben Nordlicht Digital GmbH",
    dateiname: "anschreiben-nordlicht-digital.pdf",
    aktualisiertAm: "2026-08-07",
    vorhanden: true,
  },
  {
    id: "dok-3",
    kategorie: "Zeugnis",
    name: "Arbeitszeugnis – letzter Arbeitgeber",
    vorhanden: false,
  },
  {
    id: "dok-4",
    kategorie: "Zeugnis",
    name: "Abschlusszeugnis Studium",
    vorhanden: false,
  },
];

// Beispiel für ein editierbares Anschreiben mit separaten Feldern
export const anschreibenBeispiel: AnschreibenFelder = {
  empfaengerFirma: "Nordlicht Digital GmbH",
  firmenadresse: "Hafenstraße 12, 20457 Hamburg",
  ansprechpartner: "Frau Julia Nordmann",
  datum: "2026-08-09",
  betreff: "Bewerbung als Frontend-Entwicklerin (m/w/d) React",
  anrede: "Sehr geehrte Frau Nordmann,",
  text:
    "mit großem Interesse habe ich Ihre Stellenanzeige für die Position als Frontend-Entwicklerin gelesen. " +
    "Durch meine bisherige Erfahrung mit React, TypeScript und modernen Frontend-Architekturen bringe ich " +
    "die passenden Voraussetzungen mit, um Ihr Team tatkräftig zu unterstützen.\n\n" +
    "[Hier folgt der individuelle Haupttext des Anschreibens.]\n\n" +
    "Über die Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.",
};
