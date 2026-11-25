// Cálculos que usan los ejemplos interactivos. Todo en funciones puras
// para que los números de la web salgan siempre del cálculo, no escritos a mano.

export const log = (x, base = 2) => Math.log(x) / Math.log(base);

/** Entropía de una lista de recuentos por clase. */
export function entropia(cuentas, base = 2) {
  const n = cuentas.reduce((a, b) => a + b, 0);
  if (n === 0) return 0;
  return cuentas.reduce((h, c) => (c === 0 ? h : h - (c / n) * log(c / n, base)), 0);
}

export function gini(cuentas) {
  const n = cuentas.reduce((a, b) => a + b, 0);
  if (n === 0) return 0;
  return 1 - cuentas.reduce((s, c) => s + (c / n) ** 2, 0);
}

/** Cuenta cuántas filas hay de cada clase. */
export function contarClases(filas, clase, clases) {
  return clases.map((c) => filas.filter((f) => f[clase] === c).length);
}

/** Particiona filas por el valor de un atributo. */
export function particionar(filas, attr) {
  const m = new Map();
  filas.forEach((f) => {
    if (!m.has(f[attr])) m.set(f[attr], []);
    m.get(f[attr]).push(f);
  });
  return m;
}

/** Ganancia de información, información de la división, ratio y gini de un atributo. */
export function evaluarAtributo(filas, attr, clase, clases, base = 2) {
  const n = filas.length;
  const hS = entropia(contarClases(filas, clase, clases), base);
  const parts = [...particionar(filas, attr).entries()].map(([valor, sub]) => {
    const cuentas = contarClases(sub, clase, clases);
    return { valor, n: sub.length, cuentas, h: entropia(cuentas, base), g: gini(cuentas) };
  });
  const eA = parts.reduce((s, p) => s + (p.n / n) * p.h, 0);
  const splitInfo = entropia(parts.map((p) => p.n), base);
  const giniSplit = parts.reduce((s, p) => s + (p.n / n) * p.g, 0);
  const gain = hS - eA;
  return {
    attr,
    hS,
    parts,
    eA,
    gain,
    splitInfo,
    ratio: splitInfo === 0 ? 0 : gain / splitInfo,
    giniSplit,
  };
}

/** ID3 recursivo. Devuelve un árbol {attr, hijos:[{valor, nodo}]} o {hoja, cuentas}. */
export function id3(filas, attrs, clase, clases, criterio = 'gain', profundidad = 0) {
  const cuentas = contarClases(filas, clase, clases);
  const mayoritaria = clases[cuentas.indexOf(Math.max(...cuentas))];
  if (cuentas.filter((c) => c > 0).length <= 1 || attrs.length === 0) {
    return { hoja: mayoritaria, cuentas, n: filas.length };
  }
  const evals = attrs.map((a) => evaluarAtributo(filas, a, clase, clases));
  const clave = criterio === 'gini' ? (e) => -e.giniSplit : criterio === 'ratio' ? (e) => e.ratio : (e) => e.gain;
  const mejor = evals.reduce((a, b) => (clave(b) > clave(a) + 1e-12 ? b : a));
  const resto = attrs.filter((a) => a !== mejor.attr);
  const hijos = [...particionar(filas, mejor.attr).entries()].map(([valor, sub]) => ({
    valor,
    nodo: id3(sub, resto, clase, clases, criterio, profundidad + 1),
  }));
  return { attr: mejor.attr, evals, cuentas, n: filas.length, hijos };
}

export const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export const desv = (xs, muestral = true) => {
  const m = media(xs);
  const d = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - (muestral ? 1 : 0));
  return Math.sqrt(d);
};
export const normal = (x, mu, sigma) =>
  (1 / (Math.sqrt(2 * Math.PI) * sigma)) * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));

/** Mínimos cuadrados para y = a + b·x */
export function minimosCuadrados(pts) {
  const mx = media(pts.map((p) => p.x));
  const my = media(pts.map((p) => p.y));
  const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const b = den === 0 ? 0 : num / den;
  return { a: my - b * mx, b, mx, my };
}

/** Métricas de error del Tema 8. */
export function metricas(reales, pred) {
  const n = reales.length;
  const mr = media(reales);
  const mp = media(pred);
  const ecm = reales.reduce((s, v, i) => s + (v - pred[i]) ** 2, 0) / n;
  const ema = reales.reduce((s, v, i) => s + Math.abs(v - pred[i]), 0) / n;
  const ear =
    reales.reduce((s, v, i) => s + Math.abs(v - pred[i]), 0) /
    reales.reduce((s, v) => s + Math.abs(v - mr), 0);
  const sv = desv(reales);
  const sp = desv(pred);
  const cov = reales.reduce((s, v, i) => s + (v - mr) * (pred[i] - mp), 0) / (n - 1);
  return { ecm, ecme: Math.sqrt(ecm), ema, ear, r: sv && sp ? cov / (sv * sp) : 0 };
}

/** Generador pseudoaleatorio con semilla (para que los ejemplos sean reproducibles). */
export function semilla(s = 7) {
  let x = s >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

export const redondear = (x, d = 3) => {
  if (!isFinite(x)) return '—';
  const r = Number(x.toFixed(d));
  return r.toLocaleString('es-ES', { maximumFractionDigits: d });
};
