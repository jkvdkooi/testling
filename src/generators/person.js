// ============================================================
// Testling — persoon generator
// Stelt een volledige synthetische identiteit samen
// ============================================================

import { voornamenMannelijk, voornamenVrouwelijk, achternamen } from '../../data/namen.js';
import { randomItem, randomInt } from '../utils.js';
import { genereerBSN }     from './bsn.js';
import { genereerIBAN }    from './iban.js';
import { genereerTelefoon } from './phone.js';
import { genereerAdres }    from './address.js';
import {
  genereerEmailKind,
  genereerEmailOuder1,
  genereerEmailOuder2,
  genereerEmailOuderLos,
} from './email.js';

// VO-niveaus
const VO_NIVEAUS = ['VMBO-KB', 'VMBO-GL', 'VMBO-T', 'HAVO', 'VWO'];

/** Genereert een geboortedatum voor een volwassene (26–52 jaar) */
function genereerGeboortedatumVolwassene() {
  const leeftijd = randomInt(26, 52);
  const nu       = new Date();
  const jaar     = nu.getFullYear() - leeftijd;
  const maand    = randomInt(1, 12);
  const maxDag   = new Date(jaar, maand, 0).getDate();
  const dag      = randomInt(1, maxDag);
  return `${String(dag).padStart(2, '0')}-${String(maand).padStart(2, '0')}-${jaar}`;
}

// Ouder-relaties
const RELATIES = ['Ouder', 'Verzorger', 'Voogd'];

// ── Hulpfuncties ──────────────────────────────────────────────

/** Berekent PO-groep op basis van leeftijd (4–12 jaar) */
function berekenGroep(leeftijd) {
  const groep = leeftijd - 3; // 4 jaar = groep 1, 5 = groep 2, …
  return Math.min(Math.max(groep, 1), 8);
}

/** Berekent VO-klas op basis van leeftijd (12–18 jaar) */
function berekenKlas(leeftijd) {
  const klas = leeftijd - 11; // 12 jaar = klas 1, 13 = klas 2, …
  return Math.min(Math.max(klas, 1), 6);
}

/**
 * Genereert een geboortedatum passend bij schooltype en instroomtype.
 * @returns {{ datum: string, leeftijd: number }}
 */
function genereerGeboortedatum(schooltype, instroomtype) {
  let leeftijd;

  if (schooltype === 'po') {
    leeftijd = instroomtype === 'onder' ? 4 : randomInt(4, 12);
  } else {
    leeftijd = instroomtype === 'onder' ? 12 : randomInt(12, 18);
  }

  const nu       = new Date();
  const jaar     = nu.getFullYear() - leeftijd;
  const maand    = randomInt(1, 12);
  const maxDag   = new Date(jaar, maand, 0).getDate();
  const dag      = randomInt(1, maxDag);

  return {
    datum:    `${String(dag).padStart(2, '0')}-${String(maand).padStart(2, '0')}-${jaar}`,
    leeftijd,
  };
}

/**
 * Genereert een volledige naam (voornaam + tussenvoegsel + achternaam).
 * Tussenvoegsel is altijd compatibel met de achternaam.
 *
 * @param {'m'|'v'} geslacht
 * @returns {{ voornaam, tussenvoegsel, achternaam, volleNaam }}
 */
export function genereerNaam(geslacht) {
  const pool     = geslacht === 'm' ? voornamenMannelijk : voornamenVrouwelijk;
  const voornaam = randomItem(pool);
  const entry    = randomItem(achternamen);
  const tv       = randomItem(entry.tv);  // compatibel tussenvoegsel

  const volleNaam = tv
    ? `${voornaam} ${tv} ${entry.naam}`
    : `${voornaam} ${entry.naam}`;

  return {
    voornaam,
    tussenvoegsel: tv,
    achternaam:    entry.naam,
    volleNaam,
  };
}

// ── Publieke generators ───────────────────────────────────────

/**
 * Genereert een enkelvoudige leerlingidentiteit.
 *
 * @param {'po'|'vo'} schooltype
 * @param {'onder'|'zij'} instroomtype
 * @param {string} basisEmail - Instelbaar basis-emailadres (mag leeg zijn)
 * @returns {object}
 */
