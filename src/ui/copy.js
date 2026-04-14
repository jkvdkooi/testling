// ============================================================
// Testling — clipboard helper
// navigator.clipboard met execCommand als fallback
// (voor iframe / Cowork-omgevingen zonder secure context)
// ============================================================

/**
 * Kopieert tekst naar het klembord en toont visuele feedback op de knop.
 * @param {string} tekst
 * @param {HTMLButtonElement} knop
 */
export async function kopieer(tekst, knop) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(tekst);
    } else {
      _fallback(tekst);
    }
    _feedback(knop, true);
  } catch {
    try {
      _fallback(tekst);
      _feedback(knop, true);
    } catch {
      _feedback(knop, false);
    }
  }
}

function _fallback(tekst) {
  const el = document.createElement('textarea');
  el.value = tekst;
  el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function _feedback(knop, succes) {
  knop.textContent = succes ? '✓ ok' : '✗';
  knop.classList.toggle('gekopieerd', succes);
  knop.classList.toggle('fout', !succes);
  setTimeout(() => {
    knop.textContent = 'kopieer';
    knop.classList.remove('gekopieerd', 'fout');
  }, 1800);
}
