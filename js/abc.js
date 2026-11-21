// =========================================================
// Abfall Schaffhausen – Tab «Abfall-ABC»
// Alle Gegenstände aus data/abfallarten.js, nach Abfallart
// gruppiert oder von A bis Z. Antippen zeigt das Ergebnis
// im Tab «Entsorgung».
// Wird vor js/app.js geladen; abcEinrichten() ruft app.js auf.
// =========================================================

const abc = { ansicht: "arten" };   // "arten" oder "az"

// Alle Gegenstände plus die Abfallarten selbst (z.B. «Sperrgut»)
function abcEintraege() {
  return ABFALL_BEGRIFFE.map((b, nr) => ({ ...b, nr }));
}

function abcSortieren(eintraege) {
  return [...eintraege].sort((a, b) => a.text.localeCompare(b.text, "de-CH"));
}

function abcZeile(e) {
  return `<li><button type="button" class="abc-eintrag" data-nr="${e.nr}">${sicher(e.text)}`
    + (abc.ansicht === "az" ? `<span class="klein">${sicher(ABFALLARTEN[e.id].name)}</span>` : "")
    + `</button></li>`;
}

// Ansicht «Nach Abfallart»: aufklappbare Gruppen
function abcNachArten(eintraege, sucht) {
  const alle = abcEintraege();
  return Object.entries(ABFALLARTEN)
    .map(([id, art]) => {
      // Passt die Abfallart selbst zur Suche (z.B. «Sperrgut»), alle ihre Gegenstände zeigen
      const artPasst = eintraege.some((e) => e.id === id && e.istArt);
      const quelle = artPasst ? alle : eintraege;
      const liste = abcSortieren(quelle.filter((e) => e.id === id && !e.istArt));
      if (liste.length === 0) return "";
      return `<details${sucht ? " open" : ""}>
        <summary>${sicher(art.name)} <span class="anzahl">${liste.length}</span></summary>
        <ul>${liste.map(abcZeile).join("")}</ul>
      </details>`;
    })
    .join("");
}

// Ansicht «A–Z»: eine Liste mit Buchstaben als Zwischentitel
function abcVonAbisZ(eintraege) {
  let buchstabe = "";
  return abcSortieren(eintraege)
    .map((e) => {
      const erster = e.text[0].toUpperCase().normalize("NFD")[0];
      const titel = erster !== buchstabe ? `<li class="buchstabe">${sicher(erster)}</li>` : "";
      buchstabe = erster;
      return titel + abcZeile(e);
    })
    .join("");
}

function abcZeichnen() {
  const suche = document.getElementById("abc-suche").value;
  const sucht = suche.trim() !== "";
  // Beim Suchen: nur passende Einträge (gleiche Suche wie im Feld «Abfall»)
  const eintraege = sucht
    ? suchen(abcEintraege(), suche, (b) => b.suchtexte || b.text)
    : abcEintraege();

  document.querySelectorAll("[data-abc]").forEach((k) => k.classList.toggle("aktiv", k.dataset.abc === abc.ansicht));
  const bereich = document.getElementById("abc-inhalt");
  if (eintraege.length === 0) {
    bereich.innerHTML = `<p class="platzhalter">Nichts gefunden</p>`;
    return;
  }
  bereich.innerHTML = abc.ansicht === "arten"
    ? `<div class="abc-gruppen">${abcNachArten(eintraege, sucht)}</div>`
    : `<ul class="abc-liste">${abcVonAbisZ(eintraege)}</ul>`;
}

// Gegenstand angetippt: zum Tab «Entsorgung» wechseln und Ergebnis zeigen
function abcGewaehlt(begriff) {
  abfallWaehlen(begriff.id, { hinweis: begriff.hinweis, sorteFertig: !begriff.istArt });
  abfallFeld.eingabe.value = begriff.text;
  abfallFeld.leeren.hidden = false;
  tabWechseln("abfall");
  aktualisieren();
  if (!auswahl.strasse) strassenFeld.eingabe.focus();   // ohne Strasse gibt es kein Ergebnis
  window.scrollTo(0, 0);
}

function abcEinrichten() {
  const tab = document.getElementById("tab-abc");
  document.getElementById("abc-suche").addEventListener("input", abcZeichnen);
  tab.addEventListener("click", (e) => {
    const umschalten = e.target.closest("[data-abc]");
    const eintrag = e.target.closest(".abc-eintrag");
    if (umschalten) {
      abc.ansicht = umschalten.dataset.abc;
      abcZeichnen();
    } else if (eintrag) {
      abcGewaehlt(ABFALL_BEGRIFFE[Number(eintrag.dataset.nr)]);
    }
  });
  abcZeichnen();
}
