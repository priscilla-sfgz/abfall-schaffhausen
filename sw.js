// =========================================================
// Service Worker – macht die App offline nutzbar.
// Strategie: zuerst immer aus dem Internet laden (damit du
// Änderungen sofort siehst). Nur ohne Internet wird die
// zuletzt gespeicherte Version verwendet.
// =========================================================

const CACHE_NAME = "abfall-sh-v14";

const DATEIEN = [
  "./",
  "index.html",
  "css/style.css",
  "js/leiste.js",
  "js/zurueck.js",
  "js/kalender.js",
  "js/erinnerungen.js",
  "js/abc.js",
  "js/karte.js",
  "data/karte.js",
  "js/app.js",
  "data/touren.js",
  "data/abfallarten.js",
  "data/sammelstellen.js",
  "manifest.webmanifest",
  "img/icons/icon-192.png",
  "img/icons/startbild.svg",
  "img/icons/badge-96.png",
];

// Beim Installieren die wichtigsten Dateien speichern
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(DATEIEN)));
  self.skipWaiting();
});

// Alte Speicher-Versionen aufräumen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Jede Anfrage: zuerst Internet, sonst gespeicherte Version
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((antwort) => {
        if (antwort.ok && new URL(event.request.url).origin === location.origin) {
          const kopie = antwort.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(event.request))
  );
});

// ---------------------------------------------------------
// Push-Erinnerungen (verschickt von /api/senden)
// ---------------------------------------------------------

// Nachricht anzeigen
self.addEventListener("push", (event) => {
  let daten = { titel: "Abfall Schaffhausen", text: "" };
  try { daten = event.data.json(); } catch (fehler) { /* Standardtext */ }
  event.waitUntil(
    self.registration.showNotification(daten.titel, {
      body: daten.text,
      icon: "img/icons/icon-192.png",
      badge: "img/icons/badge-96.png",   // weisses Symbol für die Statusleiste (Android)
      tag: "abfall-erinnerung",
      data: daten.ziel || null,   // Strasse und Abfallart für das Antippen
    })
  );
});

// Antippen der Nachricht öffnet die App mit dem passenden Ergebnis (Tab Entsorgung)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const ziel = event.notification.data;
  const adresse = ziel
    ? "./?" + new URLSearchParams({ strasse: ziel.strasse, text: ziel.strasseText || "", abfall: ziel.abfall })
    : "./";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenster) => {
      if (fenster.length > 0) {
        // App ist schon offen: Ergebnis dort zeigen (js/app.js hört auf diese Nachricht)
        if (ziel) fenster[0].postMessage({ typ: "ergebnisZeigen", ziel });
        return fenster[0].focus();
      }
      return clients.openWindow(adresse);
    })
  );
});
