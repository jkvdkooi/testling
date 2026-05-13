// ============================================================
// Testling × Leerlinq — pagina-module
// Beheert het genereren, renderen en kopiëren van
// testdata specifiek voor het Leerlinq PO aanmeldportaal.
// ============================================================

import { genereerGezin }    from '../generators/gezin.js';
import { renderKind, renderOuder } from '../ui/render.js';
import { kopieer }          from '../ui/copy.js';
import { mapKindNaarLeerlinq, mapGezinNaarVerzorgers } from './mapper.js';

// ── State ─────────────────────────────────────────────────────

const state = {
  gezin:      null,   // huidig gegenereerd gezin
  basisEmail: '',
  schooltype: 'po',
};

// ── DOM ───────────────────────────────────────────────────────

const elEmail       = document.getElementById('basisEmail');
const elBtnNieuw    = document.getElementById('btnNieuw');
const elUitvoerKind = document.getElementById('uitvoerKind');
const elUitvoerOuder = document.getElementById('uitvoerOuder');
const elBtnKopieerLeerling  = document.getElementById('btnKopieerLeerling');
const elBtnKopieerVerzorger = document.getElementById('btnKopieerVerzorger');
const elTeller      = document.getElementById('tellerGezin');
const elSchooltypeToggles = document.querySelectorAll('[data-schooltype]');

// ── Persistentie ──────────────────────────────────────────────

const EMAIL_KEY = 'testling_basisEmail';

function laadEmail() {
  const opgeslagen = localStorage.getItem(EMAIL_KEY) || '';
  elEmail.value   = opgeslagen;
  state.basisEmail = opgeslagen;
}

function slaEmailOp(waarde) {
  state.basisEmail = waarde;
  localStorage.setItem(EMAIL_KEY, waarde);
}

// ── Genereer & render ─────────────────────────────────────────

function genereer() {
  state.gezin = genereerGezin({
    schooltype:   state.schooltype,
    instroomtype: 'onder',
    aantalOuders: 2,
    biologisch:   true,
    basisEmail:   state.basisEmail,
  });

  // Kind-kaart
  elUitvoerKind.innerHTML = renderKind(state.gezin.kind);

  // Ouder-kaarten
  let ouderHTML = renderOuder(state.gezin.ouder1, 'Ouder / verzorger 1');
  if (state.gezin.ouder2) {
    ouderHTML += renderOuder(state.gezin.ouder2, 'Ouder / verzorger 2');
  }
  elUitvoerOuder.innerHTML = ouderHTML;

  // Teller bijwerken
  if (elTeller) elTeller.textContent = '#' + Math.floor(Math.random() * 9000 + 1000);

  koppelKopieerKnoppen();
}

function koppelKopieerKnoppen() {
  document.querySelectorAll('.kopieer-btn').forEach(btn => {
    btn.addEventListener('click', () => kopieer(btn.dataset.waarde, btn));
  });
}

// ── Leerlinq-kopieer knoppen ──────────────────────────────────

elBtnKopieerLeerling.addEventListener('click', () => {
  if (!state.gezin) return;
  const mapped = mapKindNaarLeerlinq(state.gezin.kind);
  const json   = JSON.stringify(mapped, null, 2);
  kopieer(json, elBtnKopieerLeerling);
});

elBtnKopieerVerzorger.addEventListener('click', () => {
  if (!state.gezin) return;
  const mapped = mapGezinNaarVerzorgers(state.gezin);
  const json   = JSON.stringify(mapped, null, 2);
  kopieer(json, elBtnKopieerVerzorger);
});

// ── Events ────────────────────────────────────────────────────

elBtnNieuw.addEventListener('click', genereer);
elEmail.addEventListener('input',  e => slaEmailOp(e.target.value.trim()));
elEmail.addEventListener('change', genereer);

elSchooltypeToggles.forEach(btn => {
  btn.addEventListener('click', () => {
    state.schooltype = btn.dataset.schooltype;
    elSchooltypeToggles.forEach(b => {
      b.classList.toggle('toggle--actief', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    genereer();
  });
});

document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.key === 'n' || e.key === 'N') genereer();
});

// ── Opstarten ─────────────────────────────────────────────────

laadEmail();
genereer();

// ── Thema (zelfde logica als main.js) ─────────────────────────

const THEMA_KEY = 'testling_thema';

function bepaalAutoThema() {
  const uur = new Date().getHours();
  if (uur >= 19 || uur < 7) return 'donker';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'donker' : 'licht';
}

function pasThemaToe(thema) {
  document.documentElement.dataset.thema = thema;
}

function wisselThema() {
  const huidig = document.documentElement.dataset.thema;
  const nieuw  = huidig === 'donker' ? 'licht' : 'donker';
  localStorage.setItem(THEMA_KEY, nieuw);
  pasThemaToe(nieuw);
  document.getElementById('btnThema').checked = nieuw === 'donker';
}

const opgeslagenThema = localStorage.getItem(THEMA_KEY);
pasThemaToe(opgeslagenThema || bepaalAutoThema());
const btnThema = document.getElementById('btnThema');
if (btnThema) {
  btnThema.checked = document.documentElement.dataset.thema === 'donker';
  btnThema.addEventListener('change', wisselThema);
}
