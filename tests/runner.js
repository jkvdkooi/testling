// ============================================================
// Testling — lichtgewicht browser-native test runner
// Geen dependencies, werkt met ES-modules via <script type="module">
// ============================================================

let totaal = 0;
let geslaagd = 0;
const resultaten = [];
let huidigeSuite = '';

export function suite(naam) {
  huidigeSuite = naam;
}

export function test(beschrijving, fn) {
  totaal++;
  try {
    fn();
    geslaagd++;
    resultaten.push({ ok: true, suite: huidigeSuite, beschrijving });
  } catch (e) {
    resultaten.push({ ok: false, suite: huidigeSuite, beschrijving, fout: e.message });
  }
}

export function verwacht(waarde) {
  return {
    toBe(verwacht) {
      if (waarde !== verwacht)
        throw new Error(`Verwacht ${JSON.stringify(verwacht)}, kreeg ${JSON.stringify(waarde)}`);
    },
    toBeTrue() {
      if (waarde !== true)
        throw new Error(`Verwacht true, kreeg ${JSON.stringify(waarde)}`);
    },
    toBeFalse() {
      if (waarde !== false)
        throw new Error(`Verwacht false, kreeg ${JSON.stringify(waarde)}`);
    },
    toMatch(regex) {
      if (!regex.test(String(waarde)))
        throw new Error(`"${waarde}" voldoet niet aan patroon ${regex}`);
    },
    toBeGreaterThanOrEqual(n) {
      if (waarde < n)
        throw new Error(`Verwacht ≥ ${n}, kreeg ${waarde}`);
    },
    toBeLessThanOrEqual(n) {
      if (waarde > n)
        throw new Error(`Verwacht ≤ ${n}, kreeg ${waarde}`);
    },
  };
}

export function toonRapport() {
  const container = document.getElementById('resultaten');
  const samenvatting = document.getElementById('samenvatting');
  const allesOk = geslaagd === totaal;

  samenvatting.className = allesOk ? 'ok' : 'fout';
  samenvatting.textContent = allesOk
    ? `✓  Alle ${totaal} tests geslaagd`
    : `✗  ${geslaagd} van ${totaal} geslaagd — ${totaal - geslaagd} gefaald`;

  let huidigeSuiteLabel = '';
  for (const r of resultaten) {
    if (r.suite !== huidigeSuiteLabel) {
      huidigeSuiteLabel = r.suite;
      const h = document.createElement('h3');
      h.textContent = r.suite;
      container.appendChild(h);
    }
    const li = document.createElement('div');
    li.className = `test-rij ${r.ok ? 'ok' : 'fout'}`;
    li.innerHTML = `<span class="icoon">${r.ok ? '✓' : '✗'}</span>
      <span class="naam">${r.beschrijving}</span>
      ${r.fout ? `<span class="foutmelding">${r.fout}</span>` : ''}`;
    container.appendChild(li);
  }
}
