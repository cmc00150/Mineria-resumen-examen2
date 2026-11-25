// Discretización supervisada paso a paso: ChiMerge (mezcla, bottom-up) y MDLP (división, top-down).
// Los dos usan el mismo eje ordinal: cada valor distinto ocupa una casilla, porque a ambos
// solo les importa el orden de los valores y la clase de cada uno.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, COLORES } from './comun.jsx';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';
import { semilla, entropia, log } from '../lib/stats.js';
import { redondear } from '../lib/stats.js';
import { latido } from '../lib/anim.js';

const CCLASE = [COLORES.a, COLORES.b, COLORES.c];

// ───────── Conjuntos de datos ─────────
function tresClases(s = 7) {
  const r = semilla(s);
  const out = [];
  const rangos = [[1, 12], [10, 21], [19, 30]];
  rangos.forEach(([a, b], c) => {
    for (let i = 0; i < 15; i++) out.push([a + Math.floor(r() * (b - a + 1)), c]);
  });
  return out;
}
const DATOS = {
  kerber: {
    n: 'Kerber (12 valores, 2 clases)',
    clases: ['clase 1', 'clase 2'],
    v: [[1, 0], [3, 1], [7, 0], [8, 0], [9, 0], [11, 1], [23, 1], [37, 0], [39, 1], [45, 0], [46, 0], [59, 0]],
  },
  golf: {
    n: 'Golf · temperatura (14, sí/no)',
    clases: ['juega: sí', 'juega: no'],
    v: [[85, 1], [80, 1], [83, 0], [70, 0], [68, 0], [65, 1], [64, 0], [72, 1], [69, 0], [75, 0], [75, 0], [72, 0], [81, 0], [71, 1]],
  },
  tres: { n: 'Tres clases (45 valores)', clases: ['A', 'B', 'C'], v: null },
};

function preparar(clave, s) {
  const d = DATOS[clave];
  const v = d.v || tresClases(s);
  const k = d.clases.length;
  const mapa = new Map();
  v.forEach(([x, c]) => {
    if (!mapa.has(x)) mapa.set(x, Array(k).fill(0));
    mapa.get(x)[c]++;
  });
  const dist = [...mapa.entries()].sort((a, b) => a[0] - b[0]).map(([x, cuentas]) => ({ v: x, cuentas }));
  return { dist, k, clases: d.clases, N: v.length };
}
const sumar = (dist, a, b) => {
  const k = dist[0].cuentas.length;
  const r = Array(k).fill(0);
  for (let s = a; s <= b; s++) dist[s].cuentas.forEach((n, j) => (r[j] += n));
  return r;
};
const total = (c) => c.reduce((x, y) => x + y, 0);
const rango = (dist, a, b) => (a === b ? `${dist[a].v}` : `[${dist[a].v}, ${dist[b].v}]`);

