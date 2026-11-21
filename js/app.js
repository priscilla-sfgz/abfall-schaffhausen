// =========================================================
// Abfall Schaffhausen – App-Logik
// =========================================================

// Die Daten kommen aus data/touren.js und data/abfallarten.js.
// TOUREN und STRASSEN werden beim Start durch die Live-Daten ersetzt (siehe liveDatenLaden).
let TOUREN = window.TOUREN_DATEN.touren;
let STRASSEN = window.TOUREN_DATEN.strassen;
const ABFALLARTEN = window.ABFALLARTEN;
const GEGENSTAENDE = window.GEGENSTAENDE;
const SAMMELSTELLEN = window.SAMMELSTELLEN;

// Hauskehricht Tour 6 = Altstadt
const ALTSTADT_TOUR = "906921982";

const QUELLE_URL = "https://m.stadt-schaffhausen.ch/index.php?apid=917954978";
const MAX_VORSCHLAEGE = 8;

// Was gerade ausgewählt ist
const auswahl = {
  strasse: null,      // Eintrag aus STRASSEN
  abfallart: null,    // Kurzbezeichnung, z.B. "papier"
  hinweis: null,      // kurzer Hinweis, z.B. "Zuerst eintrocknen lassen."
  sorteFertig: false, // true = keine Auswahl «Welche Sorte?» mehr zeigen
  oberart: null,      // nach «Welche Sorte?»: die Abfallart mit der Auswahl, z.B. "plastik"
  sorteText: null,    // nach «Welche Sorte?»: die gewählte Sorte als Text
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
// Abgabestellen (aus data/sammelstellen.js)
// ---------------------------------------------------------

// Kosten einer Stelle für eine bestimmte Abfallart
function kostenFuer(stelle, abfallartId) {
  if (typeof stelle.kosten === "string") return stelle.kosten;
  return stelle.kosten[abfallartId] ?? stelle.kosten.standard ?? "";
}

function istGratis(stelle) {
  return stelle.kosten.startsWith("gratis");
}

// Alle Stellen, die diese Abfallart annehmen – gratis zuerst
function abgabestellen(abfallartId) {
  return SAMMELSTELLEN
    .filter((stelle) => stelle.annahme.includes(abfallartId))
    .map((stelle) => ({ ...stelle, kosten: kostenFuer(stelle, abfallartId) }))
    .sort((a, b) => istGratis(b) - istGratis(a));
}


// ---------------------------------------------------------
// Ergebnis berechnen
// Gibt ein einfaches Objekt zurück – so kann es später auch
// für «Termin speichern» oder «In Kalender laden» genutzt werden.
// ---------------------------------------------------------

function ergebnisBerechnen(strasse, abfallartId, hinweis) {
  let art = ABFALLARTEN[abfallartId];
  const istAltstadt = strasse.touren.hauskehricht === ALTSTADT_TOUR;
  if (istAltstadt && art.altstadt) {
    art = { ...art, ...art.altstadt };   // Altstadt-Abweichungen übernehmen
  }

  const heuteText = datumAlsText(heute());
  const ergebnis = {
    strasse: strasse.name,
    abfallartId: abfallartId,
    abfallart: art.name,
    hinweis: hinweis || null,
    abgeholt: art.abgeholt,
    art: art,
    stellen: abgabestellen(abfallartId),
    termine: [],
    ausfaelle: [],
  };

  if (!art.abgeholt) {
    // Feste Daten zum Hinbringen (z.B. Giftsammlung)
    ergebnis.termine = (art.sammeltermine || [])
      .filter((t) => t.datum >= heuteText)
      .map((t) => ({ datum: t.datum, zeit: t.zeit, notiz: t.ort }));
    return ergebnis;
  }

  const tour = art.tour ? TOUREN[strasse.touren[art.tour]] : null;
  if (tour) {
    const kommende = tour.termine.filter((t) => t.datum >= heuteText);
    ergebnis.termine = kommende.filter((t) => !t.faelltAus);
    ergebnis.ausfaelle = kommende.filter((t) => t.faelltAus && tageBis(t.datum) <= 21);
  } else if (art.wochentage) {
    ergebnis.termine = naechsteWochentage(art.wochentage, 3);
  }

  ergebnis.tourId = tour ? strasse.touren[art.tour] : null;
  ergebnis.tourName = tour ? tour.name : null;
  ergebnis.regelmaessig = art.regelmaessig;
  ergebnis.rhythmus = art.gross || (tour ? rhythmusAusTourname(tour.name) : "");
  ergebnis.bereitstellenOrt = art.tour ? strasse.bereitstellen[art.tour] : null;
  return ergebnis;
}


// ---------------------------------------------------------
// Ergebnis anzeigen (grünes oder rotes Feld)
// ---------------------------------------------------------

const ICON_HAKEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_KREUZ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';

// Liste mit Punkten
function punkte(eintraege) {
  if (!eintraege || eintraege.length === 0) return "";
  return `<ul>${eintraege.map((e) => `<li>${sicher(e)}</li>`).join("")}</ul>`;
}

// Aufklappbarer Abschnitt (ohne Inhalt: gar nicht anzeigen)
function aufklappen(titel, inhalt) {
  if (!inhalt) return "";
  return `<details><summary>${titel}</summary><div class="details-inhalt">${inhalt}</div></details>`;
}

// Liste der Abgabestellen
function stellenListe(stellen) {
  if (stellen.length === 0) return "";
  return `<ul class="stellen">${stellen.map((s) => `
    <li>
      <strong>${sicher(s.name)}</strong>
      ${s.kosten ? `<span class="kosten ${istGratis(s) ? "gratis" : ""}">${sicher(s.kosten)}</span>` : ""}
      ${s.ort ? `<span class="klein">${sicher(s.ort)}</span>` : ""}
      ${s.zeiten ? `<span class="klein">${sicher(s.zeiten)}</span>` : ""}
      ${s.link ? `<a class="klein" href="${s.link}" target="_blank" rel="noopener">Webseite</a>` : ""}
    </li>`).join("")}</ul>`;
}

// Weitere Termine als kleine Liste
function weitereTermine(termine) {
  if (termine.length === 0) return "";
  return `<p class="naechstes">Weitere Termine:</p><ul class="weitere">`
    + termine.map((t) => `<li>${datumKurz(t.datum)}${t.notiz ? ` · ${sicher(t.notiz)}` : ""}</li>`).join("")
    + "</ul>";
}

const ICON_RECYCLING = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-14.3 4.9"/><path d="M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3v4.2h-4.2"/><path d="M5.5 21v-4.2h4.2"/></svg>';

// Wann wird es abgeholt? Gibt die grossen Zeilen zurück.
function abfuhrZeilen(ergebnis) {
  const art = ergebnis.art;
  const naechster = ergebnis.termine[0];
  let html = "";
  if (ergebnis.regelmaessig) {
    // Regelmässig: nur der Rhythmus, z.B. «Jeden Dienstag und Freitag»
    html += `<p class="gross">${sicher(ergebnis.rhythmus)}</p>`;
    html += `<p class="zeit">${sicher(art.zeit)}</p>`;
  } else if (naechster) {
    // Selten: das nächste Datum, darunter weitere Termine
    html += `<p class="gross">${grossAnfang(wannText(naechster.datum))} (${datumKurz(naechster.datum)})</p>`;
    html += `<p class="zeit">${sicher(art.zeit)}</p>`;
    if (naechster.notiz) html += `<p class="notiz">${sicher(naechster.notiz)}</p>`;
    html += weitereTermine(ergebnis.termine.slice(1, 6));
  } else {
    // Selten, aber zurzeit keine Termine veröffentlicht
    html += `<p class="gross">Nächster Termin noch nicht bekannt</p>`;
    html += `<p class="naechstes">${sicher(art.rhythmus || "Die Stadt hat noch keine weiteren Termine veröffentlicht.")}</p>`;
  }
  return html;
}

// Wohin damit (wenn es nicht abgeholt wird)? Gibt die grossen Zeilen zurück.
function hinbringenZeilen(ergebnis) {
  const art = ergebnis.art;
  const naechster = ergebnis.termine[0];
  let html = `<p class="gross">${sicher(art.ziel || "An Sammelstelle entsorgen")}</p>`;
  if (art.zeit) html += `<p class="zeit">${sicher(art.zeit)}</p>`;
  if (naechster) {
    html += `<p class="naechstes">${sicher(art.sammeltermineName || "Nächster Termin")}: `
      + `${wannText(naechster.datum)} (${datumKurz(naechster.datum)}), ${sicher(naechster.zeit)}, ${sicher(naechster.notiz)}</p>`;
    html += weitereTermine(ergebnis.termine.slice(1));
  }
  return html;
}

function ergebnisAnzeigen(ergebnis) {
  const feld = document.getElementById("ergebnis");
  aktuellesErgebnis = ergebnis;   // für den Stern (js/kalender.js)
  if (!ergebnis) {
    feld.innerHTML = "";
    return;
  }
  const art = ergebnis.art;
  const naechster = ergebnis.termine[0];

  // ----- Oben: welche Sorte (falls gewählt), Abfallart und Hinweise -----
  let haupt = "";
  if (auswahl.oberart) {
    haupt += `<p class="sorte-zeile">${sicher(ABFALLARTEN[auswahl.oberart].name)} › ${sicher(auswahl.sorteText)}
      <button type="button" class="andere-sorte">Sorte ändern</button></p>`;
  }
  haupt += `<p class="abfallart">${sicher(art.name)}</p>`;
  // Ein Gegenstand, der in den Hauskehricht gehört: klar sagen, dass nichts Besonderes nötig ist
  // (nicht, wenn der Hinweis den Hauskehricht schon nennt)
  const nenntHauskehricht = (ergebnis.hinweis || "").includes("Hauskehricht");
  if (ergebnis.abfallartId === "hauskehricht" && auswahl.sorteFertig && !nenntHauskehricht) {
    haupt += `<p class="hinweis">Entsorgung im Hauskehricht (Böcklisack)</p>`;
  }
  if (ergebnis.hinweis) haupt += `<p class="hinweis">${sicher(ergebnis.hinweis)}</p>`;

  // ----- Kopf und grosse Zeilen -----
  let kopf;
  if (art.recycling) {
    // Recycling ist am wichtigsten, Abfuhr bzw. Container nur als zweite Möglichkeit
    kopf = { klasse: "ja", icon: ICON_RECYCLING, text: "Recycling empfohlen" };
    haupt += `<p class="gross">${sicher(art.recycling.ziel)}</p>`;
    haupt += `<p class="zeit">${sicher(art.recycling.zeit)}</p>`;
    const oder = ergebnis.abgeholt
      ? `<strong>Alternativ mit dem ${sicher(ABFALLARTEN[art.tour].name)}:</strong> ${sicher(ergebnis.rhythmus)}, ${sicher(art.zeit)}`
      : `<strong>Alternativ:</strong> ${sicher(art.ziel)}, ${sicher(art.zeit)}`;
    haupt += `<p class="oder">${oder}</p>`;
  } else if (ergebnis.abgeholt) {
    kopf = { klasse: "ja", icon: ICON_HAKEN, text: "Wird abgeholt" };
    haupt += abfuhrZeilen(ergebnis);
  } else {
    kopf = { klasse: "nein", icon: ICON_KREUZ, text: "Wird nicht abgeholt" };
    haupt += hinbringenZeilen(ergebnis);
  }

  // Warnung bei Ausfällen in den nächsten 3 Wochen und bei verschobenen Terminen
  for (const ausfall of ergebnis.ausfaelle) {
    haupt += `<p class="warnung"><strong>${datumKurz(ausfall.datum)}:</strong> ${sicher(ausfall.ausnahme)}</p>`;
  }
  if (ergebnis.abgeholt && naechster && naechster.ausnahme) {
    haupt += `<p class="warnung">${sicher(naechster.ausnahme)}</p>`;
  }

  // ----- Aufklappbare Abschnitte (immer die gleichen Titel) -----
  let bereitstellen = "";
  let nichtMitgenommen = "";
  if (ergebnis.abgeholt) {
    const punkteListe = [...(art.bereitstellen || [])];
    if (ergebnis.bereitstellenOrt) {
      punkteListe.unshift(`An deiner Strasse bereitstellen bei: ${ergebnis.bereitstellenOrt}.`);
    }
    bereitstellen = punkte(punkteListe);
    if (art.bild) {
      bereitstellen += `<img class="sack-foto" src="${art.bild}" alt="${sicher(art.bildText || "")}" onerror="this.remove()">`;
    }
    nichtMitgenommen = punkte(art.nichtMitgenommen);
  }
  const sammelstellen = stellenListe(ergebnis.stellen);
  const gutZuWissen = punkte([...(art.wohin || []), ...(art.tipp ? [art.tipp] : [])]);

  // Wird es abgeholt, kommt «So bereitstellen» zuerst, sonst die Sammelstellen
  const abschnitte = (ergebnis.abgeholt && !art.recycling)
    ? [["So bereitstellen", bereitstellen], ["Wird nicht mitgenommen", nichtMitgenommen], ["Sammelstellen", sammelstellen]]
    : [["Sammelstellen", sammelstellen], ["So bereitstellen", bereitstellen], ["Wird nicht mitgenommen", nichtMitgenommen]];
  abschnitte.push(["Gut zu wissen", gutZuWissen]);
  const hinweise = abschnitte.map(([titel, inhalt]) => aufklappen(titel, inhalt)).join("");

  feld.innerHTML = `
    <article class="karte ${kopf.klasse}">
      <div class="karte-kopf">${kopf.icon} ${kopf.text} ${sternKnopf(ergebnis)}</div>
      <div class="karte-haupt">${haupt}</div>
      <div class="karte-hinweise">
        ${hinweise}
        <p class="quelle">Abfalltelefon <a href="tel:+41526325329">052 632 53 29</a> · Termine: <a href="${QUELLE_URL}" target="_blank" rel="noopener">Stadt Schaffhausen</a>, Stand ${datumKurz(window.TOUREN_DATEN.stand)}</p>
      </div>
    </article>`;
}

// ---------------------------------------------------------
// Zweite Auswahl «Welche Sorte?» (z.B. bei Plastik)
// ---------------------------------------------------------

function sortenAnzeigen(abfallartId) {
  const art = ABFALLARTEN[abfallartId];
  document.getElementById("ergebnis").innerHTML = `
    <article class="karte frage">
      <div class="karte-kopf">Sorte wählen</div>
      <div class="karte-haupt">
        <p class="abfallart">${sicher(art.name)}</p>
        <div class="sorten">
          ${art.sorten.map(([text], nr) => `<button type="button" class="sorte" data-nr="${nr}">${sicher(text)}</button>`).join("")}
        </div>
      </div>
    </article>`;
}

// Klicks im Ergebnisfeld: Sorte wählen oder «andere Sorte»
function sortenEinrichten() {
  document.getElementById("ergebnis").addEventListener("click", (e) => {
    const sorte = e.target.closest(".sorte");
    if (sorte) {
      const oberart = auswahl.abfallart;
      const [text, ziel, hinweis] = ABFALLARTEN[oberart].sorten[Number(sorte.dataset.nr)];
      abfallWaehlen(ziel, { hinweis, sorteFertig: true });
      auswahl.oberart = oberart;
      auswahl.sorteText = text;
      aktualisieren();
    } else if (e.target.closest(".andere-sorte")) {
      abfallWaehlen(auswahl.oberart);
      aktualisieren();
    }
  });
}

// Abfallart merken.
// hinweis:     kurzer Hinweis, z.B. "Zuerst eintrocknen lassen."
// sorteFertig: true = keine Sorten-Auswahl zeigen (z.B. bei einem bestimmten Gegenstand)
function abfallWaehlen(abfallartId, { hinweis = null, sorteFertig = false } = {}) {
  auswahl.abfallart = abfallartId;
  auswahl.hinweis = hinweis;
  auswahl.sorteFertig = sorteFertig;
  auswahl.oberart = null;
  auswahl.sorteText = null;
}

function aktualisieren() {
  // Schnellwahl-Knöpfe nur zeigen, solange das Feld «Abfall» leer ist
  document.getElementById("schnellwahl").hidden = document.getElementById("eingabe-abfall").value !== "";

  if (!auswahl.strasse || !auswahl.abfallart) {
    ergebnisAnzeigen(null);
    return;
  }
  const art = ABFALLARTEN[auswahl.abfallart];
  if (art.sorten && (art.nurAuswahl || !auswahl.sorteFertig)) {
    sortenAnzeigen(auswahl.abfallart);
  } else {
    ergebnisAnzeigen(ergebnisBerechnen(auswahl.strasse, auswahl.abfallart, auswahl.hinweis));
  }
}


// ---------------------------------------------------------
// Vorschläge beim Tippen
// ---------------------------------------------------------

// Zählt, wie viele Buchstaben man ändern, einfügen oder löschen muss,
// damit aus Wort a das Wort b wird (z.B. "hauskericht" → "hauskehricht" = 1)
function tippfehler(a, b) {
  let vorherigeZeile = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const zeile = [i];
    for (let j = 1; j <= b.length; j++) {
      const gleich = a[i - 1] === b[j - 1] ? 0 : 1;
      zeile[j] = Math.min(vorherigeZeile[j] + 1, zeile[j - 1] + 1, vorherigeZeile[j - 1] + gleich);
    }
    vorherigeZeile = zeile;
  }
  return vorherigeZeile[b.length];
}

