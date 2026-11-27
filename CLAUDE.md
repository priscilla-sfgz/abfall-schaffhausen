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
- **Regelmässige Abfuhr** (Hauskehricht, Grünabfall, Sperrgut, Plastik): gross «Jeden Dienstag und Freitag» und «bis 7 Uhr bereitstellen», **kein** «Nächstes Mal» (Entscheid 21.11.2026). Keine weiteren Termine.
- **Seltene Abfuhr** (Papier, Karton, Altmetall): gross «In 17 Tagen (Di., 17. Nov.)» mit Uhrzeit, darunter die weiteren Termine.
- Unten im Feld: «So bereitstellen» und «Wird nicht mitgenommen».

## Design

- **Schwarz-Gelb** (Entscheid 23.11.2026): nur Schaffhauser Gelb `#ffdb1a` (nur dieses eine Gelb), Text schwarz (auch frühere Grautöne). **Kein Petrol** mehr, ausser für die Brockenhäuser-Punkte auf der Karte. Knöpfe und Auswahl gelb; Eingabefeld beim Tippen gelb umrandet. Text auf Gelb schwarz (weiss ausprobiert: zu wenig Kontrast). **Flächen:** weiss mit leichtem Schatten (Schnellwahl, Umschalter, Karten-Filter an). Was **auf** einer weissen Fläche liegt oder ausgewählt ist, ist gelb (Sorten, Knöpfe in der Übersicht, Umschalter-Auswahl). **Nie Gelb auf Gelb, kein helles Gelb** (ausprobiert 23.11.2026, gefiel nicht). Kartenpunkte ohne Umrandung. Ausnahmen bewusst grau: Platzhalter in den Feldern, Tage anderer Monate im Kalender. Schrift Lato (von stadt-schaffhausen.ch übernommen).
- Oben ein **weisser** Balken mit kleinem Schatten nach unten, das Stadtlogo (schwarz-gelb, Original) klein oben links.
- Zwei abgerundete Eingabefelder «Strasse» und «Abfall», die Wörter grau im Feld (wie in der SBB-App).
- Solange das Feld «Abfall» leer ist, stehen darunter **Schnellwahl-Knöpfe** mit den wichtigsten Abfallarten (Liste `SCHNELLWAHL` in `data/abfallarten.js`). Beim Tippen erscheint eine Auswahlliste, das Ergebnis erst, wenn beides gewählt ist.
- Unten eine Leiste mit Tabs, nur Icons, wie in der SBB-App: Der ausgewählte Tab hat das schwarze Icon in einem **gelben Kreis**, der in einer runden Einbuchtung der weissen Leiste sitzt. Nicht ausgewählt: schwarz auf Weiss. **4 Tabs:** Entsorgung, Kalender, Abfall-ABC, Karte. Icons aus `img/icons/` (trash, calendar, manual, map.svg), direkt in `index.html` eingebaut.
- **Startbildschirm:** bei jedem Start kurz gelb (`#ffdb1a`) mit dem App-Icon. In der **installierten App auf Android** wird unser Startbildschirm weggelassen (Android zeigt einen eigenen mit dem Home-Bildschirm-Icon in einem weissen Kreis; sonst springt das Icon). Deshalb hat das Android-Icon (`icon-maskable.svg`) einen **weissen** Hintergrund. Das Symbol in der Statusleiste kann nur einfarbig sein (Android ignoriert Farben).
- **App-Icon** (erledigt 21.11.2026, neu gezeichnet von Priscilla: `img/icons/sack-icon.svg`): iPhone-Icon (`icon.svg`) ganz weiss (kein gelber Rand), Startbildschirm gelb mit weissem Kreis; darin der gelbe Sack mit Knoten, schwarzer Umrandung und schwarzem Steinbock. Aus `sack-icon.svg` entstehen `icon.svg`, `icon-maskable.svg`, `startbild.svg` und `badge.svg` (Farben vereinheitlicht, Umriss dicker, sonst würde er klein unsichtbar), danach `python werkzeuge/icons_erstellen.py`. **Nur 3 Farben:** Schwarz `#000000`, Gelb `#ffdb1a`, Weiss. Keine Glanzlichter, Schatten oder Falten. Vorlagen in `img/vorlagen/`: `Steinbock.png` (Wappen, nur 120 px, darum als SVG nachzeichnen) und `Abfallsack.jpg` (Originalfoto). Die App benutzt diesen Ordner nicht.
- Gut auf dem Handy bedienbar, merkt sich die Strasse, auf dem Startbildschirm installierbar.

