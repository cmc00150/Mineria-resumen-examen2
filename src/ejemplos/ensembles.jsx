// Comités de clasificadores paso a paso: bagging (muestras bootstrap independientes) y boosting (pesos secuenciales).
// El diagrama muestra TODAS las conexiones (datos → versiones → clasificadores → agregación) y las ilumina a medida
// que avanza el ejemplo; el gráfico de dispersión muestra los datos con los que se entrena cada clasificador.
import { useMemo, useState } from 'react';
import { Marco, COLORES, escala } from './comun.jsx';
import { lunas, semilla } from './vecinos.js';
import { redondear } from '../lib/stats.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

const PUNTOS = lunas(36, 0.34, 11).map((p) => ({ ...p, y2: p.c ? 1 : -1 }));
const N = PUNTOS.length;
const Y0 = Math.min(...PUNTOS.map((p) => p.y)) - 0.4;
const Y1 = Math.max(...PUNTOS.map((p) => p.y)) + 0.4;

// ───────── clasificador débil: un solo corte ─────────
function tocon(w) {
  let mejor = null;
  ['x', 'y'].forEach((eje) => {
    const vs = [...new Set(PUNTOS.map((p) => p[eje]))].sort((a, b) => a - b);
    for (let k = 0; k < vs.length - 1; k++) {
      const t = (vs[k] + vs[k + 1]) / 2;
      [1, -1].forEach((s) => {
        const e = PUNTOS.reduce((acc, p, i) => acc + ((p[eje] <= t ? s : -s) !== p.y2 ? w[i] : 0), 0);
        if (!mejor || e < mejor.e - 1e-12) mejor = { eje, t, s, e };
      });
    }
  });
  return mejor;
}
const h = (st, p) => (p[st.eje] <= st.t ? st.s : -st.s);
const acierto = (f) => PUNTOS.filter((p) => f(p) === p.y2).length / N;
const voto = (sts, alfas) => (p) => (sts.reduce((s, st, i) => s + (alfas ? alfas[i] : 1) * h(st, p), 0) >= 0 ? 1 : -1);

const MAPAS = {
  padre: { datos: '0', version: '1.0', pesos: '1.0', aprender: '1.1', error: '1.1', comprobar: '1.1', alfa: '1.1', predecir: '2', agregar: '2' },
  bagging: { datos: '0', version: '1.0', aprender: '1.1', predecir: '2.0', agregar: '3' },
  adaboost: { datos: '0', version: '1.0', aprender: '1.0', error: '1.1', comprobar: '1.2', alfa: '1.3', pesos: '1.4', predecir: '2', agregar: '2' },
};

