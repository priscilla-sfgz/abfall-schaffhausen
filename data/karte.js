// =========================================================
// Orte für den Tab «Karte»
// Quellen: Abfallkalender der Stadt Schaffhausen (Sammelstellen und
// Unterflurcontainer mit Koordinaten), Websites der Anbieter.
// Koordinaten der übrigen Adressen: OpenStreetMap (21.11.2026).
//
// Diese Datei darfst du gerne von Hand ergänzen!
//
//   typ     "sammelstelle", "unterflur", "brocki" oder "reparatur"
//   name    Name des Orts
//   ort     Adresse
//   zeiten  Öffnungszeiten (optional)
//   info    was man dort abgeben kann (optional)
//   link    Website (optional)
//   lage    [Breitengrad, Längengrad] – z.B. auf openstreetmap.org:
//           rechte Maustaste → «Adresse anzeigen» zeigt die Zahlen
// =========================================================

window.KARTE_ORTE = [

  // ----- Quartier-Sammelstellen der Stadt -----
  { typ: "sammelstelle", name: "Sammelstelle Lochstr./Schwarzadlerstr.", ort: "Lochstrasse 19, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70874, 8.6281] },
  { typ: "sammelstelle", name: "Sammelstelle Birch", ort: "Birchweg 75, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.71644, 8.63034] },
  { typ: "sammelstelle", name: "Sammelstelle Hohlenbaum", ort: "Hohlenbaumstrasse 68, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70579, 8.6185] },
  { typ: "sammelstelle", name: "Sammelstelle Geissberg", ort: "Weinsteig 80, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70471, 8.63275] },
  { typ: "sammelstelle", name: "Sammelstelle Hauental/Sommerwies", ort: "Sommerwies, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.71795, 8.61863] },
  { typ: "sammelstelle", name: "Sammelstelle Viehmarkt", ort: "Hochstrasse 15, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl. Karton und Inertstoffe: Mo–Fr 10–11 und 16–17 Uhr, Sa 8.30–12 Uhr", lage: [47.70248, 8.63518] },
  { typ: "sammelstelle", name: "Sammelstelle Schützenhaus", ort: "Bühlstrasse, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70007, 8.62594] },
  { typ: "sammelstelle", name: "Sammelstelle Mühlentalstrasse", ort: "Mühlentalstrasse, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69969, 8.63044] },
  { typ: "sammelstelle", name: "Sammelstelle Niklausen", ort: "Klausweg 28, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70537, 8.64409] },
  { typ: "sammelstelle", name: "Sammelstelle Wagenareal", ort: "Wagenstrasse 8, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70151, 8.64113] },
  { typ: "sammelstelle", name: "Sammelstelle Feldstrasse", ort: "Wölflinshalde, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70239, 8.64394] },
  { typ: "sammelstelle", name: "Sammelstelle Bachstrasse/Webergasse", ort: "Webergasse, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.6984, 8.63704] },
  { typ: "sammelstelle", name: "Sammelstelle Munot", ort: "Munotstrasse 51, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69933, 8.63992] },
  { typ: "sammelstelle", name: "Sammelstelle Mühlenen/Neustadt", ort: "Rheinstrasse, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69339, 8.6324] },
  { typ: "sammelstelle", name: "Sammelstelle Gräfler", ort: "Neutrottenstrasse 16, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.71898, 8.65157] },
  { typ: "sammelstelle", name: "Sammelstelle Unterstadt", ort: "Quaistrasse 11, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69475, 8.63924] },
  { typ: "sammelstelle", name: "Sammelstelle Alpenblick", ort: "Stimmerstrasse, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.70515, 8.65339] },
  { typ: "sammelstelle", name: "Sammelstelle Lindli", ort: "Rheinhaldenstrasse 8, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69459, 8.64703] },
  { typ: "sammelstelle", name: "Sammelstelle Dürstlingweg / Zündelgut", ort: "Dürstlingweg 7, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69937, 8.65376] },
  { typ: "sammelstelle", name: "Sammelstelle Hohberg", ort: "Trüllenbuck 1, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.72375, 8.65674] },
  { typ: "sammelstelle", name: "Sammelstelle Herblingen/Einkaufszentrum", ort: "Stüdliackerstrasse 4, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.71973, 8.66286] },
  { typ: "sammelstelle", name: "Sammelstelle Zollerweg", ort: "Büsingerstrasse 32, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.69689, 8.66126] },
  { typ: "sammelstelle", name: "Sammelstelle Im Höfli", ort: "Im Höfli 8, Schaffhausen", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.72529, 8.66377] },
  { typ: "sammelstelle", name: "Sammelstelle Hemmental", ort: "Randenstrasse 30, Hemmental", zeiten: "Mo–Sa 7–20 Uhr, nicht an Feiertagen", info: "Glas, Alu und Weissblech, Batterien, Speise- und Altöl", lage: [47.73423, 8.57911] },

  // ----- Unterflurcontainer (Hauskehricht im Böcklisack) -----
  { typ: "unterflur", name: "Unterflurcontainer Mühlental", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69986, 8.63043] },
  { typ: "unterflur", name: "Unterflurcontainer Bogenstrasse", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69912, 8.63437] },
  { typ: "unterflur", name: "Unterflurcontainer Wagenareal", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.70154, 8.64113] },
  { typ: "unterflur", name: "Unterflurcontainer Schwertstrasse", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69734, 8.63246] },
  { typ: "unterflur", name: "Unterflurcontainer Vordersteig", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.6969, 8.62993] },
  { typ: "unterflur", name: "Unterflurcontainer Webergasse", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.6984, 8.63695] },
  { typ: "unterflur", name: "Unterflurcontainer Walther-Bringolf-Platz", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69764, 8.63484] },
  { typ: "unterflur", name: "Unterflurcontainer Munot", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69931, 8.63989] },
  { typ: "unterflur", name: "Unterflurcontainer Oberstadt", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69656, 8.63315] },
  { typ: "unterflur", name: "Unterflurcontainer Falkenstrasse", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.71642, 8.64877] },
  { typ: "unterflur", name: "Unterflurcontainer Kasinogässchen", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69574, 8.62969] },
  { typ: "unterflur", name: "Unterflurcontainer Kirchhofplatz", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69669, 8.6362] },
  { typ: "unterflur", name: "Unterflurcontainer Neustadt", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69524, 8.63218] },
  { typ: "unterflur", name: "Unterflurcontainer Münsterplatz", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69524, 8.63554] },
  { typ: "unterflur", name: "Unterflurcontainer Gerberplatz", zeiten: "rund um die Uhr", info: "Hauskehricht im Böcklisack", lage: [47.69578, 8.6382] },

  // ----- Weitere Sammelstellen -----
  { typ: "sammelstelle", name: "KBA Hard", ort: "Hardweg 340, 8222 Beringen", zeiten: "Mo–Fr 7.15–11.45 und 13–17 Uhr, Sa 9–12 Uhr", info: "Gratis: Papier, Karton, Glas, PET, Altkleider, Altmetall, Elektrogeräte, Batterien, Sonderabfall bis 30 kg. Mit Gebühr: Kehricht und Sperrgut Fr. 26.90 / 100 kg, Grünabfall Fr. 16.16 / 100 kg (mind. Fr. 10.–)", link: "https://www.abfall-sh.ch/kba/content/preisliste/", lage: [47.69018, 8.59698] },
  { typ: "sammelstelle", name: "Arnold Schmid Recycling AG", ort: "Hardmorgenweg 15, 8222 Beringen", zeiten: "Mo–Fr 7.10–11.50 und 13–16.50 Uhr, Sa 8.30–12 Uhr", info: "Recycling aller Art, teils mit Gebühr", lage: [47.69451, 8.58154] },
  { typ: "sammelstelle", name: "TIT Imhof AG", ort: "Kaltenbacherstrasse 40, 8260 Stein am Rhein", zeiten: "Öffnungszeiten telefonisch erfragen", info: "Sonderabfall gratis bis 30 kg pro Person", lage: [47.65256, 8.85237] },
  { typ: "sammelstelle", name: "SRK / koro Second Hand", ort: "Oberstadt 13, Schaffhausen", zeiten: "Di–Fr 10–18 Uhr, Sa 10–12 und 12.30–16 Uhr", info: "Saubere, tragbare Kleider, Schuhe, Bettwäsche, Toner und Druckerpatronen", lage: [47.69648, 8.63251] },

  // ----- Brockenhäuser -----
  { typ: "brocki", name: "Heilsarmee brocki.ch", ort: "Ebnatstrasse 65, 8200 Schaffhausen", zeiten: "Mo–Fr 9–18.30 Uhr, Sa 9–17 Uhr", info: "Gut erhaltene Möbel, Kleider und Haushaltwaren. Abholung von grossen Möbeln gratis", link: "https://www.brocki.ch/filialen/schaffhausen/", lage: [47.70728, 8.64357] },
  { typ: "brocki", name: "galleria13 Schaffhausen", ort: "Schützengraben 21, 8200 Schaffhausen", zeiten: "Mo–Sa, Zeiten auf der Website", info: "Kleider, Möbel und Accessoires. Abgabe bis 1 Stunde vor Ladenschluss", link: "https://www.galleria13.ch", lage: [47.69865, 8.63583] },
  { typ: "brocki", name: "galleria13 Neuhausen", ort: "Zollstrasse 92, 8212 Neuhausen am Rheinfall", zeiten: "Mo–Sa, Zeiten auf der Website", info: "Kleider, Möbel und Accessoires. Abgabe bis 1 Stunde vor Ladenschluss", link: "https://www.galleria13.ch", lage: [47.67743, 8.60089] },

  // ----- Reparieren -----
  { typ: "reparatur", name: "reparierBar Schaffhausen", ort: "Raum NACHBAR, Stahlgiesserei 15B, 8200 Schaffhausen", zeiten: "Meist am letzten Samstag im Monat, 10–16 Uhr (nicht im Juli und Dezember)", info: "Kleinere Gegenstände gemeinsam reparieren", link: "https://www.reparierbarschaffhausen.ch", lage: [47.70454, 8.62997] },
];
