// =========================================================
// Abfall Schaffhausen – Tab «Karte»
// Zeigt die Orte aus data/karte.js auf einer Karte (OpenStreetMap).
// Die Karten-Bibliothek «Leaflet» wird erst geladen, wenn man den
// Tab zum ersten Mal öffnet – so startet die App schneller.
// =========================================================

const LEAFLET_URL = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";

// Die drei Filter-Knöpfe. Unterflurcontainer gehören zu den Sammelstellen.
const KARTEN_FILTER = [
  { id: "sammelstelle", text: "Sammelstellen", typen: ["sammelstelle", "unterflur"] },
  { id: "brocki", text: "Brockenhäuser", typen: ["brocki"] },
  { id: "reparatur", text: "Reparieren", typen: ["reparatur"] },
];

// Farbe der Punkte je nach Art
const KARTEN_FARBEN = {
  sammelstelle: "#005e74",   // Petrol
  unterflur: "#5c8f9c",      // helles Petrol
  brocki: "#c47f00",         // Ocker
  reparatur: "#2e7d32",      // Grün
};

const karte = {
  leaflet: null,   // die Karte, sobald sie geladen ist
  ebenen: {},      // pro Filter eine Gruppe von Punkten
  an: new Set(KARTEN_FILTER.map((f) => f.id)),   // eingeschaltete Filter
  laedt: false,
};

// Lädt eine Datei (Skript oder Stylesheet) aus dem Internet
function dateiLaden(url, istCss) {
  return new Promise((fertig, fehler) => {
    const element = document.createElement(istCss ? "link" : "script");
    if (istCss) { element.rel = "stylesheet"; element.href = url; } else { element.src = url; }
    element.onload = fertig;
    element.onerror = fehler;
    document.head.appendChild(element);
  });
}

// Text im Fenster, das beim Antippen eines Punkts erscheint
function ortText(ort) {
  const route = `https://www.google.com/maps/dir/?api=1&destination=${ort.lage[0]},${ort.lage[1]}`;
  return `<strong>${sicher(ort.name)}</strong>`
    + (ort.ort ? `<br>${sicher(ort.ort)}` : "")
    + (ort.zeiten ? `<br><span class="karten-zeiten">${sicher(ort.zeiten)}</span>` : "")
    + (ort.info ? `<br>${sicher(ort.info)}` : "")
    + `<br><a href="${route}" target="_blank" rel="noopener">Route</a>`
    + (ort.link ? ` · <a href="${sicher(ort.link)}" target="_blank" rel="noopener">Website</a>` : "");
}

function filterZeichnen() {
  document.getElementById("karten-filter").innerHTML = KARTEN_FILTER
    .map((f) => `<button type="button" class="chip karten-chip${karte.an.has(f.id) ? " an" : ""}" data-filter="${f.id}" aria-pressed="${karte.an.has(f.id)}">
      <span class="punkt" style="background:${KARTEN_FARBEN[f.id]}"></span>${sicher(f.text)}</button>`)
    .join("");
}

function filterUmschalten(id) {
  if (karte.an.has(id)) karte.an.delete(id); else karte.an.add(id);
  filterZeichnen();
  for (const f of KARTEN_FILTER) {
    const ebene = karte.ebenen[f.id];
    if (karte.an.has(f.id)) ebene.addTo(karte.leaflet); else ebene.remove();
  }
}

async function karteErstellen() {
  const bereich = document.getElementById("karten-flaeche");
  try {
    await Promise.all([dateiLaden(LEAFLET_URL + "leaflet.min.css", true), dateiLaden(LEAFLET_URL + "leaflet.min.js")]);
  } catch (fehler) {
    karte.laedt = false;
    bereich.innerHTML = `<p class="platzhalter">Karte nur mit Internet verfügbar</p>`;
    return;
  }

  // Start: Stadt Schaffhausen
  karte.leaflet = L.map(bereich, { zoomControl: false }).setView([47.6995, 8.6370], 14);
  L.control.zoom({ position: "topright" }).addTo(karte.leaflet);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(karte.leaflet);

  for (const f of KARTEN_FILTER) {
    karte.ebenen[f.id] = L.layerGroup(
      window.KARTE_ORTE
        .filter((ort) => f.typen.includes(ort.typ))
        .map((ort) => L.circleMarker(ort.lage, {
          radius: ort.typ === "unterflur" ? 6 : 8,
          color: "#ffffff",
          weight: 2,
          fillColor: KARTEN_FARBEN[ort.typ],
          fillOpacity: 1,
        }).bindPopup(ortText(ort)))
    ).addTo(karte.leaflet);
  }
}

// Wird aufgerufen, wenn der Tab «Karte» angezeigt wird
function karteZeigen() {
  if (karte.leaflet) {
    karte.leaflet.invalidateSize();   // Grösse neu messen (war versteckt)
    return;
  }
  if (karte.laedt) return;
  karte.laedt = true;
  karteErstellen();
}

function karteEinrichten() {
  filterZeichnen();
  document.getElementById("karten-filter").addEventListener("click", (e) => {
    const knopf = e.target.closest("[data-filter]");
    if (knopf && karte.leaflet) filterUmschalten(knopf.dataset.filter);
  });
}
