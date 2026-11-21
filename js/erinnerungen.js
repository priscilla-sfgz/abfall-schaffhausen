// =========================================================
// Abfall Schaffhausen – Push-Erinnerungen
// Knopf «Push-Erinnerungen» im Kalender-Tab. Ist er an, meldet
// sich das Gerät bei /api/erinnerung (Vercel) an und schickt
// die Daten der gespeicherten Termine mit. Supabase löst jede
// Stunde /api/senden aus, das dann die Nachrichten verschickt.
//
// Wird vor js/app.js geladen.
// =========================================================

// Öffentlicher Schlüssel für Push (nicht geheim). Der passende geheime
// Schlüssel steht bei Vercel als VAPID_PRIVATE_KEY.
const VAPID_OEFFENTLICH = "BFiNpxsdT-c6mzbf5j8cVu7zphGWdjPCSHit1fYi_IbVsF7JJZII2_7W7ZyZa6mQCQvHjPMiQmoDqaPudSdUrEw";

// Wann erinnert wird (pro gespeicherter Kombination wählbar)
const ERINNERUNG_ZEITPUNKTE = [
  ["vorabend", "Vorabend 19 Uhr"],
  ["morgen", "Morgen 6 Uhr"],
  ["keine", "Keine"],
];

// Kann dieser Browser überhaupt Push-Nachrichten empfangen?
// (Auf dem iPhone nur in der installierten App.)
const PUSH_MOEGLICH = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function erinnerungenAn() {
  try { return localStorage.getItem("erinnerungen") === "an"; } catch (fehler) { return false; }
}

function erinnerungenMerken(an) {
  try { localStorage.setItem("erinnerungen", an ? "an" : "aus"); } catch (fehler) { /* nicht schlimm */ }
}

// "BFiN..." → Bytes (so will es der Browser)
function schluesselAlsBytes(text) {
  const base64 = (text + "=".repeat((4 - (text.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (zeichen) => zeichen.charCodeAt(0));
}

async function aboHolen() {
  const registrierung = await navigator.serviceWorker.ready;
  return registrierung.pushManager.getSubscription();
}

// Was der Server über die gespeicherten Termine wissen muss
function erinnerungsDaten() {
  return lesezeichenLaden()
    .filter((l) => (l.erinnerung || "vorabend") !== "keine")
    .map((l) => {
      const termine = termineVon(l);
      return {
        titel: ABFALLARTEN[l.abfallartId] ? ABFALLARTEN[l.abfallartId].name : "",
        ort: l.strasseText,
        zeitpunkt: l.erinnerung || "vorabend",
        daten: termine.slice(0, 120).map((t) => ({
          datum: t.datum,
          // Abfuhr: «bis 7 Uhr bereitstellen». Sammeltag (z.B. Giftsammlung): Zeit und Ort.
          text: t.ergebnis.abgeholt ? t.ergebnis.art.zeit : [t.zeit, t.notiz].filter(Boolean).join(", "),
        })),
      };
    })
    .filter((l) => l.daten.length > 0);
}

// Schickt die aktuellen Termine an den Server (nur wenn Erinnerungen an sind)
async function erinnerungenAbgleichen() {
  if (!PUSH_MOEGLICH || !erinnerungenAn()) return;
  const abo = await aboHolen();
  if (!abo) return;
  const antwort = await fetch("api/erinnerung", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abo: abo.toJSON(), lesezeichen: erinnerungsDaten() }),
  });
  if (!antwort.ok) throw new Error("Server antwortet mit " + antwort.status);
}

// Im Hintergrund abgleichen, Fehler nur in der Konsole melden
function erinnerungenStillAbgleichen() {
  erinnerungenAbgleichen().catch((fehler) => console.warn("Erinnerungen:", fehler));
}

async function erinnerungenEinschalten() {
  const erlaubnis = await Notification.requestPermission();
  if (erlaubnis !== "granted") {
    meldungZeigen("Benachrichtigungen sind in den Einstellungen blockiert");
    return;
  }
  try {
    const registrierung = await navigator.serviceWorker.ready;
    await registrierung.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: schluesselAlsBytes(VAPID_OEFFENTLICH),
    });
    erinnerungenMerken(true);
    await erinnerungenAbgleichen();
    meldungZeigen("Push-Erinnerungen eingeschaltet");
  } catch (fehler) {
    console.warn("Erinnerungen:", fehler);
    erinnerungenMerken(false);
    meldungZeigen("Push-Erinnerungen konnten nicht eingeschaltet werden");
  }
}

async function erinnerungenAusschalten() {
  erinnerungenMerken(false);
  try {
    const abo = await aboHolen();
    if (abo) {
      await fetch("api/erinnerung", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: abo.endpoint }),
      });
      await abo.unsubscribe();
    }
  } catch (fehler) {
    console.warn("Erinnerungen:", fehler);
  }
  meldungZeigen("Push-Erinnerungen ausgeschaltet");
}

// Knopf im Kalender-Tab auf den aktuellen Stand bringen
function erinnerungsSchalterZeigen() {
  const schalter = document.getElementById("erinnerung-schalter");
  const knopf = schalter.querySelector(".schalter");
  const zusatz = schalter.querySelector(".klein");
  knopf.disabled = !PUSH_MOEGLICH;
  knopf.setAttribute("aria-checked", String(PUSH_MOEGLICH && erinnerungenAn()));
  zusatz.textContent = PUSH_MOEGLICH
    ? "Für gespeicherte Termine"
    : "Nur in der installierten App (Teilen → Zum Home-Bildschirm)";
}

// Auswahl «Vorabend / Morgen / Keine» für die Übersicht eines Termins
function erinnerungsAuswahl(lesezeichen) {
  if (!PUSH_MOEGLICH || !erinnerungenAn()) return "";
  const aktuell = lesezeichen.erinnerung || "vorabend";
  return `<p class="auswahl-titel">Erinnerung</p>
    <div class="umschalter klein-umschalter" role="group" aria-label="Erinnerung">
      ${ERINNERUNG_ZEITPUNKTE.map(([wert, text]) =>
        `<button type="button" data-erinnerung="${wert}" class="${wert === aktuell ? "aktiv" : ""}">${text}</button>`).join("")}
    </div>`;
}

function erinnerungWaehlen(schluessel, wert) {
  lesezeichenSpeichern(lesezeichenLaden().map((l) => (l.schluessel === schluessel ? { ...l, erinnerung: wert } : l)));
  erinnerungenStillAbgleichen();
}

// Einrichten (wird am Ende von app.js aufgerufen)
function erinnerungenEinrichten() {
  erinnerungsSchalterZeigen();
  document.querySelector("#erinnerung-schalter .schalter").addEventListener("click", async () => {
    if (erinnerungenAn()) await erinnerungenAusschalten();
    else await erinnerungenEinschalten();
    erinnerungsSchalterZeigen();
  });
  // Termine beim Start neu schicken (die Daten können sich geändert haben)
  erinnerungenStillAbgleichen();
}
