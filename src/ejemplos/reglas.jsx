// Reglas paso a paso: listas de decisión (se recorren en orden) y reglas extraídas de un árbol (un camino = una regla).
import { useMemo, useState } from 'react';
import { Marco, ArbolSvg, COLORES } from './comun.jsx';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

// ═════════ Listas de decisión (crédito) ═════════
const LISTA = [
  { cond: [['gastos', 'altos'], ['ingresos', 'altos'], ['propietario', 'si']], c: 'SÍ' },
  { cond: [['gastos', 'bajos'], ['propietario', 'si']], c: 'SÍ' },
];
const OPC = { ingresos: ['bajos', 'medios', 'altos'], propietario: ['no', 'si'], gastos: ['altos', 'bajos'] };

function framesLista(x) {
  const fr = [{ e: '0', r: -1, msg: `Cliente: ingresos ${x.ingresos}, propietario ${x.propietario}, gastos ${x.gastos}.` }];
  for (let r = 0; r < LISTA.length; r++) {
    const checks = LISTA[r].cond.map(([a, v]) => x[a] === v);
    const ok = checks.every(Boolean);
    fr.push({ e: '1.0', r, checks, ok, msg: ok ? `Regla ${r + 1}: se cumplen todas sus condiciones → devuelve «${LISTA[r].c}» y se PARA (las reglas siguientes no se miran).` : `Regla ${r + 1}: ${checks.filter((c) => !c).length} condición(es) no se cumplen → se pasa a la siguiente regla.` });
    if (ok) return fr;
  }
  fr.push({ e: '2', r: LISTA.length, msg: 'Ninguna regla se cumple → clase por defecto: «NO».' });
  return fr;
}

export function PasoLista() {
  const [x, setX] = useState({ ingresos: 'medios', propietario: 'si', gastos: 'bajos' });
  const frames = useMemo(() => framesLista(x), [x]);
  const p = usePasos(frames, { intervalo: 1100 });
  const f = p.frame;
  const final = f.e === '2' ? 'NO' : f.ok ? LISTA[f.r].c : null;
  return (
    <Marco
      titulo="Lista de decisión: se recorre en orden y gana la primera regla que se cumple"
      controles={Object.entries(OPC).map(([a, vs]) => (
        <label key={a} className="fila-control" style={{ margin: 0 }}>{a} <select value={x[a]} onChange={(e) => setX({ ...x, [a]: e.target.value })}>{vs.map((v) => <option key={v}>{v}</option>)}</select></label>
      ))}
      pie="Cada regla depende de las anteriores: si llegas a la 2, es porque la 1 no se cumplió. A diferencia de un conjunto de reglas, aquí no hay solapamientos."
    >
      <Controles p={p} />
      <div className="lista-reglas">
        {LISTA.map((r, i) => {
          const visto = f.r > i || (f.r === i && f.e === '1.0');
          const act = f.r === i && f.e === '1.0';
          return (
            <div key={i} className={`regla-fila ${act ? 'act' : ''} ${visto && !act ? 'vista' : ''}`}>
              <b>R{i + 1}</b>
              <span>SI {r.cond.map(([a, v], k) => (
                <span key={k} className={`cond ${act ? (f.checks[k] ? 'ok' : 'mal') : ''}`}>{k ? ' ∧ ' : ''}{a} = {v}{act ? (f.checks[k] ? ' ✓' : ' ✗') : ''}</span>
              ))}</span>
              <span>→ <b>{r.c}</b></span>
            </div>
          );
        })}
        <div className={`regla-fila ${f.e === '2' ? 'act' : ''}`}><b>por defecto</b><span>en cualquier otro caso</span><span>→ <b>NO</b></span></div>
      </div>
      {final && <p className="resultado-lista">Clase devuelta: <b style={{ color: final === 'SÍ' ? COLORES.c : COLORES.b }}>{final}</b></p>}
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

// ═════════ Reglas desde un árbol ═════════
const ARBOL = {
  id: 'r', t: 'gastos',
  hijos: [
    { a: 'altos', n: { id: 'r.0', t: 'ingresos', hijos: [
      { a: 'bajos', n: { id: 'r.0.0', t: 'NO', hoja: true, color: COLORES.b } },
      { a: 'medios', n: { id: 'r.0.1', t: 'NO', hoja: true, color: COLORES.b } },
      { a: 'altos', n: { id: 'r.0.2', t: 'propietario', hijos: [
        { a: 'no', n: { id: 'r.0.2.0', t: 'NO', hoja: true, color: COLORES.b } },
        { a: 'sí', n: { id: 'r.0.2.1', t: 'SÍ', hoja: true, color: COLORES.c } },
      ] } },
    ] } },
    { a: 'bajos', n: { id: 'r.1', t: 'propietario', hijos: [
      { a: 'no', n: { id: 'r.1.0', t: 'NO', hoja: true, color: COLORES.b } },
      { a: 'sí', n: { id: 'r.1.1', t: 'SÍ', hoja: true, color: COLORES.c } },
    ] } },
  ],
};
function caminos(n, previas = [], ids = ['r'], out = []) {
  if (n.hoja) {
    out.push({ conds: previas, clase: n.t, ids });
    return out;
  }
  n.hijos.forEach((h) => caminos(h.n, [...previas, `${n.t} = ${h.a}`], [...ids, h.n.id], out));
  return out;
}

export function PasoReglasArbol() {
  const cs = useMemo(() => caminos(ARBOL), []);
  const frames = useMemo(() => [
    { e: '0', k: -1, msg: 'Árbol de decisión del crédito: 6 hojas.' },
    ...cs.map((c, k) => ({ e: '1.0', k, msg: `Camino ${k + 1}: ${c.conds.join(' → ')} → hoja ${c.clase}. Las pruebas del camino se unen con ∧.` })),
    { e: '2', k: cs.length, msg: `Sistema basado en reglas: ${cs.length} reglas, una por hoja.` },
  ], [cs]);
  const p = usePasos(frames, { intervalo: 1000 });
  const f = p.frame;
  const camino = f.k >= 0 && f.k < cs.length ? cs[f.k].ids : [];
  return (
    <Marco titulo="Cada camino raíz → hoja se convierte en una regla" pie="Más legible que un árbol grande, pero hay una regla por hoja y las premisas se repiten.">
      <Controles p={p} />
      <div className="arbol-paso">
        <div className="arbol-izq"><ArbolSvg raiz={ARBOL} camino={camino} ancho={0} sepX={86} sepY={64} animar={false} /></div>
        <ol className="reglas-salida">
          {cs.slice(0, Math.max(0, f.k + 1)).map((c, i) => (
            <li key={i} className={i === f.k ? 'nueva' : ''}>SI {c.conds.map((x) => x.replace(' = ', ' = ')).join(' ∧ ')} ENTONCES <b>{c.clase}</b></li>
          ))}
        </ol>
      </div>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}
