# Abfall Schaffhausen – Hinweise für Claude

## Wie ich arbeiten möchte

- Bitte **auf Deutsch** (Schweizer Schreibweise, «ss» statt «ß») antworten.
- Ich bin **Anfängerin im Programmieren**: Schritt für Schritt vorgehen, kurz erklären, was du machst, und **vor grösseren Schritten fragen**.
- Technik **so einfach wie möglich** halten, damit ich den Code verstehe und kleine Änderungen selbst machen kann. Code-Kommentare und Namen auf Deutsch.
- **Node.js ist nicht installiert**, Python schon. Kein Build-Schritt, keine npm-Pakete: nur HTML, CSS und JavaScript.
- Git über **GitHub Desktop**. Repository: `priscilla-sfgz/abfall-schaffhausen`. Committe nur, wenn ich es sage.
- Veröffentlichung über **Vercel**. Damit habe ich kaum Erfahrung, deshalb brauche ich eine genaue Anleitung mit jedem Klick.

## Die Idee

PWA für Einwohnerinnen und Einwohner der Stadt Schaffhausen: Man gibt Strasse und Abfall ein und erfährt, **ob und wann er abgeholt wird**, oder wohin man ihn sonst bringen muss.

- **Grünes Feld «Wird abgeholt»** oder **rotes Feld «Wird nicht abgeholt»** (mit «Wohin damit?»).
- **Regelmässige Abfuhr** (Hauskehricht, Grünabfall, Sperrgut, Plastik): gross «Jeden Dienstag und Freitag» und «bis 7 Uhr bereitstellen», klein «Nächstes Mal: in 3 Tagen (Di., 10. Nov.)». Keine weiteren Termine.
- **Seltene Abfuhr** (Papier, Karton, Altmetall): gross «In 17 Tagen (Di., 17. Nov.)» mit Uhrzeit, darunter die weiteren Termine.
- Unten im Feld: «So bereitstellen» und «Wird nicht mitgenommen».

## Design

- Corporate Design der Stadt Schaffhausen: Petrol `#005e74`, Schaffhauser Gelb `#ffdb1a`, Schrift Lato (von stadt-schaffhausen.ch übernommen).
- Oben ein **weisser** Balken mit kleinem Schatten nach unten, das Stadtlogo (schwarz-gelb, Original) klein oben links.
- Zwei abgerundete Eingabefelder «Strasse» und «Abfall», die Wörter grau im Feld (wie in der SBB-App).
- Am Anfang steht unter den Feldern nichts. Erst beim Tippen erscheint eine Auswahlliste, das Ergebnis erst, wenn beides gewählt ist.
- Unten eine Leiste mit drei Tabs, nur Icons: Abfall (Sack), Termine (Kalender), Infos (Info). Über dem aktiven Tab ein kleiner gelber Balken (wie in der 20-Minuten-App). Im Moment hat nur «Abfall» Inhalt.
- Gut auf dem Handy bedienbar, merkt sich die Strasse, auf dem Startbildschirm installierbar.

## Getroffene Entscheidungen

1. **Hausnummern:** Strassen, die nach Hausnummer auf zwei Touren aufgeteilt sind, erscheinen als eigene Einträge in der Auswahlliste (z.B. «Alpenstrasse 1–115»). Es gibt kein eigenes Feld für die Hausnummer.
2. **Uhrzeit:** Gross steht «bis 7 Uhr». Der Hinweis «bei Hitze über 30 Grad bis 6 Uhr» steht unter «So bereitstellen».
3. **Papier** wird als seltene Abfuhr angezeigt: Datum plus Hinweis, wer sammelt (z.B. «Schulhaus Buchthalen»).
4. **Fotos unter «So bereitstellen»:** Böckli-Foto (`img/boeckli.jpg`) beim Hauskehricht, Behälter-Bild (`img/gruenabfall.jpg`) beim Grünabfall. Eingestellt in `data/abfallarten.js` mit `bild` und `bildText`. Fotos vor dem Einbauen verkleinern (ca. 1200 Pixel breit).
5. **Altstadt** (= Hauskehricht Tour 6, apid `906921982`): Hauskehricht, Sperrgut und Plastik werden **rot** angezeigt, mit Verweis auf die Unterflurcontainer. Karton in der Altstadt: jeden Donnerstag 6.00–9.30 Uhr an Sammelplätzen (grün).
   - *Offen:* Zu Tour 6 gehören auch Strassen wie die Bahnhofstrasse. Noch nicht geklärt, ob dort wirklich nichts abgeholt wird.