export function genereerKind(schooltype = 'po', instroomtype = 'onder', basisEmail = '') {
  const geslacht = Math.random() < 0.5 ? 'm' : 'v';
  const naam     = genereerNaam(geslacht);
  const { datum: geboortedatum, leeftijd } = genereerGeboortedatum(schooltype, instroomtype);
  const adres    = genereerAdres();

  const basis = {
    ...naam,
    geslacht:      geslacht === 'm' ? 'Man' : 'Vrouw',
    geboortedatum,
    leeftijd,
    bsn:           genereerBSN(),
    telefoon:      genereerTelefoon(),
    emailadres:    basisEmail ? genereerEmailKind(basisEmail, naam.voornaam, schooltype, instroomtype) : '',
    ...adres,
    schooltype:    schooltype.toUpperCase(),
    instroomtype,
  };

  if (schooltype === 'po') {
    basis.groep = berekenGroep(leeftijd);
  } else {
    basis.klas   = berekenKlas(leeftijd);
    basis.niveau = randomItem(VO_NIVEAUS);
  }

  return basis;
}

/**
 * Genereert een enkelvoudige ouder/verzorger-identiteit,
 * los van een kind.
 *
 * @param {string} basisEmail
 * @returns {object}
 */
export function genereerOuderLos(basisEmail = '') {
  const geslacht = Math.random() < 0.5 ? 'm' : 'v';
  const naam     = genereerNaam(geslacht);
  const adres    = genereerAdres();

  const { iban, bankNaam } = genereerIBAN();

  return {
    ...naam,
    geslacht:      geslacht === 'm' ? 'Man' : 'Vrouw',
    geboortedatum: genereerGeboortedatumVolwassene(),
    relatie:       randomItem(RELATIES),
    bsn:           genereerBSN(),
    iban,
    bankNaam,
    telefoon:      genereerTelefoon(),
    emailadres:    basisEmail ? genereerEmailOuderLos(basisEmail, naam.voornaam) : '',
    ...adres,
  };
}

/**
 * Genereert een ouder die aan een kind gekoppeld is.
 * Adres en emailadres worden meegegeven (gedeeld met kind).
 *
 * @param {object} adres            - Gedeeld adres van het gezin
 * @param {string} voornaamKind     - Voor de e-mail plus-tag
 * @param {'po'|'vo'} schooltype
 * @param {'onder'|'zij'} instroomtype
 * @param {string} basisEmail
 * @param {1|2} ouderNummer         - 1 = eerste ouder, 2 = tweede ouder
 * @param {string|null} achternaamKind - Alleen bij biologisch=true: overnemen
 * @param {string|null} tussenvoegselKind
 * @returns {object}
 */
export function genereerOuderGekoppeld({
  adres,
  voornaamKind,
  schooltype,
  instroomtype,
  basisEmail = '',
  ouderNummer = 1,
  achternaamKind = null,
  tussenvoegselKind = null,
  verplichtGeslacht = null,
}) {
  const geslacht = verplichtGeslacht || (Math.random() < 0.5 ? 'm' : 'v');
  const naam     = genereerNaam(geslacht);

  // Biologisch: achternaam + tussenvoegsel van het kind overnemen (voor beide ouders)
  const achternaam    = achternaamKind    !== null ? achternaamKind    : naam.achternaam;
  const tussenvoegsel = tussenvoegselKind !== null ? tussenvoegselKind : naam.tussenvoegsel;

  const volleNaam = tussenvoegsel
    ? `${naam.voornaam} ${tussenvoegsel} ${achternaam}`
    : `${naam.voornaam} ${achternaam}`;

  const emailFn            = ouderNummer === 1 ? genereerEmailOuder1 : genereerEmailOuder2;
  const { iban, bankNaam } = genereerIBAN();

  return {
    voornaam:      naam.voornaam,
    tussenvoegsel,
    achternaam,
    volleNaam,
    geslacht:      geslacht === 'm' ? 'Man' : 'Vrouw',
    geboortedatum: genereerGeboortedatumVolwassene(),
    relatie:       randomItem(RELATIES),
    bsn:           genereerBSN(),
    iban,
    bankNaam,
    telefoon:      genereerTelefoon(),
    emailadres:    basisEmail ? emailFn(basisEmail, voornaamKind, schooltype, instroomtype) : '',
    ...adres,
  };
}