## Getroffene Entscheidungen

1. **Hausnummern:** Strassen, die nach Hausnummer auf zwei Touren aufgeteilt sind, erscheinen als eigene Einträge (z.B. «Alpenstrasse 1–115»). Es gibt kein eigenes Feld für die Hausnummer, aber man kann sie mit eintippen («Alpenstrasse 23»): Dann wird der passende Abschnitt gewählt.
   - **Suche** ist fehlertolerant (1 Tippfehler ab 4, 2 ab 8 Buchstaben). Tippfehler-Treffer erscheinen nur, wenn es keine richtigen Treffer gibt.
2. **Uhrzeit:** Gross steht «bis 7 Uhr». Der Hinweis «bei Hitze über 30 Grad bis 6 Uhr» steht unter «So bereitstellen».
3. **Papier** wird als seltene Abfuhr angezeigt: Datum plus Hinweis, wer sammelt (z.B. «Schulhaus Buchthalen»).
4. **Fotos unter «So bereitstellen»:** Böckli-Foto (`img/boeckli.jpg`) beim Hauskehricht, Behälter-Bild (`img/gruenabfall.jpg`) beim Grünabfall. Eingestellt in `data/abfallarten.js` mit `bild` und `bildText`. Fotos vor dem Einbauen verkleinern (ca. 1200 Pixel breit).
5. **Altstadt** (= Hauskehricht Tour 6, apid `906921982`): Hauskehricht, Sperrgut und Plastik werden **rot** angezeigt, mit Verweis auf die Unterflurcontainer. Karton in der Altstadt: jeden Donnerstag 6.00–9.30 Uhr an Sammelplätzen (grün).
   - *Offen:* Zu Tour 6 gehören auch Strassen wie die Bahnhofstrasse. Noch nicht geklärt, ob dort wirklich nichts abgeholt wird.
6. **Plastik** ist grün (wird im Böckli mit dem Hauskehricht mitgenommen) und hat einen Recycling-Tipp (Sammelsack, RecyBag).
7. **Ohne Strasse** gibt es trotzdem ein Ergebnis (Entscheid 21.11.2026): Bei «Wird abgeholt» steht gross «Termin je nach Strasse» mit Knopf «Strasse eingeben», alle Abschnitte erscheinen. Kein Stern ohne Strasse. Altstadt-Regeln gelten erst mit Strasse.
8. **Zwei Möglichkeiten = zwei Karten** (Entscheid 25.11.2026): Gibt es eine zweite Möglichkeit, erscheint sie als eigene Ergebnis-Karte unter dem Wort «Oder». Recycling (`recycling` in `data/abfallarten.js`, z.B. RecyBag) kommt zuerst, die Abfuhr danach. Eine andere Abfallart (`alternative: { id, was, wohin }`, z.B. kaputte Kleider → Hauskehricht) steht als zweite Karte. Zeile über dem Ergebnis der zweiten Karte immer **«Was · Wohin»**: «Plastik / Kunststoff · Im Hauskehricht», «Kaputte Kleider · Im Hauskehricht». Stern nur bei der Karte mit Terminen. Abfalltelefon/Quelle einmal unter allen Karten.

## Datenquelle: Abfallkalender der Stadt

Start: https://m.stadt-schaffhausen.ch/index.php?apid=917954978

- Aufbau: **Abfallart → Touren → Tour-Seite** (`index.php?apid=<tour>`).
- Abfallarten mit Touren (apid): Hauskehricht `173769616`, Grünabfall `1133998044`, Papier `2140428229`, Karton Quartiere `425274297`, Altmetall `1780443521`.
- **Datum** steht seit Ende Nov. 2026 nur noch als Text («30. Nov 2026 ganztägig», `datum_lesen()` in `api/_abfallkalender.py`); der frühere Link `from=…` fiel weg → Live-Daten lieferten am 27.11.2026 einen Fehler (die Sicherheitsprüfung hat richtig angeschlagen). Die Stadt veröffentlicht Termine etwa 13 Monate im Voraus.
- Die Tour-Seite enthält **alle Termine** (auch versteckte Zeilen), **Ausnahmen** (`exceptionNoteText`, z.B. Ausfall am 25.12.) und die **Strassenliste** (mit Hausnummernbereichen und «Bereitstellen: …»).
- Jede Tour hat auch einen iCal-Feed (`/appl/ical.php?apid=<tour>&calhome=917954978`). **Darin fehlen aber die Ausnahmen**, ausgefallene Termine stehen dort trotzdem drin. Deshalb lesen wir die HTML-Seite.
- Die Stadt-Website sendet **keine CORS-Header**. Der Browser darf die Daten also nicht direkt abrufen, dafür braucht es einen Proxy (geplant: Python-Funktion auf Vercel im Ordner `api/`).
- Ohne eigene Touren: Sperrgut (kommt mit dem Hauskehricht), Plastik, Karton Altstadt. Nicht abgeholt werden: Glas, Alu, PET, Batterien, Öl, Altkleider, Elektrogeräte, Sonderabfall, Steine.
- Hat eine Abfallart keine Termine (z.B. Altmetall Anfang November 2026), zeigt die App «Nächster Termin noch nicht bekannt» und den Rhythmus.

