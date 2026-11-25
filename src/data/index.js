import { raiz, conceptos } from './conceptos.js';
import { preparacion } from './preparacion.js';
import { reglas } from './reglas.js';
import { otras } from './otras.js';
import { regresion } from './regresion.js';

import { VISUAL } from './visual.js';

export const NODOS = [raiz, ...preparacion, ...reglas, ...otras, ...regresion, ...conceptos];
NODOS.forEach((n) => {
  if (VISUAL[n.id]) n.visual = VISUAL[n.id];
});

export const POR_ID = Object.fromEntries(NODOS.map((n) => [n.id, n]));

/** hijos[id] = lista de ids en el orden en que se declararon */
export const HIJOS = {};
NODOS.forEach((n) => {
  if (n.padre) (HIJOS[n.padre] ||= []).push(n.id);
});
/** hijos "alias": nodos que también cuelgan de otra rama (kNN y MLP en regresión) */
export const ALIAS = {};
NODOS.forEach((n) => (n.alias || []).forEach((p) => (ALIAS[p] ||= []).push(n.id)));

export function ancestros(id) {
  const out = [];
  let n = POR_ID[id];
  while (n && n.padre) {
    n = POR_ID[n.padre];
    if (n) out.unshift(n);
  }
  return out;
}

export const SALIDAS = {
  cat: { nombre: 'Categórica', largo: 'Salida categórica (clasificación)', clase: 's-cat' },
  num: { nombre: 'Numérica', largo: 'Salida numérica (regresión)', clase: 's-num' },
  ambas: { nombre: 'Ambas', largo: 'Clasificación y regresión', clase: 's-ambas' },
  prep: { nombre: 'Datos', largo: 'Devuelve datos preparados (preprocesado)', clase: 's-prep' },
  concepto: { nombre: 'Concepto', largo: 'Concepto compartido', clase: 's-concepto' },
};

export const PARTES = [
  { n: 1, romano: 'I', nombre: 'Preparación de datos', temas: 'Tema 3 (2.ª mitad) · Tema 4', raiz: 'preparacion', salida: 'prep' },
  { n: 2, romano: 'II', nombre: 'Clasificación basada en reglas', temas: 'Tema 6', raiz: 'reglas', salida: 'cat' },
  { n: 3, romano: 'III', nombre: 'Otras técnicas de clasificación', temas: 'Tema 7', raiz: 'multiclasificadores', salida: 'ambas' },
  { n: 4, romano: 'IV', nombre: 'Regresión', temas: 'Tema 8', raiz: 'regresion', salida: 'num' },
  { n: 5, romano: '·', nombre: 'Conceptos transversales', temas: 'Todos', raiz: 'conceptos', salida: 'concepto' },
];

/** Orden de lectura: recorrido en profundidad del árbol (preorden). */
export const ORDEN = [];
(function dfs(id) {
  ORDEN.push(id);
  (HIJOS[id] || []).forEach(dfs);
})('mineria');

export const parteDe = (n) => n.parte || (n.id === 'mineria' ? 0 : 5);

export const ORDEN_PARTE = (p) => ORDEN.filter((id) => parteDe(POR_ID[id]) === p);

/** Enlaces internos citados en los textos de un nodo: [[id]] o [[id|texto]] */
const RE_ENLACE = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
function textosDe(n) {
  const out = [n.resumen || ''];
  const f = n.ficha || {};
  out.push(f.funcionamiento || '', f.devuelve || '', ...(f.fuertes || []), ...(f.debiles || []));
  const visitar = (b) => {
    if (b == null) return;
    if (typeof b === 'string') return out.push(b);
    if (Array.isArray(b)) return b.forEach(visitar);
    if (typeof b === 'object') Object.values(b).forEach(visitar);
  };
  (n.secciones || []).forEach((s) => visitar(s.b));
  return out.join('\n');
}
export const MENCIONES = {}; // id -> Set de ids que lo mencionan
NODOS.forEach((n) => {
  const txt = textosDe(n);
  let m;
  RE_ENLACE.lastIndex = 0;
  while ((m = RE_ENLACE.exec(txt))) {
    const dest = m[1];
    if (dest !== n.id) (MENCIONES[dest] ||= new Set()).add(n.id);
  }
  (n.rel || []).forEach(([dest]) => (MENCIONES[dest] ||= new Set()).add(n.id));
});

/** Relaciones transversales para dibujar en el mapa (sin duplicar pares). */
export const RELACIONES = (() => {
  const vistos = new Set();
  const out = [];
  NODOS.forEach((n) =>
    (n.rel || []).forEach(([dest, motivo]) => {
      if (!POR_ID[dest]) return;
      const k = [n.id, dest].sort().join('|');
      if (vistos.has(k)) return;
      vistos.add(k);
      out.push({ a: n.id, b: dest, motivo });
    }),
  );
  return out;
})();

export const ALGORITMOS = NODOS.filter((n) => n.tipo === 'algoritmo');

/** Comprobación en desarrollo: enlaces rotos. */
export function enlacesRotos() {
  const rotos = [];
  NODOS.forEach((n) => {
    const txt = textosDe(n);
    let m;
    RE_ENLACE.lastIndex = 0;
    while ((m = RE_ENLACE.exec(txt))) if (!POR_ID[m[1]]) rotos.push(`${n.id} → ${m[1]}`);
    (n.rel || []).forEach(([d]) => !POR_ID[d] && rotos.push(`${n.id} (rel) → ${d}`));
    if (n.padre && !POR_ID[n.padre]) rotos.push(`${n.id} (padre) → ${n.padre}`);
  });
  return rotos;
}

export const nombreCorto = (n) => n.corto || n.nombre;
