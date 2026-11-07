// =========================================================
// Abfall Schaffhausen – App-Logik
// =========================================================

// Die Daten kommen aus data/touren.js und data/abfallarten.js
const TOUREN = window.TOUREN_DATEN.touren;
const STRASSEN = window.TOUREN_DATEN.strassen;
const ABFALLARTEN = window.ABFALLARTEN;
const GEGENSTAENDE = window.GEGENSTAENDE;

// Hauskehricht Tour 6 = Altstadt
const ALTSTADT_TOUR = "906921982";

const QUELLE_URL = "https://m.stadt-schaffhausen.ch/index.php?apid=917954978";
const MAX_VORSCHLAEGE = 8;

// Was gerade ausgewählt ist
const auswahl = {
  strasse: null,   // Eintrag aus STRASSEN
  abfallart: null, // Kurzbezeichnung, z.B. "papier"
};


// ---------------------------------------------------------
// Hilfsfunktionen für Datum und Text
// ---------------------------------------------------------

const WOCHENTAGE_KURZ = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
const WOCHENTAGE_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONATE_KURZ = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];

// "2026-11-10" → Date-Objekt (Mitternacht, Schweizer Zeit des Geräts)
function datumLesen(text) {
  const [jahr, monat, tag] = text.split("-").map(Number);
  return new Date(jahr, monat - 1, tag);
}

// Date-Objekt → "2026-11-10"
function datumAlsText(datum) {
  const zweistellig = (zahl) => String(zahl).padStart(2, "0");
  return `${datum.getFullYear()}-${zweistellig(datum.getMonth() + 1)}-${zweistellig(datum.getDate())}`;
}

function heute() {
  const jetzt = new Date();
  return new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
}

// "2026-11-10" → "Di., 10. Nov."
function datumKurz(text) {
  const d = datumLesen(text);
  return `${WOCHENTAGE_KURZ[d.getDay()]}, ${d.getDate()}. ${MONATE_KURZ[d.getMonth()]}`;
}

// Anzahl Tage ab heute
function tageBis(text) {
  return Math.round((datumLesen(text) - heute()) / 86400000);
}

// "heute", "morgen" oder "in 3 Tagen"
function wannText(text) {
  const tage = tageBis(text);
  if (tage === 0) return "heute";
  if (tage === 1) return "morgen";
  return `in ${tage} Tagen`;
}

