import { Profil } from "@/types";

export const profil: Profil = {
  persoenlicheAngaben: {
    vollerName: "Max Mustermann",
    beruf: "Frontend-Entwickler",
    standort: "Hamburg",
    email: "max.mustermann@example.com",
    telefon: "",
    ueberMich:
      "Erfahrener Frontend-Entwickler mit Schwerpunkt auf React, TypeScript und modernen Web-Anwendungen.",
  },

  berufUndQualifikation: {
    berufserfahrungJahre: 4,
    ausbildung: "Ausbildung zum Fachinformatiker für Anwendungsentwicklung",
    fuehrerschein: true,
  },

  faehigkeitenUndKenntnisse: {
    faehigkeiten: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "REST-APIs",
      "Git",
    ],
    kenntnisse: [
      "Agile Arbeitsmethoden",
      "Code-Reviews",
      "Testautomatisierung",
    ],
    sprachen: ["Deutsch (Muttersprache)", "Englisch (fließend)"],
  },

  wunschberufe: {
    wunschjobs: [
      "Frontend-Entwickler (m/w/d)",
      "Fullstack-Entwickler (m/w/d)",
      "Web-Entwickler (m/w/d)",
    ],
    alternativeBerufe: [
      "Junior Webentwickler (m/w/d)",
      "UI-Entwickler (m/w/d)",
      "Technischer Support (m/w/d)",
    ],
  },

  jobsuche: {
    wunschorte: ["Hamburg", "Berlin"],
    suchradiusKm: 50,
    remoteErlaubt: true,
    hybridErlaubt: true,
    vorOrtErlaubt: false,
  },

  arbeitszeit: {
    vollzeit: true,
    teilzeit: false,
    schichtarbeitAkzeptieren: false,
    wochenendarbeitAkzeptieren: false,
    befristeteStellenAkzeptieren: true,
  },

  gehalt: {
    mindestgehalt: 50000,
    wunschgehalt: 62000,
    zeitraum: "Jahr",
  },

  ausschlusskriterien: {
    auszuschliessendeBerufe: ["Call-Center-Agent (m/w/d)"],
    auszuschliessendeBranchen: ["Glücksspiel"],
    auszuschliessendeSuchbegriffe: ["Kaltakquise"],
    schichtarbeitAusschliessen: true,
    wochenendarbeitAusschliessen: true,
    befristeteStellenAusschliessen: false,
  },

  kiSuchpraeferenzen: {
    quereinsteigerBeruecksichtigen: false,
    aehnlicheBerufeBeruecksichtigen: true,
    aehnlicheTaetigkeitenBeruecksichtigen: true,
    trotzFehlenderAnforderungenVorschlagen: true,
    prioritaeten: ["Tätigkeit", "Gehalt", "Remote"],
  },
};