// Wie gut passt ein Text zur Suche?
// 0 = beginnt damit, 1 = ein Wort beginnt damit, 2 = steht irgendwo drin,
// 3 oder mehr = passt mit Tippfehlern, null = passt nicht
function passung(text, suche) {
  if (text.startsWith(suche)) return 0;
  const woerter = text.split(/[\s\-\/(),]+/);
  if (woerter.some((wort) => wort.startsWith(suche))) return 1;
  if (text.includes(suche)) return 2;

  // Tippfehler erlauben: 1 Fehler ab 4 Buchstaben, 2 Fehler ab 8 Buchstaben
  const erlaubt = suche.length >= 8 ? 2 : suche.length >= 4 ? 1 : 0;
  if (erlaubt === 0) return null;
  let wenigsteFehler = Infinity;
  for (const wort of [text, ...woerter]) {
    // Mit dem Wortanfang vergleichen (gleich lang, einen Buchstaben kürzer oder länger)
    for (let laenge = suche.length - 1; laenge <= suche.length + 1; laenge++) {
      wenigsteFehler = Math.min(wenigsteFehler, tippfehler(suche, wort.slice(0, laenge)));
    }
  }
  return wenigsteFehler <= erlaubt ? 2 + wenigsteFehler : null;
}

// Sucht passende Einträge, die besten Treffer zuerst
function suchen(eintraege, eingabe, textVon) {
  const suche = normalisieren(eingabe.trim());
  if (!suche) return [];
  const gefunden = [];
  for (const eintrag of eintraege) {
    // textVon kann einen Text oder eine Liste von Texten liefern (z.B. Name + Suchwörter)
    const texte = [].concat(textVon(eintrag));
    const werte = texte.map((t) => passung(normalisieren(t), suche)).filter((w) => w !== null);
    if (werte.length) gefunden.push({ eintrag, wert: Math.min(...werte) });
  }
  gefunden.sort((a, b) => a.wert - b.wert);
  // Treffer mit Tippfehlern (Wert 3 und mehr) nur zeigen, wenn es keine richtigen Treffer gibt
  const richtige = gefunden.filter((g) => g.wert <= 2);
  return (richtige.length ? richtige : gefunden).map((g) => g.eintrag);
}

