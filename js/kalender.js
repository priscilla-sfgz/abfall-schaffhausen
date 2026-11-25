// =========================================================
// Abfall Schaffhausen – Kalender
// Termine mit dem Stern speichern, im Tab «Kalender» anzeigen
// (Liste, Woche, Monat, Jahr) und als Datei für den eigenen
// Kalender herunterladen (.ics).
//
// Diese Datei wird VOR js/app.js geladen und benutzt dessen
// Funktionen (z.B. ergebnisBerechnen, datumKurz) erst, wenn
// etwas angeklickt wird.
// =========================================================

// Farbe pro Abfallart (Punkte im Kalender) – darf angepasst werden
const KALENDER_FARBEN = {
  hauskehricht: "#4a5559",
  sperrgut: "#8a6d5a",
  plastik: "#c99a00",
  gruenabfall: "#1f7a3d",
  papier: "#2b6cb0",
  karton: "#a0672d",
  altmetall: "#6b4fa0",
  sonderabfall: "#c0262d",
};

const MONATE_LANG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
  "August", "September", "Oktober", "November", "Dezember"];

const ICON_STERN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>';

// Was im Kalender-Tab gerade angezeigt wird
const kalender = {
  ansicht: "monat",   // "liste", "woche", "monat" oder "jahr"
  bezug: null,        // Datum, um das sich die Ansicht dreht
  gewaehlt: null,     // angetippter Tag in der Monatsansicht ("2026-11-24")
};

// Das zuletzt angezeigte Ergebnis (wird von app.js gesetzt)
let aktuellesErgebnis = null;


// ---------------------------------------------------------
// Speichern im Browser
// Ein Lesezeichen = eine Kombination aus Strasse und Abfallart
// ---------------------------------------------------------

function lesezeichenLaden() {
  try {
    return JSON.parse(localStorage.getItem("lesezeichen")) || [];
  } catch (fehler) {
    return [];
  }
}

function lesezeichenSpeichern(liste) {
  try { localStorage.setItem("lesezeichen", JSON.stringify(liste)); } catch (fehler) { /* nicht schlimm */ }
}

function schluesselVon(strasseName, abfallartId) {
  return strasseName + "|" + abfallartId;
}

function istGespeichert(ergebnis) {
  const schluessel = schluesselVon(ergebnis.strasse, ergebnis.abfallartId);
  return lesezeichenLaden().some((l) => l.schluessel === schluessel);
}

// Alle kommenden Termine eines Lesezeichens (immer aus den aktuellen Daten berechnet)
function termineVon(lesezeichen) {
  const strasse = STRASSEN.find((s) => s.name === lesezeichen.strasse);
  if (!strasse || !ABFALLARTEN[lesezeichen.abfallartId]) return [];
  const ergebnis = ergebnisBerechnen(strasse, lesezeichen.abfallartId);
  let termine = ergebnis.termine;
  if (ergebnis.art.wochentage) termine = naechsteWochentage(ergebnis.art.wochentage, 60);
  if (lesezeichen.nurDatum) termine = termine.filter((t) => t.datum === lesezeichen.nurDatum);
  return termine.map((t) => ({ ...t, lesezeichen, ergebnis }));
}

// Alle gespeicherten Termine, nach Datum sortiert
function alleTermine() {
  return lesezeichenLaden().flatMap(termineVon).sort((a, b) => a.datum.localeCompare(b.datum));
}

function speichern(ergebnis, nurDatum) {
  const schluessel = schluesselVon(ergebnis.strasse, ergebnis.abfallartId);
  const neu = {
    schluessel,
    strasse: ergebnis.strasse,
    strasseText: document.getElementById("eingabe-strasse").value || ergebnis.strasse,
    abfallartId: ergebnis.abfallartId,
    nurDatum: nurDatum || null,
  };
  lesezeichenSpeichern([...lesezeichenLaden().filter((l) => l.schluessel !== schluessel), neu]);
  aktualisieren();
  kalenderZeichnen();
  erinnerungenStillAbgleichen();
  meldungZeigen("Im Kalender gespeichert", "Download für den eigenen Kalender", () => icsHerunterladen(neu));
}

