import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, COLORES, escala, Ejes } from './comun.jsx';
import { metricas, minimosCuadrados, redondear, media, entropia, gini } from '../lib/stats.js';
import { anim, dibujar, latido, stagger } from '../lib/anim.js';

// ───────── Métricas de error ─────────
const REALES = [54, 41, 34, 19, 18, 20, 171, 41];
export function Metricas() {
  const [pred, setPred] = useState([50, 45, 30, 25, 20, 22, 150, 38]);
  const m = metricas(REALES, pred);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) latido(ref.current.querySelectorAll('b.v')); }, [pred]);
  const cambiar = (i, v) => setPred((p) => p.map((x, j) => (j === i ? v : x)));
  return (
    <Marco
      titulo="Rendimiento PRP real (CPU) frente a una predicción que tú ajustas"
      controles={
        <>
          <button className="boton" onClick={() => setPred(REALES.map(() => Math.round(media(REALES))))} type="button">Predecir siempre la media</button>
          <button className="boton" onClick={() => setPred([...REALES])} type="button">Predicción perfecta</button>
          <button className="boton" onClick={() => setPred([50, 45, 30, 25, 20, 22, 120, 38])} type="button">Un error grande</button>
        </>
      }
      pie="Fíjate en que un único error grande (la CPU de 171) dispara el ECM mucho más que el EMA, y en que «predecir siempre la media» da EAR = 100 % y r indefinido: el EAR compara tu modelo con ese predictor trivial."
    >
      <div className="dos-col">
        <table className="t">
          <thead><tr><th>Real vᵢ</th><th>Predicho v′ᵢ</th><th>|error|</th></tr></thead>
          <tbody>
            {REALES.map((v, i) => (
              <tr key={i}>
                <td className="num">{v}</td>
                <td><input type="range" min={0} max={220} value={pred[i]} onChange={(e) => cambiar(i, Number(e.target.value))} style={{ width: 110 }} /> {pred[i]}</td>
                <td className="num">{Math.abs(v - pred[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="def" ref={ref}>
          <dt>ECM</dt><dd><b className="v">{redondear(m.ecm, 2)}</b></dd>
          <dt>ECME (raíz)</dt><dd><b className="v">{redondear(m.ecme, 2)}</b></dd>
          <dt>EMA</dt><dd><b className="v">{redondear(m.ema, 2)}</b></dd>
          <dt>EAR</dt><dd><b className="v">{redondear(m.ear * 100, 1)} %</b></dd>
          <dt>r</dt><dd><b className="v">{isFinite(m.r) && m.r !== 0 ? redondear(m.r, 3) : 'indefinido'}</b></dd>
        </dl>
      </div>
    </Marco>
  );
}

// ───────── Regresión lineal y exponencial (puntos arrastrables) ─────────
const PUNTOS_LIN = [[1, 2.1], [2, 2.9], [3, 4.2], [4, 4.8], [5, 6.1], [6, 6.8], [7, 8.3], [8, 8.9]];
const PUNTOS_EXP = [[1, 9.5], [2, 6.3], [3, 4.1], [4, 2.9], [5, 1.9], [6, 1.35], [7, 0.9], [8, 0.65]];
export function RegresionLineal() {
  const [tipo, setTipo] = useState('lineal');
  const [pts, setPts] = useState(PUNTOS_LIN.map(([x, y]) => ({ x, y })));
  const [arr, setArr] = useState(null);
  const svg = useRef(null);
  const W = 520, H = 320, m = { l: 36, r: 12, t: 12, b: 30 };
  const sx = escala(0, 9, m.l, W - m.r), sy = escala(0, 11, H - m.b, m.t);
  const ajLin = minimosCuadrados(pts);
  const ajExp = useMemo(() => {
    const v = pts.filter((p) => p.y > 0);
    const a = minimosCuadrados(v.map((p) => ({ x: p.x, y: Math.log(p.y) })));
    return { A: Math.exp(a.a), b: a.b, aStar: a.a };
  }, [pts]);
  const f = tipo === 'lineal' ? (x) => ajLin.a + ajLin.b * x : (x) => ajExp.A * Math.exp(ajExp.b * x);
  const curva = Array.from({ length: 91 }, (_, i) => { const x = i / 10; const y = Math.max(-1, Math.min(12, f(x))); return `${i ? 'L' : 'M'}${sx(x)},${sy(y)}`; }).join('');
  const M = metricas(pts.map((p) => p.y), pts.map((p) => f(p.x)));
  const mover = (e) => {
    if (arr == null) return;
    const r = svg.current.getBoundingClientRect();
    const y = ((H - m.b - ((e.clientY - r.top) / r.height) * H) / (H - m.b - m.t)) * 11;
    setPts((P) => P.map((p, i) => (i === arr ? { ...p, y: Math.max(0.2, Math.min(10.8, y)) } : p)));
  };
  const ref = useRef(null);
  useEffect(() => { if (ref.current) dibujar([ref.current], { dur: 700 }); }, [tipo]);
  return (
    <Marco
      titulo="Arrastra los puntos arriba y abajo"
      controles={
        <>
          <button className={`boton ${tipo === 'lineal' ? 'activo' : ''}`} onClick={() => setTipo('lineal')} type="button">y = a + b·x</button>
          <button className={`boton ${tipo === 'exp' ? 'activo' : ''}`} onClick={() => setTipo('exp')} type="button">y = a·e^(bx)</button>
          <button className="boton" onClick={() => setPts(PUNTOS_LIN.map(([x, y]) => ({ x, y })))} type="button">Datos rectos</button>
          <button className="boton" onClick={() => setPts(PUNTOS_EXP.map(([x, y]) => ({ x, y })))} type="button">Datos curvos</button>
        </>
      }
      pie={tipo === 'lineal'
        ? <>Mínimos cuadrados: x̄ = {redondear(ajLin.mx, 2)}, ȳ = {redondear(ajLin.my, 2)}, b = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)² = <b>{redondear(ajLin.b, 3)}</b>, a = ȳ − b·x̄ = <b>{redondear(ajLin.a, 3)}</b>. EMA {redondear(M.ema, 3)} · r {redondear(M.r, 3)}. Con los datos curvos la recta es «no tan apropiada».</>
        : <>Se ajusta ln y = a* + b·x con regresión lineal: a* = {redondear(ajExp.aStar, 3)}, b = <b>{redondear(ajExp.b, 3)}</b>, y se deshace a = e^(a*) = <b>{redondear(ajExp.A, 3)}</b>. EMA {redondear(M.ema, 3)} · r {redondear(M.r, 3)}.</>}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} onPointerMove={mover} onPointerUp={() => setArr(null)} onPointerLeave={() => setArr(null)} style={{ touchAction: 'none' }}>
        <Ejes x0={0} x1={9} y0={0} y1={11} W={W} H={H} m={m} ticksX={9} ticksY={11} etqX="x" etqY="y" />
        {pts.map((p, i) => <line key={`r${i}`} x1={sx(p.x)} x2={sx(p.x)} y1={sy(p.y)} y2={sy(Math.max(-1, Math.min(12, f(p.x))))} stroke={COLORES.b} strokeDasharray="3 3" />)}
        <path ref={ref} d={curva} fill="none" stroke={COLORES.a} strokeWidth="2.5" />
        {pts.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={arr === i ? 9 : 7} fill={COLORES.tinta} stroke="#fff" strokeWidth="2" style={{ cursor: 'ns-resize' }} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setArr(i); }} />
        ))}
      </svg>
    </Marco>
  );
}

