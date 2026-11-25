import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, ArbolSvg, COLORES, escala, Ejes } from './comun.jsx';
import { DATASETS, CREDITO, CREDITO_PRISM, TENIS_NUM } from './datos.js';
import { evaluarAtributo, id3, entropia, contarClases, redondear } from '../lib/stats.js';
import { anim, latido, stagger, dibujar } from '../lib/anim.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

// ───────── Árbol del tenis: clasificar recorriendo ─────────
const ARBOL_TENIS = {
  id: 'r', t: 'tiempo',
  hijos: [
    { a: 'soleado', n: { id: 's', t: 'humedad', hijos: [{ a: 'alta', n: { id: 'sa', t: 'no', hoja: true, color: COLORES.b } }, { a: 'normal', n: { id: 'sn', t: 'sí', hoja: true, color: COLORES.c } }] } },
    { a: 'nublado', n: { id: 'n', t: 'sí', hoja: true, color: COLORES.c } },
    { a: 'lluvioso', n: { id: 'l', t: 'viento', hijos: [{ a: 'fuerte', n: { id: 'lf', t: 'no', hoja: true, color: COLORES.b } }, { a: 'débil', n: { id: 'ld', t: 'sí', hoja: true, color: COLORES.c } }] } },
  ],
};
export function ArbolTenis() {
  const [v, setV] = useState({ tiempo: 'soleado', humedad: 'normal', viento: 'débil', temperatura: 72 });
  const camino = ['r'];
  let regla = `tiempo = ${v.tiempo}`;
  let res;
  if (v.tiempo === 'soleado') { camino.push('s', v.humedad === 'alta' ? 'sa' : 'sn'); regla += ` y humedad = ${v.humedad}`; res = v.humedad === 'alta' ? 'no' : 'sí'; }
  else if (v.tiempo === 'nublado') { camino.push('n'); res = 'sí'; }
  else { camino.push('l', v.viento === 'fuerte' ? 'lf' : 'ld'); regla += ` y viento = ${v.viento}`; res = v.viento === 'fuerte' ? 'no' : 'sí'; }
  const sel = (k, opts) => (
    <label className="fila-control">{k}
      <select value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
    </label>
  );
  return (
    <Marco titulo="Clasificar un día recorriendo el árbol" pie={<>Regla usada: <b>SI {regla} ENTONCES jugar = {res}</b>. La temperatura ({v.temperatura}) no aparece en el árbol: no hace falta mirarla.</>}>
      <div className="fila-control">
        {sel('tiempo', ['soleado', 'nublado', 'lluvioso'])}
        {sel('humedad', ['alta', 'normal'])}
        {sel('viento', ['fuerte', 'débil'])}
        <label className="fila-control">temperatura <input type="range" min={60} max={90} value={v.temperatura} onChange={(e) => setV({ ...v, temperatura: Number(e.target.value) })} /> {v.temperatura}</label>
      </div>
      <ArbolSvg raiz={ARBOL_TENIS} camino={camino} sepX={100} animar={false} />
    </Marco>
  );
}

// ───────── Partición del espacio: cortes paralelos a los ejes ─────────
export function ParticionEspacio() {
  const [prof, setProf] = useState(1);
  const [frontera, setFrontera] = useState('diagonal');
  const pts = useMemo(() => {
    const out = [];
    for (let i = 0; i < 14; i++) for (let j = 0; j < 10; j++) {
      const x = i / 13, y = j / 9;
      const c = frontera === 'diagonal' ? (y > x ? 1 : 0) : (x > 0.5 && y > 0.4 ? 1 : 0);
      out.push({ x, y, c });
    }
    return out;
  }, [frontera]);
  // Árbol "ideal" con cortes paralelos: construimos recursivamente hasta la profundidad dada
  const regiones = useMemo(() => {
    const res = [];
    const rec = (caja, d) => {
      const dentro = pts.filter((p) => p.x >= caja.x0 && p.x <= caja.x1 && p.y >= caja.y0 && p.y <= caja.y1);
      const pos = dentro.filter((p) => p.c).length;
      const puro = pos === 0 || pos === dentro.length;
      if (d === 0 || puro || dentro.length < 2) { res.push({ ...caja, c: pos * 2 >= dentro.length ? 1 : 0 }); return; }
      let mejor = null;
      ['x', 'y'].forEach((eje) => {
        const vals = [...new Set(dentro.map((p) => p[eje]))].sort((a, b) => a - b);
        for (let k = 0; k < vals.length - 1; k++) {
          const t = (vals[k] + vals[k + 1]) / 2;
          const A = dentro.filter((p) => p[eje] <= t), B = dentro.filter((p) => p[eje] > t);
          const err = (S) => Math.min(S.filter((p) => p.c).length, S.filter((p) => !p.c).length);
          const e = err(A) + err(B);
          if (!mejor || e < mejor.e) mejor = { eje, t, e };
        }
      });
      if (!mejor) { res.push({ ...caja, c: pos * 2 >= dentro.length ? 1 : 0 }); return; }
      if (mejor.eje === 'x') { rec({ ...caja, x1: mejor.t }, d - 1); rec({ ...caja, x0: mejor.t }, d - 1); }
      else { rec({ ...caja, y1: mejor.t }, d - 1); rec({ ...caja, y0: mejor.t }, d - 1); }
    };
    rec({ x0: 0, x1: 1, y0: 0, y1: 1 }, prof);
    return res;
  }, [pts, prof]);
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) anim(ref.current.querySelectorAll('rect.reg'), { opacity: [0, 1], duration: 400, delay: stagger(20) });
  }, [regiones]);
  const W = 420, H = 320, m = 14;
  const sx = escala(-0.04, 1.04, m, W - m), sy = escala(-0.06, 1.06, H - m, m);
  const errores = pts.filter((p) => { const r = regiones.find((g) => p.x >= g.x0 && p.x <= g.x1 && p.y >= g.y0 && p.y <= g.y1); return r && r.c !== p.c; }).length;
  return (
    <Marco
      titulo="Cómo particiona el espacio un árbol"
      controles={
        <>
          <button className={`boton ${frontera === 'ejes' ? 'activo' : ''}`} onClick={() => setFrontera('ejes')} type="button">Frontera paralela a los ejes</button>
          <button className={`boton ${frontera === 'diagonal' ? 'activo' : ''}`} onClick={() => setFrontera('diagonal')} type="button">Frontera diagonal</button>
        </>
      }
      pie={`Profundidad ${prof}: ${regiones.length} rectángulos (hojas), ${errores} puntos mal clasificados. ${frontera === 'diagonal' ? 'Con una frontera diagonal el árbol necesita muchos cortes y aparece el efecto escalera; un árbol oblicuo lo resolvería con un solo corte x − y.' : 'Con una frontera paralela a los ejes bastan dos cortes.'}`}
    >
      <label className="fila-control">Profundidad máxima <input type="range" min={1} max={7} value={prof} onChange={(e) => setProf(Number(e.target.value))} /> {prof}</label>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 520 }}>
        {regiones.map((g, i) => (
          <rect key={`${prof}-${frontera}-${i}`} className="reg" x={sx(g.x0 === 0 ? -0.04 : g.x0)} y={sy(g.y1 === 1 ? 1.06 : g.y1)} width={sx(g.x1 === 1 ? 1.04 : g.x1) - sx(g.x0 === 0 ? -0.04 : g.x0)} height={sy(g.y0 === 0 ? -0.06 : g.y0) - sy(g.y1 === 1 ? 1.06 : g.y1)} fill={g.c ? '#dce6f3' : '#f5e0df'} stroke="#4a5a51" strokeWidth="1" />
        ))}
        {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.4} fill={p.c ? COLORES.a : COLORES.b} />)}
      </svg>
    </Marco>
  );
}