// ───────── Recta ordinal común ─────────
const W = 640, ML = 26, MR = 14;
function Recta({ dist, k, bandas = [], cortes = [], resalte, debajo, alturaDebajo = 0, refEl }) {
  const n = dist.length;
  const sw = (W - ML - MR) / n;
  const cx = (s) => ML + sw * (s + 0.5);
  const xc = (j) => ML + sw * (j + 1); // corte tras la casilla j
  const r = Math.max(2.6, Math.min(5, sw / 3.2));
  const pila = Math.max(...dist.map((d) => total(d.cuentas)));
  const top = 10, base = top + pila * (2 * r + 1.5);
  const yEje = base + 8, yBanda = yEje + 22, hBanda = 16;
  const H = yBanda + hBanda + 10 + alturaDebajo;
  return (
    <svg ref={refEl} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Valores ordenados con su clase">
      <rect width={W} height={H} fill="#fbfcfa" />
      {resalte && <rect x={ML + sw * resalte.a} y={2} width={sw * (resalte.b - resalte.a + 1)} height={yBanda + hBanda + 4} fill={resalte.c || '#e8efe0'} rx="4" />}
      {dist.map((d, s) => {
        let h = 0;
        return (
          <g key={s}>
            {d.cuentas.flatMap((nc, c) =>
              Array.from({ length: nc }, (_, t) => {
                const y = base - r - (h++) * (2 * r + 1.5);
                return <circle key={`${c}-${t}`} cx={cx(s)} cy={y} r={r} fill={CCLASE[c]} />;
              }),
            )}
            <text x={cx(s)} y={yEje + 10} textAnchor="middle" fontSize={sw < 22 ? 8.5 : 10.5} fill="#4a5a51" fontFamily="var(--f-titulo)">{d.v}</text>
          </g>
        );
      })}
      <line x1={ML} x2={W - MR} y1={yEje} y2={yEje} stroke="#4a5a51" />
      {bandas.map((b, i) => {
        const x0 = ML + sw * b.a, w = sw * (b.b - b.a + 1);
        const tot = total(b.cuentas) || 1;
        let acc = 0;
        return (
          <g key={`${b.a}-${b.b}`} className={b.nuevo ? 'nuevo' : ''} opacity={b.apagada ? 0.45 : 1}>
            {b.cuentas.map((nc, c) => {
              const ww = (w - 4) * (nc / tot);
              const el = <rect key={c} x={x0 + 2 + acc} y={yBanda} width={Math.max(0, ww)} height={hBanda} fill={CCLASE[c]} opacity="0.85" />;
              acc += ww;
              return el;
            })}
            <rect x={x0 + 2} y={yBanda} width={w - 4} height={hBanda} fill="none" stroke={b.marca ? '#1f2b25' : '#9aa69e'} strokeWidth={b.marca ? 2.4 : 1} rx="2" />
          </g>
        );
      })}
      {cortes.map((c) => (
        <line key={c.j} x1={xc(c.j)} x2={xc(c.j)} y1={4} y2={yBanda + hBanda + 4} stroke={c.color || '#1f2b25'} strokeWidth={c.ancho || 1.8} strokeDasharray={c.discontinuo ? '4 3' : undefined} />
      ))}
      {debajo && debajo({ xc, cx, sw, y0: yBanda + hBanda + 10 })}
    </svg>
  );
}

function Leyenda({ clases, extra }) {
  return (
    <div className="leyenda-puntos">
      {clases.map((c, i) => (
        <span key={c}><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={CCLASE[i]} /></svg>{c}</span>
      ))}
      <span><svg width="22" height="12"><rect x="1" y="2" width="20" height="8" fill={CCLASE[0]} /><rect x="13" y="2" width="8" height="8" fill={CCLASE[1]} /></svg>barra = reparto de clases del intervalo</span>
      {extra}
    </div>
  );
}

function SelectorDatos({ clave, setClave, otra }) {
  return (
    <>
      <select value={clave} onChange={(e) => setClave(e.target.value)} aria-label="Conjunto de datos">
        {Object.entries(DATOS).map(([c, d]) => <option key={c} value={c}>{d.n}</option>)}
      </select>
      {clave === 'tres' && <button className="boton" onClick={otra} type="button">Otros datos</button>}
    </>
  );
}

// ───────── ChiMerge ─────────
// Umbral χ² según grados de libertad (k − 1) y nivel de significancia.
const TABLA_CHI = { 0.1: [2.706, 4.605], 0.05: [3.841, 5.991], 0.01: [6.635, 9.21] };

function contingencia(a, b) {
  const filas = [a.cuentas, b.cuentas];
  const k = a.cuentas.length;
  const R = filas.map(total);
  const C = Array.from({ length: k }, (_, j) => filas[0][j] + filas[1][j]);
  const N = R[0] + R[1];
  const E = filas.map((_, i) => C.map((cj) => (R[i] * cj) / N));
  let x = 0;
  for (let i = 0; i < 2; i++) for (let j = 0; j < k; j++) if (E[i][j] > 0) x += (filas[i][j] - E[i][j]) ** 2 / E[i][j];
  return { A: filas, E, R, C, N, x };
}

