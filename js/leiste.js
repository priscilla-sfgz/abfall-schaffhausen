// =========================================================
// Abfall Schaffhausen – weisse Tab-Leiste mit runder Einbuchtung
//
// Die Leiste ist eine SVG-Form (<svg class="leiste-grund"> in index.html).
// Unter dem ausgewählten Tab hat sie ein rundes Loch mit abgerundeten
// Ecken. Beim Tab-Wechsel schliesst sich das alte Loch, und das neue
// geht auf. Der gelbe Kreis und das Icon bewegen sich per CSS mit.
// Wird vor js/app.js geladen; app.js ruft leisteSetzen() auf.
// =========================================================

const LOCH = {
  mitte: 22,     // Mitte des Lochs, von oben gemessen (px)
  radius: 31,    // Radius des Lochs (gelber Kreis hat 25, also 6 px Abstand)
  rundung: 16,   // Rundung der Ecken, wo das Loch in die gerade Kante übergeht
  dauer: 320,    // Dauer der Animation (Millisekunden)
};

let leisteX = null;          // Mitte des aktuellen Lochs (px von links)
let leisteAnimation = null;  // laufende Animation

// Pfad-Stück für ein Loch bei x. t = Grösse von 0 (zu) bis 1 (ganz offen).
// Rechnung: Die Ecken-Rundung ist ein kleiner Kreis, der die gerade Kante
// und das Loch genau berührt.
function lochPfad(x, t) {
  if (t < 0.01) return "";
  const r = LOCH.radius * t, f = LOCH.rundung * t, m = LOCH.mitte * t;
  const dy = m - f;
  const dx = Math.sqrt((r + f) ** 2 - dy ** 2);
  const k = r / (r + f);
  const px = dx * k, py = m - dy * k;
  return `H${x - dx}A${f} ${f} 0 0 1 ${x - px} ${py}`
    + `A${r} ${r} 0 1 0 ${x + px} ${py}`
    + `A${f} ${f} 0 0 1 ${x + dx} 0`;
}

// Zeichnet die Leiste mit den angegebenen Löchern [{ x, t }, …]
function leisteZeichnen(loecher) {
  const svg = document.querySelector(".leiste-grund");
  const breite = svg.clientWidth, hoehe = svg.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${breite} ${hoehe}`);
  const teile = [...loecher].sort((a, b) => a.x - b.x).map((l) => lochPfad(l.x, l.t)).join("");
  svg.querySelector("path").setAttribute("d", `M0 0${teile}H${breite}V${hoehe}H0Z`);
}

// Sanft anfangen und sanft aufhören
function sanft(p) {
  return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
}

// Loch unter den ausgewählten Tab setzen. animiert = false z.B. beim Start
function leisteSetzen(animiert = true) {
  const aktiv = document.querySelector(".tab.aktiv");
  if (!aktiv) return;
  const neuX = aktiv.offsetLeft + aktiv.offsetWidth / 2;
  const altX = leisteX;
  leisteX = neuX;
  if (leisteAnimation) cancelAnimationFrame(leisteAnimation);

  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animiert || altX === null || altX === neuX || ruhig) {
    leisteZeichnen([{ x: neuX, t: 1 }]);
    return;
  }
  const start = performance.now();
  function schritt(jetzt) {
    const p = Math.min(1, (jetzt - start) / LOCH.dauer);
    const e = sanft(p);
    leisteZeichnen([{ x: altX, t: 1 - e }, { x: neuX, t: e }]);
    leisteAnimation = p < 1 ? requestAnimationFrame(schritt) : null;
  }
  leisteAnimation = requestAnimationFrame(schritt);
  // Sicherheit: Läuft die Animation nicht (z.B. App im Hintergrund), trotzdem am Ende richtig zeichnen
  setTimeout(() => {
    if (leisteX === neuX) {
      cancelAnimationFrame(leisteAnimation);
      leisteAnimation = null;
      leisteZeichnen([{ x: neuX, t: 1 }]);
    }
  }, LOCH.dauer + 80);
}

function leisteEinrichten() {
  leisteSetzen(false);
  window.addEventListener("resize", () => {
    leisteX = null;
    leisteSetzen(false);
  });
}