// "Alpenstrasse 23" → { text: "Alpenstrasse", nummer: 23 }
// "Alpenstrasse"    → { text: "Alpenstrasse", nummer: null }
function hausnummerTrennen(eingabe) {
  const teile = eingabe.trim().match(/^(.*\D)\s+(\d+)\s*[a-zA-Z]?$/);
  if (!teile) return { text: eingabe, nummer: null };
  return { text: teile[1], nummer: Number(teile[2]) };
}

// Gehört die Hausnummer zu diesem Abschnitt der Strasse?
function nummerPasst(strasse, nummer) {
  return strasse.von !== null && strasse.von <= nummer && nummer <= strasse.bis;
}

// Strassensuche, auch mit Hausnummer.
// Gibt Einträge der Form { strasse, nummer } zurück.
function strassenFinden(eingabe) {
  const { text, nummer } = hausnummerTrennen(eingabe);
  let treffer = suchen(STRASSEN, text, (s) => s.strasse || s.name);
  if (nummer !== null) {
    // Bei aufgeteilten Strassen nur den Abschnitt mit dieser Hausnummer zeigen.
    // Passt kein Abschnitt, bleiben alle stehen.
    treffer = treffer.filter((s) =>
      s.von === null || nummerPasst(s, nummer)
      || !treffer.some((andere) => andere.strasse === s.strasse && nummerPasst(andere, nummer)));
  }
  return treffer.slice(0, MAX_VORSCHLAEGE).map((s) => ({ strasse: s, nummer }));
}