function entfernen(schluessel) {
  lesezeichenSpeichern(lesezeichenLaden().filter((l) => l.schluessel !== schluessel));
  aktualisieren();
  kalenderZeichnen();
  erinnerungenStillAbgleichen();
  meldungZeigen("Aus dem Kalender entfernt");
}


// ---------------------------------------------------------
// Stern im Ergebnisfeld
// ---------------------------------------------------------

// Wird von app.js in den Kopf des Ergebnisfelds eingesetzt
function sternKnopf(ergebnis) {
  if (ergebnis.termine.length === 0) return "";   // ohne Termine nichts zu speichern
  const an = istGespeichert(ergebnis);
  return `<button type="button" class="stern ${an ? "an" : ""}" aria-pressed="${an}"
    aria-label="${an ? "Aus dem Kalender entfernen" : "Im Kalender speichern"}">${ICON_STERN}</button>`;
}

// Auswahl «Alle Termine» / «Nur nächster Termin».
// Wer daneben tippt, speichert alle Termine.
function sternMenueZeigen(ergebnis) {
  const naechster = ergebnis.termine[0];
  const menue = document.createElement("div");
  menue.className = "stern-menue";
  menue.innerHTML = `
    <button type="button" data-wahl="alle">Alle Termine speichern</button>
    <button type="button" data-wahl="einer">Nur nächsten Termin speichern (${datumKurz(naechster.datum)})</button>`;
  document.querySelector("#ergebnis .karte-kopf").after(menue);

  function schliessen(wahl) {
    document.removeEventListener("pointerdown", daneben, true);
    menue.remove();
    speichern(ergebnis, wahl === "einer" ? naechster.datum : null);
  }
  function daneben(e) {
    if (!menue.contains(e.target) && !e.target.closest(".stern")) schliessen("alle");
  }
  menue.addEventListener("click", (e) => {
    const knopf = e.target.closest("button");
    if (knopf) schliessen(knopf.dataset.wahl);
  });
  document.addEventListener("pointerdown", daneben, true);
}

function sternGeklickt() {
  const ergebnis = aktuellesErgebnis;
  const offenesMenue = document.querySelector(".stern-menue");
  if (offenesMenue) {
    offenesMenue.querySelector('[data-wahl="alle"]').click();   // Stern nochmals = alle speichern
  } else if (istGespeichert(ergebnis)) {
    entfernen(schluesselVon(ergebnis.strasse, ergebnis.abfallartId));
  } else {
    sternMenueZeigen(ergebnis);
  }
}


// ---------------------------------------------------------
// Kurze Meldung unten (z.B. «Im Kalender gespeichert»)
// ---------------------------------------------------------

let meldungTimer = null;

function meldungZeigen(text, knopfText, aktion) {
  const meldung = document.getElementById("meldung");
  meldung.innerHTML = `<span>${sicher(text)}</span>`
    + (knopfText ? `<button type="button">${sicher(knopfText)}</button>` : "");
  if (knopfText) meldung.querySelector("button").addEventListener("click", () => { aktion(); meldung.hidden = true; });
  meldung.hidden = false;
  clearTimeout(meldungTimer);
  meldungTimer = setTimeout(() => { meldung.hidden = true; }, knopfText ? 8000 : 3000);
}


// ---------------------------------------------------------
// Download für den eigenen Kalender (.ics-Datei)
// Ganztägige Termine mit Erinnerung am Vorabend um 19 Uhr
// ---------------------------------------------------------

