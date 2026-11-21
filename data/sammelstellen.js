// =========================================================
// Abgabestellen: wo man welchen Abfall hinbringen kann
// Quellen und Details: notizen/recherche-entsorgung.md
//
// Diese Datei darfst du gerne von Hand ergänzen!
//
//   name     Name der Stelle
//   ort      Adresse oder kurze Ortsangabe
//   zeiten   Öffnungszeiten
//   kosten   "gratis", ein Preis als Text, oder pro Abfallart:
//            { standard: "mit Gebühr", sonderabfall: "gratis bis 30 kg" }
//            (Texte, die mit "gratis" beginnen, erscheinen zuoberst)
//   annahme  Liste der Abfallarten (Kurzbezeichnungen aus abfallarten.js)
//   link     Webseite (optional)
// =========================================================

window.SAMMELSTELLEN = [

  // ----- Stadt Schaffhausen -----

  {
    name: "Quartier-Sammelstellen (24 in der Stadt)",
    ort: "z.B. Viehmarkt (Hochstrasse 15), Wagenareal (Wagenstrasse 8), Unterstadt (Quaistrasse 11)",
    zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen",
    kosten: "gratis",
    annahme: ["glas", "alu", "batterien", "oel"],
    link: "https://m.stadt-schaffhausen.ch/index.php?apid=1493269045",
  },
  {
    name: "Unterflurcontainer (15 Standorte, v.a. Altstadt)",
    ort: "z.B. Münsterplatz, Kirchhofplatz, Oberstadt, Munot",
    zeiten: "rund um die Uhr",
    kosten: "gratis (nur im Böcklisack)",
    annahme: ["hauskehricht"],
    link: "https://m.stadt-schaffhausen.ch/index.php?apid=758656457",
  },
  {
    name: "Karton-Presscontainer Viehmarkt",
    ort: "Hochstrasse 15",
    zeiten: "Mo–Fr 10–11 und 16–17 Uhr, Sa 8.30–12 Uhr",
    kosten: "gratis",
    annahme: ["karton"],
    link: "https://m.stadt-schaffhausen.ch/index.php?apid=772863702",
  },
  {
    name: "Inertstoffe Viehmarkt",
    ort: "Hochstrasse 15",
    zeiten: "Mo–Fr 10–11 und 16–17 Uhr, Sa 8.30–12 Uhr",
    kosten: "nur Kleinmengen",
    annahme: ["inert"],
    link: "https://m.stadt-schaffhausen.ch/index.php?apid=1493269045",
  },
  {
    name: "SRK / koro Second Hand",
    ort: "Oberstadt 13",
    zeiten: "Di–Fr 10–18 Uhr, Sa 10–12 und 12.30–16 Uhr",
    kosten: "gratis",
    annahme: ["altkleider"],
    link: "https://m.stadt-schaffhausen.ch/index.php?apid=1079284927",
  },
  {
    name: "Altkleidercontainer",
    ort: "z.B. bei Coop-Filialen",
    zeiten: "",
    kosten: "gratis",
    annahme: ["altkleider"],
  },

  // ----- Geschäfte -----

  {
    name: "Verkaufsstellen",
    ort: "Geschäfte, die solche Produkte verkaufen",
    zeiten: "zu den Ladenöffnungszeiten",
    kosten: "gratis",
    annahme: ["pet", "elektro", "batterien", "leuchtmittel"],
  },
  {
    name: "Apotheke, Drogerie, Farbengeschäft",
    ort: "",
    zeiten: "zu den Ladenöffnungszeiten",
    kosten: "gratis (Kleinmengen)",
    annahme: ["sonderabfall"],
  },
  {
    name: "Nespresso, Migros, einige Coop",
    ort: "Sammelbehälter im Laden",
    zeiten: "zu den Ladenöffnungszeiten",
    kosten: "gratis",
    annahme: ["kapseln"],
  },
  {
    name: "RecyBag – Coop, Denner, Spar, Lidl",
    ort: "Sammelbox im Laden",
    zeiten: "zu den Ladenöffnungszeiten",
    kosten: "Sack ab Fr. 1.–",
    annahme: ["plastik"],
    link: "https://www.recybag.ch",
  },

  // ----- Region -----

  {
    name: "KBA Hard",
    ort: "Hardweg 340, 8222 Beringen · 052 687 21 00",
    zeiten: "Mo–Fr 7.15–11.45 und 13–17 Uhr, Sa 9–12 Uhr",
    kosten: {
      standard: "teils mit Gebühr",
      sonderabfall: "gratis bis 30 kg pro Person",
      hauskehricht: "Fr. 26.90 pro 100 kg, mind. Fr. 10.–",
      plastik: "Sammelsack: 10 Stück Fr. 23.–",
      sperrgut: "mit Gebühr",
      gruenabfall: "mit Gebühr",
      inert: "mit Gebühr, auch grössere Mengen",
    },
    annahme: ["sonderabfall", "hauskehricht", "plastik", "sperrgut", "gruenabfall", "inert",
              "altmetall", "karton", "glas", "alu", "pet", "elektro", "batterien", "leuchtmittel", "altkleider"],
    link: "https://www.abfall-sh.ch/kba/content/preisliste/",
  },
  {
    name: "Arnold Schmid Recycling AG",
    ort: "Hardmorgenweg 15, 8222 Beringen · 052 644 07 77",
    zeiten: "Mo–Fr 7.10–11.50 und 13–16.50 Uhr, Sa 8.30–12 Uhr",
    kosten: {
      standard: "",
      sonderabfall: "mit Gebühr",
      sperrgut: "mit Gebühr",
      gruenabfall: "mit Gebühr",
      inert: "mit Gebühr",
    },
    annahme: ["sonderabfall", "plastik", "sperrgut", "gruenabfall", "inert", "altmetall", "karton",
              "glas", "alu", "pet", "elektro", "batterien", "leuchtmittel", "altkleider", "oel"],
  },
  {
    name: "TIT Imhof AG",
    ort: "Kaltenbacherstrasse 40, Stein am Rhein · 052 742 09 09",
    zeiten: "Öffnungszeiten telefonisch erfragen",
    kosten: "gratis bis 30 kg pro Person",
    annahme: ["sonderabfall"],
  },
];