// Text für das Strassenfeld, z.B. "Alpenstrasse 23" oder "Alpenstrasse 1–115"
function strassenText({ strasse, nummer }) {
  const hatSchonNummer = strasse.von === null && /\d/.test(strasse.name);   // z.B. "Im Freien 55"
  if (nummer !== null && !hatSchonNummer && (strasse.von === null || nummerPasst(strasse, nummer))) {
    return `${strasse.strasse || strasse.name} ${nummer}`;
  }
  return strasse.name;
}

// Kleiner grauer Text unter dem Vorschlag, z.B. "Nr. 1–115 · Bürgerstrasse bis Kesselstrasse"
function strassenZusatz({ strasse, nummer }) {
  const teile = [];
  if (strasse.von !== null && nummer !== null && nummerPasst(strasse, nummer)) {
    teile.push(`Nr. ${strasse.von}–${strasse.bis}`);
  }
  if (strasse.zusatz) teile.push(strasse.zusatz);
  return teile.join(" · ");
}

// Alle Begriffe für das Feld «Abfall»: Abfallarten und Gegenstände
const ABFALL_BEGRIFFE = [
  ...Object.entries(ABFALLARTEN).map(([id, art]) => ({
    text: art.name, id: id, zusatz: "", istArt: true,   // kein grauer Zusatz: ist selbst die Abfallart
    suchtexte: [art.name, ...(art.suchwoerter || [])],
  })),
  ...GEGENSTAENDE
    // Gegenstände, die gleich heissen wie eine Abfallart (z.B. «Batterien»), nicht doppelt zeigen
    .filter(([text]) => !Object.values(ABFALLARTEN).some((art) => art.name === text))
    .map(([text, id, hinweis]) => ({ text: text, id: id, zusatz: ABFALLARTEN[id].name, hinweis: hinweis })),
];

