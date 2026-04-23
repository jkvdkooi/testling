// ============================================================
// Testling — unit tests: e-mail generator (plus-adres schema)
// ============================================================

import { suite, test, verwacht } from './runner.js';
import {
  genereerEmailKind,
  genereerEmailOuder1,
  genereerEmailOuder2,
  genereerEmailOuderLos,
} from '../src/generators/email.js';

const BASIS = 'test@voorbeeld.nl';

// ── Suite: genereerEmailKind ──────────────────────────────────
suite('genereerEmailKind — plus-adres formaat');

test('kind PO onderinstroom krijgt juist adres', () => {
  verwacht(genereerEmailKind(BASIS, 'Emma', 'po', 'onder'))
    .toBe('test+emma.po.onder@voorbeeld.nl');
});

test('kind VO zij-instroom krijgt juist adres', () => {
  verwacht(genereerEmailKind(BASIS, 'Noah', 'vo', 'zij'))
    .toBe('test+noah.vo.zij@voorbeeld.nl');
});

test('voornaam met accent wordt genormaliseerd', () => {
  verwacht(genereerEmailKind(BASIS, 'Renée', 'po', 'zij'))
    .toBe('test+renee.po.zij@voorbeeld.nl');
});

test('spaties en speciale tekens worden gestript', () => {
  verwacht(genereerEmailKind(BASIS, 'Jan-Peter', 'po', 'onder'))
    .toBe('test+janpeter.po.onder@voorbeeld.nl');
});

test('ongeldig basisadres (geen @) gooit een fout', () => {
  let gegooid = false;
  try { genereerEmailKind('ongeldig-adres', 'Emma', 'po', 'onder'); }
  catch { gegooid = true; }
  verwacht(gegooid).toBeTrue();
});

// ── Suite: genereerEmailOuder1 / genereerEmailOuder2 ──────────
suite('genereerEmailOuder1 & genereerEmailOuder2 — prefix');

test('ouder 1 krijgt "ouder." prefix', () => {
  verwacht(genereerEmailOuder1(BASIS, 'Emma', 'po', 'onder'))
    .toBe('test+ouder.emma.po.onder@voorbeeld.nl');
});

test('ouder 2 krijgt "ouder2." prefix', () => {
  verwacht(genereerEmailOuder2(BASIS, 'Emma', 'po', 'onder'))
    .toBe('test+ouder2.emma.po.onder@voorbeeld.nl');
});

test('ouder 1 VO zij-instroom correct', () => {
  verwacht(genereerEmailOuder1(BASIS, 'Noah', 'vo', 'zij'))
    .toBe('test+ouder.noah.vo.zij@voorbeeld.nl');
});

// ── Suite: genereerEmailOuderLos ──────────────────────────────
suite('genereerEmailOuderLos — los ouder adres');

test('los ouder krijgt "ouder." prefix met eigen voornaam', () => {
  verwacht(genereerEmailOuderLos(BASIS, 'Jan'))
    .toBe('test+ouder.jan@voorbeeld.nl');
});

test('los ouder voornaam met accent wordt genormaliseerd', () => {
  verwacht(genereerEmailOuderLos(BASIS, 'José'))
    .toBe('test+ouder.jose@voorbeeld.nl');
});

// ── Suite: basisadres-formaten ────────────────────────────────
suite('splitEmail — basisadres-formaten');

test('basis met subdomein werkt correct', () => {
  verwacht(genereerEmailKind('jan@mail.school.nl', 'Lisa', 'po', 'onder'))
    .toBe('jan+lisa.po.onder@mail.school.nl');
});

test('basis met koppelteken in user-deel werkt correct', () => {
  verwacht(genereerEmailKind('jouw-adres@outlook.com', 'Emma', 'po', 'onder'))
    .toBe('jouw-adres+emma.po.onder@outlook.com');
});

test('leeg basisadres ("") gooit een fout', () => {
  let gegooid = false;
  try { genereerEmailKind('', 'Emma', 'po', 'onder'); }
  catch { gegooid = true; }
  verwacht(gegooid).toBeTrue();
});
