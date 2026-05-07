// ============================================================
// Testling × Leerlinq — mapper
// Zet testling-data om naar Leerlinq formveld-keys (varNames)
// zodat de bookmarklet ze direct via document.getElementById()
// kan invullen.
// ============================================================

/**
 * Splitst "25A" in { nummer: "25", toevoeging: "A" }
 */
function splitHuisnummer(huisnummer) {
  const match = String(huisnummer).match(/^(\d+)([A-Za-z]*)$/);
  if (match) return { nummer: match[1], toevoeging: match[2] || '' };
  return { nummer: String(huisnummer), toevoeging: '' };
}

/**
 * Mapt testling relatie + geslacht naar Leerlinq relationToStudent waarde
 */
function mapRelatie(relatie, geslacht) {
  const m = geslacht === 'Man';
  switch (relatie) {
    case 'Ouder':     return m ? 'Vader'     : 'Moeder';
    case 'Verzorger': return m ? 'Verzorger' : 'Verzorgster';
    case 'Voogd':     return m ? 'Voogd'     : 'Voogdes';
    default:          return m ? 'Vader'     : 'Moeder';
  }
}

/**
 * Genereert initialen van de voornaam: "Jan" → "J."
 */
function initialen(voornaam) {
  return voornaam ? voornaam[0].toUpperCase() + '.' : '';
}

/**
 * Mapt een testling kind-object naar een flat object
 * met Leerlinq student-varNames als keys.
 *
 * @param {object} kind
 * @returns {object}
 */
export function mapKindNaarLeerlinq(kind) {
  const { nummer, toevoeging } = splitHuisnummer(kind.huisnummer);

  return {
    _stap:                   'leerling',
    firstName:               kind.voornaam,
    nickName:                kind.voornaam,
    prefix:                  kind.tussenvoegsel || '',
    lastName:                kind.achternaam,
    sex:                     kind.geslacht.toLowerCase(),
    birthDate:               kind.geboortedatum,
    bsn:                     kind.bsn,
    emailAddress:            kind.emailadres || '',
    street:                  kind.straat,
    houseNumber:             nummer,
    houseNumberAddition:     toevoeging,
    postalCode:              kind.postcode,
    city:                    kind.woonplaats,
    'mobileNumber.number':   kind.telefoon,
    'mobileNumber.isSecret': 'false',
  };
}

/**
 * Mapt één testling ouder naar Leerlinq parent-varNames met het
 * opgegeven prefix ('parentOne' of 'parentTwo').
 *
 * @param {object} ouder
 * @param {'parentOne'|'parentTwo'} pre
 * @returns {object}
 */
function mapOuderNaarParent(ouder, pre) {
  const { nummer, toevoeging } = splitHuisnummer(ouder.huisnummer);

  return {
    [`${pre}.nickName`]:              ouder.voornaam,
    [`${pre}.initials`]:              initialen(ouder.voornaam),
    [`${pre}.prefix`]:                ouder.tussenvoegsel || '',
    [`${pre}.lastName`]:              ouder.achternaam,
    [`${pre}.sex`]:                   ouder.geslacht.toLowerCase(),
    [`${pre}.relationToStudent`]:     mapRelatie(ouder.relatie, ouder.geslacht),
    [`${pre}.emailAddress`]:          ouder.emailadres || '',
    [`${pre}.street`]:                ouder.straat,
    [`${pre}.houseNumber`]:           nummer,
    [`${pre}.houseNumberAddition`]:   toevoeging,
    [`${pre}.postalCode`]:            ouder.postcode,
    [`${pre}.city`]:                  ouder.woonplaats,
    [`${pre}.mobileNumber.number`]:   ouder.telefoon,
    [`${pre}.mobileNumber.isSecret`]: 'false',
    [`${pre}.phoneNumber.number`]:    ouder.telefoon,
    [`${pre}.phoneNumber.isSecret`]:  'false',
    [`${pre}.sameAddressAsStudent`]:  'false',
    [`${pre}.hasParentalAuthority`]:  'true',
    [`${pre}.country`]:               'Nederland',
  };
}

/**
 * Mapt een volledig testling gezin naar een flat object
 * met Leerlinq CareTakers varNames als keys.
 *
 * @param {object} gezin  - { kind, ouder1, ouder2, gezinssituatie }
 * @returns {object}
 */
export function mapGezinNaarVerzorgers(gezin) {
  const result = { _stap: 'verzorger' };

  Object.assign(result, mapOuderNaarParent(gezin.ouder1, 'parentOne'));

  if (gezin.ouder2) {
    Object.assign(result, mapOuderNaarParent(gezin.ouder2, 'parentTwo'));
    result['secondCareTaker'] = 'true';
  } else {
    result['secondCareTaker'] = 'false';
  }

  // Betalingsinformatie — ouder 1 betaalt standaard
  result['paymentInformation.billableCaretaker'] = '1';
  result['paymentInformation.nameAccountHolder'] = gezin.ouder1.volleNaam;
  result['paymentInformation.iban']              = gezin.ouder1.iban;
  result['paymentInformation.sendToEmail']       = gezin.ouder1.emailadres || '';

  return result;
}
