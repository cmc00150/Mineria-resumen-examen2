// Criterios de división explicados con números: el mismo nodo (14 días de tenis) y el mismo atributo, calculado
// paso a paso con ganancia, ratio de ganancia, Gini y SDR. Más un medidor intuitivo de «desorden» de un nodo.
import { useMemo, useState } from 'react';
import { Marco, COLORES } from './comun.jsx';
import { TENIS, HORAS } from './datos.js';
import { entropia, gini, particionar, redondear, media } from '../lib/stats.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

const dec = (x, n = 3) => String(redondear(x, n)).replace('.', ',');
const FILAS = TENIS.map((f, i) => ({ ...f, horas: HORAS[i] }));
const ATTRS = ['outlook', 'temperature', 'humidity', 'windy'];
const sd = (xs) => Math.sqrt(xs.reduce((s, x) => s + (x - media(xs)) ** 2, 0) / xs.length);
const cuenta = (fs) => [fs.filter((f) => f.play === 'yes').length, fs.filter((f) => f.play === 'no').length];

const CRIT = {
  gain: { n: 'Ganancia', usa: 'ID3', mejor: 'mayor' },
  ratio: { n: 'Ratio de ganancia', usa: 'C4.5', mejor: 'mayor' },
  gini: { n: 'Gini', usa: 'CART', mejor: 'menor' },
  sdr: { n: 'SDR', usa: 'árboles de regresión', mejor: 'mayor' },
};

// cálculo completo de un atributo
function calcular(a) {
  const ramas = [...particionar(FILAS, a).entries()].map(([v, fs]) => ({ v, fs, c: cuenta(fs), n: fs.length }));
  const N = FILAS.length;
  const c0 = cuenta(FILAS);
  const hS = entropia(c0, 2);
  ramas.forEach((r) => {
    r.h = entropia(r.c, 2);
    r.g = gini(r.c);
    r.m = media(r.fs.map((f) => f.horas));
    r.sd = sd(r.fs.map((f) => f.horas));
  });
  const eA = ramas.reduce((s, r) => s + (r.n / N) * r.h, 0);
  const gain = hS - eA;
  const info = entropia(ramas.map((r) => r.n), 2);
  const g0 = gini(c0);
  const gs = ramas.reduce((s, r) => s + (r.n / N) * r.g, 0);
  const ys = FILAS.map((f) => f.horas);
  const sd0 = sd(ys);
  const sdA = ramas.reduce((s, r) => s + (r.n / N) * r.sd, 0);
  return { a, ramas, N, c0, hS, eA, gain, info, ratio: gain / info, g0, gs, m0: media(ys), sd0, sdA, sdr: sd0 - sdA };
}
const TODOS = Object.fromEntries(ATTRS.map((a) => [a, calcular(a)]));
const valor = (k, c) => (k === 'gain' ? c.gain : k === 'ratio' ? c.ratio : k === 'gini' ? c.gs : c.sdr);

// texto de una entropía / gini con los números sustituidos
const termH = (k, n) => (k === 0 ? null : `(${k}/${n})·log₂(${k}/${n})`);
const txtH = (c, n) => {
  const t = c.map((k) => termH(k, n)).filter(Boolean);
  return t.length === 1 ? `−${t[0]}` : `−${t.join(' − ')}`;
};
const txtG = (c, n) => `1 − ${c.map((k) => `(${k}/${n})²`).join(' − ')}`;