// Richtet ein Eingabefeld mit Auswahlliste ein
function suchfeldEinrichten({ eingabeId, listeId, finden, anzeigen, auswaehlen, zuruecksetzen }) {
  const eingabe = document.getElementById(eingabeId);
  const liste = document.getElementById(listeId);
  const leeren = document.querySelector(`.leeren[data-fuer="${eingabeId}"]`);
  let treffer = [];
  let markiert = 0;
  const ebene = "liste-" + eingabeId;   // für «Zurück» (js/zurueck.js)

  function listeVerstecken() {
    liste.hidden = true;
    ebeneGeschlossen(ebene);
  }

  function listeZeigen() {
    treffer = finden(eingabe.value);
    markiert = 0;
    if (!eingabe.value.trim()) {
      listeVerstecken();
      return;
    }
    liste.innerHTML = treffer.length
      ? treffer.map((t, i) => `<li data-nr="${i}" class="${i === 0 ? "markiert" : ""}">${anzeigen(t)}</li>`).join("")
      : `<li class="leer">Nichts gefunden</li>`;
    liste.hidden = false;
    // «Zurück» schliesst die Liste und die Tastatur
    ebeneOeffnen(ebene, () => { liste.hidden = true; eingabe.blur(); });
  }

  function waehlen(nr) {
    const eintrag = treffer[nr];
    if (!eintrag) return;
    auswaehlen(eintrag, eingabe);
    listeVerstecken();
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
      listeVerstecken();
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
    setTimeout(listeVerstecken, 150);
  });

  // Android: Die Zurück-Geste klappt zuerst nur die Tastatur zu, das Feld bleibt aktiv.
  // Wird der sichtbare Bereich plötzlich viel höher (Tastatur weg), Feld verlassen → Liste zu.
  if (window.visualViewport) {
    let hoehe = visualViewport.height;
    visualViewport.addEventListener("resize", () => {
      if (visualViewport.height > hoehe + 120 && document.activeElement === eingabe && !liste.hidden) eingabe.blur();
      hoehe = visualViewport.height;
    });
  }

  leeren.addEventListener("click", () => {
    eingabe.value = "";
    leeren.hidden = true;
    listeVerstecken();
    zuruecksetzen();
    aktualisieren();
    eingabe.focus();
  });

  return { eingabe, leeren };
}