// ───────── fotogramas ─────────
function generar(modo, T, mapa) {
  const fr = [];
  const sts = [];
  const alfas = [];
  const uni = PUNTOS.map(() => 1 / N);
  const push = (fase, msg, extra = {}) => fr.push({ fase, e: mapa[fase], msg, sts: sts.map((s) => ({ ...s })), alfas: [...alfas], ...extra });
  push('datos', `${N} ejemplos de dos clases. Cada clasificador será un «tocón»: un único corte sobre un atributo.`, { r: -1, pesos: uni.map(() => 1), tipo: 'cuenta' });
  let D = uni;
  for (let r = 0; r < T; r++) {
    if (modo === 'bagging') {
      const rnd = semilla(40 + r * 7);
      const cuenta = Array(N).fill(0);
      for (let k = 0; k < N; k++) cuenta[Math.floor(rnd() * N)]++;
      push('version', `Muestra bootstrap ${r + 1}: ${N} ejemplos sacados con reemplazamiento (${cuenta.filter((c) => c === 0).length} no han salido, otros se repiten).`, { r, pesos: cuenta, tipo: 'cuenta' });
      const st = tocon(cuenta.map((c) => c / N));
      sts.push(st);
      const a = acierto((p) => h(st, p));
      push('aprender', `C${r + 1} aprende con su muestra: corte ${st.eje} ≤ ${redondear(st.t, 2)}. Acierto sobre todos los datos: ${redondear(a * 100, 0)} %.`, { r, pesos: cuenta, tipo: 'cuenta', stump: st, reg: false });
    } else {
      push('version', r === 0 ? 'Al principio todos los ejemplos pesan lo mismo: Dₜ(i) = 1/m.' : `Distribución D${r + 1}: los ejemplos que falló el clasificador anterior pesan más (puntos más grandes).`, { r, pesos: D.map((d) => d * N), tipo: 'peso' });
      const st = tocon(D);
      const eps = Math.max(st.e, 1e-6);
      const alfa = 0.5 * Math.log((1 - eps) / eps);
      push('aprender', `h${r + 1} se entrena con la distribución D${r + 1}: corte ${st.eje} ≤ ${redondear(st.t, 2)}.`, { r, pesos: D.map((d) => d * N), tipo: 'peso', stump: st, reg: false });
      push('error', `Error ponderado ε${r + 1} = ${redondear(eps, 3)} (suma de los pesos de los ejemplos que falla, rodeados).`, { r, pesos: D.map((d) => d * N), tipo: 'peso', stump: st, fallos: true, eps });
      push('comprobar', `ε${r + 1} = ${redondear(eps, 3)} ≤ 0,5 → se continúa (si fuera > 0,5 se pararía).`, { r, pesos: D.map((d) => d * N), tipo: 'peso', stump: st, fallos: true, eps });
      sts.push(st);
      alfas.push(alfa);
      push('alfa', `α${r + 1} = ½·ln((1 − ε)/ε) = ${redondear(alfa, 3)}: el voto de h${r + 1} pesa ${redondear(alfa, 2)}.`, { r, pesos: D.map((d) => d * N), tipo: 'peso', stump: st, fallos: true, eps, alfa });
      const nuevo = D.map((d, i) => d * Math.exp(-alfa * PUNTOS[i].y2 * h(st, PUNTOS[i])));
      const Z = nuevo.reduce((a, b) => a + b, 0);
      D = nuevo.map((v) => v / Z);
      push('pesos', `Se actualizan los pesos: ×e^(−α) a los acertados, ×e^(+α) a los fallados, y se normaliza (÷Zₜ).`, { r, pesos: D.map((d) => d * N), tipo: 'peso', stump: st, reg: true });
    }
  }
  if (modo === 'bagging') {
    for (let k = 1; k <= T; k++) {
      const a = acierto(voto(sts.slice(0, k)));
      push(k === T ? 'agregar' : 'predecir', `${k} ${k === 1 ? 'clasificador vota' : 'clasificadores votan'} por mayoría: acierto ${redondear(a * 100, 0)} %.`, { r: T - 1, pesos: PUNTOS.map(() => 1), tipo: 'cuenta', reg: true, k });
    }
    push('agregar', `Comité final: voto mayoritario de ${T} tocones → ${redondear(acierto(voto(sts)) * 100, 0)} % de acierto (un solo tocón con todos los datos: ${redondear(acierto((p) => h(tocon(uni), p)) * 100, 0)} %).`, { r: T - 1, pesos: PUNTOS.map(() => 1), tipo: 'cuenta', reg: true, k: T, final: true });
  } else {
    push('agregar', `H(x) = signo(Σ αₜ·hₜ(x)) → ${redondear(acierto(voto(sts, alfas)) * 100, 0)} % de acierto (un solo tocón: ${redondear(acierto((p) => h(tocon(uni), p)) * 100, 0)} %).`, { r: T - 1, pesos: PUNTOS.map(() => 1), tipo: 'peso', reg: true, k: T, final: true });
  }
  return fr;
}

