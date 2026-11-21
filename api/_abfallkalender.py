"""
Liest die Abfuhrtermine und Strassen vom Abfallkalender der Stadt Schaffhausen.

Wird von zwei Orten benutzt:
  - api/touren.py              (Live-Daten für die App, auf Vercel)
  - werkzeuge/daten_holen.py   (erstellt die Rückfall-Datei data/touren.js)

Der Unterstrich am Anfang des Dateinamens sorgt dafür, dass Vercel
daraus keine eigene Adresse (/api/...) macht.

Quelle: https://m.stadt-schaffhausen.ch/index.php?apid=917954978
Aufbau dort: Abfallart -> Touren -> pro Tour eine Seite mit Terminen und Strassen.
"""

import html
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date

BASIS_URL = "https://m.stadt-schaffhausen.ch"

# Abfallarten mit Touren und die Nummer (apid) ihrer Seite beim Abfallkalender
KATEGORIEN = {
    "hauskehricht": 173769616,
    "gruenabfall": 1133998044,
    "papier": 2140428229,
    "karton": 425274297,
    "altmetall": 1780443521,
}

GLEICHZEITIG = 6   # so viele Seiten werden gleichzeitig geladen


def seite_laden(apid):
    """Lädt eine Seite des Abfallkalenders und gibt den HTML-Text zurück."""
    url = f"{BASIS_URL}/index.php?apid={apid}"
    anfrage = urllib.request.Request(url, headers={"User-Agent": "Abfall-Schaffhausen-App"})
    with urllib.request.urlopen(anfrage, timeout=20) as antwort:
        return antwort.read().decode("utf-8", "replace")


def nur_text(html_text):
    """Entfernt HTML-Tags und überflüssige Leerzeichen."""
    ohne_tags = re.sub(r"<[^>]+>", " ", html_text)
    ohne_tags = re.sub(r"<[^>]*$", " ", ohne_tags)   # abgeschnittenes Tag am Ende, z.B. "<div class='"
    return re.sub(r"\s+", " ", html.unescape(ohne_tags)).strip()


def touren_finden(kategorie_html, kategorie_apid):
    """Findet auf der Seite einer Abfallart alle Touren (Nummer und Name)."""
    muster = r"href='/index.php\?apid=(\d+)&amp;apparentid=%d'[^>]*>(.*?)</a>" % kategorie_apid
    touren = {}
    for apid, inhalt in re.findall(muster, kategorie_html, re.S):
        titel = re.search(r"<div class='title'>(.*?)</div>", inhalt, re.S)
        touren[apid] = nur_text(titel.group(1) if titel else inhalt)
    return touren


def termine_lesen(tour_html):
    """Liest alle Termine einer Tour, inklusive Ausnahmen (z.B. Ausfall an Weihnachten)."""
    termine = []
    # Jeder Termin beginnt mit <a name='termin...'>
    for zeile in re.split(r"<a name='termin\d+'", tour_html)[1:]:
        zeile = re.split(r"<h3|elementListShowMore", zeile)[0]
        datum = re.search(r"from=(\d{4}-\d\d-\d\d)%20(\d\d)%3A(\d\d)", zeile)
        if not datum:
            continue
        ausnahme = re.search(r"exceptionNoteText'>(.*?)</div>", zeile, re.S)
        ausnahme_text = nur_text(ausnahme.group(1)) if ausnahme else ""
        # Zusätzliche Notiz nach dem Datum, z.B. "Sammlung wird durchgeführt vom Schulhaus ..."
        rest = nur_text(re.sub(r"exceptionNoteText'>.*?</div>", "'>", zeile, flags=re.S))
        notiz = rest.split("ganztägig", 1)[-1].replace("Ausnahme", "").strip() if "ganztägig" in rest else ""
        termine.append({
            "datum": datum.group(1),
            "zeit": f"{datum.group(2)}:{datum.group(3)}",
            "ausnahme": ausnahme_text or None,
            "faelltAus": bool(re.search(r"nicht statt|entfällt|fällt aus", ausnahme_text)),
            "notiz": notiz or None,
        })
    return termine


def strassen_lesen(tour_html):
    """Liest die Strassenliste einer Tour."""
    roh = re.findall(r"fa-road ' ></span></span>(.*?)</div>", tour_html, re.S)
    return [nur_text(s) for s in roh]


def strasse_zerlegen(eintrag):
    """
    Zerlegt einen Strasseneintrag der Stadt, z.B.
      "Alpenstrasse 1 - 115 Bürgerstrasse bis Kesselstrasse"
      "Ackergässchen Bereitstellen: Neustadt"
    in Strassenname, Hausnummern-Bereich, Zusatz und Bereitstellungsort.
    """
    teile = eintrag.split("Bereitstellen:", 1)
    links = teile[0].strip().rstrip(",").strip()
    # Fehlendes Leerzeichen vor einer Zahl ergänzen ("Im Freien55" → "Im Freien 55")
    links = re.sub(r"([a-zäöüé])(\d)", r"\1 \2", links)
    bereitstellen = teile[1].strip() if len(teile) > 1 else None
    bereich = re.match(r"^(.*?)\s+(\d+)\s*-\s*(\d+)\s*(.*)$", links)
    if bereich:
        name, von, bis, zusatz = bereich.groups()
        return {"name": name.strip(), "von": int(von), "bis": int(bis),
                "zusatz": zusatz.strip(" ,") or None, "bereitstellen": bereitstellen}
    return {"name": links, "von": None, "bis": None, "zusatz": None, "bereitstellen": bereitstellen}


