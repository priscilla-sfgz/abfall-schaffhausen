# Abfall Schaffhausen

Web-App (PWA) für die Stadt Schaffhausen: Strasse und Abfall eingeben und sehen, ob und wann er abgeholt wird.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Seitenaufbau |
| `css/style.css` | Aussehen (Farben, Schriften, Layout) |
| `js/app.js` | Logik (Suche, Ergebnis, Strasse merken) |
| `data/abfallarten.js` | Abfallarten mit Hinweisen und Verzeichnis der Gegenstände – **hier darfst du gerne ergänzen** |
| `data/touren.js` | Termine und Strassen der Stadt (automatisch erstellt) |
| `werkzeuge/daten_holen.py` | Holt die aktuellen Daten vom Abfallkalender der Stadt |
| `manifest.webmanifest`, `sw.js` | Machen die App installierbar und offline nutzbar |
| `img/` | Bilder (Stadtlogo `logo.png`, Sack-Foto `boeckli.jpg`, App-Icons) |

## Auf dem PC anschauen

In PowerShell im Projektordner:

```
python -m http.server 8000
```

Dann im Browser <http://localhost:8000> öffnen. Beenden mit `Ctrl + C`.

## Daten aktualisieren

```
python werkzeuge/daten_holen.py
```

Quelle: [Abfallkalender Stadt Schaffhausen](https://m.stadt-schaffhausen.ch/index.php?apid=917954978)