// Sonderzeichen für Kalenderdateien schützen
function icsText(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function icsHerunterladen(lesezeichen) {
  const termine = termineVon(lesezeichen);
  if (termine.length === 0) return;
  const zeitstempel = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ohneStriche = (datum) => datum.replace(/-/g, "");

  const ereignisse = termine.map((t) => {
    const art = t.ergebnis.art;
    const naechsterTag = datumLesen(t.datum);
    naechsterTag.setDate(naechsterTag.getDate() + 1);
    const titel = `${art.name} (${lesezeichen.strasseText})`;
    const details = [t.zeit && !t.ergebnis.abgeholt ? t.zeit : art.zeit, t.notiz].filter(Boolean).join(" · ");
    return [
      "BEGIN:VEVENT",
      `UID:${ohneStriche(t.datum)}-${lesezeichen.abfallartId}-${encodeURIComponent(lesezeichen.strasse)}@abfall-schaffhausen`,
      `DTSTAMP:${zeitstempel}`,
      `DTSTART;VALUE=DATE:${ohneStriche(t.datum)}`,
      `DTEND;VALUE=DATE:${ohneStriche(datumAlsText(naechsterTag))}`,
      `SUMMARY:${icsText(titel)}`,
      `DESCRIPTION:${icsText(details)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText("Morgen: " + art.name + (details ? ", " + details : ""))}`,
      "TRIGGER:-PT5H",   // 5 Stunden vor Mitternacht = am Vorabend um 19 Uhr
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });

  const inhalt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Abfall Schaffhausen//DE",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...ereignisse, "END:VCALENDAR"].join("\r\n");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([inhalt], { type: "text/calendar;charset=utf-8" }));
  link.download = `abfall-${lesezeichen.abfallartId}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
}


// ---------------------------------------------------------
// Kalender-Tab zeichnen
// ---------------------------------------------------------

function farbeVon(abfallartId) {
  return KALENDER_FARBEN[abfallartId] || "#000000";
}

// "2026-11-24" → "Dienstag, 24. November 2026"
function datumLang(text) {
  const d = datumLesen(text);
  return `${WOCHENTAGE_LANG[d.getDay()]}, ${d.getDate()}. ${MONATE_LANG[d.getMonth()]} ${d.getFullYear()}`;
}

// Montag der Woche, in der das Datum liegt
function montagVon(datum) {
  const montag = new Date(datum);
  montag.setDate(montag.getDate() - ((montag.getDay() + 6) % 7));
  return montag;
}

// Ein Termin als antippbare Zeile
function eintragZeile(t) {
  return `<button type="button" class="eintrag" data-schluessel="${sicher(t.lesezeichen.schluessel)}" data-datum="${t.datum}">
      <span class="punkt" style="background:${farbeVon(t.lesezeichen.abfallartId)}"></span>
      <span><strong>${sicher(t.ergebnis.art.name)}</strong>
      <span class="klein">${sicher(t.lesezeichen.strasseText)}</span></span>
    </button>`;
}

function tagesEintraege(eintraege) {
  return eintraege && eintraege.length
    ? eintraege.map(eintragZeile).join("")
    : `<p class="leer-text">Keine Termine</p>`;
}

function kopfMitPfeilen(titel) {
  return `<div class="kal-kopf">
      <button type="button" data-schritt="-1" aria-label="Zurück">‹</button>
      <strong>${titel}</strong>
      <button type="button" data-schritt="1" aria-label="Weiter">›</button>
    </div>`;
}

function listeAnsicht(proTag) {
  const tage = Object.keys(proTag).slice(0, 25);
  return tage.map((datum) => `
      <h3 class="tag-titel">${datumKurz(datum)} <span>${grossAnfang(wannText(datum))}</span></h3>
      ${tagesEintraege(proTag[datum])}`).join("");
}

function wocheAnsicht(proTag) {
  const montag = montagVon(kalender.bezug);
  const sonntag = new Date(montag);
  sonntag.setDate(sonntag.getDate() + 6);
  let html = kopfMitPfeilen(`${montag.getDate()}. ${MONATE_KURZ[montag.getMonth()]} – ${sonntag.getDate()}. ${MONATE_KURZ[sonntag.getMonth()]} ${sonntag.getFullYear()}`);
  for (let i = 0; i < 7; i++) {
    const tag = new Date(montag);
    tag.setDate(tag.getDate() + i);
    const datum = datumAlsText(tag);
    html += `<div class="woche-tag ${datum === datumAlsText(heute()) ? "heute" : ""}">
        <div class="woche-datum">${WOCHENTAGE_KURZ[tag.getDay()]} ${tag.getDate()}.</div>
        <div>${tagesEintraege(proTag[datum])}</div>
      </div>`;
  }
  return html;
}

function monatAnsicht(proTag) {
  const jahr = kalender.bezug.getFullYear();
  const monat = kalender.bezug.getMonth();
  const heuteText = datumAlsText(heute());
  let html = kopfMitPfeilen(`${MONATE_LANG[monat]} ${jahr}`);
  html += `<div class="monat-gitter">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((t) => `<span class="wochentag">${t}</span>`).join("")}`;

  const tag = montagVon(new Date(jahr, monat, 1));
  const letzter = new Date(jahr, monat + 1, 0);
  while (tag <= letzter || tag.getDay() !== 1) {
    const datum = datumAlsText(tag);
    const eintraege = proTag[datum] || [];
    const klassen = ["tag",
      tag.getMonth() !== monat ? "anderer-monat" : "",
      datum === heuteText ? "heute" : "",
      datum === kalender.gewaehlt ? "gewaehlt" : ""].join(" ");
    const punkte = eintraege.slice(0, 3)
      .map((t) => `<i style="background:${farbeVon(t.lesezeichen.abfallartId)}"></i>`).join("");
    html += `<button type="button" class="${klassen}" data-datum="${datum}">${tag.getDate()}<span class="punkte">${punkte}</span></button>`;
    tag.setDate(tag.getDate() + 1);
  }
  html += "</div>";

  if (kalender.gewaehlt) {
    html += `<h3 class="tag-titel">${datumKurz(kalender.gewaehlt)}</h3>${tagesEintraege(proTag[kalender.gewaehlt])}`;
  }
  return html;
}

function jahrAnsicht(proTag) {
  const jahr = kalender.bezug.getFullYear();
  let html = kopfMitPfeilen(String(jahr)) + `<div class="jahr-gitter">`;
  for (let monat = 0; monat < 12; monat++) {
    html += `<button type="button" class="mini-monat" data-monat="${monat}"><strong>${MONATE_KURZ[monat]}</strong><span class="mini-tage">`;
    const tag = montagVon(new Date(jahr, monat, 1));
    const letzter = new Date(jahr, monat + 1, 0);
    while (tag <= letzter || tag.getDay() !== 1) {
      const eintraege = tag.getMonth() === monat ? proTag[datumAlsText(tag)] : null;
      const farbe = eintraege ? farbeVon(eintraege[0].lesezeichen.abfallartId) : "";
      html += `<i class="${tag.getMonth() !== monat ? "leer" : ""}" ${farbe ? `style="background:${farbe}"` : ""}></i>`;
      tag.setDate(tag.getDate() + 1);
    }
    html += "</span></button>";
  }
  return html + "</div>";
}

function kalenderZeichnen() {
  const bereich = document.getElementById("kalender-inhalt");
  if (!kalender.bezug) {
    kalender.bezug = heute();
    kalender.gewaehlt = datumAlsText(heute());
  }
  document.querySelectorAll("[data-ansicht]").forEach((k) => k.classList.toggle("aktiv", k.dataset.ansicht === kalender.ansicht));

  const termine = alleTermine();
  if (termine.length === 0) {
    bereich.innerHTML = `<p class="platzhalter"><strong>Keine gespeicherten Termine</strong><br>
      Termine im Ergebnis mit dem Stern speichern.</p>`;
    return;
  }
  const proTag = {};
  for (const t of termine) (proTag[t.datum] = proTag[t.datum] || []).push(t);

  const ansichten = { liste: listeAnsicht, woche: wocheAnsicht, monat: monatAnsicht, jahr: jahrAnsicht };
  bereich.innerHTML = ansichten[kalender.ansicht](proTag);
}


// ---------------------------------------------------------
// Übersicht eines Termins (öffnet sich beim Antippen)
// ---------------------------------------------------------

function uebersichtZeigen(schluessel, datum) {
  const lesezeichen = lesezeichenLaden().find((l) => l.schluessel === schluessel);
  const termin = lesezeichen && termineVon(lesezeichen).find((t) => t.datum === datum);
  if (!termin) return;
  const art = termin.ergebnis.art;
  const zeit = termin.zeit && !termin.ergebnis.abgeholt ? termin.zeit : art.zeit;

  const bereich = document.getElementById("uebersicht");
  bereich.innerHTML = `
    <div class="blatt" role="dialog" aria-modal="true" aria-label="Termin">
      <button type="button" class="schliessen" aria-label="Schliessen">×</button>
      <p class="abfallart" style="color:${farbeVon(lesezeichen.abfallartId)}">${sicher(art.name)}</p>
      <p class="gross">${datumLang(datum)}</p>
      ${zeit ? `<p class="zeit">${sicher(zeit)}</p>` : ""}
      <p class="naechstes">${grossAnfang(wannText(datum))} · ${sicher(lesezeichen.strasseText)}</p>
      ${termin.notiz ? `<p class="notiz">${sicher(termin.notiz)}</p>` : ""}
      ${termin.ausnahme ? `<p class="warnung">${sicher(termin.ausnahme)}</p>` : ""}
      ${erinnerungsAuswahl(lesezeichen)}
      <div class="blatt-knoepfe">
        <button type="button" class="knopf haupt" data-aktion="ics">Download für den eigenen Kalender</button>
        <button type="button" class="text-knopf" data-aktion="entfernen">Aus dem Kalender entfernen</button>
      </div>
    </div>`;
  bereich.hidden = false;
  ebeneOeffnen("uebersicht", () => { bereich.hidden = true; });   // «Zurück» schliesst (js/zurueck.js)

  bereich.onclick = (e) => {
    const erinnerung = e.target.closest("[data-erinnerung]");
    if (erinnerung) {
      erinnerungWaehlen(schluessel, erinnerung.dataset.erinnerung);
      // Nur die Auswahl umstellen (nicht alles neu zeichnen), damit die gelbe Fläche gleitet
      bereich.querySelectorAll("[data-erinnerung]").forEach((k) => k.classList.toggle("aktiv", k === erinnerung));
      return;
    }
    const aktion = e.target.closest("[data-aktion]")?.dataset.aktion;
    if (aktion === "ics") icsHerunterladen(lesezeichen);
    if (aktion === "entfernen") entfernen(schluessel);
    // Schliessen: ×, Hintergrund oder «entfernen»
    if (e.target === bereich || e.target.closest(".schliessen") || aktion === "entfernen") {
      bereich.hidden = true;
      ebeneGeschlossen("uebersicht");
    }
  };
}


// ---------------------------------------------------------
// Einrichten (wird am Ende von app.js aufgerufen)
// ---------------------------------------------------------

function kalenderEinrichten() {
  // Stern im Ergebnisfeld
  document.getElementById("ergebnis").addEventListener("click", (e) => {
    if (e.target.closest(".stern")) sternGeklickt();
  });

  // Klicks im Kalender-Tab
  document.getElementById("tab-termine").addEventListener("click", (e) => {
    const ansicht = e.target.closest("[data-ansicht]");
    const schritt = e.target.closest("[data-schritt]");
    const tag = e.target.closest(".tag");
    const miniMonat = e.target.closest(".mini-monat");
    const eintrag = e.target.closest(".eintrag");

    if (ansicht) {
      kalender.ansicht = ansicht.dataset.ansicht;
    } else if (schritt) {
      const richtung = Number(schritt.dataset.schritt);
      const neu = new Date(kalender.bezug);
      if (kalender.ansicht === "woche") neu.setDate(neu.getDate() + 7 * richtung);
      if (kalender.ansicht === "monat") neu.setMonth(neu.getMonth() + richtung, 1);
      if (kalender.ansicht === "jahr") neu.setFullYear(neu.getFullYear() + richtung);
      kalender.bezug = neu;
    } else if (tag) {
      kalender.gewaehlt = tag.dataset.datum;
    } else if (miniMonat) {
      kalender.ansicht = "monat";
      kalender.bezug = new Date(kalender.bezug.getFullYear(), Number(miniMonat.dataset.monat), 1);
    } else if (eintrag) {
      uebersichtZeigen(eintrag.dataset.schluessel, eintrag.dataset.datum);
      return;
    } else {
      return;
    }
    kalenderZeichnen();
  });

  // Beim Öffnen des Tabs neu zeichnen
  document.querySelector('.tab[data-tab="termine"]').addEventListener("click", kalenderZeichnen);
}
