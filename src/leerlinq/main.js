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
  gezin:        null,  // huidig gegenereerd gezin
  basisEmail:   '',
  schooltype:   'po',
  geschiedenis: [],    // [{ naam, gezin }]
  huidigIndex:  -1,
};

// ── DOM ───────────────────────────────────────────────────────

const elEmail       = document.getElementById('basisEmail');
const elBtnNieuw    = document.getElementById('btnNieuw');
const elUitvoerKind = document.getElementById('uitvoerKind');
const elUitvoerOuder = document.getElementById('uitvoerOuder');
const elBtnKopieerLeerling  = document.getElementById('btnKopieerLeerling');
const elBtnKopieerVerzorger = document.getElementById('btnKopieerVerzorger');
const elTeller           = document.getElementById('tellerGezin');
const elGeschPanel       = document.getElementById('geschPanel');
const elGeschBackdrop    = document.getElementById('geschBackdrop');
const elGeschToggle      = document.getElementById('btnGesch');
const elGeschTeller      = document.getElementById('geschTeller');
const elGeschiedenisTabs = document.getElementById('geschiedenisTabs');
const elSchooltypeToggles = document.querySelectorAll('[data-schooltype]');

// ── Persistentie ──────────────────────────────────────────────

const EMAIL_KEY        = 'testling_basisEmail';
const SESSION_KEY      = 'testling_geschiedenis_llq';
const MAX_GESCHIEDENIS = 10;

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

function renderHuidigGezin() {
  const g = state.gezin;
  elUitvoerKind.innerHTML = renderKind(g.kind);
  let ouderHTML = renderOuder(g.ouder1, 'Ouder / verzorger 1');
  if (g.ouder2) ouderHTML += renderOuder(g.ouder2, 'Ouder / verzorger 2');
  elUitvoerOuder.innerHTML = ouderHTML;
  koppelKopieerKnoppen();
}

function genereer() {
  state.gezin = genereerGezin({
    schooltype:   state.schooltype,
    instroomtype: 'onder',
    aantalOuders: 2,
    biologisch:   true,
    basisEmail:   state.basisEmail,
  });

  renderHuidigGezin();
  if (elTeller) elTeller.textContent = '#' + Math.floor(Math.random() * 9000 + 1000);

  // Geschiedenis bijwerken
  const naam = `${state.gezin.kind.voornaam} ${state.gezin.kind.achternaam}`;
  state.geschiedenis.push({ naam, gezin: state.gezin });
  if (state.geschiedenis.length > MAX_GESCHIEDENIS) state.geschiedenis.shift();
  state.huidigIndex = state.geschiedenis.length - 1;
  slaGeschiedenisOp();
  renderTabs();
}

function koppelKopieerKnoppen() {
  document.querySelectorAll('.kopieer-btn').forEach(btn => {
    btn.addEventListener('click', () => kopieer(btn.dataset.waarde, btn));
  });
}

// ── Sessie-geschiedenis zijpaneel ──────────────────────────────────

function slaGeschiedenisOp() {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.geschiedenis)); } catch (_) {}
}

function openGeschPanel() {
  elGeschPanel.classList.add('gesch-panel--open');
  elGeschPanel.setAttribute('aria-hidden', 'false');
  elGeschBackdrop.classList.add('gesch-backdrop--zichtbaar');
  elGeschToggle.hidden = true;
}

function sluitGeschPanel() {
  elGeschPanel.classList.remove('gesch-panel--open');
  elGeschPanel.setAttribute('aria-hidden', 'true');
  elGeschBackdrop.classList.remove('gesch-backdrop--zichtbaar');
  elGeschToggle.hidden = state.geschiedenis.length < 2;
}

function renderTabs() {
  const count = state.geschiedenis.length;
  elGeschToggle.hidden = count < 2;
  if (elGeschTeller) elGeschTeller.textContent = count >= 2 ? count : '';
  if (count < 2) { sluitGeschPanel(); return; }

  elGeschiedenisTabs.innerHTML = state.geschiedenis.map((item, i) =>
    `<li><button class="gesch-item${i === state.huidigIndex ? ' gesch-item--actief' : ''}" data-index="${i}" aria-pressed="${i === state.huidigIndex}">${item.naam}</button></li>`
  ).join('');
  elGeschiedenisTabs.querySelectorAll('.gesch-item').forEach(btn => {
    btn.addEventListener('click', () => {
      laadGezin(parseInt(btn.dataset.index, 10));
      sluitGeschPanel();
    });
  });
  const actief = elGeschiedenisTabs.querySelector('.gesch-item--actief');
  if (actief) actief.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function laadGezin(index) {
  if (index < 0 || index >= state.geschiedenis.length) return;
  state.huidigIndex = index;
  state.gezin = state.geschiedenis[index].gezin;
  if (elTeller) elTeller.textContent = '';
  renderHuidigGezin();
  renderTabs();
}

function laadGeschiedenisSessie() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;
    state.geschiedenis = parsed;
    state.huidigIndex  = parsed.length - 1;
    state.gezin        = parsed[state.huidigIndex].gezin;
    renderHuidigGezin();
    renderTabs();
    return true;
  } catch (_) { return false; }
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
  if (e.key === 'Escape') sluitGeschPanel();
});

document.getElementById('btnGeschSluit').addEventListener('click', sluitGeschPanel);
elGeschBackdrop.addEventListener('click', sluitGeschPanel);
elGeschToggle.addEventListener('click', () => {
  elGeschPanel.classList.contains('gesch-panel--open') ? sluitGeschPanel() : openGeschPanel();
});

// ── Opstarten ─────────────────────────────────────────────────

laadEmail();
if (!laadGeschiedenisSessie()) genereer();

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
