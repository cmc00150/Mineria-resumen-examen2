// Pictogramas: sustituyen texto por un dibujo que se reconoce de un vistazo.
const T = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const nodo = (x, y, r = 2.6, lleno = false) => <circle cx={x} cy={y} r={r} fill={lleno ? 'currentColor' : 'var(--blanco, #fff)'} stroke="currentColor" strokeWidth="1.6" />;

export const PICTOS = {
  // ── tipo de salida ──
  cat: (
    <g {...T}><path d="M4 12V5h7l9 9-7 7-9-9z" /><circle cx="8" cy="9" r="1.4" fill="currentColor" /></g>
  ),
  num: (
    <g {...T}><path d="M3 17h18M5 17v-3M9 17v-5M13 17v-3M17 17v-5M21 17v-3" /><path d="M6 7l3-3v6M13 4h3l-3 4h3" strokeWidth="1.5" /></g>
  ),
  ambas: (
    <g {...T}><path d="M3 10V4h6l7 7-6 6-7-7z" /><path d="M12 20h9M14 20v-2M17 20v-3M20 20v-2" /></g>
  ),
  prep: (
    <g {...T}><path d="M3 4h18l-7 8v6l-4 2v-8z" /></g>
  ),
  concepto: (
    <g {...T}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" /></g>
  ),
  // ── entrada ──
  discreta: (
    <g {...T}><rect x="3" y="8" width="5" height="8" rx="1" /><rect x="9.5" y="8" width="5" height="8" rx="1" /><rect x="16" y="8" width="5" height="8" rx="1" /></g>
  ),
  continua: (
    <g {...T}><path d="M2 14c3-7 5-7 8 0s5 7 8 0 3-4 4-3" /></g>
  ),
  mixta: (
    <g {...T}><rect x="2.5" y="5" width="5" height="6" rx="1" /><rect x="9" y="5" width="5" height="6" rx="1" /><path d="M2 19c3-4 5-4 8 0s5 4 8 0 3-2 4-2" /></g>
  ),
  // ── interpretabilidad ──
  blanca: (
    <g {...T}><path d="M3 9l9-5 9 5-9 5z" /><path d="M3 9v8l9 5 9-5V9" /><path d="M12 14v8" /></g>
  ),
  negra: (
    <g><path d="M3 9l9-5 9 5-9 5z" fill="currentColor" /><path d="M3 9v8l9 5V14zM21 9v8l-9 5V14z" fill="currentColor" opacity=".75" /></g>
  ),
  gris: (
    <g {...T}><path d="M3 9l9-5 9 5-9 5z" /><path d="M3 9v8l9 5 9-5V9" /><path d="M12 14v8M3 9l9 5" /><path d="M12 14l9-5v8l-9 5z" fill="currentColor" opacity=".45" stroke="none" /></g>
  ),
  // ── qué devuelve ──
  arbol: (
    <g {...T}><path d="M12 6v4M12 10L6 15M12 10l6 5M6 15v3M18 15l-3 4M18 15l3 4" />{nodo(12, 5)}{nodo(6, 15)}{nodo(18, 15)}<rect x="4" y="18" width="4" height="3" rx="1" fill="currentColor" /><rect x="13" y="19" width="4" height="3" rx="1" fill="currentColor" /><rect x="19" y="19" width="4" height="3" rx="1" fill="currentColor" /></g>
  ),
  'arbol-podado': (
    <g {...T}><path d="M12 6v4M12 10L6 15M12 10l6 5" />{nodo(12, 5)}<rect x="4" y="14" width="4" height="3" rx="1" fill="currentColor" />{nodo(18, 15)}<path d="M15 19l6-2M15 17l6 2" stroke="var(--no, #b0413e)" /></g>
  ),
  'arbol-binario': (
    <g {...T}><path d="M12 6l-6 6M12 6l6 6M6 12l-3 6M6 12l3 6" />{nodo(12, 5)}{nodo(6, 12)}<rect x="16" y="11" width="4" height="3" rx="1" fill="currentColor" /><rect x="1" y="17" width="4" height="3" rx="1" fill="currentColor" /><rect x="7" y="17" width="4" height="3" rx="1" fill="currentColor" /></g>
  ),
  reglas: (
    <g {...T}><path d="M3 6h3M8 6h13M3 12h3M8 12h10M3 18h3M8 18h12" /><path d="M3 4.5v3M3 10.5v3M3 16.5v3" strokeWidth="1" /></g>
  ),
  lista: (
    <g {...T}><path d="M7 6h14M7 12h11M7 18h8" /><circle cx="3.5" cy="6" r="1" fill="currentColor" /><circle cx="3.5" cy="12" r="1" fill="currentColor" /><path d="M2.5 18h2" /></g>
  ),
  probs: (
    <g {...T}><path d="M3 21h18" /><rect x="4" y="8" width="4" height="13" fill="currentColor" opacity=".8" /><rect x="10" y="14" width="4" height="7" /><rect x="16" y="17" width="4" height="4" /></g>
  ),
  red: (
    <g {...T}><path d="M5 6l7 6-7 6M5 6l7 0M5 18l7-6M12 12l7-0M12 6l7 6" />{nodo(5, 6)}{nodo(5, 18)}{nodo(12, 6)}{nodo(12, 12)}{nodo(19, 12, 2.6, true)}</g>
  ),
  comite: (
    <g {...T}><circle cx="5" cy="7" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="7" r="2" /><path d="M2 13c1-2 5-2 6 0M9 11c1-2 5-2 6 0M16 13c1-2 5-2 6 0" /><path d="M8 20h8M12 15v5" /></g>
  ),
  datos: (
    <g {...T}><circle cx="5" cy="15" r="1.6" fill="currentColor" /><circle cx="9" cy="9" r="1.6" fill="currentColor" /><circle cx="15" cy="13" r="1.6" fill="currentColor" /><circle cx="19" cy="7" r="1.6" fill="currentColor" /><circle cx="7" cy="5" r="1.6" opacity=".25" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.6" opacity=".25" fill="currentColor" stroke="none" /><circle cx="19" cy="18" r="1.6" opacity=".25" fill="currentColor" stroke="none" /></g>
  ),
  intervalos: (
    <g {...T}><path d="M2 12h20M2 8v8M9 9v6M15 9v6M22 8v8" /><path d="M4 5h3M11 5h2M17 5h3" strokeWidth="1.4" /></g>
  ),
  numero: (
    <g {...T}><path d="M4 16l3-8M9 8h4l-3 8M15 8h5l-2 4c2 0 3 1 2 3s-4 1-5 0" /></g>
  ),
  ecuacion: (
    <g {...T}><path d="M3 19L21 5" /><circle cx="6" cy="14" r="1.3" fill="currentColor" /><circle cx="10" cy="13" r="1.3" fill="currentColor" /><circle cx="14" cy="8" r="1.3" fill="currentColor" /><circle cx="18" cy="9" r="1.3" fill="currentColor" /></g>
  ),
  regiones: (
    <g {...T}><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M10 3v18M10 12h11" /><rect x="10" y="3" width="11" height="9" fill="currentColor" opacity=".3" stroke="none" /></g>
  ),
};

export function Picto({ k, size = 24, title, style }) {
  const p = PICTOS[k];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} style={style}>
      {title && <title>{title}</title>}
      {p}
    </svg>
  );
}

export const NOMBRE_PICTO = {
  cat: 'Salida categórica',
  num: 'Salida numérica',
  ambas: 'Categórica y numérica',
  prep: 'Prepara los datos',
  concepto: 'Concepto',
  discreta: 'Entrada discreta',
  continua: 'Entrada continua',
  mixta: 'Discreta y continua',
  blanca: 'Caja blanca',
  negra: 'Caja negra',
  gris: 'Parcialmente interpretable',
  arbol: 'Un árbol',
  'arbol-podado': 'Un árbol podado',
  'arbol-binario': 'Un árbol binario',
  reglas: 'Un conjunto de reglas',
  lista: 'Una lista ordenada de reglas',
  probs: 'Una probabilidad por clase',
  red: 'Pesos de una red',
  comite: 'Un comité que vota',
  datos: 'Un subconjunto de los datos',
  intervalos: 'Puntos de corte',
  numero: 'Un número',
  ecuacion: 'Una ecuación',
  regiones: 'Regiones del espacio',
};