function grossAnfang(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Für die Suche: Kleinbuchstaben, ohne Akzente (ä → a), ß → ss
function normalisieren(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
}

// Schützt vor fehlerhafter Darstellung, wenn Text Zeichen wie < oder & enthält
function sicher(text) {
  return String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// "Hauskehricht Tour 6 Dienstag + Freitag" → "Jeden Dienstag und Freitag"
function rhythmusAusTourname(tourName) {
  const tage = WOCHENTAGE_LANG.filter((tag) => tourName.includes(tag));
  if (tage.length === 0) return "Regelmässig";
  return "Jeden " + tage.join(" und ");
}

// Nächste Termine für einen festen Wochentag (z.B. Karton Altstadt jeden Donnerstag)
function naechsteWochentage(wochentage, anzahl) {
  const termine = [];
  const tag = heute();
  while (termine.length < anzahl) {
    if (wochentage.includes(tag.getDay())) termine.push({ datum: datumAlsText(tag) });
    tag.setDate(tag.getDate() + 1);
  }
  return termine;
}


// ---------------------------------------------------------
// Ergebnis berechnen
// Gibt ein einfaches Objekt zurück – so kann es später auch
// für «Termin anpinnen» oder «In Kalender speichern» genutzt werden.
// ---------------------------------------------------------

function ergebnisBerechnen(strasse, abfallartId) {
  let art = ABFALLARTEN[abfallartId];
  const istAltstadt = strasse.touren.hauskehricht === ALTSTADT_TOUR;
  if (istAltstadt && art.altstadt) {
    art = { ...art, ...art.altstadt };   // Altstadt-Abweichungen übernehmen
  }

  const ergebnis = {
    strasse: strasse.name,
    abfallart: art.name,
    abgeholt: art.abgeholt,
    art: art,
  };
  if (!art.abgeholt) return ergebnis;

  const tour = art.tour ? TOUREN[strasse.touren[art.tour]] : null;
  const heuteText = datumAlsText(heute());
  let termine = [];
  let ausfaelle = [];

  if (tour) {
    const kommende = tour.termine.filter((t) => t.datum >= heuteText);
    termine = kommende.filter((t) => !t.faelltAus);
    ausfaelle = kommende.filter((t) => t.faelltAus && tageBis(t.datum) <= 21);
  } else if (art.wochentage) {
    termine = naechsteWochentage(art.wochentage, 3);
  }

  ergebnis.tourId = tour ? strasse.touren[art.tour] : null;
  ergebnis.tourName = tour ? tour.name : null;
  ergebnis.regelmaessig = art.regelmaessig;
  ergebnis.rhythmus = art.gross || (tour ? rhythmusAusTourname(tour.name) : "");
  ergebnis.termine = termine;
  ergebnis.ausfaelle = ausfaelle;
  ergebnis.bereitstellenOrt = art.tour ? strasse.bereitstellen[art.tour] : null;
  return ergebnis;
}


// ---------------------------------------------------------
// Ergebnis anzeigen (grünes oder rotes Feld)
// ---------------------------------------------------------

const ICON_HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_KREUZ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';

function liste(titel, eintraege) {
  if (!eintraege || eintraege.length === 0) return "";
  return `<h3>${titel}</h3><ul>${eintraege.map((e) => `<li>${sicher(e)}</li>`).join("")}</ul>`;
}

function ergebnisAnzeigen(ergebnis) {
  const feld = document.getElementById("ergebnis");
  if (!ergebnis) {
    feld.innerHTML = "";
    return;
  }
  const art = ergebnis.art;
  let haupt = "";
  let hinweise = "";

  if (!ergebnis.abgeholt) {
    // ----- Rotes Feld: wird nicht abgeholt -----
    haupt = `<p class="gross">${sicher(art.name)}</p>`;
    hinweise = liste("Wohin damit?", art.wohin);
  } else {
    // ----- Grünes Feld: wird abgeholt -----
    const naechster = ergebnis.termine[0];

    if (ergebnis.regelmaessig) {
      // Regelmässig: gross der Rhythmus, klein das nächste Datum
      haupt += `<p class="gross">${sicher(ergebnis.rhythmus)}</p>`;
      haupt += `<p class="zeit">${sicher(art.zeit)}</p>`;
      if (naechster) {
        haupt += `<p class="naechstes">Nächstes Mal: ${wannText(naechster.datum)} (${datumKurz(naechster.datum)})</p>`;
      }
    } else if (naechster) {
      // Selten: gross das nächste Datum, darunter weitere Termine
      haupt += `<p class="gross">${grossAnfang(wannText(naechster.datum))} (${datumKurz(naechster.datum)})</p>`;
      haupt += `<p class="zeit">${sicher(art.zeit)}</p>`;
      if (naechster.notiz) haupt += `<p class="notiz">${sicher(naechster.notiz)}</p>`;
      const weitere = ergebnis.termine.slice(1, 6);
      if (weitere.length) {
        haupt += `<p class="naechstes">Weitere Termine:</p><ul class="weitere">`
          + weitere.map((t) => `<li>${datumKurz(t.datum)}</li>`).join("") + "</ul>";
      }
    } else {
      // Selten, aber zurzeit keine Termine veröffentlicht
      haupt += `<p class="gross">Nächster Termin noch nicht bekannt</p>`;
      haupt += `<p class="naechstes">${sicher(art.rhythmus || "Die Stadt hat noch keine weiteren Termine veröffentlicht.")}</p>`;
    }

    // Warnung bei Ausfällen in den nächsten 3 Wochen
    for (const ausfall of ergebnis.ausfaelle) {
      haupt += `<p class="warnung"><strong>${datumKurz(ausfall.datum)}:</strong> ${sicher(ausfall.ausnahme)}</p>`;
    }
    // Hinweis bei verschobenen Terminen
    if (naechster && naechster.ausnahme) {
      haupt += `<p class="warnung">${sicher(naechster.ausnahme)}</p>`;
    }

    const bereitstellen = [...(art.bereitstellen || [])];
    if (ergebnis.bereitstellenOrt) {
      bereitstellen.unshift(`An deiner Strasse bereitstellen bei: ${ergebnis.bereitstellenOrt}.`);
    }
    hinweise += liste("So bereitstellen", bereitstellen);
    if (art.bild) {
      hinweise += `<img class="sack-foto" src="${art.bild}" alt="${sicher(art.bildText || "")}" onerror="this.remove()">`;
    }
    hinweise += liste("Wird nicht mitgenommen", art.nichtMitgenommen);
  }

  if (art.tipp) hinweise += `<h3>Tipp</h3><p>${sicher(art.tipp)}</p>`;
  hinweise += `<p class="quelle">Quelle: <a href="${QUELLE_URL}" target="_blank" rel="noopener">Abfallkalender Stadt Schaffhausen</a>, Stand ${datumKurz(window.TOUREN_DATEN.stand)}</p>`;

  feld.innerHTML = `
    <article class="karte ${ergebnis.abgeholt ? "ja" : "nein"}">
      <div class="karte-kopf">
        ${ergebnis.abgeholt ? ICON_HAKEN : ICON_KREUZ}
        ${ergebnis.abgeholt ? "Wird abgeholt" : "Wird nicht abgeholt"}
      </div>
      <div class="karte-haupt">${haupt}</div>
      <div class="karte-hinweise">${hinweise}</div>
    </article>`;
}

function aktualisieren() {
  if (auswahl.strasse && auswahl.abfallart) {
    ergebnisAnzeigen(ergebnisBerechnen(auswahl.strasse, auswahl.abfallart));
  } else {
    ergebnisAnzeigen(null);
  }
}


// ---------------------------------------------------------
// Vorschläge beim Tippen
// ---------------------------------------------------------

// Sucht passende Einträge; Treffer am Wortanfang kommen zuerst
function suchen(eintraege, eingabe, textVon) {
  const suche = normalisieren(eingabe.trim());
  if (!suche) return [];
  const anfang = [];
  const irgendwo = [];
  for (const eintrag of eintraege) {
    const text = normalisieren(textVon(eintrag));
    if (text.startsWith(suche)) anfang.push(eintrag);
    else if (text.includes(suche)) irgendwo.push(eintrag);
  }
  return [...anfang, ...irgendwo].slice(0, MAX_VORSCHLAEGE);
}

// Alle Begriffe für das Feld «Abfall»: Abfallarten und Gegenstände
const ABFALL_BEGRIFFE = [
  ...Object.entries(ABFALLARTEN).map(([id, art]) => ({ text: art.name, id: id, zusatz: "Abfallart" })),
  ...GEGENSTAENDE.map(([text, id]) => ({ text: text, id: id, zusatz: ABFALLARTEN[id].name })),
];

// Richtet ein Eingabefeld mit Auswahlliste ein
function suchfeldEinrichten({ eingabeId, listeId, finden, anzeigen, auswaehlen, zuruecksetzen }) {
  const eingabe = document.getElementById(eingabeId);
  const liste = document.getElementById(listeId);
  const leeren = document.querySelector(`.leeren[data-fuer="${eingabeId}"]`);
  let treffer = [];
  let markiert = 0;

  function listeZeigen() {
    treffer = finden(eingabe.value);
    markiert = 0;
    if (!eingabe.value.trim()) {
      liste.hidden = true;
      return;
    }
    liste.innerHTML = treffer.length
      ? treffer.map((t, i) => `<li data-nr="${i}" class="${i === 0 ? "markiert" : ""}">${anzeigen(t)}</li>`).join("")
      : `<li class="leer">Nichts gefunden</li>`;
    liste.hidden = false;
  }

  function waehlen(nr) {
    const eintrag = treffer[nr];
    if (!eintrag) return;
    auswaehlen(eintrag, eingabe);
    liste.hidden = true;
    eingabe.blur();
    aktualisieren();
  }

  eingabe.addEventListener("input", () => {
    leeren.hidden = !eingabe.value;
    zuruecksetzen();
    aktualisieren();
    listeZeigen();
  });

  eingabe.addEventListener("keydown", (e) => {
    if (liste.hidden || treffer.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      markiert = (markiert + (e.key === "ArrowDown" ? 1 : -1) + treffer.length) % treffer.length;
      liste.querySelectorAll("li").forEach((li, i) => li.classList.toggle("markiert", i === markiert));
    } else if (e.key === "Enter") {
      e.preventDefault();
      waehlen(markiert);
    } else if (e.key === "Escape") {
      liste.hidden = true;
    }
  });

  // pointerdown statt click, damit die Auswahl vor dem Verlassen des Feldes zählt
  liste.addEventListener("pointerdown", (e) => {
    const li = e.target.closest("li[data-nr]");
    if (li) {
      e.preventDefault();
      waehlen(Number(li.dataset.nr));
    }
  });

  eingabe.addEventListener("blur", () => {
    setTimeout(() => { liste.hidden = true; }, 150);
  });

  leeren.addEventListener("click", () => {
    eingabe.value = "";
    leeren.hidden = true;
    liste.hidden = true;
    zuruecksetzen();
    aktualisieren();
    eingabe.focus();
  });

  return { eingabe, leeren };
}


// ---------------------------------------------------------
// Strasse merken (im Browser gespeichert)
// ---------------------------------------------------------

function strasseSpeichern(name) {
  try { localStorage.setItem("strasse", name || ""); } catch (fehler) { /* nicht schlimm */ }
}

function gespeicherteStrasse() {
  try { return localStorage.getItem("strasse"); } catch (fehler) { return null; }
}


// ---------------------------------------------------------
// Tabs unten
// ---------------------------------------------------------

function tabsEinrichten() {
  document.querySelectorAll(".tab").forEach((knopf) => {
    knopf.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((k) => k.classList.toggle("aktiv", k === knopf));
      document.querySelectorAll(".tab-inhalt").forEach((bereich) => {
        bereich.hidden = bereich.id !== "tab-" + knopf.dataset.tab;
      });
    });
  });
}


