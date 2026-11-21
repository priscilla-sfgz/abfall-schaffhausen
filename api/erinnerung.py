"""
Vercel-Funktion /api/erinnerung
Speichert, welches Gerät an welche Termine erinnert werden will.

  POST   {"abo": {...}, "lesezeichen": [...]}  → speichern (ersetzt alte Angaben dieses Geräts)
  DELETE {"endpoint": "https://..."}           → alles von diesem Gerät löschen

Die Daten liegen in Supabase (Tabelle «erinnerungen»).
Nötige Umgebungsvariablen bei Vercel: SUPABASE_URL, SUPABASE_SECRET_KEY
"""

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
MAX_GROESSE = 200_000   # Bytes – grössere Anfragen werden abgelehnt


def supabase(methode, pfad, daten=None, extra_header=None):
    """Schickt eine Anfrage an die Supabase-Datenbank (Data API)."""
    header = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
    if SUPABASE_KEY.startswith("eyJ"):   # alter «service_role»-Schlüssel
        header["Authorization"] = "Bearer " + SUPABASE_KEY
    header.update(extra_header or {})
    anfrage = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{pfad}",
        method=methode,
        headers=header,
        data=json.dumps(daten).encode("utf-8") if daten is not None else None,
    )
    with urllib.request.urlopen(anfrage, timeout=10) as antwort:
        inhalt = antwort.read()
        return json.loads(inhalt) if inhalt else None


class handler(BaseHTTPRequestHandler):

    def antworten(self, status, daten):
        inhalt = json.dumps(daten).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(inhalt)))
        self.end_headers()
        self.wfile.write(inhalt)

    def daten_lesen(self):
        laenge = int(self.headers.get("Content-Length") or 0)
        if laenge > MAX_GROESSE:
            raise ValueError("Anfrage zu gross")
        return json.loads(self.rfile.read(laenge) or b"{}")

    def do_POST(self):
        try:
            daten = self.daten_lesen()
            abo = daten["abo"]
            endpoint = abo["endpoint"]
            if not endpoint.startswith("https://"):
                raise ValueError("Ungültiges Abo")
            lesezeichen = daten.get("lesezeichen", [])[:50]
        except (ValueError, KeyError, TypeError):
            return self.antworten(400, {"fehler": "Ungültige Anfrage"})

        try:
            supabase(
                "POST",
                "erinnerungen?on_conflict=endpoint",
                {
                    "endpoint": endpoint,
                    "abo": abo,
                    "lesezeichen": lesezeichen,
                    "aktualisiert": datetime.now(timezone.utc).isoformat(),
                },
                {"Prefer": "resolution=merge-duplicates"},
            )
        except Exception as fehler:   # z.B. Supabase nicht erreichbar
            print("Supabase-Fehler:", fehler)
            return self.antworten(502, {"fehler": "Speichern fehlgeschlagen"})
        return self.antworten(200, {"gespeichert": len(lesezeichen)})

    def do_DELETE(self):
        try:
            endpoint = self.daten_lesen()["endpoint"]
            supabase("DELETE", "erinnerungen?endpoint=eq." + urllib.parse.quote(endpoint, safe=""))
        except (ValueError, KeyError, TypeError):
            return self.antworten(400, {"fehler": "Ungültige Anfrage"})
        except Exception as fehler:
            print("Supabase-Fehler:", fehler)
            return self.antworten(502, {"fehler": "Löschen fehlgeschlagen"})
        return self.antworten(200, {"geloescht": True})
