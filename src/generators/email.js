// ============================================================
// Testling — e-mailadres generator
// Plus-adres schema op basis van instelbaar basis-emailadres
// ============================================================

/**
 * Normaliseert een voornaam voor gebruik in een plus-tag:
 * lowercase, accenten verwijderd, alleen a-z en cijfers.
 * @param {string} voornaam
 * @returns {string}
 */
function normaliseerNaam(voornaam) {
  return voornaam
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // verwijder accenten
    .replace(/[^a-z0-9]/g, '');      // verwijder overige tekens
}

/**
 * Splitst een basis-emailadres in user en domain.
 * @param {string} basis - bijv. "jouw-adres@outlook.com"
 * @returns {{ user: string, domain: string }}
 */
function splitEmail(basis) {
  const at = basis.lastIndexOf('@');
  if (at < 1) throw new Error(`Ongeldig basis-emailadres: "${basis}"`);
  return {
    user: basis.slice(0, at),
    domain: basis.slice(at + 1),
  };
}

/**
 * Genereert een plus-adres voor een kind.
 *
 * @param {string} basis       - Instelbaar basis-emailadres (bijv. "jouw@outlook.com")
 * @param {string} voornaam    - Voornaam van het kind
 * @param {'po'|'vo'} schooltype
 * @param {'onder'|'zij'} instroomtype
 * @returns {string}           - bijv. "jouw+emma.po.onder@outlook.com"
 */
export function genereerEmailKind(basis, voornaam, schooltype, instroomtype) {
  const { user, domain } = splitEmail(basis);
  const naam = normaliseerNaam(voornaam);
  const tag = `${naam}.${schooltype}.${instroomtype}`;
  return `${user}+${tag}@${domain}`;
}

/**
 * Genereert een plus-adres voor ouder 1 van een kind.
 *
 * @param {string} basis
 * @param {string} voornaamKind - Voornaam van het kind (bepaalt de tag)
 * @param {'po'|'vo'} schooltype
 * @param {'onder'|'zij'} instroomtype
 * @returns {string}            - bijv. "jouw+ouder.emma.po.onder@outlook.com"
 */
export function genereerEmailOuder1(basis, voornaamKind, schooltype, instroomtype) {
  const { user, domain } = splitEmail(basis);
  const naam = normaliseerNaam(voornaamKind);
  const tag = `ouder.${naam}.${schooltype}.${instroomtype}`;
  return `${user}+${tag}@${domain}`;
}

/**
 * Genereert een plus-adres voor ouder 2 van een kind.
 *
 * @param {string} basis
 * @param {string} voornaamKind
 * @param {'po'|'vo'} schooltype
 * @param {'onder'|'zij'} instroomtype
 * @returns {string}            - bijv. "jouw+ouder2.emma.po.onder@outlook.com"
 */
export function genereerEmailOuder2(basis, voornaamKind, schooltype, instroomtype) {
  const { user, domain } = splitEmail(basis);
  const naam = normaliseerNaam(voornaamKind);
  const tag = `ouder2.${naam}.${schooltype}.${instroomtype}`;
  return `${user}+${tag}@${domain}`;
}

/**
 * Genereert een los plus-adres voor een ouder zonder gekoppeld kind.
 *
 * @param {string} basis
 * @param {string} voornaamOuder
 * @returns {string}             - bijv. "jouw+ouder.jan@outlook.com"
 */
export function genereerEmailOuderLos(basis, voornaamOuder) {
  const { user, domain } = splitEmail(basis);
  const naam = normaliseerNaam(voornaamOuder);
  return `${user}+ouder.${naam}@${domain}`;
}