// ---------------------------------------------------------
// Start
// ---------------------------------------------------------

const strassenFeld = suchfeldEinrichten({
  eingabeId: "eingabe-strasse",
  listeId: "liste-strasse",
  finden: (text) => suchen(STRASSEN, text, (s) => s.name),
  anzeigen: (s) => sicher(s.name) + (s.zusatz ? `<span class="klein">${sicher(s.zusatz)}</span>` : ""),
  auswaehlen: (s, eingabe) => {
    auswahl.strasse = s;
    eingabe.value = s.name;
    strasseSpeichern(s.name);
  },
  zuruecksetzen: () => {
    auswahl.strasse = null;
    strasseSpeichern("");
  },
});

suchfeldEinrichten({
  eingabeId: "eingabe-abfall",
  listeId: "liste-abfall",
  finden: (text) => suchen(ABFALL_BEGRIFFE, text, (b) => b.text),
  anzeigen: (b) => `${sicher(b.text)}<span class="klein">${sicher(b.zusatz)}</span>`,
  auswaehlen: (b, eingabe) => {
    auswahl.abfallart = b.id;
    eingabe.value = b.text;
  },
  zuruecksetzen: () => { auswahl.abfallart = null; },
});

// Gemerkte Strasse wieder eintragen
const gemerkt = STRASSEN.find((s) => s.name === gespeicherteStrasse());
if (gemerkt) {
  auswahl.strasse = gemerkt;
  strassenFeld.eingabe.value = gemerkt.name;
  strassenFeld.leeren.hidden = false;
}

tabsEinrichten();

// Service Worker: macht die App installierbar und offline nutzbar
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js");
}
