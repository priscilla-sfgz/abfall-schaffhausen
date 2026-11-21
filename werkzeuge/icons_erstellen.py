"""
Erstellt aus den SVG-Dateien in img/icons/ alle PNG-Icons.

Aufruf (im Projektordner):  python werkzeuge/icons_erstellen.py

Braucht: Google Chrome (zum Zeichnen der SVGs) und Pillow (pip install pillow).

  icon.svg          → icon-180.png (iPhone, gelbes Quadrat)
  startbild.svg     → icon-512.png, icon-192.png (rund, ohne gelbes Quadrat –
                      Android zeigt dieses Icon auf dem gelben Startbildschirm)
  icon-maskable.svg → icon-512-maskable.png (Android-Home-Bildschirm und Android-Startbildschirm;
                      weisser Hintergrund, weil Android das Icon in einen weissen Kreis legt)
  badge.svg         → badge-96.png (weisses Symbol in der Statusleiste bei Benachrichtigungen)
"""

import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ORDNER = Path(__file__).resolve().parent.parent / "img" / "icons"
CHROME_ORTE = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]
GROESSE = 1024   # zuerst gross zeichnen, dann verkleinern (wird schärfer)

AUFTRAEGE = [
    ("icon.svg", [("icon-180.png", 180)]),
    ("startbild.svg", [("icon-512.png", 512), ("icon-192.png", 192)]),
    ("icon-maskable.svg", [("icon-512-maskable.png", 512)]),
    ("badge.svg", [("badge-96.png", 96)]),
]


def chrome_finden():
    for ort in CHROME_ORTE:
        if ort.exists():
            return ort
    raise SystemExit("Chrome oder Edge nicht gefunden.")


def svg_zeichnen(chrome, svg_datei, ziel_png):
    """Zeichnet eine SVG-Datei mit Chrome als PNG (durchsichtiger Hintergrund)."""
    with tempfile.TemporaryDirectory() as tmp:
        seite = Path(tmp) / "seite.html"
        seite.write_text(
            f'<!doctype html><body style="margin:0"><img src="{svg_datei.as_uri()}" '
            f'width="{GROESSE}" height="{GROESSE}" style="display:block"></body>',
            encoding="utf-8",
        )
        subprocess.run([
            str(chrome), "--headless=new", "--disable-gpu", "--hide-scrollbars",
            f"--user-data-dir={tmp}/profil", "--allow-file-access-from-files",
            "--default-background-color=00000000",
            f"--window-size={GROESSE},{GROESSE}", f"--screenshot={ziel_png}", seite.as_uri(),
        ], check=True, capture_output=True, timeout=60)


def main():
    chrome = chrome_finden()
    for svg_name, ziele in AUFTRAEGE:
        with tempfile.TemporaryDirectory() as tmp:
            gross = Path(tmp) / "gross.png"
            svg_zeichnen(chrome, ORDNER / svg_name, gross)
            bild = Image.open(gross).convert("RGBA").crop((0, 0, GROESSE, GROESSE))
            for ziel_name, pixel in ziele:
                klein = bild.resize((pixel, pixel), Image.LANCZOS)
                if ziel_name in ("icon-180.png", "icon-512-maskable.png"):
                    klein = klein.convert("RGB")   # diese Icons ohne Durchsichtigkeit
                klein.save(ORDNER / ziel_name, optimize=True)
                print("erstellt:", ziel_name)


if __name__ == "__main__":
    main()
