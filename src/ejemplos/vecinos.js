// Utilidades compartidas por los ejemplos de instancias: datos 2D, vecinos, CNN, ENN y un árbol CART.
import { semilla } from '../lib/stats.js';

export { semilla };

export function gauss(r) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

/** Dos clases entrelazadas (lunas) en [0,10]×[0,6] con ruido. */
export function lunas(n, ruido = 0.22, s = 3) {
  const r = semilla(s);
  return Array.from({ length: n }, (_, i) => {
    const c = i % 2;
    const t = Math.PI * r();
    const x = c === 0 ? Math.cos(t) : 1 - Math.cos(t);
    const y = c === 0 ? Math.sin(t) : 0.5 - Math.sin(t);
    return { x: (x + gauss(r) * ruido + 1.3) * 2.6, y: (y + gauss(r) * ruido + 0.9) * 2.3, c, i };
  });
}

export const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/** k vecinos de p dentro de conj (excluyendo a p). Devuelve los objetos. */
export function vecinos(conj, p, k) {
  return conj
    .filter((q) => q !== p)
    .map((q) => [d2(p, q), q])
    .sort((a, b) => a[0] - b[0])
    .slice(0, k)
    .map((x) => x[1]);
}

export function votar(vs) {
  const c = {};
  vs.forEach((v) => (c[v.c] = (c[v.c] || 0) + 1));
  let mejor = null;
  Object.entries(c).forEach(([k, n]) => {
    if (mejor === null || n > c[mejor]) mejor = k;
  });
  return Number(mejor);
}

/** Acierto de 1-NN sobre test usando el conjunto S. */
export function acierto1NN(S, test) {
  if (!S.length) return 0;
  return test.filter((p) => vecinos(S, p, 1)[0].c === p.c).length / test.length;
}

/** Acierto leave-one-out de 1-NN de todo TR usando S como referencia. */
export function aciertoLOO(S, TR) {
  if (S.length < 2) return 0;
  return TR.filter((p) => vecinos(S, p, 1)[0]?.c === p.c).length / TR.length;
}

export function barajar(lista, r) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** CNN rápido (sin fotogramas) para los ejemplos que solo necesitan el resultado. */
export function cnn(TR, r) {
  const orden = barajar(TR, r);
  const S = [];
  [0, 1].forEach((c) => {
    const p = orden.find((q) => q.c === c);
    if (p) S.push(p);
  });
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const p of orden) {
      if (S.includes(p)) continue;
      if (vecinos(S, p, 1)[0].c !== p.c) {
        S.push(p);
        cambio = true;
      }
    }
  }
  return S;
}

export function enn(TR, k = 3) {
  const malos = new Set(TR.filter((p) => votar(vecinos(TR, p, k)) !== p.c));
  return TR.filter((p) => !malos.has(p));
}

/** Árbol CART (Gini, cortes paralelos a los ejes). Devuelve las hojas como rectángulos. */
export function cart(P, caja = { x0: 0, x1: 10, y0: 0, y1: 6 }, prof = 0, maxProf = 9) {
  const pos = P.filter((p) => p.c === 1).length;
  const clase = pos * 2 >= P.length ? 1 : 0;
  if (prof >= maxProf || P.length < 2 || pos === 0 || pos === P.length) return [{ ...caja, c: clase, n: P.length }];
  const g = (S) => {
    if (!S.length) return 0;
    const q = S.filter((p) => p.c === 1).length / S.length;
    return 1 - q * q - (1 - q) * (1 - q);
  };
  let mejor = null;
  ['x', 'y'].forEach((eje) => {
    const vs = [...new Set(P.map((p) => p[eje]))].sort((a, b) => a - b);
    for (let i = 0; i < vs.length - 1; i++) {
      const t = (vs[i] + vs[i + 1]) / 2;
      const A = P.filter((p) => p[eje] <= t);
      const B = P.filter((p) => p[eje] > t);
      const v = (A.length * g(A) + B.length * g(B)) / P.length;
      if (!mejor || v < mejor.v) mejor = { eje, t, v, A, B };
    }
  });
  if (!mejor || mejor.v >= g(P) - 1e-9) return [{ ...caja, c: clase, n: P.length }];
  const c1 = { ...caja }, c2 = { ...caja };
  if (mejor.eje === 'x') { c1.x1 = mejor.t; c2.x0 = mejor.t; } else { c1.y1 = mejor.t; c2.y0 = mejor.t; }
  return [...cart(mejor.A, c1, prof + 1, maxProf), ...cart(mejor.B, c2, prof + 1, maxProf)];
}

export const predCart = (hojas, p) => {
  const h = hojas.find((q) => p.x >= q.x0 && p.x <= q.x1 && p.y >= q.y0 && p.y <= q.y1);
  return h ? h.c : 0;
};
