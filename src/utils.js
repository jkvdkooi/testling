// ============================================================
// Testling — utility helpers
// ============================================================

/** Willekeurig item uit een array */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Willekeurig geheel getal tussen min en max (inclusief) */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gewogen willekeurige keuze
 * @param {Array<{weight: number}>} items - items met weight-eigenschap
 */
export function randomWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}