// ───────── SDR: elegir el corte de un árbol de regresión ─────────
const SDR_DATOS = [[1, 12], [2, 14], [3, 13], [4, 15], [5, 14], [6, 31], [7, 29], [8, 33], [9, 30], [10, 46], [11, 44], [12, 47]];
const sdv = (zs) => { if (zs.length < 2) return 0; const m = media(zs); return Math.sqrt(zs.reduce((s, z) => s + (z - m) ** 2, 0) / zs.length); };
export function Sdr() {
  const ys = SDR_DATOS.map((d) => d[1]);
  const cortes = SDR_DATOS.slice(0, -1).map(([x], i) => {
    const t = x + 0.5;
    const A = SDR_DATOS.filter((d) => d[0] <= t).map((d) => d[1]);
    const B = SDR_DATOS.filter((d) => d[0] > t).map((d) => d[1]);
    return { t, A, B, sdr: sdv(ys) - (A.length / ys.length) * sdv(A) - (B.length / ys.length) * sdv(B) };
  });
  const [i, setI] = useState(4);
  const c = cortes[i];
  const mejor = cortes.reduce((a, b) => (b.sdr > a.sdr ? b : a));
  const ref = useRef(null);
  useEffect(() => { if (ref.current) anim(ref.current.querySelectorAll('.media'), { opacity: [0, 1], duration: 300 }); }, [i]);
  const W = 520, H = 250, m = { l: 34, r: 10, t: 10, b: 28 };
  const sx = escala(0, 13, m.l, W - m.r), sy = escala(0, 52, H - m.b, m.t);
  const mA = media(c.A), mB = media(c.B);
  return (
    <Marco
      titulo="Elegir el corte que más reduce la desviación típica"
      controles={<button className="boton" onClick={() => setI(cortes.indexOf(mejor))} type="button">Ir al mejor corte</button>}
      pie={<>sd(T) = {redondear(sdv(ys), 2)}. Con x ≤ {c.t}: sd(T₁) = {redondear(sdv(c.A), 2)} ({c.A.length} ej.), sd(T₂) = {redondear(sdv(c.B), 2)} ({c.B.length} ej.) → SDR = <b>{redondear(c.sdr, 3)}</b>. El mejor corte es x ≤ {mejor.t} (SDR {redondear(mejor.sdr, 3)}). Cada hoja predice la media de sus ejemplos (líneas).</>}
    >
      <label className="fila-control">Corte <input type="range" min={0} max={cortes.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} /> x ≤ {c.t}</label>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`}>
        <Ejes x0={0} x1={13} y0={0} y1={52} W={W} H={H} m={m} ticksX={13} ticksY={4} />
        {cortes.map((k, j) => <rect key={j} x={sx(k.t) - 5} y={H - m.b - (k.sdr / mejor.sdr) * 50} width={10} height={(k.sdr / mejor.sdr) * 50} fill={j === i ? COLORES.d : '#e4e9e2'} />)}
        <line x1={sx(c.t)} x2={sx(c.t)} y1={m.t} y2={H - m.b} stroke={COLORES.d} strokeWidth="2" strokeDasharray="4 3" />
        <line className="media" x1={sx(0.5)} x2={sx(c.t)} y1={sy(mA)} y2={sy(mA)} stroke={COLORES.a} strokeWidth="3" />
        <line className="media" x1={sx(c.t)} x2={sx(12.5)} y1={sy(mB)} y2={sy(mB)} stroke={COLORES.a} strokeWidth="3" />
        {SDR_DATOS.map(([x, y], j) => <circle key={j} cx={sx(x)} cy={sy(y)} r={5} fill={COLORES.tinta} />)}
      </svg>
    </Marco>
  );
}

// ───────── Sistema difuso: fuzzificación, inferencia, defuzzificación ─────────
const tri = (x, a, b, c) => (x <= a || x >= c ? 0 : x <= b ? (x - a) / (b - a) : (c - x) / (c - b));
const ETQ = { B: [-0.5, 0, 0.5], M: [0, 0.5, 1], A: [0.5, 1, 1.5] };
const ETQ_N = { B: 'Bajo', M: 'Medio', A: 'Alto' };
const BASE = { B: { B: 'B', M: 'B', A: 'M' }, M: { B: 'B', M: 'M', A: 'A' }, A: { B: 'M', M: 'A', A: 'A' } }; // [X1][X2] → Y
export function Difuso() {
  const [x1, setX1] = useState(0.72);
  const [x2, setX2] = useState(0.3);
  const mu = (x) => Object.fromEntries(Object.entries(ETQ).map(([k, [a, b, c]]) => [k, tri(x, a, b, c)]));
  const m1 = mu(x1), m2 = mu(x2);
  const reglas = [];
  Object.keys(ETQ).forEach((a) => Object.keys(ETQ).forEach((b) => {
    const g = Math.min(m1[a], m2[b]);
    if (g > 0) reglas.push({ a, b, y: BASE[a][b], g });
  }));
  const corte = { B: 0, M: 0, A: 0 };
  reglas.forEach((r) => (corte[r.y] = Math.max(corte[r.y], r.g)));
  const agregada = (y) => Math.max(...Object.keys(ETQ).map((k) => Math.min(corte[k], tri(y, ...ETQ[k]))));
  let num = 0, den = 0;
  for (let y = 0; y <= 1.0001; y += 0.005) { const v = agregada(y); num += y * v; den += v; }
  const salida = den ? num / den : 0;
  const ref = useRef(null);
  useEffect(() => { if (ref.current) latido(ref.current.querySelectorAll('.salida-y')); }, [Math.round(salida * 100)]); // eslint-disable-line
  const W = 300, H = 120, m = { l: 10, r: 10, t: 10, b: 20 };
  const sx = escala(0, 1, m.l, W - m.r), sy = escala(0, 1.05, H - m.b, m.t);
  const curvas = (x) => Object.entries(ETQ).map(([k, p]) => (
    <g key={k}>
      <path d={Array.from({ length: 101 }, (_, i) => `${i ? 'L' : 'M'}${sx(i / 100)},${sy(tri(i / 100, ...p))}`).join('')} fill="none" stroke="#4a5a51" strokeWidth="1.5" />
      <text x={sx(p[1])} y={m.t + 4} textAnchor="middle" fontSize="11" fontFamily="var(--f-titulo)" fill="#4a5a51">{k}</text>
    </g>
  ));
  return (
    <Marco
      titulo="SBRD de dos entradas: SI X₁ es … y X₂ es … ENTONCES Y es …"
      pie="Fuzzificación: cada entrada nítida se convierte en grados de pertenencia a Bajo/Medio/Alto. Inferencia: cada regla se activa con el mínimo de sus grados (Y lógico) y recorta su etiqueta de salida; se unen con el máximo. Defuzzificación: el centro de gravedad del área resultante da el número final."
    >
      <div className="fila-control">
        <label className="fila-control">X₁ <input type="range" min={0} max={1} step={0.01} value={x1} onChange={(e) => setX1(Number(e.target.value))} /> {x1}</label>
        <label className="fila-control">X₂ <input type="range" min={0} max={1} step={0.01} value={x2} onChange={(e) => setX2(Number(e.target.value))} /> {x2}</label>
      </div>
      <div className="dos-col" ref={ref}>
        <div>
          <p className="marcador">1 · Fuzzificación</p>
          {[[x1, m1, 'X₁'], [x2, m2, 'X₂']].map(([x, mm, n]) => (
            <svg key={n} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 320 }}>
              {curvas()}
              <line x1={sx(x)} x2={sx(x)} y1={m.t} y2={H - m.b} stroke={COLORES.a} strokeWidth="2" />
              <text x={W - m.r} y={H - 4} textAnchor="end" fontSize="11" fontFamily="var(--f-titulo)" fill={COLORES.a}>{n}: {Object.entries(mm).filter(([, v]) => v > 0).map(([k, v]) => `${k} ${redondear(v, 2)}`).join(' · ')}</text>
            </svg>
          ))}
        </div>
        <div>
          <p className="marcador">2 · Base de reglas (filas X₁, columnas X₂) y reglas activadas</p>
          <table className="t" style={{ maxWidth: 300 }}>
            <thead><tr><th>X₁ \ X₂</th>{Object.keys(ETQ).map((b) => <th key={b}>{b}</th>)}</tr></thead>
            <tbody>
              {Object.keys(ETQ).map((a) => (
                <tr key={a}><th>{a}</th>{Object.keys(ETQ).map((b) => { const r = reglas.find((q) => q.a === a && q.b === b); return <td key={b} className={r ? 'resaltado' : ''}>{BASE[a][b]}{r ? ` (${redondear(r.g, 2)})` : ''}</td>; })}</tr>
              ))}
            </tbody>
          </table>
          <p className="marcador" style={{ marginTop: 8 }}>3 · Salida agregada y defuzzificación</p>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 320 }}>
            <path d={`M${sx(0)},${sy(0)} ` + Array.from({ length: 101 }, (_, i) => `L${sx(i / 100)},${sy(agregada(i / 100))}`).join('') + ` L${sx(1)},${sy(0)} Z`} fill="rgba(168,112,15,0.35)" stroke={COLORES.d} />
            {curvas()}
            <line className="salida-y" x1={sx(salida)} x2={sx(salida)} y1={m.t} y2={H - m.b} stroke={COLORES.b} strokeWidth="2.5" style={{ transformOrigin: `${sx(salida)}px ${H - m.b}px` }} />
            <text x={W - m.r} y={H - 4} textAnchor="end" fontSize="12" fontFamily="var(--f-titulo)" fontWeight="700" fill={COLORES.b}>Y = {redondear(salida, 3)}</text>
          </svg>
        </div>
      </div>
    </Marco>
  );
}

export function Pertenencia() {
  const [x, setX] = useState(0.62);
  const W = 420, H = 140, m = { l: 12, r: 12, t: 14, b: 24 };
  const sx = escala(0, 1, m.l, W - m.r), sy = escala(0, 1.05, H - m.b, m.t);
  const g = Object.fromEntries(Object.entries(ETQ).map(([k, p]) => [k, tri(x, ...p)]));
  return (
    <Marco titulo="Un mismo valor, varias etiquetas" pie={`x = ${x} es ${Object.entries(g).filter(([, v]) => v > 0).map(([k, v]) => `${redondear(v, 2)} ${ETQ_N[k]}`).join(' y ')}. En lógica clásica sería solo una de ellas.`}>
      <label className="fila-control">x <input type="range" min={0} max={1} step={0.01} value={x} onChange={(e) => setX(Number(e.target.value))} /> {x}</label>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 520 }}>
        {Object.entries(ETQ).map(([k, p], i) => (
          <g key={k}>
            <path d={Array.from({ length: 101 }, (_, j) => `${j ? 'L' : 'M'}${sx(j / 100)},${sy(tri(j / 100, ...p))}`).join('')} fill="none" stroke={[COLORES.a, COLORES.d, COLORES.b][i]} strokeWidth="2.4" />
            <text x={sx(p[1])} y={m.t - 2} textAnchor="middle" fontSize="12" fontFamily="var(--f-titulo)" fill={[COLORES.a, COLORES.d, COLORES.b][i]}>{ETQ_N[k]}</text>
            {g[k] > 0 && <circle cx={sx(x)} cy={sy(g[k])} r="5" fill={[COLORES.a, COLORES.d, COLORES.b][i]} />}
          </g>
        ))}
        <line x1={sx(x)} x2={sx(x)} y1={m.t} y2={H - m.b} stroke="#1f2b25" strokeDasharray="3 3" />
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="#a9b5ab" />
      </svg>
    </Marco>
  );
}

// ───────── Curva de entropía y Gini ─────────
export function CurvaEntropia() {
  const [p, setP] = useState(0.3);
  const W = 420, H = 220, m = { l: 34, r: 12, t: 12, b: 30 };
  const sx = escala(0, 1, m.l, W - m.r), sy = escala(0, 1.05, H - m.b, m.t);
  const camino = (f) => Array.from({ length: 101 }, (_, i) => `${i ? 'L' : 'M'}${sx(i / 100)},${sy(f(i / 100))}`).join('');
  const H2 = (q) => entropia([q, 1 - q]);
  const G = (q) => gini([q, 1 - q]);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) dibujar(ref.current.querySelectorAll('path.c'), { dur: 900, paso: 250 }); }, []);
  return (
    <Marco titulo="Impureza de un nodo con dos clases" pie={`Con ${Math.round(p * 100)} % de positivos: entropía ${redondear(H2(p), 3)} bits, Gini ${redondear(G(p), 3)}. Ambas valen 0 en un nodo puro y son máximas al 50 %.`}>
      <label className="fila-control">Proporción de positivos <input type="range" min={0} max={1} step={0.01} value={p} onChange={(e) => setP(Number(e.target.value))} /> {p}</label>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 520 }}>
        <Ejes x0={0} x1={1} y0={0} y1={1} W={W} H={H} m={m} etqX="p (positivos)" ticksY={4} />
        <path className="c" d={camino(H2)} fill="none" stroke={COLORES.a} strokeWidth="2.5" />
        <path className="c" d={camino(G)} fill="none" stroke={COLORES.d} strokeWidth="2.5" />
        <circle cx={sx(p)} cy={sy(H2(p))} r="5.5" fill={COLORES.a} />
        <circle cx={sx(p)} cy={sy(G(p))} r="5.5" fill={COLORES.d} />
        <text x={sx(0.5)} y={sy(1) - 4} textAnchor="middle" fontSize="12" fontFamily="var(--f-titulo)" fill={COLORES.a}>entropía</text>
        <text x={sx(0.5)} y={sy(0.5) - 6} textAnchor="middle" fontSize="12" fontFamily="var(--f-titulo)" fill={COLORES.d}>Gini</text>
      </svg>
    </Marco>
  );
}

// ───────── Sobreajuste: error vs tamaño del árbol ─────────
export function Sobreajuste() {
  const [t, setT] = useState(8);
  const tr = (k) => 0.42 * Math.exp(-k / 6) + 0.01;
  const te = (k) => 0.42 * Math.exp(-k / 6) + 0.11 + 0.0045 * Math.max(0, k - 9) ** 1.3;
  const mejor = Array.from({ length: 40 }, (_, k) => k + 1).reduce((a, b) => (te(b) < te(a) ? b : a));
  const W = 420, H = 220, m = { l: 34, r: 12, t: 12, b: 30 };
  const sx = escala(1, 40, m.l, W - m.r), sy = escala(0, 0.5, H - m.b, m.t);
  const camino = (f) => Array.from({ length: 40 }, (_, i) => `${i ? 'L' : 'M'}${sx(i + 1)},${sy(f(i + 1))}`).join('');
  return (
    <Marco titulo="Efecto del tamaño del árbol" pie={t > mejor + 3 ? `Con ${t} nodos el árbol memoriza: el error de entrenamiento sigue bajando pero el de test sube. Hay que podar hacia ~${mejor} nodos.` : t < mejor - 3 ? 'Árbol demasiado pequeño: falta capacidad (los dos errores son altos).' : `Zona buena: alrededor de ${mejor} nodos el error de test es mínimo.`}>
      <label className="fila-control">Nodos del árbol <input type="range" min={1} max={40} value={t} onChange={(e) => setT(Number(e.target.value))} /> {t}</label>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 520 }}>
        <Ejes x0={1} x1={40} y0={0} y1={0.5} W={W} H={H} m={m} etqX="tamaño del árbol" ticksY={5} />
        <path d={camino(tr)} fill="none" stroke={COLORES.a} strokeWidth="2.5" />
        <path d={camino(te)} fill="none" stroke={COLORES.b} strokeWidth="2.5" />
        <line x1={sx(t)} x2={sx(t)} y1={m.t} y2={H - m.b} stroke="#1f2b25" strokeDasharray="3 3" />
        <text x={W - m.r} y={sy(tr(40)) - 6} textAnchor="end" fontSize="12" fontFamily="var(--f-titulo)" fill={COLORES.a}>entrenamiento</text>
        <text x={W - m.r} y={sy(te(40)) - 6} textAnchor="end" fontSize="12" fontFamily="var(--f-titulo)" fill={COLORES.b}>test</text>
      </svg>
    </Marco>
  );
}