// ───────── diagrama completo ─────────
function Diagrama({ modo, T, f }) {
  const W = 640, sp = T > 1 ? 560 / (T - 1) : 0, bw = Math.min(74, sp - 10 || 74);
  const xs = Array.from({ length: T }, (_, i) => 40 + i * sp);
  const fase = f.fase;
  const r = f.r;
  const verV = (i) => i < r || (i === r && ['version', 'pesos', 'aprender', 'error', 'comprobar', 'alfa'].includes(fase)) || (i === r && fase === 'pesos');
  const verC = (i) => i < r || (i === r && ['aprender', 'error', 'comprobar', 'alfa', 'pesos'].includes(fase)) || ['predecir', 'agregar'].includes(fase) || (modo === 'boosting' && i < r);
  const verA = ['predecir', 'agregar'].includes(fase);
  const actV = (i) => i === r && ['version', 'pesos'].includes(fase);
  const actC = (i) => i === r && ['aprender', 'error', 'comprobar', 'alfa'].includes(fase);
  const actA = ['predecir', 'agregar'].includes(fase);
  const lin = (on) => ({ stroke: on ? '#1f2b25' : '#c3ccc4', strokeWidth: on ? 1.8 : 1.2, strokeDasharray: on ? '' : '4 4', fill: 'none' });
  const caja = (on, act) => ({ fill: on ? '#fbfcfa' : '#f2f4f1', stroke: act ? COLORES.a : on ? '#4a5a51' : '#c3ccc4', strokeWidth: act ? 3 : 1.4 });
  return (
    <svg viewBox={`0 0 ${W} 214`} role="img" aria-label="Estructura del comité" style={{ width: '100%', maxWidth: 760 }}>
      <defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#4a5a51" /></marker></defs>
      <rect x={230} y={4} width={180} height={28} rx="5" fill="#e4e9e2" stroke="#4a5a51" strokeWidth="1.4" />
      <text x={320} y={23} textAnchor="middle" fontFamily="var(--f-titulo)" fontWeight="700" fontSize="14">Datos de entrenamiento</text>
      {xs.map((x, i) => (
        <g key={i}>
          <path d={`M320,32 L${x},64`} {...lin(verV(i))} markerEnd="url(#fa)" />
          <rect x={x - bw / 2} y={64} width={bw} height={28} rx="5" {...caja(verV(i), actV(i))} />
          <text x={x} y={83} textAnchor="middle" fontFamily="var(--f-titulo)" fontSize="12" fill={verV(i) ? '#1f2b25' : '#8a968e'}>{modo === 'bagging' ? `muestra ${i + 1}` : `D${i + 1}`}</text>
          <path d={`M${x},92 L${x},118`} {...lin(verC(i))} markerEnd="url(#fa)" />
          <circle cx={x} cy={134} r={16} {...caja(verC(i), actC(i))} fill={verC(i) ? COLORES.tinta : '#f2f4f1'} />
          <text x={x} y={139} textAnchor="middle" fontFamily="var(--f-titulo)" fontWeight="700" fontSize="13" fill={verC(i) ? '#fff' : '#8a968e'}>{modo === 'bagging' ? 'C' : 'h'}{i + 1}</text>
          {modo === 'boosting' && verC(i) && f.alfas[i] != null && <text x={x} y={162} textAnchor="middle" fontSize="11" fontFamily="var(--f-titulo)" fill={COLORES.a}>α={redondear(f.alfas[i], 2)}</text>}
          <path d={`M${x},${modo === 'boosting' ? 166 : 150} L320,184`} {...lin(verA)} markerEnd="url(#fa)" />
          {modo === 'boosting' && i < T - 1 && (
            <path d={`M${x + 14},128 C${x + sp * 0.35},112 ${x + sp * 0.65},100 ${x + sp - bw / 2 + 4},88`} {...lin(verC(i) && (i < r || ['pesos'].includes(fase)))} stroke={verC(i) && (i < r || fase === 'pesos') ? COLORES.b : '#c3ccc4'} markerEnd="url(#fa)" />
          )}
        </g>
      ))}
      <rect x={210} y={184} width={220} height={26} rx="5" fill={actA ? COLORES.a : verA ? '#2f62a8' : '#c3ccc4'} stroke={actA ? '#1f2b25' : 'none'} strokeWidth="2.5" />
      <text x={320} y={202} textAnchor="middle" fontFamily="var(--f-titulo)" fontWeight="700" fontSize="13.5" fill="#fff">{modo === 'bagging' ? 'Voto mayoritario' : 'sign(Σ αₜ hₜ(x))'}</text>
      {modo === 'boosting' && <text x={620} y={56} textAnchor="end" fontSize="11" fontFamily="var(--f-titulo)" fill={COLORES.b}>flecha roja: los pesos pasan al siguiente</text>}
    </svg>
  );
}

