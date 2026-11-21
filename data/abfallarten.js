// =========================================================
// Abfallarten und Verzeichnis der Gegenstände
// Quelle: Infoseiten im Abfallkalender der Stadt Schaffhausen
// https://m.stadt-schaffhausen.ch/index.php?apid=917954978
// und notizen/recherche-entsorgung.md
//
// Diese Datei darfst du gerne von Hand ergänzen!
// =========================================================

// ---------------------------------------------------------
// ABFALLARTEN
// Jede Abfallart hat eine Kurzbezeichnung (z.B. "papier").
//
//   name             Anzeigename
//   abgeholt         true = wird abgeholt (grün), false = nicht (rot)
//   tour             nach welcher Tour sich die Abholung richtet
//                    (hauskehricht, gruenabfall, papier, karton, altmetall)
//   regelmaessig     true = jede Woche (gross steht der Wochentag)
//                    false = selten (gross steht das nächste Datum)
//   zeit             wird gross unter dem Termin bzw. Ziel angezeigt
//   ziel             nur bei «nicht abgeholt»: gross, wohin damit
//                    (fehlt es, steht «An Sammelstelle entsorgen»)
//   recycling        besser als die Abfuhr: { ziel, zeit } – steht dann zuoberst
//   sammeltermine    feste Daten zum Hinbringen (z.B. Giftsammlung)
//   rhythmus         wie oft (für seltene Abfuhren)
//   sorten           zweite Auswahl «Welche Sorte?»:
//                    ["Text", "abfallart", "kurzer Hinweis (optional)"]
//   nurAuswahl       true = zeigt nur die Sorten, kein eigenes Ergebnis
//   bereitstellen    aufklappbar «So bereitstellen»
//   nichtMitgenommen aufklappbar «Wird nicht mitgenommen»
//   wohin, tipp      aufklappbar «Gut zu wissen»
//   bild             Foto unter «So bereitstellen»
//   bildText         kurze Beschreibung des Fotos (für Screenreader)
//   altstadt         Abweichungen für die Altstadt (Hauskehricht Tour 6)
//
// Wo man etwas abgeben kann, steht in data/sammelstellen.js.
// ---------------------------------------------------------