// ---------------------------------------------------------
// Strasse merken (im Browser gespeichert)
// ---------------------------------------------------------

// name = Eintrag in der Strassenliste, text = was im Feld steht (z.B. mit Hausnummer)
function strasseSpeichern(name, text) {
  try {
    localStorage.setItem("strasse", name || "");
    localStorage.setItem("strasseText", text || "");
  } catch (fehler) { /* nicht schlimm */ }
}

function gespeicherteStrasse() {
  try {
    return { name: localStorage.getItem("strasse"), text: localStorage.getItem("strasseText") };
  } catch (fehler) {
    return { name: null, text: null };
  }
}


// ---------------------------------------------------------
// Schnellwahl: Knöpfe mit den wichtigsten Abfallarten
// (erscheinen, solange das Feld «Abfall» leer ist)
// ---------------------------------------------------------

function schnellwahlEinrichten() {
  const bereich = document.getElementById("schnellwahl");
  bereich.innerHTML = window.SCHNELLWAHL
    .map(([text, id]) => `<button type="button" class="chip" data-id="${id}">${sicher(text)}</button>`)
    .join("");
  bereich.addEventListener("click", (e) => {
    const knopf = e.target.closest(".chip");
    if (!knopf) return;
    abfallWaehlen(knopf.dataset.id);
    abfallFeld.eingabe.value = ABFALLARTEN[knopf.dataset.id].name;
    abfallFeld.leeren.hidden = false;
    aktualisieren();
  });
}


