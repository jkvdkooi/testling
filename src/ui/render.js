// ============================================================
// Testling — kaart renderer
// Bouwt HTML voor kind-, ouder- en gezin-kaarten
// ============================================================

// Avatar-kleurenpalet — bepaald op basis van initialen (hash)
const AVATAR_KLEUREN = [
  '#5b7cf6', '#e05b9a', '#e07c5b', '#3ecf8e',
  '#9a5be0', '#5bb8e0', '#e0c05b', '#cf5b3e',
];

function avatarKleur(voornaam, achternaam) {
  const code = (voornaam.charCodeAt(0) || 0) + (achternaam.charCodeAt(0) || 0);
  return AVATAR_KLEUREN[code % AVATAR_KLEUREN.length];
}

function initialen(voornaam, achternaam) {
  return ((voornaam[0] || '') + (achternaam[0] || '')).toUpperCase();
}

// ── Bouwblokken ───────────────────────────────────────────────

function veld(label, waarde, volBreedte = false, extraKlasse = '') {
  const w = (waarde !== null && waarde !== undefined && waarde !== '')
    ? String(waarde)
    : '—';
  const escaped = w.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const klassen = ['veld', volBreedte && 'veld--vol', extraKlasse].filter(Boolean).join(' ');
  return `
    <div class="${klassen}">
      <span class="veld-label">${label}</span>
      <div class="veld-rij">
        <span class="veld-waarde">${w}</span>
        <button class="kopieer-btn" data-waarde="${escaped}" aria-label="Kopieer ${label}">kopieer</button>
      </div>
    </div>`;
}

function sectie(titel, velden, gridKlasse = '') {
  return `
    <div class="kaart-sectie">
      <span class="sectie-titel">${titel}</span>
      <div class="veld-grid${gridKlasse ? ' ' + gridKlasse : ''}">${velden}</div>
    </div>`;
}

function kaartHeader(type, naam, badges) {
  const kleur = avatarKleur(naam.voornaam, naam.achternaam);
  const init  = initialen(naam.voornaam, naam.achternaam);
  const badgeHTML = badges.map(b =>
    `<span class="badge badge--${b.stijl}">${b.tekst}</span>`
  ).join('');

  return `
    <div class="kaart-header">
      <div class="avatar" style="background:${kleur}" aria-hidden="true">${init}</div>
      <div class="kaart-header-info">
        <span class="kaart-type">${type}</span>
        <span class="kaart-naam">${naam.volleNaam}</span>
        <div class="kaart-badges">${badgeHTML}</div>
      </div>
    </div>`;
}

// ── Kaart-renderers ───────────────────────────────────────────

export function renderKind(kind) {
  const header = kaartHeader('Kind', kind, [
    { tekst: kind.schooltype,   stijl: 'school' },
    { tekst: kind.instroomtype === 'onder' ? 'onderinstroom' : 'zij-instroom', stijl: 'instroom' },
  ]);

  const persoonsgegevens = sectie('PERSOONSGEGEVENS',
    veld('Voornaam',    kind.voornaam) +
    veld('Achternaam',  kind.achternaam) +
    veld('Tussenvoegsel', kind.tussenvoegsel || '—') +
    veld('Geslacht',    kind.geslacht) +
    veld('Geboortedatum', kind.geboortedatum) +
    veld('Leeftijd',    kind.leeftijd ? `${kind.leeftijd} jaar` : '—')
  );

  const bsnContact = sectie('BSN & CONTACT',
    veld('BSN (ELF-proef ✓)', kind.bsn) +
    veld('Telefoon (10 cijfers)', kind.telefoon) +
    (kind.emailadres ? veld('E-mailadres', kind.emailadres, true) : '')
  );

  const adres = sectie('ADRES',
    veld('Straat',          kind.straat) +
    veld('Huisnummer',      kind.huisnummer) +
    veld('Postcode (PC6)',  kind.postcode) +
    veld('Woonplaats',      kind.woonplaats) +
    veld('Provincie',       kind.provincie)
  );

  let aanmelding = '';
  if (kind.schooltype === 'PO') {
    aanmelding = sectie('AANMELDING',
      veld('Groep', `Groep ${kind.groep}`)
    );
  } else {
    aanmelding = sectie('AANMELDING',
      veld('Klas',   `${kind.klas}e klas`) +
      veld('Niveau', kind.niveau)
    );
  }

  return `<div class="kaart">
    ${header}${persoonsgegevens}${bsnContact}${adres}${aanmelding}
  </div>`;
}

export function renderOuder(ouder, label = 'Ouder / verzorger') {
  const header = kaartHeader(label, ouder, [
    { tekst: ouder.relatie, stijl: 'relatie' },
  ]);

  const persoonsgegevens = sectie('PERSOONSGEGEVENS',
    veld('Voornaam',    ouder.voornaam) +
    veld('Achternaam',  ouder.achternaam) +
    veld('Tussenvoegsel', ouder.tussenvoegsel || '—') +
    veld('Geslacht',    ouder.geslacht) +
    veld('Geboortedatum', ouder.geboortedatum)
  );

  const bsnContact = sectie('BSN & CONTACT',
    veld('BSN (ELF-proef ✓)',    ouder.bsn) +
    veld('Telefoon (10 cijfers)', ouder.telefoon) +
    veld('IBAN (ELF-proef ✓)',   ouder.iban, false, 'veld--mono') +
    veld('Bank',                  ouder.bankNaam) +
    (ouder.emailadres ? veld('E-mailadres', ouder.emailadres, true) : ''),
    'veld-grid--2col'
  );

  const adres = sectie('ADRES',
    veld('Straat',         ouder.straat) +
    veld('Huisnummer',     ouder.huisnummer) +
    veld('Postcode (PC6)', ouder.postcode) +
    veld('Woonplaats',     ouder.woonplaats) +
    veld('Provincie',      ouder.provincie)
  );

  return `<div class="kaart">
    ${header}${persoonsgegevens}${bsnContact}${adres}
  </div>`;
}

function renderGezinssituatie(gs, heeftOuder2) {
  const woonsituatie = heeftOuder2 && !gs.samenwonend
    ? veld('Woonsituatie', 'Ouders wonen apart (eigen adres ouder 2)')
    : '';
  return `<div class="kaart">${sectie('GEZINSSITUATIE',
    veld('Burgerlijke staat', gs.burgerlijkeStaat) +
    veld('Ouderlijk gezag',   gs.ouderlijkGezag) +
    woonsituatie
  )}</div>`;
}

export function renderGezin(gezin) {
  const kaarten = [];
  if (gezin.gezinssituatie) kaarten.push(renderGezinssituatie(gezin.gezinssituatie, !!gezin.ouder2));
  kaarten.push(renderKind(gezin.kind));
  if (gezin.ouder1) kaarten.push(renderOuder(gezin.ouder1, 'Ouder / verzorger 1'));
  if (gezin.ouder2) kaarten.push(renderOuder(gezin.ouder2, 'Ouder / verzorger 2'));
  return kaarten.join('');
}