// ───────── Construcción paso a paso del árbol de crédito (TDIDT) ─────────
const PASOS_CREDITO = [
  { txt: '1. Se llama al algoritmo sobre la raíz con los 10 ejemplos (8 NO, 2 SÍ). No son todos de la misma clase y quedan atributos.', arbol: { t: '¿? (10)' }, foco: CREDITO.map((_, i) => i) },
  { txt: '2. Se elige gastos como test y se reparten los ejemplos: altos (6 ejemplos) y bajos (4).', arbol: { t: 'gastos', hijos: [{ a: 'altos', n: { t: '¿? (5 NO, 1 SÍ)' } }, { a: 'bajos', n: { t: '¿? (3 NO, 1 SÍ)' } }] }, foco: [0, 1, 2, 3, 4, 5] },
  { txt: '3. En gastos = altos se elige ingresos: bajos (2 NO), medios (2 NO) y altos (1 NO, 1 SÍ).', arbol: { t: 'gastos', hijos: [{ a: 'altos', n: { t: 'ingresos', hijos: [{ a: 'bajos', n: { t: '¿? (2,0)' } }, { a: 'medios', n: { t: '¿? (2,0)' } }, { a: 'altos', n: { t: '¿? (1,1)' } }] } }, { a: 'bajos', n: { t: '¿? (3,1)' } }] }, foco: [0, 1, 2, 3, 4, 5] },
  { txt: '4. Ingresos bajos y medios son puros: se crean las hojas NO.', arbol: { t: 'gastos', hijos: [{ a: 'altos', n: { t: 'ingresos', hijos: [{ a: 'bajos', n: { t: 'NO', hoja: true, color: COLORES.b } }, { a: 'medios', n: { t: 'NO', hoja: true, color: COLORES.b } }, { a: 'altos', n: { t: '¿? (1,1)' } }] } }, { a: 'bajos', n: { t: '¿? (3,1)' } }] }, foco: [0, 1, 2, 3] },
  { txt: '5. En gastos = bajos se elige propietario: no → 3 NO (hoja), sí → 1 SÍ (hoja).', arbol: { t: 'gastos', hijos: [{ a: 'altos', n: { t: 'ingresos', hijos: [{ a: 'bajos', n: { t: 'NO', hoja: true, color: COLORES.b } }, { a: 'medios', n: { t: 'NO', hoja: true, color: COLORES.b } }, { a: 'altos', n: { t: '¿? (1,1)' } }] } }, { a: 'bajos', n: { t: 'propietario', hijos: [{ a: 'no', n: { t: 'NO', hoja: true, color: COLORES.b } }, { a: 'sí', n: { t: 'SÍ', hoja: true, color: COLORES.c } }] } }] }, foco: [6, 7, 8, 9] },
  { txt: '6. En gastos = altos ∧ ingresos = altos solo queda propietario: no → NO, sí → SÍ. Árbol terminado: 6 hojas = 6 reglas.', arbol: { t: 'gastos', hijos: [{ a: 'altos', n: { t: 'ingresos', hijos: [{ a: 'bajos', n: { t: 'NO (2,0)', hoja: true, color: COLORES.b } }, { a: 'medios', n: { t: 'NO (2,0)', hoja: true, color: COLORES.b } }, { a: 'altos', n: { t: 'propietario', hijos: [{ a: 'no', n: { t: 'NO (1,0)', hoja: true, color: COLORES.b } }, { a: 'sí', n: { t: 'SÍ (0,1)', hoja: true, color: COLORES.c } }] } }] } }, { a: 'bajos', n: { t: 'propietario', hijos: [{ a: 'no', n: { t: 'NO (3,0)', hoja: true, color: COLORES.b } }, { a: 'sí', n: { t: 'SÍ (0,1)', hoja: true, color: COLORES.c } }] } }] }, foco: [4, 5] },
];
export function ArbolCredito() {
  const [p, setP] = useState(0);
  const paso = PASOS_CREDITO[p];
  return (
    <Marco
      titulo="TDIDT paso a paso con los datos de crédito"
      controles={
        <>
          <button className="boton" onClick={() => setP((x) => Math.max(0, x - 1))} disabled={p === 0} type="button">Anterior</button>
          <button className="boton primario" onClick={() => setP((x) => Math.min(PASOS_CREDITO.length - 1, x + 1))} disabled={p === PASOS_CREDITO.length - 1} type="button">Siguiente paso</button>
        </>
      }
      pie="El orden gastos → ingresos → propietario es el de la diapositiva y sirve para ilustrar TDIDT. Con ganancia de información (ID3) la raíz sería propietario (ganancia 0,236 frente a 0,007 de gastos): compruébalo en el simulador de ID3 eligiendo «Crédito»."
    >
      <p className="marcador" aria-live="polite">{paso.txt}</p>
      <div className="dos-col">
        <ArbolSvg raiz={paso.arbol} sepX={86} sepY={74} />
        <div className="tabla-env">
          <table className="t">
            <thead><tr><th>crédito</th><th>ingresos</th><th>propietario</th><th>gastos</th></tr></thead>
            <tbody>
              {CREDITO.map((f, i) => (
                <tr key={i} className={paso.foco.includes(i) ? 'resaltado' : ''}>
                  <td className={f.credito === 'si' ? 'ok' : ''}>{f.credito.toUpperCase()}</td><td>{f.ingresos}</td><td>{f.propietario}</td><td>{f.gastos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Marco>
  );
}

// ───────── Ganancia / ratio / Gini e ID3 ─────────
function aArbolSvg(nodo, clases, valor = null, id = 'r') {
  if (nodo.hoja) return { id, t: `${nodo.hoja} (${nodo.cuentas.join(',')})`, hoja: true, color: nodo.hoja === clases[0] ? COLORES.c : nodo.hoja === clases[1] ? COLORES.b : COLORES.d };
  return { id, t: nodo.attr, hijos: nodo.hijos.map((h, i) => ({ a: h.valor, n: aArbolSvg(h.nodo, clases, h.valor, `${id}.${i}`) })) };
}
export function Ganancia() {
  const [ds, setDs] = useState('tenis');
  const [sub, setSub] = useState('');
  const [crit, setCrit] = useState('gain');
  const [verArbol, setVerArbol] = useState(false);
  const D = DATASETS[ds];
  const base = D.base;
  const filas = useMemo(() => {
    if (!sub) return D.filas;
    const [a, v] = sub.split('=');
    return D.filas.filter((f) => f[a] === v);
  }, [D, sub]);
  const attrs = D.attrs.filter((a) => !sub || a !== sub.split('=')[0]);
  const evals = useMemo(() => attrs.map((a) => evaluarAtributo(filas, a, D.clase, D.clases, base)), [filas, attrs.join(), D, base]); // eslint-disable-line
  const valor = (e) => (crit === 'gain' ? e.gain : crit === 'ratio' ? e.ratio : -e.giniSplit);
  const mejor = evals.length ? evals.reduce((a, b) => (valor(b) > valor(a) + 1e-12 ? b : a)) : null;
  const hS = entropia(contarClases(filas, D.clase, D.clases), base);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    anim(ref.current.querySelectorAll('.barra-g'), { scaleX: [0, 1], duration: 600, delay: stagger(80), ease: 'outCubic' });
  }, [ds, sub, crit]);
  const arbol = useMemo(() => (verArbol ? id3(D.filas, D.attrs, D.clase, D.clases, crit) : null), [verArbol, D, crit]);
  const maxV = Math.max(...evals.map((e) => Math.abs(crit === 'gini' ? e.giniSplit : valor(e))), 0.001);
  const opcionesSub = D.attrs.flatMap((a) => [...new Set(D.filas.map((f) => f[a]))].map((v) => `${a}=${v}`));
  return (
    <Marco
      titulo="Calculadora de ganancia, ratio de ganancia y Gini"
      controles={
        <>
          <select value={ds} onChange={(e) => { setDs(e.target.value); setSub(''); }} aria-label="Conjunto de datos">
            {Object.entries(DATASETS).map(([k, d]) => <option key={k} value={k}>{d.nombre}</option>)}
          </select>
          <select value={crit} onChange={(e) => setCrit(e.target.value)} aria-label="Criterio">
            <option value="gain">Ganancia (ID3)</option>
            <option value="ratio">Ratio de ganancia (C4.5)</option>
            <option value="gini">Gini (CART)</option>
          </select>
        </>
      }
      pie={mejor && <>Con {crit === 'gain' ? 'la ganancia' : crit === 'ratio' ? 'el ratio de ganancia' : 'Gini (el menor gini_split)'} se elige <b>{mejor.attr}</b>. {base === 10 && 'Este conjunto usa log₁₀ para reproducir los números de la diapositiva.'}</>}
    >
      <div className="fila-control">
        <label className="fila-control">Calcular en
          <select value={sub} onChange={(e) => setSub(e.target.value)}>
            <option value="">todos los ejemplos (raíz)</option>
            {opcionesSub.map((o) => <option key={o} value={o}>la rama {o.replace('=', ' = ')}</option>)}
          </select>
        </label>
        <span className="marcador">{filas.length} ejemplos · H(S) = <b>{redondear(hS, 4)}</b> ({D.clases.map((c, i) => `${c}: ${contarClases(filas, D.clase, D.clases)[i]}`).join(', ')})</span>
      </div>
      <div className="tabla-env" ref={ref}>
        <table className="t">
          <thead>
            <tr><th>Atributo</th><th>Particiones (cuentas por clase)</th><th>E(A)</th><th>Ganancia</th><th>Info. división</th><th>Ratio</th><th>gini_split</th><th style={{ width: 160 }}>Criterio</th></tr>
          </thead>
          <tbody>
            {evals.map((e) => (
              <tr key={e.attr} className={mejor && e.attr === mejor.attr ? 'resaltado' : ''}>
                <td><b>{e.attr}</b></td>
                <td style={{ fontSize: 13 }}>{e.parts.map((p) => `${p.valor} (${p.cuentas.join('/')})`).join(' · ')}</td>
                <td className="num">{redondear(e.eA, 4)}</td>
                <td className="num">{redondear(e.gain, 4)}</td>
                <td className="num">{redondear(e.splitInfo, 4)}</td>
                <td className="num">{redondear(e.ratio, 4)}</td>
                <td className="num">{redondear(e.giniSplit, 4)}</td>
                <td>
                  <svg viewBox="0 0 150 14" width="150" height="14" aria-hidden="true">
                    <rect className="barra-g" x="0" y="2" height="10" width={(Math.abs(crit === 'gini' ? e.giniSplit : valor(e)) / maxV) * 148} fill={mejor && e.attr === mejor.attr ? COLORES.a : '#a9b5ab'} style={{ transformOrigin: '0 0' }} />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grupo-botones" style={{ marginTop: 12 }}>
        <button className={`boton ${verArbol ? 'activo' : ''}`} onClick={() => setVerArbol((x) => !x)} type="button">{verArbol ? 'Ocultar el árbol' : 'Construir el árbol completo con este criterio'}</button>
      </div>
      {arbol && <div style={{ marginTop: 10 }}><ArbolSvg raiz={aArbolSvg(arbol, D.clases)} sepX={70} sepY={72} /></div>}
    </Marco>
  );
}

// ───────── Umbral de C4.5 para un atributo continuo ─────────
export function UmbralC45() {
  const datos = useMemo(() => [...TENIS_NUM].sort((a, b) => a.temp - b.temp), []);
  const vals = [...new Set(datos.map((d) => d.temp))];
  const candidatos = useMemo(() => vals.slice(0, -1).map((u) => {
    const fil = datos.map((d) => ({ ...d, t: d.temp <= u ? 'bajo' : 'alto' }));
    const e = evaluarAtributo(fil, 't', 'play', ['yes', 'no']);
    const iu = vals.indexOf(u);
    const cambia = (() => {
      const cls = (v) => new Set(datos.filter((d) => d.temp === v).map((d) => d.play));
      const a = cls(u), b = cls(vals[iu + 1]);
      return a.size > 1 || b.size > 1 || [...a][0] !== [...b][0];
    })();
    return { u, gain: e.gain, ratio: e.ratio, cambia };
  }), [datos]); // eslint-disable-line
  const [i, setI] = useState(0);
  const mejor = candidatos.reduce((a, b) => (b.gain > a.gain ? b : a));
  const c = candidatos[i];
  const ref = useRef(null);
  useEffect(() => { if (ref.current) latido(ref.current.querySelector('.umbral')); }, [i]);
  const W = 640, H = 210, m = { l: 40, r: 20, t: 14, b: 34 };
  const sx = escala(62, 87, m.l, W - m.r);
  const maxR = Math.max(...candidatos.map((x) => x.gain));
  return (
    <Marco
      titulo="C4.5: buscar el mejor umbral de «temperatura»"
      controles={<button className="boton" onClick={() => setI(candidatos.indexOf(mejor))} type="button">Ir al mejor umbral</button>}
      pie={<>Umbral temp ≤ {c.u}: ganancia {redondear(c.gain, 4)}, ratio {redondear(c.ratio, 4)}. {c.cambia ? 'Es un punto donde cambia la clase, así que es candidato.' : 'Aquí la clase no cambia entre este valor y el siguiente: C4.5 ni siquiera necesita probarlo.'} El de mayor ganancia es temp ≤ {mejor.u} (ganancia {redondear(mejor.gain, 4)}, ratio {redondear(mejor.ratio, 4)}). Las barras son la ganancia de cada umbral; el ratio de ganancia se usa después para comparar este atributo con los demás.</>}
    >
      <label className="fila-control">Umbral <input type="range" min={0} max={candidatos.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} /> temp ≤ {c.u}</label>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`}>
        <Ejes x0={62} x1={87} y0={0} y1={1} W={W} H={H} m={m} etqX="temperatura" ticksY={0} />
        {candidatos.map((k, j) => (
          <rect key={j} x={sx(k.u) + 2} width={10} y={H - m.b - (k.gain / maxR) * 90} height={(k.gain / maxR) * 90} fill={j === i ? COLORES.a : k.cambia ? '#a9b5ab' : '#e4e9e2'} />
        ))}
        <line className="umbral" x1={sx(c.u) + 7} x2={sx(c.u) + 7} y1={m.t} y2={H - m.b} stroke={COLORES.a} strokeWidth="2" strokeDasharray="4 3" style={{ transformOrigin: `${sx(c.u) + 7}px ${H - m.b}px` }} />
        {datos.map((d, j) => {
          const rep = datos.slice(0, j).filter((x) => x.temp === d.temp).length;
          return <circle key={j} cx={sx(d.temp)} cy={m.t + 14 + rep * 11} r={4.5} fill={d.play === 'yes' ? COLORES.c : COLORES.b} />;
        })}
        <circle cx={W - 150} cy={H - 8} r="4.5" fill={COLORES.c} /><text x={W - 142} y={H - 4} fontSize="12" fontFamily="var(--f-titulo)" fill="#4a5a51">juega</text><circle cx={W - 88} cy={H - 8} r="4.5" fill={COLORES.b} /><text x={W - 80} y={H - 4} fontSize="12" fontFamily="var(--f-titulo)" fill="#4a5a51">no juega</text>
      </svg>
    </Marco>
  );
}

// ───────── PRISM paso a paso ─────────
const ORDEN_ATTR = [['ingresos', ['altos', 'medios', 'bajos']], ['propietario', ['si', 'no']], ['gastos', ['altos', 'bajos']]];
function prismTraza({ criterio, desempate, porDefecto }) {
  const pasos = [];
  const reglas = [];
  const clases = porDefecto ? ['si'] : ['si', 'no'];
  for (const c of clases) {
    let E = CREDITO_PRISM.map((f, i) => ({ ...f, i }));
    while (E.some((f) => f.credito === c)) {
      let regla = [];
      let cubiertos = E;
      while (true) {
        const usados = regla.map(([a]) => a);
        const cands = [];
        ORDEN_ATTR.forEach(([a, vs]) => {
          if (usados.includes(a)) return;
          vs.forEach((v) => {
            const cub = cubiertos.filter((f) => f[a] === v);
            const p = cub.filter((f) => f.credito === c).length;
            const t = cub.length;
            const fn = E.filter((f) => f.credito === c).length - p;
            const s = t ? p / t : -1;
            const F = 2 * p + (t - p) + fn ? (2 * p) / (2 * p + (t - p) + fn) : 0;
            cands.push({ a, v, p, t, s, F });
          });
        });
        if (!cands.length) break;
        const val = (x) => (criterio === 's' ? x.s : x.F);
        const mejor = cands.reduce((A, B) => {
          if (val(B) > val(A) + 1e-12) return B;
          if (Math.abs(val(B) - val(A)) < 1e-12 && desempate === 'cobertura' && B.p > A.p) return B;
          return A;
        });
        regla = [...regla, [mejor.a, mejor.v]];
        cubiertos = cubiertos.filter((f) => f[mejor.a] === mejor.v);
        const perfecta = cubiertos.every((f) => f.credito === c);
        pasos.push({ c, regla: [...regla], cands, mejor, perfecta, E: E.map((f) => f.i), cubiertos: cubiertos.map((f) => f.i), reglas: [...reglas] });
        if (perfecta || regla.length === ORDEN_ATTR.length) break;
      }
      reglas.push({ c, regla });
      const ids = new Set(cubiertos.map((f) => f.i));
      E = E.filter((f) => !ids.has(f.i));
      pasos[pasos.length - 1].reglasDespues = [...reglas];
    }
  }
  return { pasos, reglas };
}
const txtRegla = (r) => `SI ${r.regla.map(([a, v]) => `${a} = ${v}`).join(' ∧ ')} ENTONCES crédito = ${r.c.toUpperCase()}`;
export function Prism() {
  const [criterio, setCriterio] = useState('s');
  const [desempate, setDesempate] = useState('orden');
  const [porDefecto, setPorDefecto] = useState(false);
  const { pasos, reglas } = useMemo(() => prismTraza({ criterio, desempate, porDefecto }), [criterio, desempate, porDefecto]);
  const frames = useMemo(() => {
    const fr = [{ e: '0', k: 0, fase: 'ini', msg: 'R ← ∅. Se construyen las reglas de una clase cada vez.' }];
    pasos.forEach((q, k) => {
      const previo = pasos[k - 1];
      if (!previo || previo.c !== q.c || previo.reglasDespues) {
        if (!previo || previo.c !== q.c) fr.push({ e: '1.0', k, fase: 'E', msg: `Clase ${q.c.toUpperCase()}: E ← toda la BD.` });
        fr.push({ e: '1.1.0', k, fase: 'nueva', msg: `Nueva regla: SI ∅ ENTONCES crédito = ${q.c.toUpperCase()}.` });
      }
      fr.push({ e: '1.1.1.0', k, fase: 'probar', msg: 'Se prueban todas las condiciones X = v todavía no usadas y se calcula su proporción de positivos.' });
      fr.push({ e: '1.1.1.1', k, fase: 'añadir', msg: `Se añade ${q.mejor.a} = ${q.mejor.v} (${q.mejor.p}/${q.mejor.t}). ${q.perfecta ? 'La regla ya es perfecta.' : 'Aún cubre ejemplos de otra clase: se sigue refinando.'}` });
      if (q.reglasDespues) fr.push({ e: '1.1.2', k, fase: 'guardar', msg: 'Se guarda la regla en R y se quitan de E los ejemplos que cubre.' });
    });
    fr.push({ e: '2', k: pasos.length - 1, fase: 'fin', msg: 'Conjunto de reglas R terminado.' });
    return fr;
  }, [pasos]);
  const pr = usePasos(frames, { intervalo: 1100 });
  const fp = pr.frame;
  const k = fp.k;
  const p0 = pasos[Math.min(k, pasos.length - 1)];
  const antes = fp.fase === 'probar' || fp.fase === 'nueva' || fp.fase === 'E' || fp.fase === 'ini';
  const p = antes ? { ...p0, regla: p0.regla.slice(0, -1), mejor: null, cubiertos: [] } : p0;
  const ref = useRef(null);
  useEffect(() => { if (ref.current) latido(ref.current.querySelectorAll('.resaltado td:first-child')); }, [fp.e, k]);
  const fin = fp.fase === 'fin';
  const lista = fin ? reglas : fp.fase === 'guardar' ? p0.reglasDespues || p0.reglas : p0.reglas;
  return (
    <Marco
      titulo="PRISM sobre los datos de crédito"
      controles={
        <>
          <select value={criterio} onChange={(e) => setCriterio(e.target.value)} aria-label="Criterio"><option value="s">Exactitud s = p/t</option><option value="F">Medida F</option></select>
          <select value={desempate} onChange={(e) => setDesempate(e.target.value)} aria-label="Desempate"><option value="orden">Empates: el primero de la tabla</option><option value="cobertura">Empates: el que cubre más</option></select>
          <label className="fila-control"><input type="checkbox" checked={porDefecto} onChange={(e) => setPorDefecto(e.target.checked)} /> Regla por defecto para NO</label>
        </>
      }
      pie="Con exactitud y «el primero de la tabla» se reproducen las dos reglas de SÍ de la diapositiva. Cambia a «el que cubre más» o a la medida F y verás que la primera regla pasa a ser propietario = sí ∧ gastos = bajos (2/2), más general."
    >
      <Controles p={pr} />
      <p className="marcador">Clase <b>{p.c.toUpperCase()}</b> · regla actual: <b>{txtRegla({ c: p.c, regla: p.regla })}</b></p>
      <Mensaje>{fp.msg}</Mensaje>
      <div className="dos-col" ref={ref}>
        <div className="tabla-env">
          <table className="t">
            <thead><tr><th>Añadir condición</th><th>p / t</th><th>{criterio === 's' ? 's' : 'F'}</th></tr></thead>
            <tbody>
              {p.cands.map((x) => (
                <tr key={`${x.a}${x.v}`} className={x === p.mejor ? 'resaltado' : ''}>
                  <td>{x.a} = {x.v}</td>
                  <td className="num">{x.p}/{x.t}</td>
                  <td className="num">{x.t ? redondear(criterio === 's' ? x.s : x.F, 3) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tabla-env">
          <table className="t">
            <thead><tr><th>crédito</th><th>ingresos</th><th>prop.</th><th>gastos</th></tr></thead>
            <tbody>
              {CREDITO_PRISM.map((f, i) => {
                const enE = p.E.includes(i);
                const cub = p.cubiertos.includes(i);
                return (
                  <tr key={i} style={{ opacity: enE ? 1 : 0.3 }} className={cub ? 'resaltado' : ''}>
                    <td className={f.credito === 'si' ? 'ok' : ''}>{f.credito.toUpperCase()}</td><td>{f.ingresos}</td><td>{f.propietario}</td><td>{f.gastos}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="pie">Atenuadas: ya cubiertas por reglas anteriores (E ← E − EC). Resaltadas: cubiertas por la regla actual.</p>
        </div>
      </div>
      <h4 style={{ marginTop: 12 }}>Reglas obtenidas{fin ? '' : ' hasta ahora'}</h4>
      {lista.length === 0 && <p className="pie">Ninguna todavía: la primera regla se guarda cuando sea perfecta.</p>}
      <ol>{lista.map((r, i) => <li key={i}>{txtRegla(r)}</li>)}{fin && porDefecto && <li>EN OTRO CASO crédito = NO</li>}</ol>
    </Marco>
  );
}

// ───────── Mejores reglas ≠ mejor conjunto ─────────
const REGLAS_SOL = [
  { id: 'R1', x: 0.08, y: 0.45, w: 0.42, h: 0.45, q: 0.95 },
  { id: 'R2', x: 0.18, y: 0.38, w: 0.40, h: 0.45, q: 0.92 },
  { id: 'R3', x: 0.62, y: 0.1, w: 0.3, h: 0.32, q: 0.85 },
  { id: 'R4', x: 0.42, y: 0.05, w: 0.22, h: 0.3, q: 0.6 },
];
export function Solapamiento() {
  const pts = useMemo(() => {
    const r = (() => { let s = 5; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    const out = [];
    for (let i = 0; i < 46; i++) out.push({ x: 0.1 + r() * 0.42, y: 0.47 + r() * 0.42, c: 1 });
    for (let i = 0; i < 16; i++) out.push({ x: 0.64 + r() * 0.26, y: 0.12 + r() * 0.28, c: 1 });
    for (let i = 0; i < 40; i++) { const x = r(), y = r(); if (!(x > 0.08 && x < 0.55 && y > 0.45) && !(x > 0.62 && y < 0.42)) out.push({ x, y, c: 0 }); }
    return out;
  }, []);
  const [act, setAct] = useState(new Set(['R1', 'R2']));
  const dentro = (p, R) => p.x >= R.x && p.x <= R.x + R.w && p.y >= R.y && p.y <= R.y + R.h;
  const activas = REGLAS_SOL.filter((R) => act.has(R.id));
  const pos = pts.filter((p) => p.c);
  const cubiertos = pos.filter((p) => activas.some((R) => dentro(p, R))).length;
  const fp = pts.filter((p) => !p.c && activas.some((R) => dentro(p, R))).length;
  const W = 460, H = 300;
  return (
    <Marco
      titulo="Las mejores reglas no forman el mejor conjunto"
      controles={REGLAS_SOL.map((R) => (
        <button key={R.id} className={`boton ${act.has(R.id) ? 'activo' : ''}`} onClick={() => setAct((s) => { const n = new Set(s); n.has(R.id) ? n.delete(R.id) : n.add(R.id); return n; })} type="button">
          {R.id} (calidad {R.q})
        </button>
      ))}
      pie={`Conjunto actual: cubre ${cubiertos} de ${pos.length} positivos con ${fp} falsos positivos. R2 es la segunda mejor regla por separado, pero se solapa casi entera con R1: R1 + R3 cubre mucho más con dos reglas.`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 560 }}>
        <rect x="0" y="0" width={W} height={H} fill="#fbfcfa" stroke="#c3ccc4" />
        {REGLAS_SOL.map((R) => (
          <g key={R.id} opacity={act.has(R.id) ? 1 : 0.25}>
            <rect x={R.x * W} y={(1 - R.y - R.h) * H} width={R.w * W} height={R.h * H} fill={act.has(R.id) ? 'rgba(47,98,168,0.10)' : 'none'} stroke={COLORES.a} strokeWidth="2" strokeDasharray={act.has(R.id) ? '' : '4 3'} />
            <text x={R.x * W + 6} y={(1 - R.y - R.h) * H + 16} fontFamily="var(--f-titulo)" fontWeight="700" fontSize="13" fill={COLORES.a}>{R.id}</text>
          </g>
        ))}
        {pts.map((p, i) => <circle key={i} cx={p.x * W} cy={(1 - p.y) * H} r={3.6} fill={p.c ? COLORES.a : COLORES.b} opacity={p.c ? 1 : 0.6} />)}
      </svg>
    </Marco>
  );
}

// ───────── Codificación binaria de reglas + cruces ─────────
const VARS = [
  ['Zona geográfica', ['norte', 'centro', 'sur']],
  ['Utilidad de las ferias', ['poca', 'media', 'mucha']],
  ['Importancia operaciones', ['poca', 'media', 'alta']],
  ['Cercanía escaleras', ['sí', 'no']],
];
const reglaDeBits = (bits) => {
  let k = 0;
  const conds = [];
  VARS.forEach(([n, vs]) => {
    const sel = vs.filter((_, j) => bits[k + j]);
    k += vs.length;
    if (sel.length && sel.length < vs.length) conds.push(`${n} = ${sel.join(' o ')}`);
    else if (sel.length === vs.length) conds.push(`${n} = cualquiera`);
  });
  return conds.length ? `SI ${conds.join(' ∧ ')} ENTONCES eficacia = ALTA` : '(regla vacía: ninguna variable interviene)';
};
export function Codificacion() {
  const [bits, setBits] = useState([0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0]);
  const [p2, setP2] = useState([1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1]);
  const [hijo, setHijo] = useState(null);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) latido(ref.current.querySelectorAll('.hijo-bit')); }, [hijo]);
  const entera = (() => {
    let k = 0;
    return VARS.map(([, vs]) => {
      const sel = vs.map((_, j) => bits[k + j]);
      k += vs.length;
      const n1 = sel.filter(Boolean).length;
      return n1 === 0 ? 0 : n1 === 1 ? sel.indexOf(1) + 1 : '?';
    });
  })();
  const Fila = ({ b, set, cls = '' }) => {
    let k = 0;
    return (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {VARS.map(([n, vs]) => {
          const ini = k;
          k += vs.length;
          return (
            <div key={n} style={{ border: '1px solid var(--linea)', borderRadius: 4, padding: '4px 6px' }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--f-titulo)', color: 'var(--tinta-3)' }}>{n}</div>
              <div style={{ display: 'flex', gap: 3 }}>
                {vs.map((v, j) => (
                  <button key={v} className={`boton ${cls}`} style={{ padding: '2px 7px', minWidth: 32, background: b[ini + j] ? 'var(--tinta)' : undefined, color: b[ini + j] ? 'var(--papel)' : undefined }} onClick={set ? () => set(b.map((x, q) => (q === ini + j ? 1 - x : x))) : undefined} title={v} type="button">
                    {b[ini + j]}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--tinta-3)' }}>{vs.join(' · ')}</div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Marco titulo="Codificación binaria (reglas DNF) y cruces de generalización / especialización" pie="Un bit por valor. Varios bits a 1 en una variable = disyunción (DNF); todos a 0 = la variable no interviene. La codificación entera solo puede expresar un valor por variable.">
      <p className="marcador">Padre 1 (pulsa los bits):</p>
      <Fila b={bits} set={setBits} />
      <p className="marcador" style={{ marginTop: 6 }}><b>{reglaDeBits(bits)}</b></p>
      <p className="marcador">Codificación entera equivalente: <b>{entera.join(' ')}</b>{entera.includes('?') && ' (la «?» no se puede representar: hay una disyunción)'}</p>
      <p className="marcador" style={{ marginTop: 12 }}>Padre 2:</p>
      <Fila b={p2} set={setP2} />
      <p className="marcador" style={{ marginTop: 6 }}>{reglaDeBits(p2)}</p>
      <div className="grupo-botones" style={{ margin: '10px 0' }}>
        <button className="boton primario" onClick={() => setHijo({ t: 'generalización (OR bit a bit)', b: bits.map((x, i) => x | p2[i]) })} type="button">Cruce de generalización</button>
        <button className="boton primario" onClick={() => setHijo({ t: 'especialización (AND bit a bit)', b: bits.map((x, i) => x & p2[i]) })} type="button">Cruce de especialización</button>
      </div>
      {hijo && (
        <div ref={ref}>
          <p className="marcador">Hijo por {hijo.t}:</p>
          <Fila b={hijo.b} cls="hijo-bit" />
          <p className="marcador" style={{ marginTop: 6 }}><b>{reglaDeBits(hijo.b)}</b></p>
        </div>
      )}
    </Marco>
  );
}

// ───────── Árbol de expresión (programación genética) ─────────
const CLIENTES = [
  { id: 'ID-1', hijos: 2, salario: 45000, civil: 'casado', ok: 0 },
  { id: 'ID-2', hijos: 0, salario: 30000, civil: 'soltero', ok: 1 },
  { id: 'ID-3', hijos: 1, salario: 40000, civil: 'divorciado', ok: 1 },
  { id: 'ID-4', hijos: 2, salario: 90000, civil: 'casado', ok: 1 },
];
export function ArbolExpresion() {
  const [op, setOp] = useState('Y');
  const [umbral, setUmbral] = useState(80000);
  const [h, setH] = useState(2);
  const arbol = { id: 'y', t: op, hijos: [{ a: '', n: { id: 'c1', t: '=', hijos: [{ a: '', n: { t: 'nº hijos', hoja: true } }, { a: '', n: { t: String(h), hoja: true } }] } }, { a: '', n: { id: 'c2', t: '>', hijos: [{ a: '', n: { t: 'salario', hoja: true } }, { a: '', n: { t: String(umbral), hoja: true } }] } }] };
  const evalua = (c) => { const a = c.hijos === h, b = c.salario > umbral; return op === 'Y' ? a && b : a || b; };
  const aciertos = CLIENTES.filter((c) => (evalua(c) ? 1 : 0) === c.ok).length;
  return (
    <Marco
      titulo="La regla como árbol: SI (nº hijos = 2) Y (salario > 80 000) ENTONCES bueno"
      pie={`Fitness = % de ejemplos bien clasificados = ${aciertos}/${CLIENTES.length} = ${Math.round((aciertos / CLIENTES.length) * 100)} %. (ID-4 es un cliente inventado para que se vea el efecto.) Cambiar un nodo del árbol es justo lo que hacen el cruce y la mutación de la programación genética.`}
    >
      <div className="fila-control">
        <label className="fila-control">Raíz <select value={op} onChange={(e) => setOp(e.target.value)}><option>Y</option><option>O</option></select></label>
        <label className="fila-control">nº hijos = <select value={h} onChange={(e) => setH(Number(e.target.value))}>{[0, 1, 2, 3].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="fila-control">salario &gt; <input type="range" min={20000} max={100000} step={5000} value={umbral} onChange={(e) => setUmbral(Number(e.target.value))} /> {umbral}</label>
      </div>
      <div className="dos-col">
        <ArbolSvg raiz={arbol} sepX={70} sepY={64} animar={false} />
        <table className="t">
          <thead><tr><th>Cliente</th><th>hijos</th><th>salario</th><th>OK real</th><th>Regla</th></tr></thead>
          <tbody>{CLIENTES.map((c) => { const r = evalua(c) ? 1 : 0; return (<tr key={c.id}><td>{c.id}</td><td className="num">{c.hijos}</td><td className="num">{c.salario}</td><td className="num">{c.ok}</td><td className={r === c.ok ? 'ok' : 'mal'}>{r ? 'bueno' : 'malo'}</td></tr>); })}</tbody>
        </table>
      </div>
    </Marco>
  );
}

// ───────── Competición de tokens ─────────
const T_REGLAS = [
  { id: 'R1', F: 0.92, cubre: [1, 3, 10] },
  { id: 'R2', F: 0.85, cubre: [1, 6, 8] },
  { id: 'R3', F: 0.8, cubre: [3, 6] },
  { id: 'R4', F: 0.74, cubre: [7, 9, 12] },
  { id: 'R5', F: 0.6, cubre: [2] },
];
export function Tokens() {
  const [paso, setPaso] = useState(0); // 0 = nada asignado; i = reglas procesadas
  const ref = useRef(null);
  const asign = {};
  const res = T_REGLAS.map((r, i) => {
    if (i >= paso) return { ...r, gana: [], mod: null };
    const gana = r.cubre.filter((e) => !asign[e]);
    gana.forEach((e) => (asign[e] = r.id));
    return { ...r, gana, mod: r.F * (gana.length / r.cubre.length) };
  });
  const libres = [...Array(12).keys()].map((x) => x + 1).filter((e) => !asign[e]);
  useEffect(() => {
    if (!ref.current || paso === 0) return;
    const r = T_REGLAS[paso - 1];
    const tok = [...ref.current.querySelectorAll(`[data-de="${r.id}"]`)];
    anim(tok, { translateY: [-18, 0], opacity: [0, 1], duration: 450, delay: stagger(90), ease: 'outBack(2)' });
  }, [paso]);
  return (
    <Marco
      titulo="Competición de tokens (ejemplo de la diapositiva)"
      controles={
        <>
          <button className="boton primario" onClick={() => setPaso((p) => Math.min(T_REGLAS.length, p + 1))} disabled={paso >= T_REGLAS.length} type="button">Siguiente regla</button>
          <button className="boton" onClick={() => setPaso(0)} type="button">Reiniciar</button>
        </>
      }
      pie={paso < T_REGLAS.length ? 'Las reglas, de mayor a menor fitness, capturan los ejemplos (tokens) que cubren y que siguen libres.' : `R3 se queda sin tokens (E3 y E6 ya eran de R1 y R2): su fitness pasa a 0 y se elimina. Quedan libres ${libres.map((e) => 'E' + e).join(', ')}: se crean reglas de tipo 2 para cubrirlos.`}
    >
      <div ref={ref} className="tabla-env">
        <table className="t">
          <thead><tr><th>Regla</th><th>F</th><th>Cubre</th><th>Tokens conseguidos</th><th>F modificado = F · conseguidos/cubre</th></tr></thead>
          <tbody>
            {res.map((r) => (
              <tr key={r.id} style={{ opacity: r.mod === 0 ? 0.45 : 1 }}>
                <td><b>{r.id}</b></td>
                <td className="num">{r.F}</td>
                <td>{r.cubre.map((e) => 'E' + e).join(' ')}</td>
                <td>{r.gana.map((e) => <span key={e} data-de={r.id} className="chip" style={{ marginRight: 4, background: 'var(--cat-suave)' }}>E{e}</span>)}</td>
                <td className="num">{r.mod == null ? '' : r.mod === 0 ? <span className="mal">0 → se elimina</span> : redondear(r.mod, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="marcador" style={{ marginTop: 8 }}>Tokens libres: {libres.map((e) => <span key={e} className="chip" style={{ marginRight: 4 }}>E{e}</span>)}</p>
    </Marco>
  );
}