window.ABFALLARTEN = {

  hauskehricht: {
    name: "Hauskehricht",
    abgeholt: true,
    tour: "hauskehricht",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    bild: "img/boeckli.jpg",
    bildText: "Offizielle Gebührensäcke (Böckli) mit 17, 35, 60 und 110 Litern",
    bereitstellen: [
      "Erst am Abfuhrtag bis 7 Uhr hinausstellen, nicht am Vorabend.",
      "Bei Hitze (über 30 Grad) bis 6 Uhr.",
      "Nur im Böcklisack: 17 l Fr. 1.30, 35 l Fr. 2.35, 60 l Fr. 4.70, 110 l Fr. 6.40.",
      "Einzeln oder im Sammelcontainer am Strassenrand.",
    ],
    nichtMitgenommen: [
      "Abfall in gewöhnlichen Plastiksäcken.",
      "Abfallmarken von vor 2024 (nicht mehr gültig).",
      "Papier, Karton, Altmetall und Altkleider (separat sammeln).",
    ],
    altstadt: {
      abgeholt: false,
      ziel: "In einen Unterflurcontainer",
      zeit: "rund um die Uhr, im Böcklisack",
      wohin: [
        "In der Altstadt werden keine losen Säcke eingesammelt.",
        "Säcke nicht neben die Einwurfsäule stellen. Ist ein Container voll, einen anderen benutzen.",
      ],
    },
  },

  sperrgut: {
    name: "Sperrgut",
    abgeholt: true,
    tour: "hauskehricht",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    bereitstellen: [
      "Am Abfuhrtag bis 7 Uhr mit dem Hauskehricht. Keine Anmeldung nötig.",
      "Jedes Stück mit Sperrgutmarken (Fr. 5.– pro Marke).",
      "Bis 50 × 50 × 200 cm: 1 Marke. Bis 100 × 50 × 200 cm: 2 Marken.",
      "Sofas: 1 Marke pro Sitzplatz. Schränke: 1 Marke pro 50 cm Breite.",
      "Höchstens 25 kg pro Stück.",
    ],
    nichtMitgenommen: [
      "Sperrgut ohne Marke.",
      "Nicht brennbares Material.",
      "Elektrogeräte und Werkzeuge.",
      "Sperrgutmarken auf 110-Liter-Säcken.",
    ],
    altstadt: {
      abgeholt: false,
      ziel: "Beim Unterflurcontainer",
      zeit: "mit Sperrgutmarken",
      wohin: ["In der Altstadt wird Sperrgut nicht am Strassenrand abgeholt."],
    },
  },

  gruenabfall: {
    name: "Grünabfall",
    abgeholt: true,
    tour: "gruenabfall",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    bild: "img/gruenabfall.jpg",
    bildText: "Erlaubt sind kompostierbare Säcke, verschnürte Bündel, Plastikgefässe mit Griffen sowie grüne Klein- und Grosscontainer",
    bereitstellen: [
      "Am Abfuhrtag bis 7 Uhr, bei Hitze (über 30 Grad) bis 6 Uhr.",
      "Gebündelt, im Compobag, im Norm-Kleincontainer oder in einem offenen Behälter mit Griffen.",
      "Äste höchstens 5 cm dick, Christbäume höchstens 2 m.",
      "Gratis (in der Grundgebühr enthalten).",
    ],
    nichtMitgenommen: [
      "Grünabfall in Plastiksäcken.",
      "Blumenerde, Katzenstreu, Tierkot, Heu, Stroh, Asche, rohes Fleisch (→ Hauskehricht).",
      "Neophyten wie Berufkraut oder Japanischer Knöterich.",
      "Behandeltes Holz, Steine, Aushub.",
    ],
  },

  papier: {
    name: "Papier",
    abgeholt: true,
    tour: "papier",
    regelmaessig: false,
    zeit: "bis 7 Uhr bereitstellen",
    bereitstellen: [
      "Gebündelt und verschnürt am Strassenrand, am Bereitstellungsort des Hauskehrichts.",
    ],
    nichtMitgenommen: [
      "Karton.",
      "Papier in Tragtaschen, Schachteln oder Säcken.",
    ],
  },

  karton: {
    name: "Karton",
    abgeholt: true,
    tour: "karton",
    regelmaessig: false,
    zeit: "bis 7 Uhr bereitstellen",
    rhythmus: "Sechsmal pro Jahr: Januar, März, Mai, Juli, September und November.",
    bereitstellen: [
      "Gefaltet, gebündelt und verschnürt am Strassenrand, am Bereitstellungsort des Hauskehrichts.",
    ],
    nichtMitgenommen: [
      "Verschmutzter Karton.",
      "Getränkekartons, Styropor und andere Verpackungen.",
    ],
    altstadt: {
      regelmaessig: true,
      tour: null,
      wochentage: [4],
      gross: "Jeden Donnerstag",
      zeit: "6–9.30 Uhr an einem Sammelplatz",
      bereitstellen: [
        "An einem der zwölf ausgeschilderten Karton-Sammelplätze der Altstadt.",
        "Gefaltet und gebündelt.",
        "Ist Donnerstag ein Feiertag, ist die Sammlung am Mittwoch.",
      ],
    },
  },

  altmetall: {
    name: "Altmetall",
    abgeholt: true,
    tour: "altmetall",
    regelmaessig: false,
    zeit: "bis 7 Uhr bereitstellen",
    rhythmus: "Dreimal pro Jahr: Februar, Juni und Oktober.",
    sorten: [
      ["Grosse Metallteile (Pfanne, Velo, Grill, Werkzeug)", "altmetall"],
      ["Alu- und Konservendosen, Alufolie, Deckel", "alu"],
      ["Alu-Kaffeekapseln", "kapseln"],
      ["Farb- und Spraydosen", "sonderabfall"],
      ["Elektrogeräte", "elektro"],
    ],
    bereitstellen: [
      "Höchstens 2 m lang und 25 kg schwer.",
      "Bei Gartenmöbeln Plastik- und Stoffteile entfernen.",
    ],
    nichtMitgenommen: [
      "Grosse Haushaltgeräte (z.B. Gasherde) und Elektrogeräte.",
      "Konservendosen (→ Sammelstelle).",
      "Autoreifen mit Felgen, Autos, Motorräder.",
      "Metall aus Gewerbe und Umbauten.",
    ],
  },

  plastik: {
    name: "Plastik / Kunststoff",
    abgeholt: true,
    tour: "hauskehricht",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    sorten: [
      ["PET-Getränkeflaschen", "pet"],
      ["Andere Flaschen (Shampoo, Putzmittel, Milch aus PE)", "plastik"],
      ["Becher, Schalen, Folien, Tüten, Tuben", "plastik"],
      ["Getränkekartons (Tetra Pak)", "plastik"],
      ["Spielzeug, Styropor, PVC, Gartenschlauch", "hauskehricht", "Nicht für Recycling-Säcke geeignet."],
    ],
    bereitstellen: [
      "Mit dem Hauskehricht im Böcklisack.",
    ],
    nichtMitgenommen: [
      "Plastik in gewöhnlichen Plastiksäcken.",
    ],
    recycling: {
      ziel: "RecyBag",
      zeit: "Erhältlich bei Coop, Denner, Spar und Lidl, Rückgabe am selben Ort",
    },
    tipp: "Nur leeren, nicht auswaschen.",
    altstadt: {
      abgeholt: false,
      ziel: "In einen Unterflurcontainer",
      zeit: "rund um die Uhr, im Böcklisack",
    },
  },

  // ----- Nur Auswahl (kein eigenes Ergebnis) -----

  farben: {
    name: "Farben und Lacke",
    nurAuswahl: true,
    sorten: [
      ["Wasserbasiert (z.B. Dispersion, Acryl)", "hauskehricht", "Eingetrocknet im Hauskehricht entsorgen."],
      ["Mit Lösungsmittel (z.B. Lack, Ölfarbe)", "sonderabfall"],
      ["Unbekannt", "sonderabfall", "Im Zweifel Sonderabfall. Angaben auf der Verpackung beachten."],
    ],
  },

  // ----- Wird NICHT abgeholt -----

  pet: {
    name: "PET-Flaschen",
    abgeholt: false,
    ziel: "Gratis zurück in den Laden",
    wohin: ["Nur Getränkeflaschen aus PET. Andere Plastikflaschen → Plastik."],
  },

  glas: {
    name: "Glas",
    abgeholt: false,
    sorten: [
      ["Flaschen, Konfi- und Gurkengläser", "glas"],
      ["Trinkgläser, Glasschüsseln", "hauskehricht", "Nicht ins Altglas."],
      ["Spiegel, Fensterglas", "inert", "Nicht ins Altglas."],
    ],
    wohin: [
      "Nach Farbe trennen: weiss, grün, braun (andere Farben → grün).",
      "Deckel entfernen.",
    ],
  },

  alu: {
    name: "Alu und Konservendosen",
    abgeholt: false,
    wohin: [
      "Dosen ausspülen und flach drücken.",
      "Farb- und Spraydosen → Sonderabfall.",
    ],
  },

  kapseln: {
    name: "Alu-Kaffeekapseln",
    abgeholt: false,
    ziel: "Gratis zurück in den Laden",
    wohin: ["Kapseln aus Plastik → Hauskehricht."],
  },

  batterien: {
    name: "Batterien",
    abgeholt: false,
    ziel: "Gratis zurück in den Laden",
  },

  oel: {
    name: "Speiseöl und Altöl",
    abgeholt: false,
    wohin: ["Nie in den Ausguss oder die Toilette."],
  },

  altkleider: {
    name: "Altkleider und Schuhe",
    abgeholt: false,
    wohin: [
      "Nur saubere, tragbare Kleider. Schuhe paarweise zusammenbinden.",
      "Kaputte Kleider → Hauskehricht.",
    ],
  },

  elektro: {
    name: "Elektrogeräte",
    abgeholt: false,
    ziel: "Gratis zurück in den Laden",
  },

  leuchtmittel: {
    name: "Sparlampen und Leuchtröhren",
    abgeholt: false,
    ziel: "Gratis zurück in den Laden",
    wohin: ["Nicht an die Giftsammlung."],
  },

  sonderabfall: {
    name: "Sonderabfall (Gift)",
    abgeholt: false,
    ziel: "Gratis zurück in den Laden",
    sammeltermine: [
      { datum: "2027-03-31", zeit: "16–18 Uhr", ort: "Schulhaus Breite" },
      { datum: "2027-06-30", zeit: "16–18 Uhr", ort: "Schulhaus Sekundarstufe Buchthalen" },
      { datum: "2027-09-29", zeit: "16–18 Uhr", ort: "Schulhaus Kreuzgut Herblingen" },
    ],
    sammeltermineName: "Giftsammlung (max. 30 kg pro Person)",
    wohin: [
      "In der Originalverpackung, nicht zusammengiessen.",
      "Nie in den Ausguss oder den Kehricht.",
      "Batterien, Öl und Sparlampen nicht an die Giftsammlung.",
    ],
  },

  inert: {
    name: "Steine, Keramik und Bauschutt",
    abgeholt: false,
  },
};