## Projektstruktur

- `index.html`, `css/style.css`, `js/app.js`: die App
- `js/kalender.js`: Stern, Kalender-Tab (Liste/Woche/Monat/Jahr, Standard Monat), Übersicht und .ics-Download (Erinnerung am Vorabend 19 Uhr). Gespeichert im Browser (`localStorage` «lesezeichen»: Strasse + Abfallart, alle Termine oder nur einer). Wird vor `js/app.js` geladen.
- `js/leiste.js`: zeichnet die weisse Tab-Leiste als SVG mit runder Einbuchtung unter dem ausgewählten Tab (Masse in `LOCH`: Mitte 22, Radius 31, Ecken-Rundung 16 px) und animiert den Wechsel (altes Loch schliesst, neues öffnet; Kreis und Icon per CSS-Transition). Wird vor `js/app.js` geladen.
- `js/zurueck.js`: «Zurück» (Android-Geste/-Taste, iPhone Wischen vom linken Rand) schliesst zuerst die Vorschlagsliste samt Tastatur bzw. die Termin-Übersicht, dann geht es von anderen Tabs zum Tab Entsorgung. Technik: `ebeneOeffnen(name, schliessen)` / `ebeneGeschlossen(name)` mit Einträgen im Browser-Verlauf. Wird vor `js/kalender.js` geladen.
- `js/abc.js`: Tab Abfall-ABC (umschaltbar «Nach Abfallart» / «A–Z», Suche, Antippen → Ergebnis im Tab Entsorgung). Inhalt = `GEGENSTAENDE` + Abfallarten. Wird vor `js/app.js` geladen.
- `js/karte.js` + `data/karte.js`: Tab Karte (Leaflet 1.9.4 von cdnjs, wird erst beim Öffnen geladen; Kacheln von OpenStreetMap). Filter Sammelstellen (inkl. Unterflurcontainer) / Brockenhäuser / Reparieren. Orte in `data/karte.js` mit `typ` und `lage`, darf von Hand ergänzt werden.
- `data/abfallarten.js`: Abfallarten mit Hinweisen und das Verzeichnis Gegenstand → Abfallart (Quelle: Infoseiten der Stadt, darf von Hand ergänzt werden)
- `data/sammelstellen.js`: Abgabestellen (Name, Ort, Zeiten, Kosten, welche Abfallarten). Gratis-Stellen erscheinen automatisch zuerst. Darf von Hand ergänzt werden.
- **Live-Daten:** `api/touren.py` liest die Stadt-Website (Logik in `api/_abfallkalender.py`), Vercel speichert die Antwort 12 Stunden zwischen. Die App startet mit `data/touren.js` und tauscht im Hintergrund gegen die Live-Daten aus (`liveDatenLaden()` in `js/app.js`). Sehen die Daten kaputt aus (`pruefen()`), bleibt der Rückfall.
- `data/touren.js`: Rückfall-Daten (offline, Fehler), erstellt mit `python werkzeuge/daten_holen.py` (gleiche Logik wie live). Ab und zu neu erstellen.
- Suchwörter (z.B. «Normal» → Hauskehricht): `suchwoerter` in `data/abfallarten.js`.
- `img/icons/*.svg` sind die Vorlagen (icon, icon-maskable, startbild, badge). Die PNGs daraus erstellt `python werkzeuge/icons_erstellen.py` (braucht Chrome + Pillow). Der Steinbock wurde aus `img/vorlagen/Steinbock.png` nachgezeichnet.
- `manifest.webmanifest`, `sw.js`, `img/icons/`: Installierbarkeit (Service Worker lädt zuerst aus dem Netz, nur offline aus dem Speicher)
- `img/logo.png`, `img/boeckli.jpg`, `img/gruenabfall.jpg`: Logo und Fotos. Fehlt ein Bild, steht im Balken Text bzw. das Foto wird ausgeblendet.
- `js/erinnerungen.js`: Push-Erinnerungen (Schalter im Kalender-Tab, pro Lesezeichen zwei Ein/Aus-Knöpfe «Vorabend 19 Uhr» und «Morgen 6 Uhr», beide gleichzeitig möglich; gespeichert als `erinnerung`: vorabend / morgen / beides / keine, bei «beides» schickt die App zwei Einträge an den Server). Schickt die Termine an `/api/erinnerung`.
- `api/erinnerung.py` (speichert das Push-Abo + Termine in Supabase) und `api/senden.py` (verschickt fällige Nachrichten mit `Urgency: high`, sonst hält Android sie im Akku-Sparmodus zurück; Antippen öffnet über `ziel` das passende Ergebnis; wird jede Stunde von Supabase `pg_cron` aufgerufen, POST `{"test": true}` = Testnachricht). Python-Pakete in `requirements.txt`.
- Vercel-Umgebungsvariablen: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`.
- `werkzeuge/supabase.sql`: Tabelle `erinnerungen` + stündlicher Aufruf (ohne Geheimnis). Der Aufruf braucht `timeout_milliseconds := 30000` (Standard 5 s war zu kurz, weil die Vercel-Funktion nach einer Pause erst aufwachen muss → Nachricht am 25.11.2026 verloren). Prüfen: `werkzeuge/push-pruefen.sql` (liest nur). Wichtig: Neue Tabellen werden bei diesem Supabase-Projekt nicht automatisch freigegeben → `grant … to service_role` nötig. Test-Nachricht: POST `/api/senden` mit `{"test": true}` und `Authorization: Bearer <CRON_SECRET>` (oder `geheim/supabase-test.sql`).
- `geheim/` (in `.gitignore`, **nie committen**): Schlüssel und fertig ausgefüllte SQL-Dateien.
- `notizen/recherche-entsorgung.md`: Recherche zu Sammelstellen, Kosten und Sorten (Plastik, Farben, Glas, Metall), mit Quellen. Grundlage für Schritt 2 und den Karten-Tab.
- Lokal testen: `python -m http.server 8000`, dann http://localhost:8000

## Stand und nächste Schritte

Erledigt (7.11.2026): Das Grundgerüst läuft mit einer Momentaufnahme der echten Daten. Im Browser in der Handy-Ansicht getestet. Committet als «MVP».

Als Nächstes:
1. ~~Logo und Böckli-Foto einbauen~~ (erledigt 7.11.2026). App-Icons sind erstellt (siehe Design).
2. ~~Live-Daten~~ (erledigt 21.11.2026, `api/touren.py`).
3. ~~Auf Vercel veröffentlichen~~ (erledigt): https://abfall-schaffhausen.vercel.app – jeder Push auf `main` (GitHub Desktop: «Push origin») wird automatisch veröffentlicht.

## Weiterentwicklung (Wünsche vom 21.11.2026)

1. ~~Suche: Hausnummern, Tippfehler, Schnellwahl-Knöpfe~~ (erledigt 21.11.2026)
2. ~~Ergebnisfeld neu ordnen~~ (erledigt 21.11.2026; Sorten in `sorten`, Abgabestellen in `data/sammelstellen.js`), von oben nach unten:
   wird abgeholt / nicht abgeholt → **Abfallart** (nur «Hauskehricht», nicht «Knochen gehört zum …») → wann → bis wann bereitstellen bzw. Sammelstelle → aufklappbare Details (`<details>`): So bereitstellen, Wird nicht mitgenommen, Sammelstellen und Kosten.
   - Regelmässige Abfuhr: **nur** «Jeden Donnerstag», kein «Nächstes Mal: in 3 Tagen». Seltene Abfuhr: «In 17 Tagen (…)».
   - **PET** gehört unter **Plastik**. Bei Plastik (und evtl. Farben, Metall, Glas, Elektronik) eine **zweite Auswahl** der Sorte, jede Sorte mit eigenem Ergebnis.
   - **Sammelstellen im ganzen Kanton** (privat und staatlich), mit Angebot und Kosten, **Gratis-Angebote zuerst** (ohne das dem Benutzer zu sagen).
   - **Texte:** Was den Benutzer nicht betrifft, nicht zeigen. Kurze Texte sachlich und «titelig», nicht salopp (z.B. «Recycling empfohlen», «Sorte wählen», «Gratis zurück in den Laden»). Gleiches immer gleich formulieren.
   - Immer **die gleichen Abschnitt-Titel**: So bereitstellen · Wird nicht mitgenommen · Sammelstellen · Gut zu wissen. Leere Abschnitte weglassen, nichts doppelt.
   - «Wird nicht abgeholt»: gross nur allgemein («An Sammelstelle entsorgen», «Gratis zurück in den Laden»), die einzelnen Stellen unten.
   - Gegenstände, die in den Hauskehricht gehören: klar «Einfach in den Hauskehricht (Böcklisack)».
   - **Recycling zuerst:** Gibt es eine Recycling-Möglichkeit (z.B. RecyBag bei Plastik), steht sie zuoberst («Am besten recyceln»), die Abfuhr nur als «Oder …».
   - **reparierBar** ist keine Sammelstelle: steht nur auf der Karte (Filter «Reparieren»). Der frühere Hinweis über den Tabs wurde am 21.11.2026 entfernt (irritierend).
3. **Kalender-Tab** (erledigt 21.11.2026: 3a `js/kalender.js`, 3b Push mit Supabase – auf dem Handy getestet): Stern im Ergebnis = Kombination Abfall + Strasse speichern. Stern antippen → Auswahl «Alle Termine» / «Nur diesen Termin». Wer daneben tippt, speichert alle Termine. Stern wegtippen → alle Termine dieser Kombination löschen. Ansicht Liste oder Kalender (Woche / **Monat** / Jahr). Erinnerung wählbar.
   - **Push-Erinnerungen:** mit einem Knopf ein-/ausschalten (keine Abfrage beim Start). Technik: **Supabase** speichert die Anmeldungen und weckt jede Stunde (`pg_cron`), eine **Python-Funktion auf Vercel** (`api/`) schickt die Nachricht. Auf dem iPhone nur, wenn die App auf dem Startbildschirm installiert ist. Anleitung mit jedem Klick nötig.
   - **Download für den eigenen Kalender** (.ics mit Erinnerung): beim Speichern mit dem Stern **und** ganz unten in der Übersicht, wenn man im Kalender-Tab einen Eintrag antippt.
4. ~~**Abfall-ABC-Tab**~~ (erledigt 21.11.2026): detaillierte Liste, welcher Gegenstand zu welcher Abfallart gehört (Das gehört in den Hauskehricht: …), mit Hinweis, wo man nachfragen kann, wenn es unklar ist.
5. ~~**Karten-Tab**~~ (erledigt 21.11.2026; offen: geprüfte Reparaturbetriebe, Brockenstuben Stein am Rhein/Neunkirch, siehe `notizen/recherche-entsorgung.md`): Sammelstellen auf einer Karte. Idee: Filter nach **Sammelstellen, Brockenhäusern und Reparaturbetrieben** (reparierBar usw.).
6. ~~Icon und gelber Startbildschirm~~ (erledigt 21.11.2026, inkl. weisses Sack-Symbol für Android-Benachrichtigungen).
7. ~~Live-Daten über Vercel~~ (erledigt 21.11.2026).
9. **Englisch** (später, nach Abfall-ABC und Karte): Texte in `data/texte.js` mit DE/EN, Daten der Stadt bleiben deutsch.
8. **Unbedingt nachholen:** https://www.abfall-sh.ch (KBA Hard) war am 21.11.2026 nicht erreichbar. Preise für Sperrgut, Inertstoffe usw. dort nachlesen und in `notizen/recherche-entsorgung.md` und die App übernehmen.

## Für später geplant (jetzt noch nicht einbauen)

- Genauere Infos zu Sonderabfällen (z.B. Wasser mit Acrylfarbe ist Giftabfall und gehört nicht ins Becken) – kommt mit der zweiten Auswahl und dem Abfall-ABC.

Dafür ist der Code schon vorbereitet: `ergebnisBerechnen()` in `js/app.js` gibt ein einfaches Objekt zurück, das sich auch zum Anpinnen oder für den Kalender-Export verwenden lässt.
