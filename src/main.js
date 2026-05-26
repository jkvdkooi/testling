// ============================================================
// Testling — hoofdmodule
// Verbindt UI, generatoren en state
// ============================================================

import { genereerKind, genereerOuderLos } from './generators/person.js';
import { genereerGezin }     from './generators/gezin.js';
import { renderKind, renderOuder, renderGezin } from './ui/render.js';
import { kopieer }           from './ui/copy.js';

// ── State ─────────────────────────────────────────────────────

const state = {
  tab:          'kind',  // 'kind' | 'ouder' | 'gezin'
  schooltype:   'po',    // 'po' | 'vo'
  instroom:     'onder', // 'onder' | 'zij'
  ouders:       2,       // 1 | 2
  biologisch:   true,
  basisEmail:   '',
  huidigData:   null,    // laatst gegenereerde data (voor JSON-export)
  geschiedenis: [],      // [{ naam, tab, data }]
  huidigIndex:  -1,
};

// ── DOM-referenties ───────────────────────────────────────────

const elEmail            = document.getElementById('basisEmail');
const elOutput           = document.getElementById('output');
const elBtnNieuw         = document.getElementById('btnNieuw');
const elBtnJSON          = document.getElementById('btnJSON');
const elModal            = document.getElementById('jsonModal');
const elModalTekst       = document.getElementById('jsonTekst');
const elModalSluit       = document.getElementById('jsonSluit');
const elModalKopieer     = document.getElementById('jsonKopieer');
const elGeschPanel       = document.getElementById('geschPanel');
const elGeschToggle      = document.getElementById('btnGesch');
const elGeschTeller      = document.getElementById('geschTeller');
const elGeschiedenisTabs = document.getElementById('geschiedenisTabs');

// ── Persistentie ──────────────────────────────────────────────

const EMAIL_KEY        = 'testling_basisEmail';
const SESSION_KEY      = 'testling_geschiedenis_main';
const MAX_GESCHIEDENIS = 10;

function laadEmail() {
  const opgeslagen = localStorage.getItem(EMAIL_KEY) || '';
  elEmail.value = opgeslagen;
  state.basisEmail = opgeslagen;
}

function slaEmailOp(waarde) {
  state.basisEmail = waarde;
  localStorage.setItem(EMAIL_KEY, waarde);
}

// ── Tab-logica ────────────────────────────────────────────────

function activeerTab(tab, genereerNieuw = true) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('tab--actief', btn.dataset.tab === tab);
  });
  // Toon/verberg gezin-opties
  document.querySelectorAll('.optie-groep--gezin').forEach(el => {
    el.hidden = tab !== 'gezin';
  });
  // Toon/verberg schooltype + instroom (niet bij los ouder-tab)
  document.querySelectorAll('.optie-groep--school').forEach(el => {
    el.hidden = tab === 'ouder';
  });
  // Knoptekst aanpassen
  elBtnNieuw.textContent = {
    kind:  'Nieuwe identiteit',
    ouder: 'Nieuwe identiteit',
    gezin: 'Nieuw gezin',
  }[tab];

  if (genereerNieuw) genereer();
}

// ── Toggle-knoppen ────────────────────────────────────────────

function activeerToggle(groep, waarde) {
  document.querySelectorAll(`.toggle[data-groep="${groep}"]`).forEach(btn => {
    btn.classList.toggle('toggle--actief', btn.dataset.waarde === waarde);
    btn.setAttribute('aria-pressed', btn.dataset.waarde === waarde);
  });
}

function verwerkToggle(groep, waarde) {
  switch (groep) {
    case 'schooltype': state.schooltype = waarde; break;
    case 'instroom':   state.instroom   = waarde; break;
    case 'ouders':     state.ouders     = parseInt(waarde); break;
    case 'biologisch': state.biologisch = (waarde === 'ja'); break;
  }
  activeerToggle(groep, waarde);
  genereer();
}

// ── Genereer ──────────────────────────────────────────────────

function renderHuidigItem(tab, data) {
  let html = '';
  if (tab === 'kind')       html = renderKind(data);
  else if (tab === 'ouder') html = renderOuder(data);
  else                      html = renderGezin(data);
  elOutput.innerHTML = html;
  elOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
  koppelKopieerKnoppen();
}

