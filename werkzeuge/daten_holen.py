"""
Holt die Abfuhrtermine und Strassen vom Abfallkalender der Stadt Schaffhausen
und speichert sie in der Datei data/touren.js, die von der App gelesen wird.

Ausfuehren (im Projektordner, in PowerShell):
    python werkzeuge/daten_holen.py

Quelle: https://m.stadt-schaffhausen.ch/index.php?apid=917954978
Aufbau dort: Abfallart -> Touren -> pro Tour eine Seite mit Terminen und Strassen.
"""

import html
import json
import re
import urllib.request
from datetime import date
from pathlib import Path

BASIS_URL = "https://m.stadt-schaffhausen.ch"

# Abfallarten mit Touren und die Nummer (apid) ihrer Seite beim Abfallkalender
KATEGORIEN = {
    "hauskehricht": 173769616,
    "gruenabfall": 1133998044,
    "papier": 2140428229,
    "karton": 425274297,
    "altmetall": 1780443521,
}

ZIEL_DATEI = Path(__file__).resolve().parent.parent / "data" / "touren.js"


def seite_laden(apid):
    """Laedt eine Seite des Abfallkalenders und gibt den HTML-Text zurueck."""
    url = f"{BASIS_URL}/index.php?apid={apid}"
    anfrage = urllib.request.Request(url, headers={"User-Agent": "Abfall-Schaffhausen-App"})
    with urllib.request.urlopen(anfrage, timeout=30) as antwort:
        return antwort.read().decode("utf-8", "replace")


def nur_text(html_text):
    """Entfernt HTML-Tags und ueberfluessige Leerzeichen."""
    ohne_tags = re.sub(r"<[^>]+>", " ", html_text)
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
        # Zusaetzliche Notiz nach dem Datum, z.B. "Sammlung wird durchgefuehrt vom Schulhaus ..."
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
    Jeder Eintrag weiss, zu welcher Tour er pro Abfallart gehoert.
    """
    # 1. Alle Eintraege sammeln: Strassenname -> Liste von (Abfallart, Tour, zerlegter Eintrag)
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


def main():
    alle_touren = {}
    for kategorie, kategorie_apid in KATEGORIEN.items():
        touren = touren_finden(seite_laden(kategorie_apid), kategorie_apid)
        for tour_id, tour_name in touren.items():
            tour_html = seite_laden(tour_id)
            alle_touren[tour_id] = {
                "kategorie": kategorie,
                "name": tour_name,
                "termine": termine_lesen(tour_html),
                "strassenRoh": strassen_lesen(tour_html),
            }
            print(f"{tour_name}: {len(alle_touren[tour_id]['termine'])} Termine")

    strassen = strassenliste_bauen(alle_touren)
    for tour in alle_touren.values():
        del tour["strassenRoh"]

    daten = {"stand": date.today().isoformat(), "touren": alle_touren, "strassen": strassen}
    inhalt = (
        "// Automatisch erstellt mit werkzeuge/daten_holen.py – nicht von Hand bearbeiten.\n"
        "// Quelle: Abfallkalender Stadt Schaffhausen\n"
        "window.TOUREN_DATEN = " + json.dumps(daten, ensure_ascii=False, indent=1) + ";\n"
    )
    ZIEL_DATEI.write_text(inhalt, encoding="utf-8")
    print(f"\n{len(strassen)} Strassen gespeichert in {ZIEL_DATEI}")


if __name__ == "__main__":
    main()