def strassenliste_bauen(alle_touren):
    """
    Baut aus den Strassenlisten aller Touren eine gemeinsame Liste.
    Ist eine Strasse nach Hausnummern aufgeteilt, wird jeder Abschnitt ein eigener Eintrag.
    Jeder Eintrag weiss, zu welcher Tour er pro Abfallart gehört.
    """
    # 1. Alle Einträge sammeln: Strassenname -> Liste von (Abfallart, Tour, zerlegter Eintrag)
    nach_name = {}
    for tour_id, tour in alle_touren.items():
        for eintrag in tour["strassenRoh"]:
            teil = strasse_zerlegen(eintrag)
            nach_name.setdefault(teil["name"], []).append((tour["kategorie"], tour_id, teil))

    strassen = []
    for name, vorkommen in sorted(nach_name.items()):
        # 2. Abschnitte bestimmen (falls die Strasse irgendwo aufgeteilt ist)
        abschnitte = {}
        for _, _, teil in vorkommen:
            if teil["von"] is not None:
                abschnitte.setdefault((teil["von"], teil["bis"]), teil["zusatz"])
        if not abschnitte:
            abschnitte = {(None, None): None}

        for (von, bis), zusatz in sorted(abschnitte.items(), key=lambda x: x[0][0] or 0):
            eintrag = {
                "name": name if von is None else f"{name} {von}–{bis}",
                "strasse": name,   # nur der Strassenname, für die Suche mit Hausnummer
                "von": von,        # erste Hausnummer des Abschnitts (oder None)
                "bis": bis,        # letzte Hausnummer des Abschnitts (oder None)
                "zusatz": zusatz,
                "touren": {},
                "bereitstellen": {},
            }
            # 3. Pro Abfallart die passende Tour suchen
            for kategorie, tour_id, teil in vorkommen:
                passt = (teil["von"] is None or von is None or teil["von"] <= von <= teil["bis"])
                if passt and kategorie not in eintrag["touren"]:
                    eintrag["touren"][kategorie] = tour_id
                    if teil["bereitstellen"]:
                        eintrag["bereitstellen"][kategorie] = teil["bereitstellen"]
            strassen.append(eintrag)
    return strassen


def pruefen(daten):
    """
    Prüft, ob die Daten vernünftig aussehen. Hat die Stadt ihre Website umgebaut,
    findet das Programm vielleicht kaum noch etwas – dann lieber die alten Daten behalten.
    """
    for kategorie in KATEGORIEN:
        if not any(t["kategorie"] == kategorie for t in daten["touren"].values()):
            raise ValueError(f"Keine Touren für {kategorie} gefunden")
    if len(daten["strassen"]) < 300:
        raise ValueError(f"Nur {len(daten['strassen'])} Strassen gefunden")
    if not any(t["termine"] for t in daten["touren"].values() if t["kategorie"] == "hauskehricht"):
        raise ValueError("Keine Termine für den Hauskehricht gefunden")


def alles_holen(melden=None):
    """
    Lädt alle Touren und gibt die Daten zurück: {"stand", "touren", "strassen"}.
    melden: optionale Funktion, die pro Tour einen Text bekommt (für Ausgaben im Terminal).
    """
    with ThreadPoolExecutor(GLEICHZEITIG) as helfer:
        # 1. Seiten der Abfallarten laden → Liste der Touren
        kategorie_seiten = dict(zip(KATEGORIEN, helfer.map(seite_laden, KATEGORIEN.values())))
        tour_liste = []   # (tour_id, kategorie, name)
        for kategorie, kategorie_apid in KATEGORIEN.items():
            for tour_id, name in touren_finden(kategorie_seiten[kategorie], kategorie_apid).items():
                tour_liste.append((tour_id, kategorie, name))

        # 2. Alle Tour-Seiten gleichzeitig laden
        tour_seiten = list(helfer.map(seite_laden, [t[0] for t in tour_liste]))

    alle_touren = {}
    for (tour_id, kategorie, name), tour_html in zip(tour_liste, tour_seiten):
        alle_touren[tour_id] = {
            "kategorie": kategorie,
            "name": name,
            "termine": termine_lesen(tour_html),
            "strassenRoh": strassen_lesen(tour_html),
        }
        if melden:
            melden(f"{name}: {len(alle_touren[tour_id]['termine'])} Termine")

    strassen = strassenliste_bauen(alle_touren)
    for tour in alle_touren.values():
        del tour["strassenRoh"]

    daten = {"stand": date.today().isoformat(), "touren": alle_touren, "strassen": strassen}
    pruefen(daten)
    return daten
