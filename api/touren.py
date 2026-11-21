"""
Vercel-Funktion /api/touren
Liefert die aktuellen Abfuhrtermine und Strassen (live von der Stadt-Website).

Zwischenspeicher: Vercel merkt sich die Antwort 12 Stunden (s-maxage).
Die Stadt-Website wird deshalb höchstens etwa 2-mal pro Tag abgefragt.
Bei einem Fehler antwortet die Funktion mit 502 – die App nimmt dann data/touren.js.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _abfallkalender  # noqa: E402

ZWISCHENSPEICHER = "public, max-age=0, s-maxage=43200, stale-while-revalidate=86400"


class handler(BaseHTTPRequestHandler):

    def antworten(self, status, daten, cache):
        inhalt = json.dumps(daten, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(inhalt)))
        self.send_header("Cache-Control", cache)
        self.end_headers()
        self.wfile.write(inhalt)

    def do_GET(self):
        try:
            daten = _abfallkalender.alles_holen()
        except Exception as fehler:   # Stadt-Website nicht erreichbar oder umgebaut
            print("Fehler beim Lesen:", type(fehler).__name__, fehler)
            return self.antworten(502, {"fehler": "Daten nicht verfügbar"}, "no-store")
        return self.antworten(200, daten, ZWISCHENSPEICHER)