// ---------------------------------------------------------
// SCHNELLWAHL: Knöpfe unter dem Feld «Abfall»
// Format: ["Text auf dem Knopf", "abfallart"] – Reihenfolge = Anzeige
// ---------------------------------------------------------

window.SCHNELLWAHL = [
  ["Hauskehricht", "hauskehricht"],
  ["Grünabfall", "gruenabfall"],
  ["Papier", "papier"],
  ["Karton", "karton"],
  ["Plastik", "plastik"],
  ["Sperrgut", "sperrgut"],
  ["Glas", "glas"],
  ["Elektronik", "elektro"],
  ["Kleider", "altkleider"],
  ["Gift", "sonderabfall"],
  ["Metall", "altmetall"],
];


// ---------------------------------------------------------
// VERZEICHNIS: Gegenstand → Abfallart
// Format: ["Gegenstand", "abfallart"] oder
//         ["Gegenstand", "abfallart", "kurzer Hinweis"]
// ---------------------------------------------------------

window.GEGENSTAENDE = [
  // Hauskehricht
  ["Speisereste mit Knochen", "hauskehricht"],
  ["Knochen", "hauskehricht"],
  ["Rohes Fleisch", "hauskehricht"],
  ["Windeln", "hauskehricht"],
  ["Hygieneartikel", "hauskehricht"],
  ["Watte und Wattestäbchen", "hauskehricht"],
  ["Rasierklingen", "hauskehricht"],
  ["Staubsaugerbeutel", "hauskehricht"],
  ["Katzenstreu", "hauskehricht"],
  ["Kleintiermist", "hauskehricht"],
  ["Tierkot", "hauskehricht"],
  ["Asche", "hauskehricht"],
  ["Wischgut", "hauskehricht"],
  ["Glühbirne", "hauskehricht"],
  ["Waschmittelverpackung", "hauskehricht"],
  ["Papiertragtasche", "hauskehricht"],
  ["Blumenerde", "hauskehricht"],
  ["Heu und Stroh", "hauskehricht"],
  ["Zigarettenstummel", "hauskehricht"],
  ["Kaffeekapseln aus Plastik", "hauskehricht"],
  ["Taschentücher", "hauskehricht"],
  ["Haushaltpapier (verschmutzt)", "hauskehricht"],
  ["Pizzaschachtel (verschmutzt)", "hauskehricht"],
  ["Styropor", "hauskehricht"],
  ["Kerzen", "hauskehricht"],
  ["Spielzeug (ohne Batterien)", "hauskehricht"],
  ["Zahnbürste", "hauskehricht"],
  ["Trinkglas", "hauskehricht", "Nicht ins Altglas."],
  ["Wasserbasierte Farbe", "hauskehricht", "Eingetrocknet im Hauskehricht entsorgen."],
  ["Kaputte Kleider", "hauskehricht"],

  // Plastik
  ["Plastiksack / Tragtasche", "plastik"],
  ["Plastikverpackung", "plastik"],
  ["Plastikflasche (nicht PET)", "plastik"],
  ["Shampooflasche", "plastik"],
  ["Joghurtbecher", "plastik"],
  ["Folien", "plastik"],
  ["Eierschachtel aus Plastik", "plastik"],
  ["Chipsverpackung", "plastik"],
  ["Tetrapak / Getränkekarton", "plastik"],
  ["Plastikeimer", "plastik"],
  ["Blumentopf aus Plastik", "plastik"],

  // Sperrgut
  ["Sofa", "sperrgut"],
  ["Polstergruppe", "sperrgut"],
  ["Matratze", "sperrgut"],
  ["Stuhl", "sperrgut"],
  ["Tisch", "sperrgut"],
  ["Salontisch", "sperrgut"],
  ["Schrank", "sperrgut"],
  ["Kommode", "sperrgut"],
  ["Büchergestell", "sperrgut"],
  ["Bettgestell", "sperrgut"],
  ["Nachttisch", "sperrgut"],
  ["Teppich", "sperrgut"],
  ["Garderobe", "sperrgut"],
  ["Tablare", "sperrgut"],
  ["Harasse", "sperrgut"],
  ["Möbel", "sperrgut"],

  // Grünabfall
  ["Rasenschnitt", "gruenabfall"],
  ["Laub", "gruenabfall"],
  ["Äste und Strauchschnitt", "gruenabfall"],
  ["Unkraut", "gruenabfall"],
  ["Fallobst", "gruenabfall"],
  ["Blumen", "gruenabfall"],
  ["Topfpflanzen (ohne Topf und Erde)", "gruenabfall"],
  ["Christbaum", "gruenabfall"],
  ["Rüstabfälle", "gruenabfall"],
  ["Gemüse- und Obstreste", "gruenabfall"],
  ["Speisereste ohne Knochen", "gruenabfall"],
  ["Brot", "gruenabfall"],
  ["Käse und Milchprodukte", "gruenabfall"],
  ["Eierschalen", "gruenabfall"],
  ["Kaffeesatz", "gruenabfall"],
  ["Teebeutel", "gruenabfall"],
  ["Kompost", "gruenabfall"],

  // Papier
  ["Zeitungen", "papier"],
  ["Zeitschriften", "papier"],
  ["Prospekte", "papier"],
  ["Bücher", "papier"],
  ["Briefe und Couverts", "papier"],
  ["Büropapier", "papier"],
  ["Altpapier", "papier"],

  // Karton
  ["Kartonschachtel", "karton"],
  ["Umzugskarton", "karton"],
  ["Wellkarton", "karton"],
  ["Pizzaschachtel (sauber)", "karton"],

  // Altmetall
  ["Pfanne", "altmetall"],
  ["Grill", "altmetall"],
  ["Velo", "altmetall"],
  ["Mofa", "altmetall"],
  ["Metallkübel", "altmetall"],
  ["Werkzeug (nicht elektrisch)", "altmetall"],
  ["Benzinrasenmäher", "altmetall"],
  ["Metallstangen", "altmetall"],
  ["Gartenmöbel aus Metall", "altmetall"],
  ["Eisengestell", "altmetall"],

  // Nicht abgeholt
  ["PET-Flasche", "pet"],
  ["Glasflasche", "glas"],
  ["Konfiglas", "glas"],
  ["Weinflasche", "glas"],
  ["Konservendose", "alu"],
  ["Aludose", "alu"],
  ["Alufolie", "alu"],
  ["Kaffeekapseln aus Alu", "kapseln"],
  ["Batterien", "batterien"],
  ["Akku", "batterien"],
  ["Speiseöl / Frittieröl", "oel"],
  ["Motoröl", "oel"],
  ["Kleider", "altkleider"],
  ["Schuhe", "altkleider"],
  ["Bettwäsche", "altkleider"],
  ["Toner und Druckerpatronen", "altkleider"],
  ["Handy", "elektro"],
  ["Computer / Laptop", "elektro"],
  ["Fernseher", "elektro"],
  ["Kühlschrank", "elektro"],
  ["Waschmaschine", "elektro"],
  ["Kaffeemaschine", "elektro"],
  ["Staubsauger", "elektro"],
  ["Elektrowerkzeug", "elektro"],
  ["Kabel", "elektro"],
  ["Sparlampe", "leuchtmittel"],
  ["LED-Lampe", "leuchtmittel"],
  ["Leuchtstoffröhre", "leuchtmittel"],
  ["Farben und Lacke", "farben"],
  ["Lösungsmittel", "sonderabfall"],
  ["Medikamente", "sonderabfall"],
  ["Pflanzenschutzmittel", "sonderabfall"],
  ["Putzmittel (Reste)", "sonderabfall"],
  ["Säuren und Laugen", "sonderabfall"],
  ["Spraydosen", "sonderabfall"],
  ["Farbdosen (leer)", "sonderabfall"],
  ["Steine", "inert"],
  ["Keramik / Geschirr", "inert"],
  ["Porzellan", "inert"],
  ["Bauschutt", "inert"],
  ["Spiegel / Fensterglas", "inert"],
];
