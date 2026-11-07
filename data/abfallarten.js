// =========================================================
// Abfallarten und Verzeichnis der Gegenstände
// Quelle: Infoseiten im Abfallkalender der Stadt Schaffhausen
// https://m.stadt-schaffhausen.ch/index.php?apid=917954978
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
//   zeit             wird gross unter dem Termin angezeigt
//   rhythmus         wie oft (für seltene Abfuhren)
//   bereitstellen    Liste «So bereitstellen»
//   nichtMitgenommen Liste «Wird nicht mitgenommen»
//   wohin            Liste «Wohin damit?» (wenn nicht abgeholt)
//   tipp             zusätzlicher Hinweis
//   bild             Foto im Ergebnisfeld
//   altstadt         Abweichungen für die Altstadt (Hauskehricht Tour 6)
// ---------------------------------------------------------

window.ABFALLARTEN = {

  hauskehricht: {
    name: "Hauskehricht",
    abgeholt: true,
    tour: "hauskehricht",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    bild: "img/boeckli.jpg",
    bereitstellen: [
      "Erst am Abfuhrtag bis 7.00 Uhr hinausstellen, nicht schon am Vorabend.",
      "Bei Hitze (über 30 Grad) bereits bis 6.00 Uhr.",
      "Nur im offiziellen Gebührensack (Böcklisack) mit 17, 35, 60 oder 110 Litern.",
      "Säcke einzeln oder in einem Sammelcontainer am Kehrichtstandplatz bereitstellen.",
    ],
    nichtMitgenommen: [
      "Abfall in gewöhnlichen Plastiksäcken oder anderen unzulässigen Behältnissen.",
      "Abfallmarken von vor 2024 – sie sind nicht mehr gültig.",
      "Altpapier, Karton, Altmetall und Altkleider – diese werden separat gesammelt.",
    ],
    altstadt: {
      abgeholt: false,
      wohin: [
        "In der Altstadt werden keine losen Abfallsäcke eingesammelt.",
        "Bitte den Böcklisack in einen Unterflurcontainer werfen – diese sind rund um die Uhr offen.",
        "Säcke nicht neben die Einwurfsäule stellen. Ist ein Container voll, bitte einen anderen Standort benutzen.",
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
      "Am Abfuhrtag bis 7.00 Uhr zusammen mit dem Hauskehricht bereitlegen. Eine Anmeldung ist nicht nötig.",
      "Jedes Stück mit Sperrgutmarken versehen (Fr. 5.00 pro Marke).",
      "Bis 50 × 50 × 200 cm: 1 Marke. Bis 100 × 50 × 200 cm: 2 Marken.",
      "Sofas: 1 Marke pro Sitzplatz. Schränke: 1 Marke pro 50 cm Breite.",
      "Höchstens 25 kg pro Stück. Metallteile wenn möglich entfernen.",
    ],
    nichtMitgenommen: [
      "Sperrgut ohne Gebührenmarke.",
      "Nicht brennbare Materialien.",
      "Elektrische Geräte, Unterhaltungselektronik, Werkzeuge und Büroelektronik.",
      "Sperrgutmarken auf 110-Liter-Säcken (dafür den offiziellen Gebührensack verwenden).",
    ],
    altstadt: {
      abgeholt: false,
      wohin: [
        "In der Altstadt wird Sperrgut nicht am Strassenrand abgeholt.",
        "Bitte das Sperrgut mit Sperrgutmarken beim nächsten Unterflurcontainer deponieren.",
      ],
    },
  },

  gruenabfall: {
    name: "Grünabfall",
    abgeholt: true,
    tour: "gruenabfall",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    bereitstellen: [
      "Am Abfuhrtag bis 7.00 Uhr bereitstellen, bei Hitze (über 30 Grad) bis 6.00 Uhr.",
      "Gebündelt, im Compobag (100 % kompostierbar), im Norm-Kleincontainer oder in einem offenen Behälter mit umgreifbaren Griffen.",
      "Äste höchstens 5 cm dick, Christbäume höchstens 2 m hoch.",
      "Gratis – in der Grundgebühr enthalten, keine Marken nötig.",
    ],
    nichtMitgenommen: [
      "Grünabfall in Plastiksäcken.",
      "Blumenerde, Humus, Katzenstreu, Tierkot, Heu, Stroh, Asche und rohes Fleisch (gehören in den Hauskehricht).",
      "Neophyten wie Berufkraut oder Japanischer Knöterich.",
      "Behandeltes Holz wie Paletten oder imprägnierte Pfähle, Steine und Aushub.",
    ],
  },

  papier: {
    name: "Papier",
    abgeholt: true,
    tour: "papier",
    regelmaessig: false,
    zeit: "bis 7 Uhr bereitstellen",
    bereitstellen: [
      "Gebündelt und verschnürt am Kehrichtstandplatz.",
      "Muss ab 7.00 Uhr bereitstehen.",
    ],
    nichtMitgenommen: [
      "Karton.",
      "Lose Papier oder Papier in Tragtaschen, Kartonschachteln oder Kehrichtsäcken.",
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
      "Gefaltet, gebündelt und verschnürt am Kehrichtstandplatz.",
      "Am Abfuhrtag ab 7.00 Uhr bereitlegen.",
      "Jederzeit möglich: Presscontainer beim Parkplatz Viehmarkt, Hochstrasse 15 (Mo–Fr 10–11 und 16–17 Uhr, Sa 8.30–12 Uhr).",
    ],
    nichtMitgenommen: [
      "Verschmutzter Karton.",
      "Tetrapak, Styropor und andere Verpackungen.",
    ],
    altstadt: {
      regelmaessig: true,
      tour: null,
      wochentage: [4],
      gross: "Jeden Donnerstag",
      zeit: "6.00–9.30 Uhr an einem Sammelplatz",
      bereitstellen: [
        "Jeden Donnerstag zwischen 6.00 und 9.30 Uhr an einem der zwölf ausgeschilderten Karton-Sammelplätze der Altstadt.",
        "Gefaltet und gebündelt.",
        "Fällt der Donnerstag auf einen Feiertag, findet die Sammlung am Vortag statt.",
        "Alternativ: Presscontainer beim Parkplatz Viehmarkt, Hochstrasse 15.",
      ],
    },
  },

  altmetall: {
    name: "Altmetall",
    abgeholt: true,
    tour: "altmetall",
    regelmaessig: false,
    zeit: "bis 7 Uhr bereitstellen",
    rhythmus: "Dreimal pro Jahr: März, Juni und November.",
    bereitstellen: [
      "Gegenstände höchstens 2 m lang und 25 kg schwer.",
      "Bei Gartenmöbeln Plastik- und Stoffteile vorher entfernen.",
    ],
    nichtMitgenommen: [
      "Grosshaushaltgeräte wie Gasherde und Elektrogeräte.",
      "Konservendosen (gehören an die Sammelstelle).",
      "Autoreifen mit Felgen, Autos und Motorräder.",
      "Metall aus Gewerbebetrieben, Umbauten und Renovationen.",
    ],
  },

  plastik: {
    name: "Plastik / Kunststoff",
    abgeholt: true,
    tour: "hauskehricht",
    regelmaessig: true,
    zeit: "bis 7 Uhr bereitstellen",
    bereitstellen: [
      "Kunststoff wird mit dem Hauskehricht im offiziellen Böcklisack abgeholt.",
      "Erst am Abfuhrtag bis 7.00 Uhr hinausstellen.",
    ],
    nichtMitgenommen: [
      "Plastik in gewöhnlichen Plastiksäcken ohne Gebühr.",
    ],
    tipp: "Besser fürs Recycling: Kunststoff-Sammelsack (bei Recyclingbetrieben) oder RecyBag (bei Coop, Denner, Spar und Lidl). PET-Flaschen gratis an die Verkaufsstelle zurückbringen.",
    altstadt: {
      abgeholt: false,
      wohin: [
        "Im Böcklisack in einen Unterflurcontainer werfen.",
        "Oder fürs Recycling: Kunststoff-Sammelsack oder RecyBag (Coop, Denner, Spar, Lidl).",
      ],
    },
  },

  // ----- Wird NICHT abgeholt -----

  pet: {
    name: "PET-Flaschen",
    abgeholt: false,
    wohin: ["Gratis zurück an die Verkaufsstelle (Supermarkt, Kiosk)."],
  },

  glas: {
    name: "Glas",
    abgeholt: false,
    wohin: [
      "An eine Sammelstelle der Stadt, z.B. Viehmarkt (Hochstrasse 15), Wagenareal oder Unterstadt (Quaistrasse 11).",
      "Nur Montag bis Samstag zwischen 7.00 und 20.00 Uhr, nicht an Feiertagen.",
    ],
  },

  alu: {
    name: "Alu und Konservendosen",
    abgeholt: false,
    wohin: [
      "An eine Sammelstelle der Stadt (Container für Alu/Weissblech).",
      "Nur Montag bis Samstag zwischen 7.00 und 20.00 Uhr, nicht an Feiertagen.",
    ],
  },

  batterien: {
    name: "Batterien",
    abgeholt: false,
    wohin: [
      "Zurück an eine Verkaufsstelle – jedes Geschäft, das Batterien verkauft, nimmt sie gratis zurück.",
      "Oder an eine Sammelstelle der Stadt.",
    ],
  },

  oel: {
    name: "Speiseöl und Altöl",
    abgeholt: false,
    wohin: [
      "An eine Sammelstelle der Stadt (Container für Speise- und Altöl).",
      "Nicht in den Ausguss oder die Toilette giessen.",
    ],
  },

  altkleider: {
    name: "Altkleider und Schuhe",
    abgeholt: false,
    wohin: [
      "SRK / koro Second Hand, Oberstadt 13 (Di–Fr 10–18 Uhr, Sa 10–16 Uhr). Nur saubere, tragbare Kleider, Schuhe und Bettwäsche.",
      "Altkleidercontainer, z.B. in Coop-Filialen.",
      "KBA Hard, Hardweg 340, Beringen.",
    ],
  },

  elektro: {
    name: "Elektrogeräte",
    abgeholt: false,
    wohin: [
      "Gratis zurück an eine Verkaufsstelle für solche Geräte.",
      "Oder an eine offizielle Sammelstelle, z.B. KBA Hard, Hardweg 340, Beringen.",
    ],
  },

  leuchtmittel: {
    name: "Sparlampen und Leuchtröhren",
    abgeholt: false,
    wohin: [
      "Zurück an eine Verkaufsstelle für Lampen.",
      "Werden an der Giftsammlung nicht angenommen.",
    ],
  },

  sonderabfall: {
    name: "Sonderabfall (Gift)",
    abgeholt: false,
    wohin: [
      "Zurück an die Verkaufsstelle, z.B. Apotheke, Drogerie oder Farbwarengeschäft.",
      "KBA Hard, Hardweg 340, Beringen.",
      "An die Giftsammlung der Stadt (dreimal pro Jahr, höchstens 30 kg pro Person).",
      "Möglichst in der Originalverpackung, nicht zusammengiessen.",
    ],
  },

  inert: {
    name: "Steine, Keramik und Bauschutt",
    abgeholt: false,
    wohin: [
      "Kleinmengen bis 10 kg: Sammelstelle Viehmarkt, Hochstrasse 15 (Mo–Fr 10–11 und 16–17 Uhr, Sa 8.30–12 Uhr).",
      "Grössere Mengen: KBA Hard, Hardweg 340, Beringen.",
    ],
  },
};


// ---------------------------------------------------------
// VERZEICHNIS: Gegenstand → Abfallart
// Einfach neue Zeilen im Format ["Gegenstand", "abfallart"] ergänzen.
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
  ["Tetrapak / Getränkekarton", "hauskehricht"],
  ["Waschmittelverpackung", "hauskehricht"],
  ["Papiertragtasche", "hauskehricht"],
  ["Blumenerde", "hauskehricht"],
  ["Heu und Stroh", "hauskehricht"],
  ["Zigarettenstummel", "hauskehricht"],
  ["Kaffeekapseln", "hauskehricht"],
  ["Taschentücher", "hauskehricht"],
  ["Haushaltpapier (verschmutzt)", "hauskehricht"],
  ["Pizzaschachtel (verschmutzt)", "hauskehricht"],
  ["Styropor", "hauskehricht"],
  ["Kerzen", "hauskehricht"],
  ["Spielzeug (ohne Batterien)", "hauskehricht"],
  ["Zahnbürste", "hauskehricht"],

  // Plastik
  ["Plastiksack / Tragtasche", "plastik"],
  ["Plastikverpackung", "plastik"],
  ["Plastikflasche (nicht PET)", "plastik"],
  ["Shampooflasche", "plastik"],
  ["Joghurtbecher", "plastik"],
  ["Folien", "plastik"],
  ["Eierschachtel aus Plastik", "plastik"],
  ["Chipsverpackung", "plastik"],
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
  ["Farben und Lacke", "sonderabfall"],
  ["Lösungsmittel", "sonderabfall"],
  ["Medikamente", "sonderabfall"],
  ["Pflanzenschutzmittel", "sonderabfall"],
  ["Putzmittel (Reste)", "sonderabfall"],
  ["Säuren und Laugen", "sonderabfall"],
  ["Spraydosen (nicht leer)", "sonderabfall"],
  ["Steine", "inert"],
  ["Keramik / Geschirr", "inert"],
  ["Porzellan", "inert"],
  ["Bauschutt", "inert"],
  ["Spiegel / Fensterglas", "inert"],
];