function framesChiMerge(dist, k, umbral, maxInt) {
  let ints = dist.map((d, s) => ({ a: s, b: s, cuentas: [...d.cuentas] }));
  const F = [];
  const foto = (o) => F.push({ ints: ints.map((x) => ({ ...x })), ...o });
  foto({ e: '0', msg: `Empezamos con un intervalo por cada valor distinto: ${ints.length} intervalos. La barra de cada uno muestra cómo se reparten sus clases.` });
  for (let it = 0; it < 200 && ints.length > 1; it++) {
    const tablas = ints.slice(0, -1).map((a, i) => contingencia(a, ints[i + 1]));
    const chis = tablas.map((t) => t.x);
    const m = chis.indexOf(Math.min(...chis));
    const t = tablas[m];
    foto({ e: '1.0', chis, sel: m, tabla: t, msg: `χ² de cada par de vecinos. El menor es ${redondear(t.x)} entre ${rango(dist, ints[m].a, ints[m].b)} y ${rango(dist, ints[m + 1].a, ints[m + 1].b)}: sus clases se reparten de forma muy parecida.` });
    const para = chis[m] > umbral && ints.length <= maxInt;
    foto({
      e: '1.1', chis, sel: m, tabla: t, parar: para,
      msg: para
        ? `¿Parar? Sí: el menor χ² (${redondear(chis[m])}) ya supera ${redondear(umbral)} y hay ${ints.length} ≤ ${maxInt} intervalos. Todos los vecinos son estadísticamente distintos.`
        : chis[m] > umbral
          ? `¿Parar? No: aunque χ² = ${redondear(chis[m])} > ${redondear(umbral)}, hay ${ints.length} intervalos y el máximo es ${maxInt}. Se sigue mezclando.`
          : `¿Parar? No: ${redondear(chis[m])} ≤ ${redondear(umbral)}, no hay evidencia de que la clase dependa del intervalo.`,
    });
    if (para) break;
    const a = ints[m], b = ints[m + 1];
    ints = [...ints.slice(0, m), { a: a.a, b: b.b, cuentas: a.cuentas.map((x, j) => x + b.cuentas[j]), nuevo: true }, ...ints.slice(m + 2)].map((x, j) => (j === m ? x : { ...x, nuevo: false }));
    foto({ e: '1.2', msg: `Se fusionan en ${rango(dist, ints[m].a, ints[m].b)}. Quedan ${ints.length} intervalos.` });
  }
  foto({ e: '2', fin: true, msg: `Resultado: ${ints.length} intervalo${ints.length === 1 ? '' : 's'} → ${ints.map((x) => rango(dist, x.a, x.b)).join(' · ')}` });
  return F;
}

function TablaChi({ t, clases, ints, dist, sel }) {
  const fmt = (x) => redondear(x, 2);
  return (
    <div className="tabla-env">
      <table className="t">
        <thead>
          <tr><th>A (E)</th>{clases.map((c) => <th key={c}>{c}</th>)}<th>R</th></tr>
        </thead>
        <tbody>
          {[0, 1].map((i) => (
            <tr key={i}>
              <td><b>{rango(dist, ints[sel + i].a, ints[sel + i].b)}</b></td>
              {t.A[i].map((a, j) => <td key={j} className="num">{a} <span style={{ color: '#6f7d75' }}>({fmt(t.E[i][j])})</span></td>)}
              <td className="num">{t.R[i]}</td>
            </tr>
          ))}
          <tr><td>C</td>{t.C.map((c, j) => <td key={j} className="num">{c}</td>)}<td className="num">{t.N}</td></tr>
        </tbody>
      </table>
      <p className="pie" style={{ marginTop: 6 }}>
        E = R·C / N · χ² = Σ (A − E)² / E = <b>{fmt(t.x)}</b>
        {t.E.flat().some((e) => e === 0) && ' (las celdas con E = 0 no suman)'}
      </p>
    </div>
  );
}

