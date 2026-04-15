// ============================================================
// Testling — unit tests: BSN generator
// ============================================================

import { suite, test, verwacht } from './runner.js';
import { genereerBSN, valideerBSN } from '../src/generators/bsn.js';

// ── Bekende geldige BSNs ──────────────────────────────────────
const BEKENDE_GELDIGE = [
  '111222333',  // klassiek testgeval
  '123456782',  // veelgebruikt dev-BSN
];

// Bekende ongeldige BSNs
const BEKENDE_ONGELDIGE = [
  '000000000',  // begint met 0
  '123456789',  // ELF-proef faalt
  '12345678',   // te kort (8 cijfers)
  '1234567890', // te lang (10 cijfers)
  'ABCDEFGHI',  // letters
  '',
];

// ── Suite: valideerBSN ────────────────────────────────────────
suite('valideerBSN — ELF-proef');

for (const bsn of BEKENDE_GELDIGE) {
  test(`accepteert geldig BSN: ${bsn}`, () => {
    verwacht(valideerBSN(bsn)).toBeTrue();
  });
}

for (const bsn of BEKENDE_ONGELDIGE) {
  test(`verwerpt ongeldig BSN: "${bsn || '(leeg)'}"`, () => {
    verwacht(valideerBSN(bsn)).toBeFalse();
  });
}

// ── Suite: genereerBSN ────────────────────────────────────────
suite('genereerBSN — uitvoer');

test('retourneert een string van 9 cijfers', () => {
  const bsn = genereerBSN();
  verwacht(bsn).toMatch(/^\d{9}$/);
});

test('begint nooit met een 0', () => {
  for (let i = 0; i < 50; i++) {
    const bsn = genereerBSN();
    if (bsn[0] === '0') throw new Error(`BSN begint met 0: ${bsn}`);
  }
});

test('elk gegenereerd BSN doorstaat valideerBSN (100×)', () => {
  for (let i = 0; i < 100; i++) {
    const bsn = genereerBSN();
    if (!valideerBSN(bsn)) {
      throw new Error(`Ongeldig BSN gegenereerd: ${bsn}`);
    }
  }
});

test('genereert telkens een ander BSN (entropie-check)', () => {
  const set = new Set(Array.from({ length: 20 }, () => genereerBSN()));
  verwacht(set.size).toBeGreaterThanOrEqual(18); // hoogst onwaarschijnlijk dat 2+ gelijk zijn
});