function frames(k, a) {
  const C = TODOS[a];
  const { ramas, N } = C;
  const fr = [];
  const L = [];
  const push = (e, msg, vista) => fr.push({ e, msg, lineas: [...L], vista });
  const pond = (vals) => ramas.map((r, i) => `${r.n}/${N}·${dec(vals[i])}`).join(' + ');
  const nombre = (r) => `${r.v}`;

  if (k === 'sdr') {
    push('0', `Nodo con los 14 días. Ahora el objetivo es un número: las horas jugadas (bolas).`, { nodo: true });
    L.push(`media = (${FILAS.slice(0, 3).map((f) => f.horas).join(' + ')} + … + ${FILAS[13].horas}) / 14 = ${dec(C.m0, 1)}`);
    L.push(`sd(S) = √( Σ (x − ${dec(C.m0, 1)})² / 14 ) = ${dec(C.sd0, 2)}`);
    push('0', `Desorden antes de dividir: la desviación típica de las horas, ${dec(C.sd0, 2)}. Cuanto más se parecen los números, menor.`, { nodo: true, vNodo: true });
    push('1.0', `Se reparten los días según «${a}».`, { nodo: true, vNodo: true, ramas: true });
    ramas.forEach((r, i) => {
      L.push(`sd(${nombre(r)}) → media ${dec(r.m, 1)}, sd = ${dec(r.sd, 2)}`);
      push('1.1', `Rama ${nombre(r)}: ${r.n} días con media ${dec(r.m, 1)} h y desviación ${dec(r.sd, 2)}.`, { nodo: true, vNodo: true, ramas: true, vRamas: i + 1 });
    });
    L.push(`desorden después = ${pond(ramas.map((r) => r.sd))} = ${dec(C.sdA, 2)}`);
    push('1.1', 'Desorden medio después: cada rama pesa según cuántos días tiene.', { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length });
    L.push(`SDR(${a}) = ${dec(C.sd0, 2)} − ${dec(C.sdA, 2)} = ${dec(C.sdr, 2)}`);
    push('1.1', `SDR = desorden antes − desorden después = ${dec(C.sdr, 2)}.`, { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length });
  } else if (k === 'gini') {
    push('0', `Nodo con los 14 días: ${C.c0[0]} sí y ${C.c0[1]} no.`, { nodo: true });
    L.push(`gini(S) = ${txtG(C.c0, N)} = ${dec(C.g0)}`);
    push('0', `Desorden antes: gini(S) = ${dec(C.g0)}. Es la probabilidad de equivocarse si etiquetas al azar con las proporciones del nodo (0 = puro, 0,5 = mitad y mitad).`, { nodo: true, vNodo: true });
    push('1.0', `Se reparten los días según «${a}».`, { nodo: true, vNodo: true, ramas: true });
    ramas.forEach((r, i) => {
      L.push(`gini(${nombre(r)}) = ${txtG(r.c, r.n)} = ${dec(r.g)}`);
      push('1.1', `Rama ${nombre(r)}: ${r.c[0]} sí / ${r.c[1]} no → gini ${dec(r.g)}${r.g === 0 ? ' (pura)' : ''}.`, { nodo: true, vNodo: true, ramas: true, vRamas: i + 1 });
    });
    L.push(`gini_split(${a}) = ${pond(ramas.map((r) => r.g))} = ${dec(C.gs)}`);
    push('1.1', `gini_split = media ponderada de las ramas = ${dec(C.gs)}. Cuanto más bajo, más puras quedan.`, { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length });
  } else {
    push('0', `Nodo con los 14 días: ${C.c0[0]} sí y ${C.c0[1]} no.`, { nodo: true });
    L.push(`H(S) = ${txtH(C.c0, N)} = ${dec(C.hS)}`);
    push('0', `Desorden antes: la entropía H(S) = ${dec(C.hS)} bits (0 = todo de una clase, 1 = mitad y mitad).`, { nodo: true, vNodo: true });
    push('1.0', `Se reparten los días según «${a}».`, { nodo: true, vNodo: true, ramas: true });
    ramas.forEach((r, i) => {
      L.push(`H(${nombre(r)}) = ${txtH(r.c, r.n)} = ${dec(r.h)}`);
      push('1.1', `Rama ${nombre(r)}: ${r.c[0]} sí / ${r.c[1]} no → H = ${dec(r.h)}${r.h === 0 ? ' (pura: no hay desorden)' : ''}.`, { nodo: true, vNodo: true, ramas: true, vRamas: i + 1 });
    });
    L.push(`E(${a}) = ${pond(ramas.map((r) => r.h))} = ${dec(C.eA)}`);
    push('1.1', `Desorden medio después: cada rama pesa según cuántos días tiene → E(${a}) = ${dec(C.eA)}.`, { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length });
    L.push(`G(${a}) = H(S) − E(${a}) = ${dec(C.hS)} − ${dec(C.eA)} = ${dec(C.gain)}`);
    push('1.1', `Ganancia = desorden antes − desorden después = ${dec(C.gain)} bits.`, { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length });
    if (k === 'ratio') {
      L.push(`info. división = ${txtH(ramas.map((r) => r.n), N)} = ${dec(C.info)}`);
      push('1.1', `Información de la división: la entropía de los TAMAÑOS de las ramas (las clases no importan, por eso las bolas se ven grises). Crece con el nº de ramas: ${dec(C.info)}.`, { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length, gris: true });
      L.push(`ratio(${a}) = ${dec(C.gain)} / ${dec(C.info)} = ${dec(C.ratio)}`);
      push('1.1', `Ratio = ganancia / información de la división = ${dec(C.ratio)}. Un atributo con muchas ramas pequeñas queda penalizado.`, { nodo: true, vNodo: true, ramas: true, vRamas: ramas.length });
    }
  }
  const orden = [...ATTRS].sort((x, y) => (CRIT[k].mejor === 'mayor' ? valor(k, TODOS[y]) - valor(k, TODOS[x]) : valor(k, TODOS[x]) - valor(k, TODOS[y])));
  push('2', `Lo mismo con los demás atributos. Se elige el ${CRIT[k].mejor}: «${orden[0]}».${k === 'gini' ? ' (CART además solo admite dos ramas: probaría {overcast} frente a {sunny, rain}, etc.)' : ''}`, { comparar: true, gana: orden[0] });
  push('3', `El nodo se divide por «${orden[0]}» y se repite lo mismo en cada rama.`, { comparar: true, gana: orden[0] });
  return fr;
}

