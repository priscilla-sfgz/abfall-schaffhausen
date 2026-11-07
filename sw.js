// =========================================================
// Service Worker – macht die App offline nutzbar.
// Strategie: zuerst immer aus dem Internet laden (damit du
// Änderungen sofort siehst). Nur ohne Internet wird die
// zuletzt gespeicherte Version verwendet.
// =========================================================

const CACHE_NAME = "abfall-sh-v1";

const DATEIEN = [
  "./",
  "index.html",
  "css/style.css",
  "js/app.js",
  "data/touren.js",
  "data/abfallarten.js",
  "manifest.webmanifest",
  "img/icons/icon-192.png",
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