// ---------------------------------------------------------
// Hinweis reparierBar: erscheint, bis man ihn einmal wegklickt
// ---------------------------------------------------------

function reparaturHinweisEinrichten() {
  const hinweis = document.getElementById("reparatur-hinweis");
  let weggeklickt = false;
  try { weggeklickt = localStorage.getItem("reparaturHinweisWeg") === "ja"; } catch (fehler) { /* nicht schlimm */ }
  if (weggeklickt) return;

  hinweis.hidden = false;
  document.body.classList.add("mit-hinweis");
  hinweis.querySelector(".schliessen").addEventListener("click", () => {
    hinweis.hidden = true;
    document.body.classList.remove("mit-hinweis");
    try { localStorage.setItem("reparaturHinweisWeg", "ja"); } catch (fehler) { /* nicht schlimm */ }
  });
}


// ---------------------------------------------------------
// Tabs unten
// ---------------------------------------------------------

// Zeigt einen Tab an, z.B. tabWechseln("abc")
function tabWechseln(name) {
  document.querySelectorAll(".tab").forEach((k) => k.classList.toggle("aktiv", k.dataset.tab === name));
  document.querySelectorAll(".tab-inhalt").forEach((bereich) => {
    bereich.hidden = bereich.id !== "tab-" + name;
  });
  if (name === "karte") karteZeigen();
  // «Zurück» führt von den anderen Tabs zum Tab Entsorgung
  if (name === "abfall") ebeneGeschlossen("tab");
  else ebeneOeffnen("tab", () => tabWechseln("abfall"));
}

function tabsEinrichten() {
  document.querySelectorAll(".tab").forEach((knopf) => {
    knopf.addEventListener("click", () => tabWechseln(knopf.dataset.tab));
  });
}


// ---------------------------------------------------------
// Start
// ---------------------------------------------------------