export function PasoChiMerge() {
  const [clave, setClave] = useState('kerber');
  const [s, setS] = useState(7);
  const [alfa, setAlfa] = useState(0.1);
  const [maxInt, setMaxInt] = useState(6);
  const { dist, k, clases } = useMemo(() => preparar(clave, s), [clave, s]);
  const umbral = TABLA_CHI[alfa][k - 2];
  const frames = useMemo(() => framesChiMerge(dist, k, umbral, maxInt), [dist, k, umbral, maxInt]);
  const p = usePasos(frames, { intervalo: 900 });
  const f = p.frame;
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && f.e === '1.2') latido(ref.current.querySelectorAll('.nuevo'));
  }, [f]);
  const ints = f.ints || [];
  const bandas = ints.map((x, i) => ({ ...x, marca: f.sel != null && (i === f.sel || i === f.sel + 1) && !f.parar }));
  const cortes = ints.slice(0, -1).map((x) => ({ j: x.b, color: f.fin ? '#1f2b25' : '#9aa69e', ancho: f.fin ? 2.2 : 1 }));
  return (
    <Marco
      titulo="ChiMerge paso a paso"
      controles={
        <>
          <SelectorDatos clave={clave} setClave={setClave} otra={() => setS((x) => x + 1)} />
          <label className="fila-control">α
            <select value={alfa} onChange={(e) => setAlfa(Number(e.target.value))}>
              <option value={0.1}>0,10</option>
              <option value={0.05}>0,05</option>
              <option value={0.01}>0,01</option>
            </select>
          </label>
          <label className="fila-control">máx. intervalos
            <input type="range" min="2" max="12" value={maxInt} onChange={(e) => setMaxInt(Number(e.target.value))} />
            <span className="num">{maxInt}</span>
          </label>
        </>
      }
    >
      <Controles p={p} />
      <Recta
        dist={dist}
        k={k}
        bandas={bandas}
        cortes={cortes}
        refEl={ref}
        alturaDebajo={f.chis ? 30 : 0}
        debajo={({ xc, y0 }) =>
          f.chis &&
          ints.slice(0, -1).map((x, i) => {
            const min = i === f.sel;
            return (
              <g key={i}>
                <rect x={xc(x.b) - 19} y={y0 + 2} width="38" height="18" rx="9" fill={min ? (f.parar ? COLORES.c : '#1f2b25') : '#eef2ec'} />
                <text x={xc(x.b)} y={y0 + 15} textAnchor="middle" fontSize="10" fontWeight={min ? 700 : 400} fill={min ? '#fff' : '#4a5a51'} fontFamily="var(--f-titulo)">{redondear(f.chis[i], 1)}</text>
              </g>
            );
          })
        }
      />
      <Leyenda clases={clases} extra={<span>pastilla = χ² del par de vecinos · umbral χ²(gl = {k - 1}, α = {String(alfa).replace('.', ',')}) = <b>{redondear(umbral)}</b></span>} />
      <Mensaje>{f.msg}</Mensaje>
      {f.tabla && <TablaChi t={f.tabla} clases={clases} ints={ints} dist={dist} sel={f.sel} />}
    </Marco>
  );
}

// ───────── MDLP ─────────
function evaluarCorte(dist, a, j, b) {
  const S = sumar(dist, a, b), S1 = sumar(dist, a, j), S2 = sumar(dist, j + 1, b);
  const N = total(S), n1 = total(S1), n2 = total(S2);
  const H = entropia(S), H1 = entropia(S1), H2 = entropia(S2);
  const G = H - (n1 / N) * H1 - (n2 / N) * H2;
  const c = S.filter((x) => x > 0).length, c1 = S1.filter((x) => x > 0).length, c2 = S2.filter((x) => x > 0).length;
  const delta = log(3 ** c - 2) - (c * H - c1 * H1 - c2 * H2);
  const th = log(N - 1) / N + delta / N;
  return { j, G, th, N, H, H1, H2, n1, n2, delta, c, c1, c2 };
}
// Puntos frontera: entre dos valores vecinos que no son de una única clase común.
function candidatos(dist, a, b) {
  const out = [];
  for (let j = a; j < b; j++) {
    const p = dist[j].cuentas, q = dist[j + 1].cuentas;
    const puro = (x) => x.filter((n) => n > 0).length === 1;
    const mismaUnica = puro(p) && puro(q) && p.findIndex((n) => n > 0) === q.findIndex((n) => n > 0);
    if (!mismaUnica) out.push(j);
  }
  return out;
}