// ───────── dibujo del nodo y sus ramas ─────────
function Bolas({ fs, x, y, por = 7, gris, horas }) {
  return fs.map((f, i) => {
    const cx = x + (i % por) * 22, cy = y + Math.floor(i / por) * 22;
    const c = gris ? '#a9b5ab' : horas ? COLORES.d : f.play === 'yes' ? COLORES.c : COLORES.b;
    return (
      <g key={i}>
        <circle cx={cx} cy={cy} r={9.5} fill={c} />
        {horas && <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="var(--f-titulo)">{f.horas}</text>}
      </g>
    );
  });
}

function Nodo({ k, C, v }) {
  const W = 680;
  const horas = k === 'sdr';
  const nodoV = k === 'sdr' ? `sd = ${dec(C.sd0, 2)}` : k === 'gini' ? `gini = ${dec(C.g0)}` : `H = ${dec(C.hS)}`;
  const ramaV = (r) => (k === 'sdr' ? `sd = ${dec(r.sd, 2)}` : k === 'gini' ? `gini = ${dec(r.g)}` : `H = ${dec(r.h)}`);
  const nr = C.ramas.length;
  const bw = 170, gap = (W - nr * bw) / (nr + 1);
  const x0 = (W - 7 * 22) / 2;
  return (
    <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="Nodo y ramas" style={{ width: '100%', maxWidth: 720 }}>
      <rect x={x0 - 18} y={8} width={7 * 22 + 14} height={58} rx="8" fill="#fbfcfa" stroke="#4a5a51" strokeWidth="1.5" />
      <Bolas fs={FILAS} x={x0} y={26} horas={horas} gris={v.gris} />
      <text x={x0 - 28} y={34} textAnchor="end" fontSize="12.5" fontFamily="var(--f-titulo)" fill="#4a5a51">antes</text>
      {v.vNodo && <text x={x0 + 7 * 22 + 6} y={42} fontSize="15" fontWeight="700" fontFamily="var(--f-titulo)" fill={COLORES.a}>{nodoV}</text>}
      {v.ramas && C.ramas.map((r, i) => {
        const bx = gap + i * (bw + gap);
        const por = Math.min(6, r.n);
        const filas = Math.ceil(r.n / por);
        const visto = v.vRamas >= i + 1;
        const act = v.vRamas === i + 1;
        return (
          <g key={r.v}>
            <path d={`M${W / 2},66 C${W / 2},100 ${bx + bw / 2},96 ${bx + bw / 2},126`} fill="none" stroke="#8a968e" strokeWidth="1.5" />
            <text x={bx + bw / 2} y={112} textAnchor="middle" fontSize="13" fontFamily="var(--f-titulo)" fill="#1f2b25" fontWeight="700" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 }}>{r.v} ({r.n})</text>
            <rect x={bx} y={126} width={bw} height={filas * 22 + 16} rx="8" fill="#fbfcfa" stroke={act ? COLORES.a : '#a9b5ab'} strokeWidth={act ? 3 : 1.3} />
            <Bolas fs={r.fs} x={bx + (bw - (por - 1) * 22) / 2} y={144} por={por} horas={horas} gris={v.gris} />
            {visto && <text x={bx + bw / 2} y={126 + filas * 22 + 36} textAnchor="middle" fontSize="14.5" fontWeight="700" fontFamily="var(--f-titulo)" fill={COLORES.a}>{v.gris ? `${r.n}/${C.N}` : ramaV(r)}</text>}
          </g>
        );
      })}
      {v.ramas && <text x={12} y={150} fontSize="12.5" fontFamily="var(--f-titulo)" fill="#4a5a51">después</text>}
    </svg>
  );
}