// ───────── dispersión ─────────
function Dispersion({ f, modo }) {
  const Wd = 420, Hd = 250;
  const sx = escala(0, 10, 10, Wd - 10), sy = escala(Y0, Y1, Hd - 10, 10);
  const sts = f.sts;
  const k = f.k ?? sts.length;
  const celdas = [];
  if (f.reg && sts.length) {
    const sub = sts.slice(0, k);
    const al = modo === 'boosting' ? f.alfas.slice(0, k) : null;
    const H = voto(sub, al);
    for (let i = 0; i < 42; i++) for (let j = 0; j < 26; j++) {
      const p = { x: (i + 0.5) * (10 / 42), y: Y0 + (j + 0.5) * ((Y1 - Y0) / 26) };
      celdas.push({ ...p, c: H(p) });
    }
  }
  const st = f.stump;
  const falla = (p) => f.fallos && st && h(st, p) !== p.y2;
  return (
    <svg viewBox={`0 0 ${Wd} ${Hd}`} role="img" aria-label="Datos y clasificadores" style={{ width: '100%', maxWidth: 480, background: '#fbfcfa', border: '1px solid var(--linea)', borderRadius: 6 }}>
      {celdas.map((c, i) => <rect key={i} x={sx(c.x - 0.12)} y={sy(c.y + (Y1 - Y0) / 52)} width={(Wd - 20) / 42 + 0.6} height={(Hd - 20) / 26 + 0.6} fill={c.c > 0 ? '#dce6f3' : '#f5e0df'} />)}
      {st && !f.reg && (
        st.eje === 'x'
          ? <><rect x={st.s > 0 ? 0 : sx(st.t)} y={0} width={st.s > 0 ? sx(st.t) : Wd - sx(st.t)} height={Hd} fill="rgba(47,98,168,0.10)" /><line x1={sx(st.t)} x2={sx(st.t)} y1={0} y2={Hd} stroke="#1f2b25" strokeWidth="2" /></>
          : <><rect x={0} y={st.s > 0 ? sy(st.t) : 0} width={Wd} height={st.s > 0 ? Hd - sy(st.t) : sy(st.t)} fill="rgba(47,98,168,0.10)" /><line y1={sy(st.t)} y2={sy(st.t)} x1={0} x2={Wd} stroke="#1f2b25" strokeWidth="2" /></>
      )}
      {PUNTOS.map((p, i) => {
        const w = f.pesos[i];
        const col = p.c ? COLORES.b : COLORES.a;
        const fuera = f.tipo === 'cuenta' && w === 0 && f.fase !== 'datos' && !f.reg;
        const r = f.tipo === 'peso' ? 3.5 + Math.sqrt(w) * 3.4 : 4.5 + (f.reg ? 0 : Math.max(0, w - 1) * 1.8);
        return (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={r} fill={fuera ? '#fff' : col} stroke={fuera ? '#8a968e' : falla(p) ? '#1f2b25' : '#fff'} strokeWidth={falla(p) ? 2.6 : fuera ? 1.6 : 1} strokeDasharray={fuera ? '3 2' : ''} opacity={fuera ? 1 : 0.92} />
            {f.tipo === 'cuenta' && w > 1 && !f.reg && <text x={sx(p.x)} y={sy(p.y) + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">{w}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function Comite({ ini, fijo, mapaClave }) {
  const [modo, setModo] = useState(ini);
  const [T, setT] = useState(5);
  const frames = useMemo(() => generar(modo, T, MAPAS[mapaClave]), [modo, T, mapaClave]);
  const p = usePasos(frames, { intervalo: 900 });
  const f = p.frame;
  const filas = f.sts.map((s, i) => ({ s, a: f.alfas[i] }));
  return (
    <Marco
      titulo={modo === 'bagging' ? 'Bagging: muestras bootstrap independientes y voto' : 'Boosting (AdaBoost): pesos que se pasan de un clasificador al siguiente'}
      controles={
        <>
          {!fijo && ['bagging', 'boosting'].map((m) => <button key={m} className={`boton ${modo === m ? 'activo' : ''}`} onClick={() => setModo(m)} type="button">{m === 'bagging' ? 'Bagging' : 'Boosting'}</button>)}
          <label className="fila-control" style={{ margin: 0 }}>nº de clasificadores T <input type="range" min={3} max={8} value={T} onChange={(e) => setT(Number(e.target.value))} /> {T}</label>
        </>
      }
      pie={modo === 'bagging'
        ? 'Bagging: cada clasificador ve una muestra bootstrap distinta (puntos repetidos con su número, y puntos que no han salido, huecos). Se entrenan a la vez y votan por mayoría; reduce la varianza.'
        : 'Boosting: los clasificadores se entrenan uno tras otro; los ejemplos mal clasificados (rodeados) pesan más (puntos más grandes) en el siguiente. Voto ponderado por α; reduce sobre todo el sesgo.'}
    >
      <Controles p={p} />
      <Diagrama modo={modo} T={T} f={f} />
      <div className="comite-fila">
        <Dispersion f={f} modo={modo} />
        <div className="comite-tabla">
          <table className="t">
            <thead><tr><th></th><th>corte</th><th>{modo === 'bagging' ? 'acierto' : 'α'}</th></tr></thead>
            <tbody>
              {filas.map((x, i) => (
                <tr key={i}>
                  <td><b>{modo === 'bagging' ? 'C' : 'h'}{i + 1}</b></td>
                  <td>{x.s.eje} ≤ {redondear(x.s.t, 2)}</td>
                  <td className="num">{modo === 'bagging' ? `${redondear(acierto((q) => h(x.s, q)) * 100, 0)} %` : redondear(x.a ?? 0, 2)}</td>
                </tr>
              ))}
              {!filas.length && <tr><td colSpan={3}><small>aún no hay clasificadores</small></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

export const ComiteGeneral = () => <Comite ini="bagging" mapaClave="padre" />;
export const ComiteBoosting = () => <Comite ini="boosting" fijo mapaClave="adaboost" />;
export const ComiteBagging = () => <Comite ini="bagging" fijo mapaClave="bagging" />;
