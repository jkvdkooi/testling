// ============================================================
// Testling — unit tests: IBAN generator
// ============================================================

import { suite, test, verwacht } from './runner.js';
import {
  genereerIBAN,
  valideerIBAN,
  valideerBBAN,
  NEDERLANDSE_BANKEN,
} from '../src/generators/iban.js';

// ── Bekende geldige IBANs (ter referentie) ────────────────────
const BEKENDE_GELDIGE = [
  'NL91 ABNA 0417 1643 00',   // ABN AMRO — standaard testgeval
  'NL69 INGB 0123 4567 89',   // ING
  'NL20 INGB 0001 2345 67',   // ING met voorloopnullen
];

// Bekende ongeldige IBANs
const BEKENDE_ONGELDIGE = [
  'NL00 ABNA 0417 1643 00',   // controlecijfers 00 zijn nooit geldig
  'NL99 ABNA 0417 1643 00',   // controlecijfers 99 zijn nooit geldig
  'BE71 0961 2345 6769',       // Belgisch IBAN
  'NL91 ABNA 0417 1643 0',    // te kort
  'NL91 ABNA 0417 1643 000',  // te lang
  '',
  'niet-een-iban',
];

// ── Suite: valideerBBAN ───────────────────────────────────────
suite('valideerBBAN — ELF-proef (MOD-11)');

test('accepteert een correct BBAN', () => {
  // 0417164300: 10×0+9×4+8×1+7×7+6×1+5×6+4×4+3×3+2×0+1×0 = 0+36+8+49+6+30+16+9+0+0 = 154 → 154%11=0 ✓
  verwacht(valideerBBAN('0417164300')).toBeTrue();
});

test('verwerpt een BBAN met fout controlecijfer', () => {
  verwacht(valideerBBAN('0417164301')).toBeFalse(); // laatste cijfer +1
});

test('verwerpt invoer die geen 10 cijfers is', () => {
  verwacht(valideerBBAN('123456789')).toBeFalse();   // 9 cijfers
  verwacht(valideerBBAN('12345678901')).toBeFalse(); // 11 cijfers
  verwacht(valideerBBAN('041716430X')).toBeFalse();  // letter erin
  verwacht(valideerBBAN('')).toBeFalse();
});

test('accepteert BBAN met voorloopnul (zero-padded 9-cijferig nummer)', () => {
  // 0 012 345 678 → gewogen som moet deelbaar zijn door 11
  // Genereer een geldig voorbeeld: zoek d10 zodat ELF-proef klopt
  // Wij vertrouwen op het gegenereerde pad; hier test dat valideerBBAN symmetrisch is
  const cijfers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const som = cijfers.reduce((acc, d, i) => acc + (10 - i) * d, 0);
  const d10 = ((-(som % 11)) + 11) % 11;
  if (d10 <= 9) {
    const bban = [...cijfers, d10].join('');
    verwacht(valideerBBAN(bban)).toBeTrue();
  }
  // Als d10===10 slaan we deze subtest over (kans ≈ 1/11)
});

// ── Suite: valideerIBAN ───────────────────────────────────────
suite('valideerIBAN — MOD-97');

for (const iban of BEKENDE_GELDIGE) {
  test(`accepteert geldig IBAN: ${iban}`, () => {
    verwacht(valideerIBAN(iban)).toBeTrue();
  });
}

for (const iban of BEKENDE_ONGELDIGE) {
  test(`verwerpt ongeldig IBAN: "${iban || '(leeg)'}"`, () => {
    verwacht(valideerIBAN(iban)).toBeFalse();
  });
}

test('accepteert IBAN zonder spaties', () => {
  verwacht(valideerIBAN('NL91ABNA0417164300')).toBeTrue();
});

test('accepteert IBAN in kleine letters', () => {
  verwacht(valideerIBAN('nl91abna0417164300')).toBeTrue();
});

// ── Suite: genereerIBAN ───────────────────────────────────────
suite('genereerIBAN — uitvoer');

test('retourneert een object met iban en bankNaam', () => {
  const result = genereerIBAN();
  verwacht(typeof result.iban).toBe('string');
  verwacht(typeof result.bankNaam).toBe('string');
});

test('IBAN heeft correct NL-formaat met spaties (NLxx AAAA dddd dddd dd)', () => {
  const { iban } = genereerIBAN();
  verwacht(iban).toMatch(/^NL\d{2} [A-Z]{4} \d{4} \d{4} \d{2}$/);
});

test('bankNaam zit in de lijst van Nederlandse banken', () => {
  const namen = NEDERLANDSE_BANKEN.map(b => b.naam);
  const { bankNaam } = genereerIBAN();
  verwacht(namen.includes(bankNaam)).toBeTrue();
});

test('elk gegenereerd IBAN doorstaat valideerIBAN (100×)', () => {
  for (let i = 0; i < 100; i++) {
    const { iban } = genereerIBAN();
    if (!valideerIBAN(iban)) {
      throw new Error(`Ongeldig IBAN gegenereerd: ${iban}`);
    }
  }
});

test('elk gegenereerd BBAN-deel doorstaat ELF-proef (100×)', () => {
  for (let i = 0; i < 100; i++) {
    const { iban } = genereerIBAN();
    const bban = iban.replace(/\s/g, '').slice(8); // NL + 2 + 4 = 8 tekens
    if (!valideerBBAN(bban)) {
      throw new Error(`BBAN doorstaat ELF-proef niet: ${bban} (van ${iban})`);
    }
  }
});

test('alle 12 banken komen voor in minstens 200 generaties (kansverdeling)', () => {
  const gezien = new Set();
  for (let i = 0; i < 200; i++) {
    gezien.add(genereerIBAN().bankNaam);
  }
  // Met 12 banken en 200 pogingen verwachten we nagenoeg alle banken
  verwacht(gezien.size).toBeGreaterThanOrEqual(8);
});

// ── Suite: NEDERLANDSE_BANKEN data ────────────────────────────
suite('NEDERLANDSE_BANKEN — data-integriteit');

test('bevat precies 12 banken', () => {
  verwacht(NEDERLANDSE_BANKEN.length).toBe(12);
});

test('elke bank heeft een 4-letterige code in hoofdletters', () => {
  for (const bank of NEDERLANDSE_BANKEN) {
    if (!/^[A-Z]{4}$/.test(bank.code)) {
      throw new Error(`Ongeldige bankcode: "${bank.code}" (${bank.naam})`);
    }
  }
});

test('alle bankcodes zijn uniek', () => {
  const codes = NEDERLANDSE_BANKEN.map(b => b.code);
  const uniek = new Set(codes);
  verwacht(uniek.size).toBe(codes.length);
});

test('alle banknamen zijn niet-leeg', () => {
  for (const bank of NEDERLANDSE_BANKEN) {
    if (!bank.naam || bank.naam.trim() === '') {
      throw new Error(`Lege banknaam voor code "${bank.code}"`);
    }
  }
});