function genereer() {
  let naam = '';

  if (state.tab === 'kind') {
    const kind = genereerKind(state.schooltype, state.instroom, state.basisEmail);
    state.huidigData = kind;
    naam = `${kind.voornaam} ${kind.achternaam}`;

  } else if (state.tab === 'ouder') {
    const ouder = genereerOuderLos(state.basisEmail);
    state.huidigData = ouder;
    naam = `${ouder.voornaam} ${ouder.achternaam}`;

  } else {
    const gezin = genereerGezin({
      schooltype:   state.schooltype,
      instroomtype: state.instroom,
      aantalOuders: state.ouders,
      biologisch:   state.biologisch,
      basisEmail:   state.basisEmail,
    });
    state.huidigData = gezin;
    naam = `${gezin.kind.voornaam} ${gezin.kind.achternaam}`;
  }

  renderHuidigItem(state.tab, state.huidigData);

  // Geschiedenis bijwerken
  state.geschiedenis.push({ naam, tab: state.tab, data: state.huidigData });
  if (state.geschiedenis.length > MAX_GESCHIEDENIS) state.geschiedenis.shift();
  state.huidigIndex = state.geschiedenis.length - 1;
  slaGeschiedenisOp();
  renderTabs();
}

// ── Kopieer-knoppen ───────────────────────────────────────────

function koppelKopieerKnoppen() {
  elOutput.querySelectorAll('.kopieer-btn').forEach(btn => {
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
  elGeschToggle.classList.add('gesch-knop--actief');
}

function sluitGeschPanel() {
  elGeschPanel.classList.remove('gesch-panel--open');
  elGeschPanel.setAttribute('aria-hidden', 'true');
  elGeschToggle.classList.remove('gesch-knop--actief');
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
      laadItem(parseInt(btn.dataset.index, 10));
      sluitGeschPanel();
    });
  });
  const actief = elGeschiedenisTabs.querySelector('.gesch-item--actief');
  if (actief) actief.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function laadItem(index) {
  if (index < 0 || index >= state.geschiedenis.length) return;
  state.huidigIndex = index;
  const item = state.geschiedenis[index];
  state.huidigData = item.data;
  renderHuidigItem(item.tab, item.data);
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
    const item = parsed[state.huidigIndex];
    state.huidigData = item.data;
    renderHuidigItem(item.tab, item.data);
    renderTabs();
    return true;
  } catch (_) { return false; }
}

// ── JSON-modal ────────────────────────────────────────────────

function toonJSON() {
  const json = JSON.stringify(state.huidigData, null, 2);
  elModalTekst.textContent = json;
  elModal.hidden = false;
  elModal.setAttribute('aria-hidden', 'false');
  elModalSluit.focus();
}

function sluitJSON() {
  elModal.hidden = true;
  elModal.setAttribute('aria-hidden', 'true');
  elBtnJSON.focus();
}

// ── Toetsenbord shortcuts ─────────────────────────────────────

document.addEventListener('keydown', e => {
  // Niet activeren als gebruiker typt in een invoerveld
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === 'n' || e.key === 'N') genereer();
  if (e.key === 'j' || e.key === 'J') toonJSON();
  if (e.key === 'Escape') {
    if (elGeschPanel.classList.contains('gesch-panel--open')) sluitGeschPanel();
    else sluitJSON();
  }
});

// ── Event listeners ───────────────────────────────────────────

elEmail.addEventListener('input',  e => slaEmailOp(e.target.value.trim()));
elEmail.addEventListener('change', () => genereer());

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => activeerTab(btn.dataset.tab));
});

document.querySelectorAll('.toggle').forEach(btn => {
  btn.addEventListener('click', () => verwerkToggle(btn.dataset.groep, btn.dataset.waarde));
});

elBtnNieuw.addEventListener('click', genereer);
elBtnJSON.addEventListener('click', toonJSON);
elModalSluit.addEventListener('click', sluitJSON);
elModalKopieer.addEventListener('click', () => {
  kopieer(elModalTekst.textContent, elModalKopieer);
});
elModal.addEventListener('click', e => {
  if (e.target === elModal) sluitJSON();
});

elGeschToggle.addEventListener('click', e => {
  e.stopPropagation();
  elGeschPanel.classList.contains('gesch-panel--open') ? sluitGeschPanel() : openGeschPanel();
});
document.addEventListener('click', e => {
  if (!e.target.closest('.gesch-container')) sluitGeschPanel();
});

// ── Opstarten ─────────────────────────────────────────────────

laadEmail();
activeerTab('kind', false);
if (!laadGeschiedenisSessie()) genereer();

// ── Thema ─────────────────────────────────────────────────────

const THEMA_KEY = 'testling_thema';

function bepaalAutoThema() {
  const uur = new Date().getHours();
  if (uur >= 19 || uur < 7) return 'donker';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'donker' : 'licht';
}

function pasThemaToe(thema) {
  document.documentElement.dataset.thema = thema;
  const input = document.getElementById('btnThema');
  if (input) input.checked = thema === 'donker';
}

document.getElementById('btnThema').addEventListener('change', e => {
  const nieuw = e.target.checked ? 'donker' : 'licht';
  localStorage.setItem(THEMA_KEY, nieuw);
  pasThemaToe(nieuw);
});

pasThemaToe(localStorage.getItem(THEMA_KEY) || bepaalAutoThema());