function framesMDLP(dist) {
  const F = [];
  const aceptados = [];
  const finales = [];
  const pila = [{ a: 0, b: dist.length - 1, nivel: 0 }];
  const foto = (o) => F.push({ cortes: [...aceptados], finales: finales.map((x) => ({ ...x })), pendientes: pila.map((x) => ({ ...x })), ...o });
  foto({ e: '0', msg: `S = todos los valores (N = ${total(sumar(dist, 0, dist.length - 1))}). MDLP divide de arriba abajo: buscará el mejor corte y decidirá si merece la pena.` });
  while (pila.length) {
    const seg = pila.pop();
    const { a, b } = seg;
    const N = total(sumar(dist, a, b));
    const cand = candidatos(dist, a, b).map((j) => evaluarCorte(dist, a, j, b));
    if (!cand.length) {
      finales.push(seg);
      foto({ e: '3', seg, msg: `S = ${rango(dist, a, b)} (N = ${N}) es puro: no hay puntos frontera, no se puede dividir.` });
      continue;
    }
    foto({ e: '1', seg, cand, msg: `S = ${rango(dist, a, b)}, N = ${N}. Para cada punto frontera (entre valores de clase distinta) se calcula la ganancia G. Solo se prueban fronteras: Fayyad e Irani demostraron que el mejor corte siempre está en una.` });
    const m = cand.reduce((x, y) => (y.G > x.G ? y : x));
    foto({ e: '2', seg, cand, mejor: m.j, msg: `Mejor corte entre ${dist[m.j].v} y ${dist[m.j + 1].v}: G = ${redondear(m.G, 3)} (H(S) = ${redondear(m.H, 3)} → ${redondear(m.H1, 3)} | ${redondear(m.H2, 3)}).` });
    const ok = m.G > m.th;
    if (ok) {
      aceptados.push(m.j);
      pila.push({ a: m.j + 1, b, nivel: seg.nivel + 1 }, { a, b: m.j, nivel: seg.nivel + 1 });
    } else finales.push(seg);
    foto({
      e: '3', seg, cand, mejor: m.j, ok, det: m,
      msg: ok
        ? `G = ${redondear(m.G, 3)} > umbral MDL ${redondear(m.th, 3)} → se acepta el corte en ${redondear((dist[m.j].v + dist[m.j + 1].v) / 2, 1)} y se repite en cada mitad.`
        : `G = ${redondear(m.G, 3)} ≤ umbral MDL ${redondear(m.th, 3)} → no compensa: describir el corte cuesta más de lo que ahorra. ${rango(dist, a, b)} queda como intervalo.`,
    });
  }
  finales.sort((x, y) => x.a - y.a);
  foto({ e: '4', fin: true, msg: aceptados.length ? `Resultado: ${aceptados.length} corte(s) → ${finales.map((x) => rango(dist, x.a, x.b)).join(' · ')}. El número de intervalos lo ha decidido MDL, no el usuario.` : 'Resultado: ningún corte. Con tan pocos datos el umbral MDL (≈ log₂(N−1)/N) es alto y ningún corte lo supera: el atributo queda en un único intervalo.' });
  return F;
}

