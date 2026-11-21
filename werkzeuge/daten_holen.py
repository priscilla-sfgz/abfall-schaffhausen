"""
Holt die Abfuhrtermine und Strassen vom Abfallkalender der Stadt Schaffhausen
und speichert sie in der Datei data/touren.js.

Die App lädt normalerweise die Live-Daten von /api/touren. data/touren.js ist
der Rückfall (z.B. offline oder wenn die Stadt-Website nicht erreichbar ist).
Ab und zu neu erstellen schadet nicht.

Ausführen (im Projektordner, in PowerShell):
    python werkzeuge/daten_holen.py

Die eigentliche Lese-Logik steht in api/_abfallkalender.py.
"""

import json
import sys
from pathlib import Path

PROJEKT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJEKT / "api"))
import _abfallkalender  # noqa: E402

ZIEL_DATEI = PROJEKT / "data" / "touren.js"


def main():
    daten = _abfallkalender.alles_holen(melden=print)
    inhalt = (
        "// Automatisch erstellt mit werkzeuge/daten_holen.py – nicht von Hand bearbeiten.\n"
        "// Quelle: Abfallkalender Stadt Schaffhausen\n"
        "window.TOUREN_DATEN = " + json.dumps(daten, ensure_ascii=False, indent=1) + ";\n"
    )
    ZIEL_DATEI.write_text(inhalt, encoding="utf-8")
    print(f"\n{len(daten['strassen'])} Strassen gespeichert in {ZIEL_DATEI}")


if __name__ == "__main__":
    main()