6. **Plastik** ist grün (wird im Böckli mit dem Hauskehricht mitgenommen) und hat einen Recycling-Tipp (Sammelsack, RecyBag).

## Datenquelle: Abfallkalender der Stadt

Start: https://m.stadt-schaffhausen.ch/index.php?apid=917954978

- Aufbau: **Abfallart → Touren → Tour-Seite** (`index.php?apid=<tour>`).
- Abfallarten mit Touren (apid): Hauskehricht `173769616`, Grünabfall `1133998044`, Papier `2140428229`, Karton Quartiere `425274297`, Altmetall `1780443521`.
- Die Tour-Seite enthält **alle Termine** (auch versteckte Zeilen), **Ausnahmen** (`exceptionNoteText`, z.B. Ausfall am 25.12.) und die **Strassenliste** (mit Hausnummernbereichen und «Bereitstellen: …»).
- Jede Tour hat auch einen iCal-Feed (`/appl/ical.php?apid=<tour>&calhome=917954978`). **Darin fehlen aber die Ausnahmen**, ausgefallene Termine stehen dort trotzdem drin. Deshalb lesen wir die HTML-Seite.
- Die Stadt-Website sendet **keine CORS-Header**. Der Browser darf die Daten also nicht direkt abrufen, dafür braucht es einen Proxy (geplant: Python-Funktion auf Vercel im Ordner `api/`).
- Ohne eigene Touren: Sperrgut (kommt mit dem Hauskehricht), Plastik, Karton Altstadt. Nicht abgeholt werden: Glas, Alu, PET, Batterien, Öl, Altkleider, Elektrogeräte, Sonderabfall, Steine.
- Karton und Altmetall haben im Moment (November 2026) keine Termine mehr. Die App zeigt dann «Nächster Termin noch nicht bekannt» und den Rhythmus.

## Projektstruktur

- `index.html`, `css/style.css`, `js/app.js`: die App
- `data/abfallarten.js`: Abfallarten mit Hinweisen und das Verzeichnis Gegenstand → Abfallart (Quelle: Infoseiten der Stadt, darf von Hand ergänzt werden)
- `data/touren.js`: Termine und Strassen, **automatisch erstellt** mit `python werkzeuge/daten_holen.py`
- `manifest.webmanifest`, `sw.js`, `img/icons/`: Installierbarkeit (Service Worker lädt zuerst aus dem Netz, nur offline aus dem Speicher)
- `img/logo.png`, `img/boeckli.jpg`, `img/gruenabfall.jpg`: Logo und Fotos. Fehlt ein Bild, steht im Balken Text bzw. das Foto wird ausgeblendet.
- Lokal testen: `python -m http.server 8000`, dann http://localhost:8000

## Stand und nächste Schritte

Erledigt (7.11.2026): Das Grundgerüst läuft mit einer Momentaufnahme der echten Daten. Im Browser in der Handy-Ansicht getestet. Committet als «MVP».

Als Nächstes:
1. ~~Logo und Böckli-Foto einbauen~~ (erledigt 7.11.2026). App-Icons eventuell mit dem Logo neu machen (die jetzigen sind Platzhalter).
2. Live-Daten: Die Logik aus `werkzeuge/daten_holen.py` als Vercel-Funktion in `api/` anbieten (mit Zwischenspeicher). Die App lädt dann von dort und nimmt `data/touren.js` als Rückfall.
3. Auf Vercel veröffentlichen, mit genauer Schritt-für-Schritt-Anleitung.

## Für später geplant (jetzt noch nicht einbauen)

- Regelmässige Termine in der App anpinnen (Tab «Termine»).
- Termine als Kalendereintrag speichern.
- Genauere Infos zu Sonderabfällen (z.B. Wasser mit Acrylfarbe ist Giftabfall und gehört nicht ins Becken).

Dafür ist der Code schon vorbereitet: `ergebnisBerechnen()` in `js/app.js` gibt ein einfaches Objekt zurück, das sich auch zum Anpinnen oder für den Kalender-Export verwenden lässt.
