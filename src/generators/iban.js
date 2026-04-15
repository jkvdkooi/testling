// ============================================================
// Testling — IBAN generator
// Genereert geldige Nederlandse IBANs per ouder/verzorger
//
// Twee validatielagen:
//   1. ELF-proef (MOD-11) — het 10-cijferige rekeningnummer (BBAN)
//      Gewichten: 10×d1 + 9×d2 + … + 1×d10 ≡ 0 (mod 11)
//   2. MOD-97       — de twee IBAN-controlecijfers (NLxx)
//
// Formaat: NL + 2 controlecijfers + 4-letterige bankcode + 10-cijferig BBAN
// ============================================================

import { randomItem } from '../utils.js';

// ── Nederlandse banken ────────────────────────────────────────

export const NEDERLANDSE_BANKEN = [
  { naam: 'ABN AMRO',            code: 'ABNA' },
  { naam: 'ING',                 code: 'INGB' },
  { naam: 'Rabobank',            code: 'RABO' },
  { naam: 'SNS Bank',            code: 'SNSB' },
  { naam: 'ASN Bank',            code: 'ASNB' },
  { naam: 'RegioBank',           code: 'RBRB' },
  { naam: 'Triodos Bank',        code: 'TRIO' },
  { naam: 'Bunq',                code: 'BUNQ' },
  { naam: 'Knab',                code: 'KNAB' },
  { naam: 'Van Lanschot Kempen', code: 'FVLB' },
  { naam: 'Nationale Nederlanden Bank', code: 'NNBA' },
  { naam: 'Handelsbanken',       code: 'HAND' },
];

// ── Interne hulpfuncties ──────────────────────────────────────

/**
 * Genereert een 10-cijferig rekeningnummer dat de ELF-proef doorstaat.
 * ELF-proef: 10×d1 + 9×d2 + 8×d3 + … + 1×d10 ≡ 0 (mod 11)
 * @returns {string} 10 cijfers
 */
function genereerBBAN() {
  while (true) {
    const cijfers = [];

    // Genereer 9 willekeurige cijfers (d1 mag 0 zijn — BBAN wordt links zero-padded)
    for (let i = 0; i < 9; i++) {
      cijfers.push(Math.floor(Math.random() * 10));
    }

    // Gewogen som van de eerste 9 cijfers (gewicht 10 t/m 2)
    let som = 0;
    for (let i = 0; i < 9; i++) {
      som += (10 - i) * cijfers[i];
    }

    // d10 zodat som + 1×d10 ≡ 0 (mod 11)
    const d10 = ((-(som % 11)) + 11) % 11;

    // d10 moet een enkel cijfer zijn; bij 10 opnieuw proberen
    if (d10 <= 9) {
      cijfers.push(d10);
      return cijfers.join('');
    }
  }
}

/**
 * Berekent de twee IBAN-controlecijfers via MOD-97 (ISO 7064).
 * Werkwijze: bankcode + bban + 'NL00' → letters vervangen → mod 97 → 98 − rest
 * @param {string} bankCode  4-letterige bankcode, bijv. 'ABNA'
 * @param {string} bban      10-cijferig rekeningnummer
 * @returns {string} 2-cijferige controlecijfers, bijv. '91'
 */
function berekenControlecijfers(bankCode, bban) {
  // Stap 1: herrangschik → bankcode + bban + landcode + '00'
  const herrangschikt = bankCode + bban + 'NL00';

  // Stap 2: vervang elke letter door zijn numerieke waarde (A=10, B=11 … Z=35)
  const numeriek = herrangschikt
    .split('')
    .map(c => {
      const code = c.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : c;
    })
    .join('');

  // Stap 3: bereken het grote getal MOD 97 in stukjes van één cijfer
  let rest = 0;
  for (const c of numeriek) {
    rest = (rest * 10 + parseInt(c, 10)) % 97;
  }

  // Stap 4: controlecijfers = 98 − rest, minstens 2 tekens breed
  return String(98 - rest).padStart(2, '0');
}

/**
 * Formatteert een IBAN in groepen van 4: 'NL91ABNA0123456789' → 'NL91 ABNA 0123 4567 89'
 * @param {string} iban  IBAN zonder spaties
 * @returns {string}
 */
function formateerIBAN(iban) {
  return iban.match(/.{1,4}/g).join(' ');
}

// ── Publieke functies ─────────────────────────────────────────

/**
 * Genereert een geldig Nederlands IBAN voor een willekeurige bank.
 * Het BBAN-deel doorstaat de ELF-proef; de controlecijfers voldoen aan MOD-97.
 *
 * @returns {{ iban: string, bankNaam: string }}
 *   iban     — geformatteerd IBAN, bijv. 'NL91 ABNA 0417 1643 00'
 *   bankNaam — naam van de bank, bijv. 'ABN AMRO'
 */
export function genereerIBAN() {
  const bank            = randomItem(NEDERLANDSE_BANKEN);
  const bban            = genereerBBAN();
  const controlecijfers = berekenControlecijfers(bank.code, bban);
  const raw             = `NL${controlecijfers}${bank.code}${bban}`;

  return {
    iban:     formateerIBAN(raw),
    bankNaam: bank.naam,
  };
}

/**
 * Valideert of een 10-cijferig BBAN de ELF-proef (MOD-11) doorstaat.
 * Gewichten: 10×d1 + 9×d2 + … + 1×d10 ≡ 0 (mod 11)
 * @param {string} bban  10 cijfers
 * @returns {boolean}
 */
export function valideerBBAN(bban) {
  if (!/^\d{10}$/.test(bban)) return false;
  const som = bban.split('').reduce((acc, c, i) => acc + (10 - i) * parseInt(c, 10), 0);
  return som % 11 === 0;
}

/**
 * Valideert een (Nederlands) IBAN via MOD-97.
 * @param {string} iban  Met of zonder spaties
 * @returns {boolean}
 */
export function valideerIBAN(iban) {
  const schoon = iban.replace(/\s/g, '').toUpperCase();
  if (!/^NL\d{2}[A-Z]{4}\d{10}$/.test(schoon)) return false;

  // Herrangschik: verplaats eerste 4 tekens naar achteren
  const herrangschikt = schoon.slice(4) + schoon.slice(0, 4);

  const numeriek = herrangschikt
    .split('')
    .map(c => {
      const code = c.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : c;
    })
    .join('');

  let rest = 0;
  for (const c of numeriek) {
    rest = (rest * 10 + parseInt(c, 10)) % 97;
  }

  return rest === 1;
}