const strassenFeld = suchfeldEinrichten({
  eingabeId: "eingabe-strasse",
  listeId: "liste-strasse",
  finden: strassenFinden,
  anzeigen: (t) => {
    const zusatz = strassenZusatz(t);
    return sicher(strassenText(t)) + (zusatz ? `<span class="klein">${sicher(zusatz)}</span>` : "");
  },
  auswaehlen: (t, eingabe) => {
    auswahl.strasse = t.strasse;
    eingabe.value = strassenText(t);
    strasseSpeichern(t.strasse.name, eingabe.value);
  },
  zuruecksetzen: () => {
    auswahl.strasse = null;
    strasseSpeichern("", "");
  },
});

const abfallFeld = suchfeldEinrichten({
  eingabeId: "eingabe-abfall",
  listeId: "liste-abfall",
  finden: (text) => suchen(ABFALL_BEGRIFFE, text, (b) => b.suchtexte || b.text).slice(0, MAX_VORSCHLAEGE),
  anzeigen: (b) => sicher(b.text) + (b.zusatz ? `<span class="klein">${sicher(b.zusatz)}</span>` : ""),
  auswaehlen: (b, eingabe) => {
    // Bei einem bestimmten Gegenstand (z.B. «Joghurtbecher») braucht es keine Sorten-Auswahl
    abfallWaehlen(b.id, { hinweis: b.hinweis, sorteFertig: !b.istArt });
    eingabe.value = b.text;
  },
  zuruecksetzen: () => { abfallWaehlen(null); },
});

// Gemerkte Strasse wieder eintragen
const gespeichert = gespeicherteStrasse();
const gemerkt = STRASSEN.find((s) => s.name === gespeichert.name);
if (gemerkt) {
  auswahl.strasse = gemerkt;
  strassenFeld.eingabe.value = gespeichert.text || gemerkt.name;
  strassenFeld.leeren.hidden = false;
}

schnellwahlEinrichten();
sortenEinrichten();
reparaturHinweisEinrichten();
tabsEinrichten();
kalenderEinrichten();
erinnerungenEinrichten();
abcEinrichten();
karteEinrichten();
aktualisieren();
liveDatenLaden();

// Holt die aktuellen Termine von /api/touren (im Hintergrund).
// Klappt das nicht (offline, Fehler), bleiben einfach die Daten aus data/touren.js.
async function liveDatenLaden() {
  let neu;
  try {
    const antwort = await fetch("api/touren");
    if (!antwort.ok) return;
    neu = await antwort.json();
    if (!neu.touren || !neu.strassen || neu.stand < window.TOUREN_DATEN.stand) return;
  } catch (fehler) {
    return;
  }

  const gleich = JSON.stringify([neu.touren, neu.strassen])
    === JSON.stringify([window.TOUREN_DATEN.touren, window.TOUREN_DATEN.strassen]);
  window.TOUREN_DATEN = neu;
  TOUREN = neu.touren;
  STRASSEN = neu.strassen;
  if (gleich) return;   // Termine unverändert: nichts neu zeichnen

  // Gewählte Strasse in den neuen Daten wiederfinden
  if (auswahl.strasse) {
    auswahl.strasse = STRASSEN.find((s) => s.name === auswahl.strasse.name) || null;
    if (!auswahl.strasse) {   // Strasse gibt es nicht mehr: Feld leeren
      strassenFeld.eingabe.value = "";
      strassenFeld.leeren.hidden = true;
      strasseSpeichern("", "");
    }
  }
  aktualisieren();
  kalenderZeichnen();
  erinnerungenStillAbgleichen();   // neue Termine auch für die Push-Erinnerungen
}

// Gelber Startbildschirm: 0.7 Sekunden stehen lassen, dann sanft ausblenden
const startbild = document.getElementById("startbild");
if (startbild) setTimeout(() => {
  startbild.classList.add("weg");   // ab jetzt nicht mehr anklickbar
  const ausblenden = startbild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease", fill: "forwards" });
  ausblenden.finished.then(() => startbild.remove());   // danach ganz entfernen
}, 700);

// Service Worker: macht die App installierbar und offline nutzbar
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js");
}