function DetalleMDL({ d }) {
  const f = (x) => redondear(x, 3);
  return (
    <div className="tabla-env">
      <table className="t">
        <tbody>
          <tr><td>G(A,T;S) = H(S) − n₁/N·H(S₁) − n₂/N·H(S₂)</td><td className="num">{f(d.H)} − {d.n1}/{d.N}·{f(d.H1)} − {d.n2}/{d.N}·{f(d.H2)} = <b>{f(d.G)}</b></td></tr>
          <tr><td>δ = log₂(3^c − 2) − [c·H(S) − c₁·H(S₁) − c₂·H(S₂)]</td><td className="num">c = {d.c}, c₁ = {d.c1}, c₂ = {d.c2} → δ = {f(d.delta)}</td></tr>
          <tr><td>umbral = log₂(N − 1)/N + δ/N</td><td className="num">{f(log(d.N - 1) / d.N)} + {f(d.delta / d.N)} = <b>{f(d.th)}</b></td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function PasoMDLP() {
  const [clave, setClave] = useState('tres');
  const [s, setS] = useState(7);
  const { dist, k, clases } = useMemo(() => preparar(clave, s), [clave, s]);
  const frames = useMemo(() => framesMDLP(dist), [dist]);
  const p = usePasos(frames, { intervalo: 1100 });
  const f = p.frame;
  // Intervalos actuales: terminados + pendientes en la pila + el que se examina ahora.
  const examinando = f.seg && (f.e === '1' || f.e === '2');
  const bandas = [
    ...(f.finales || []).map((x) => ({ ...x, hecho: true })),
    ...(f.pendientes || []),
    ...(examinando ? [f.seg] : []),
  ]
    .sort((x, y) => x.a - y.a)
    .map((x) => ({ a: x.a, b: x.b, cuentas: sumar(dist, x.a, x.b), marca: examinando && x === f.seg, apagada: x.hecho && !f.fin }));
  const maxG = Math.max(0.2, ...(f.cand || []).flatMap((c) => [c.G, c.th]));
  const HG = 96;
  const cortes = [
    ...(f.cortes || []).map((j) => ({ j, color: '#1f2b25', ancho: 2.4 })),
    ...(f.mejor != null && !f.ok && f.e !== '1' ? [{ j: f.mejor, color: f.e === '3' ? COLORES.b : COLORES.d, discontinuo: true, ancho: 2 }] : []),
  ];
  return (
    <Marco titulo="MDLP paso a paso" controles={<SelectorDatos clave={clave} setClave={setClave} otra={() => setS((x) => x + 1)} />}>
      <Controles p={p} />
      <Recta
        dist={dist}
        k={k}
        bandas={bandas}
        cortes={cortes}
        resalte={f.seg && !f.fin ? { ...f.seg, c: '#eaf0e3' } : null}
        alturaDebajo={f.cand ? HG + 26 : 0}
        debajo={({ xc, sw, y0 }) => {
          if (!f.cand) return null;
          const y = (v) => y0 + 8 + HG - (v / maxG) * HG;
          const bw = Math.max(4, Math.min(16, sw * 0.6));
          return (
            <g>
              <text x={ML - 4} y={y0 + 12} textAnchor="end" fontSize="9.5" fill="#6f7d75" fontFamily="var(--f-titulo)">G</text>
              <line x1={ML} x2={W - MR} y1={y(0)} y2={y(0)} stroke="#9aa69e" />
              {f.cand.map((c) => {
                const mejor = c.j === f.mejor;
                const col = mejor ? (f.e === '3' ? (f.ok ? COLORES.c : COLORES.b) : COLORES.d) : '#b9c3bc';
                return (
                  <g key={c.j}>
                    <rect x={xc(c.j) - bw / 2} y={y(c.G)} width={bw} height={y(0) - y(c.G)} fill={col}>
                      <title>{`corte ${redondear((dist[c.j].v + dist[c.j + 1].v) / 2, 1)}: G = ${redondear(c.G, 3)}, umbral = ${redondear(c.th, 3)}`}</title>
                    </rect>
                    <line x1={xc(c.j) - bw / 2 - 3} x2={xc(c.j) + bw / 2 + 3} y1={y(c.th)} y2={y(c.th)} stroke="#1f2b25" strokeWidth="2" />
                  </g>
                );
              })}
              <text x={W - MR} y={y0 + HG + 22} textAnchor="end" fontSize="9.5" fill="#6f7d75" fontFamily="var(--f-titulo)">barra = ganancia G de cada corte · raya negra = umbral MDL de ese corte</text>
            </g>
          );
        }}
      />
      <Leyenda clases={clases} extra={<><span>fondo verde = S que se examina</span><span>│ corte aceptado</span><span style={{ color: COLORES.b }}>┆ corte rechazado</span></>} />
      <Mensaje>{f.msg}</Mensaje>
      {f.det && <DetalleMDL d={f.det} />}
    </Marco>
  );
}
