"""
Vercel-Funktion /api/senden
Wird jede Stunde von Supabase aufgerufen (pg_cron) und verschickt
die fälligen Push-Erinnerungen:

  um 19 Uhr: «vorabend» – Termine von morgen
  um  6 Uhr: «morgen»   – Termine von heute

Zum Testen: POST mit {"test": true} schickt allen Geräten sofort eine Test-Nachricht.

Nötige Umgebungsvariablen bei Vercel:
  SUPABASE_URL, SUPABASE_SECRET_KEY, VAPID_PRIVATE_KEY, CRON_SECRET
"""

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from zoneinfo import ZoneInfo

# pywebpush wird erst in senden() geladen: Das Laden dauert einige Sekunden,
# und die meisten stündlichen Aufrufe müssen gar nichts senden.

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
CRON_SECRET = os.environ.get("CRON_SECRET", "")
ABSENDER = {"sub": "https://abfall-schaffhausen.vercel.app"}


def supabase(methode, pfad):
    """Schickt eine Anfrage an die Supabase-Datenbank (Data API)."""
    header = {"apikey": SUPABASE_KEY}
    if SUPABASE_KEY.startswith("eyJ"):   # alter «service_role»-Schlüssel
        header["Authorization"] = "Bearer " + SUPABASE_KEY
    anfrage = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{pfad}", method=methode, headers=header)
    with urllib.request.urlopen(anfrage, timeout=10) as antwort:
        inhalt = antwort.read()
        return json.loads(inhalt) if inhalt else None


def nachricht_bauen(lesezeichen, zeitpunkt, datum, vorsilbe):
    """Sucht die fälligen Termine eines Geräts und baut daraus eine Nachricht (oder None)."""
    zeilen = []
    for eintrag in lesezeichen:
        if eintrag.get("zeitpunkt") != zeitpunkt:
            continue
        for termin in eintrag.get("daten", []):
            if termin.get("datum") == datum:
                zeilen.append((eintrag.get("titel", ""), termin.get("text", ""), eintrag.get("ort", "")))
    if not zeilen:
        return None
    return {
        "titel": f"{vorsilbe}: " + ", ".join(titel for titel, _, _ in zeilen),
        "text": "\n".join(f"{titel}: {text}".rstrip(": ") + (f" ({ort})" if ort else "") for titel, text, ort in zeilen),
    }


def senden(abo, nachricht):
    """Schickt eine Push-Nachricht. Gibt False zurück, wenn das Gerät nicht mehr existiert."""
    from pywebpush import WebPushException, webpush
    try:
        webpush(
            subscription_info=abo,
            data=json.dumps(nachricht),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=dict(ABSENDER),
            ttl=6 * 3600,
        )
    except WebPushException as fehler:
        status = fehler.response.status_code if fehler.response is not None else None
        print("Push-Fehler:", status, fehler)
        if status in (404, 410):   # Abo abgelaufen oder abgemeldet
            return False
    return True


class handler(BaseHTTPRequestHandler):

    def antworten(self, status, daten):
        inhalt = json.dumps(daten).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(inhalt)))
        self.end_headers()
        self.wfile.write(inhalt)

    def do_GET(self):
        self.ausfuehren(test=False)

    def do_POST(self):
        laenge = int(self.headers.get("Content-Length") or 0)
        try:
            daten = json.loads(self.rfile.read(min(laenge, 10_000)) or b"{}")
        except ValueError:
            daten = {}
        self.ausfuehren(test=bool(daten.get("test")))

    def ausfuehren(self, test):
        # Nur Supabase (mit dem geheimen CRON_SECRET) darf diese Funktion auslösen
        if not CRON_SECRET or self.headers.get("Authorization") != f"Bearer {CRON_SECRET}":
            return self.antworten(401, {"fehler": "Nicht erlaubt"})

        jetzt = datetime.now(ZoneInfo("Europe/Zurich"))
        if test:
            zeitpunkt = None
        elif jetzt.hour == 19:
            zeitpunkt, datum, vorsilbe = "vorabend", (jetzt + timedelta(days=1)).date().isoformat(), "Morgen"
        elif jetzt.hour == 6:
            zeitpunkt, datum, vorsilbe = "morgen", jetzt.date().isoformat(), "Heute"
        else:
            return self.antworten(200, {"gesendet": 0, "grund": f"keine Sendezeit ({jetzt:%H:%M})"})

        geraete = supabase("GET", "erinnerungen?select=endpoint,abo,lesezeichen") or []
        gesendet = 0
        for geraet in geraete:
            if test:
                nachricht = {"titel": "Abfall Schaffhausen", "text": "Test: Push-Erinnerungen funktionieren."}
            else:
                nachricht = nachricht_bauen(geraet["lesezeichen"] or [], zeitpunkt, datum, vorsilbe)
            if not nachricht:
                continue
            if senden(geraet["abo"], nachricht):
                gesendet += 1
            else:
                supabase("DELETE", "erinnerungen?endpoint=eq." + urllib.parse.quote(geraet["endpoint"], safe=""))
        return self.antworten(200, {"gesendet": gesendet, "geraete": len(geraete)})
