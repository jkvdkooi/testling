// ============================================================
// Testling — gezin generator
// Genereert een coherent gezin: kind + 1 of 2 ouders/voogden
// Adres wordt gedeeld; emailadressen via plus-adres schema
// ============================================================

import { genereerAdres }           from './address.js';
import { genereerKind, genereerOuderGekoppeld } from './person.js';
import { randomItem }              from '../utils.js';

// ── Gezinssituatie ────────────────────────────────────────────

const BURGERLIJKE_STAAT_SAMEN      = ['Gehuwd', 'Geregistreerd partnerschap', 'Samenwonend'];
const BURGERLIJKE_STAAT_GESCHEIDEN = ['Gescheiden', 'Nooit gehuwd geweest'];

function genereerGezinssituatie(aantalOuders) {
  if (aantalOuders < 2) {
    return {
      burgerlijkeStaat: randomItem(['Alleenstaand', 'Gescheiden', 'Weduwe / weduwnaar']),
      ouderlijkGezag:   'Alleen ouder 1',
      samenwonend:      false,
    };
  }

  const samenwonend = Math.random() < 0.65;
  if (samenwonend) {
    return {
      burgerlijkeStaat: randomItem(BURGERLIJKE_STAAT_SAMEN),
      ouderlijkGezag:   'Gezamenlijk gezag',
      samenwonend:      true,
    };
  }

  const staat = randomItem(BURGERLIJKE_STAAT_GESCHEIDEN);
  const gezagOpties = staat === 'Gescheiden'
    ? ['Gezamenlijk gezag', 'Alleen ouder 1', 'Alleen ouder 2']
    : ['Gezamenlijk gezag', 'Alleen ouder 1'];

  return {
    burgerlijkeStaat: staat,
    ouderlijkGezag:   randomItem(gezagOpties),
    samenwonend:      false,
  };
}

/**
 * Genereert een volledig gezin.
 *
 * @param {object} opties
 * @param {'po'|'vo'} opties.schooltype        - Schooltype van het kind
 * @param {'onder'|'zij'} opties.instroomtype  - Instroomtype van het kind
 * @param {1|2} opties.aantalOuders            - 1 of 2 ouders/voogden
 * @param {boolean} opties.biologisch          - true = ouder 1 deelt achternaam met kind
 * @param {string} opties.basisEmail           - Instelbaar basis-emailadres
 *
 * @returns {{ kind: object, ouder1: object, ouder2: object|null, gezinssituatie: object }}
 */
export function genereerGezin({
  schooltype    = 'po',
  instroomtype  = 'onder',
  aantalOuders  = 2,
  biologisch    = true,
  basisEmail    = '',
} = {}) {

  // Gedeeld adres voor het hele gezin
  const adres = genereerAdres();

  // Genereer het kind (zonder adres — dat komt uit het gezin)
  const kind = genereerKind(schooltype, instroomtype, basisEmail);

  // Overschrijf het adres van het kind met het gezinsadres
  Object.assign(kind, adres);

  // Bepaal gezinssituatie (burgerlijke staat, gezag, woonsituatie)
  const gezinssituatie = genereerGezinssituatie(aantalOuders);

  // Ouder 1
  const ouder1 = genereerOuderGekoppeld({
    adres,
    voornaamKind:      kind.voornaam,
    schooltype,
    instroomtype,
    basisEmail,
    ouderNummer:       1,
    achternaamKind:    biologisch ? kind.achternaam    : null,
    tussenvoegselKind: biologisch ? kind.tussenvoegsel : null,
  });

  // Optioneel: ouder 2
  let ouder2 = null;
  if (aantalOuders >= 2) {
    // Ouder 2: ~85% kans op ander geslacht (traditioneel), ~15% zelfde geslacht
    const anderGeslacht = ouder1.geslacht === 'Man' ? 'v' : 'm';
    const zelfdGeslacht = ouder1.geslacht === 'Man' ? 'm' : 'v';
    const geslachtOuder2 = Math.random() < 0.85 ? anderGeslacht : zelfdGeslacht;
    // Bij gescheiden/ouders wonen apart: eigen adres
    const adresOuder2 = gezinssituatie.samenwonend ? adres : genereerAdres();

    ouder2 = genereerOuderGekoppeld({
      adres:             adresOuder2,
      voornaamKind:      kind.voornaam,
      schooltype,
      instroomtype,
      basisEmail,
      ouderNummer:       2,
      achternaamKind:    biologisch ? kind.achternaam    : null, // biologisch: deelt achternaam met kind
      tussenvoegselKind: biologisch ? kind.tussenvoegsel : null,
      verplichtGeslacht: geslachtOuder2,
    });
  }

  return { kind, ouder1, ouder2, gezinssituatie };
}
