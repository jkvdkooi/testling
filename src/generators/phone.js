// ============================================================
// Testling — telefoonnummer generator
// Format: 10 cijfers, begint altijd met 06, geen koppelteken
// ============================================================

/**
 * Genereert een synthetisch Nederlands mobiel telefoonnummer.
 * @returns {string} bijv. "0612345678"
 */
export function genereerTelefoon() {
  let nummer = '06';
  for (let i = 0; i < 8; i++) {
    nummer += Math.floor(Math.random() * 10);
  }
  return nummer;
}
