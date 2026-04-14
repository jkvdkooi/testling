// ============================================================
// Testling — BSN generator
// ELF-proef: 9×d1 + 8×d2 + ... + 2×d8 − 1×d9 ≡ 0 (mod 11)
// ============================================================

/**
 * Genereert een synthetisch BSN dat de ELF-proef doorstaat.
 * Het gegenereerde BSN is wiskundig geldig maar NOOIT gekoppeld
 * aan een echte persoon in de BRP.
 * @returns {string} 9-cijferig BSN
 */
export function genereerBSN() {
  const gewichten = [9, 8, 7, 6, 5, 4, 3, 2];

  while (true) {
    const cijfers = [];

    // Eerste cijfer: 1–9 (BSN begint nooit met 0)
    cijfers.push(Math.floor(Math.random() * 9) + 1);

    // Cijfers 2 t/m 8: 0–9
    for (let i = 1; i <= 7; i++) {
      cijfers.push(Math.floor(Math.random() * 10));
    }

    // Bereken de gewogen som van de eerste 8 cijfers
    let som = 0;
    for (let i = 0; i < 8; i++) {
      som += gewichten[i] * cijfers[i];
    }

    // Het 9e cijfer telt negatief mee:
    // som − d9 ≡ 0 (mod 11)  →  d9 ≡ som (mod 11)
    const d9 = som % 11;

    // d9 moet een enkelvoudig cijfer zijn (0–9); bij 10 opnieuw proberen
    if (d9 <= 9) {
      cijfers.push(d9);
      return cijfers.join('');
    }
  }
}

/**
 * Valideert of een gegeven BSN de ELF-proef doorstaat.
 * @param {string} bsn
 * @returns {boolean}
 */
export function valideerBSN(bsn) {
  if (!/^\d{9}$/.test(bsn)) return false;
  const gewichten = [9, 8, 7, 6, 5, 4, 3, 2, -1];
  const som = bsn
    .split('')
    .reduce((acc, cijfer, i) => acc + gewichten[i] * parseInt(cijfer), 0);
  return som % 11 === 0;
}
