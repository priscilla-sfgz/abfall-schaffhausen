// =========================================================
// Abfall Schaffhausen – «Zurück» (Android-Zurück-Geste, Zurück-Taste,
// Wischen vom linken Rand auf dem iPhone)
//
// Idee: Was man mit «Zurück» schliessen kann (Vorschlagsliste,
// Termin-Übersicht, anderer Tab), meldet sich hier als «Ebene» an.
// Für jede Ebene gibt es einen Eintrag im Browser-Verlauf.
// «Zurück» entfernt den Eintrag – dann schliessen wir die oberste Ebene.
// Ganz unten (Tab Entsorgung, nichts offen) verlässt «Zurück» die App wie gewohnt.
// =========================================================

const zurueckStapel = [];     // offene Ebenen, die oberste zuletzt
let zurueckIgnorieren = 0;    // so viele «Zurück» haben wir selbst ausgelöst

// Eine Ebene ist aufgegangen. schliessen = was bei «Zurück» passieren soll.
function ebeneOeffnen(name, schliessen) {
  if (zurueckStapel.some((e) => e.name === name)) return;   // schon angemeldet
  zurueckStapel.push({ name, schliessen });
  history.pushState({ ebene: zurueckStapel.length }, "");
}

// Eine Ebene wurde anders geschlossen (z.B. Eintrag gewählt): Verlaufseintrag wieder entfernen
function ebeneGeschlossen(name) {
  const nr = zurueckStapel.findIndex((e) => e.name === name);
  if (nr === -1) return;
  zurueckStapel.splice(nr, 1);
  zurueckIgnorieren++;
  history.back();
}

window.addEventListener("popstate", () => {
  if (zurueckIgnorieren > 0) {
    zurueckIgnorieren--;
    return;
  }
  const ebene = zurueckStapel.pop();
  if (ebene) ebene.schliessen();
});

// iPhone als installierte App: Dort gibt es keine Zurück-Geste des Systems.
// Darum selbst erkennen: vom linken Rand nach rechts wischen.
if (navigator.standalone === true) {
  let start = null;
  document.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    start = e.touches.length === 1 && t.clientX < 24 ? { x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!start) return;
    const t = e.changedTouches[0];
    const nachRechts = t.clientX - start.x;
    const hochRunter = Math.abs(t.clientY - start.y);
    start = null;
    if (nachRechts > 70 && hochRunter < 60 && zurueckStapel.length > 0) history.back();
  }, { passive: true });
}