function Comparar({ k, gana }) {
  const vals = ATTRS.map((a) => valor(k, TODOS[a]));
  const max = Math.max(...vals);
  return (
    <table className="t tabla-cand" style={{ maxWidth: 620 }}>
      <thead><tr><th>Atributo</th>{k === 'ratio' && <th>G</th>}{k === 'ratio' && <th>info. div.</th>}<th>{CRIT[k].n} (se elige el {CRIT[k].mejor})</th></tr></thead>
      <tbody>
        {ATTRS.map((a, i) => (
          <tr key={a} className={a === gana ? 'resaltado' : ''}>
            <td><b>{a}</b></td>
            {k === 'ratio' && <td className="num">{dec(TODOS[a].gain)}</td>}
            {k === 'ratio' && <td className="num">{dec(TODOS[a].info)}</td>}
            <td className="num"><span className="mini-barra" style={{ width: 150 }}><i style={{ width: (vals[i] / max) * 150, background: a === gana ? COLORES.a : '#a9b5ab' }} /></span> {dec(vals[i], k === 'sdr' ? 2 : 3)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PasoCriterio() {
  const [k, setK] = useState('gain');
  const [a, setA] = useState('outlook');
  const fr = useMemo(() => frames(k, a), [k, a]);
  const p = usePasos(fr, { intervalo: 1500 });
  const f = p.frame;
  return (
    <Marco
      titulo="El mismo nodo, calculado con cada criterio"
      controles={
        <>
          {Object.entries(CRIT).map(([c, d]) => <button key={c} type="button" className={`boton ${k === c ? 'activo' : ''}`} onClick={() => setK(c)}>{d.n} <small>· {d.usa}</small></button>)}
          <label className="fila-control" style={{ margin: 0 }}>atributo <select value={a} onChange={(e) => setA(e.target.value)}>{ATTRS.map((x) => <option key={x}>{x}</option>)}</select></label>
        </>
      }
      pie={k === 'sdr' ? 'Las horas jugadas no están en las diapositivas: se añaden para tener un objetivo numérico sobre los mismos 14 días.' : 'Datos: los 14 días de tenis de las diapositivas (9 sí / 5 no).'}
    >
      <Controles p={p} />
      {f.vista.comparar ? <Comparar k={k} gana={f.vista.gana} /> : <Nodo k={k} C={TODOS[a]} v={f.vista} />}
      <ol className="pizarra">
        {f.lineas.map((l, i) => <li key={i} className={i === f.lineas.length - 1 && !f.vista.comparar ? 'nueva' : ''}>{l}</li>)}
      </ol>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

// ───────── medidor de desorden ─────────
export function Impureza() {
  const [k, setK] = useState(3);
  const n = 10;
  const c = [k, n - k];
  const H = entropia(c, 2);
  const G = gini(c);
  const estado = k === 0 || k === n ? 'puro: no hay desorden' : k === n / 2 ? 'mitad y mitad: desorden máximo' : Math.abs(k - n / 2) === 1 ? 'casi mitad y mitad: mucho desorden' : Math.abs(k - n / 2) === 2 ? 'mezclado: bastante desorden' : 'casi todos de una clase: poco desorden';
  const barra = (v, max, color, etq, val) => (
    <div className="impureza-fila">
      <span>{etq}</span>
      <div className="impureza-barra"><i style={{ width: `${(v / max) * 100}%`, background: color }} /></div>
      <b>{val}</b>
    </div>
  );
  return (
    <Marco titulo="¿Cuánto desorden tiene un nodo?" controles={<label className="fila-control" style={{ margin: 0 }}>días «sí» en el nodo <input type="range" min={0} max={n} value={k} onChange={(e) => setK(Number(e.target.value))} /> {k} de {n}</label>}
      pie="Entropía y Gini miden lo mismo con distinta escala: 0 si el nodo es puro y el máximo cuando las clases están a partes iguales (entropía 1, Gini 0,5). Un buen atributo deja ramas con poco desorden.">
      <svg viewBox="0 0 300 34" style={{ width: '100%', maxWidth: 360 }}>
        {Array.from({ length: n }, (_, i) => <circle key={i} cx={16 + i * 29} cy={17} r={12} fill={i < k ? COLORES.c : COLORES.b} />)}
      </svg>
      <p className="marcador" style={{ margin: '4px 0 8px' }}><b>{estado}</b></p>
      {barra(H, 1, COLORES.a, 'Entropía (máx. 1)', dec(H))}
      {barra(G, 0.5, COLORES.d, 'Gini (máx. 0,5)', dec(G))}
    </Marco>
  );
}
