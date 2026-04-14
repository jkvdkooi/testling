// ============================================================
// Testling — adres generator
// Genereert een subjectief realistisch Nederlands adres
// op basis van de steden-dataset
// ============================================================

import { steden, genereerPC6Letters } from '../../data/adressen.js';
import { randomItem, randomInt } from '../utils.js';

const HUISNUMMER_LETTER_KANS = 0.12; // 12% kans op een toevoeging (A, B, C)
const HUISNUMMER_LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Genereert een volledig synthetisch adres.
 *
 * @param {string|null} stadNaam - Optioneel: stuur aan op een specifieke stad.
 *                                 Bij null wordt een willekeurige stad gekozen.
 * @returns {{
 *   straat: string,
 *   huisnummer: string,
 *   postcode: string,
 *   woonplaats: string,
 *   provincie: string,
 * }}
 */
export function genereerAdres(stadNaam = null) {
  const stad = stadNaam
    ? (steden.find(s => s.stad === stadNaam) ?? randomItem(steden))
    : randomItem(steden);

  const straat     = randomItem(stad.straten);
  const pc4        = randomInt(stad.pc4.van, stad.pc4.tm);
  const letters    = genereerPC6Letters();
  const postcode   = `${pc4} ${letters}`;

  const nummer     = randomInt(1, 250);
  const toevoeging = Math.random() < HUISNUMMER_LETTER_KANS
    ? randomItem(HUISNUMMER_LETTERS)
    : '';
  const huisnummer = `${nummer}${toevoeging}`;

  return {
    straat,
    huisnummer,
    postcode,
    woonplaats: stad.stad,
    provincie:  stad.provincie,
  };
}
