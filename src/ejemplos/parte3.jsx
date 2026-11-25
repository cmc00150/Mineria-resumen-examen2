import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, COLORES, escala, Ejes } from './comun.jsx';
import { TENIS_NUM } from './datos.js';
import { media, desv, normal, redondear, semilla } from '../lib/stats.js';
import { anim, contar, dibujar, latido, stagger, linea } from '../lib/anim.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

// ───────── Estructura de Naïve Bayes ─────────
export function EstrellaNB() {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) dibujar(ref.current.querySelectorAll('line'), { dur: 600, paso: 120 }); }, []);
  const attrs = ['X₁', 'X₂', 'X₃', '…', 'Xₙ'];
  return (
    <Marco titulo="La clase es el único padre de cada atributo" pie="No hay flechas entre atributos: conocida la clase, cada atributo es independiente de los demás. Por eso la conjunta se factoriza en un producto.">
      <svg ref={ref} viewBox="0 0 460 170" style={{ maxWidth: 480 }}>
        {attrs.map((a, i) => <line key={a} x1={230} y1={42} x2={50 + i * 90} y2={128} stroke="#4a5a51" strokeWidth="1.8" markerEnd="url(#fl)" />)}
        <defs><marker id="fl" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#4a5a51" /></marker></defs>
        <ellipse cx="230" cy="28" rx="44" ry="20" fill={COLORES.a} />
        <text x="230" y="33" textAnchor="middle" fill="#fff" fontFamily="var(--f-titulo)" fontWeight="700">Clase Y</text>
        {attrs.map((a, i) => (
          <g key={a}>
            <ellipse cx={50 + i * 90} cy={145} rx="30" ry="17" fill="#fbfcfa" stroke="#4a5a51" />
            <text x={50 + i * 90} y={150} textAnchor="middle" fontFamily="var(--f-titulo)">{a}</text>
          </g>
        ))}
      </svg>
    </Marco>
  );
}

// ───────── Naïve Bayes con el tenis ─────────
export function NaiveBayes() {
  const [x, setX] = useState({ outlook: 'sunny', windy: 'false', temp: 87, hum: 90 });
  const [laplace, setLaplace] = useState(false);
  const clases = ['no', 'yes'];
  const est = useMemo(() => clases.map((c) => {
    const f = TENIS_NUM.filter((d) => d.play === c);
    return { c, n: f.length, f, mt: media(f.map((d) => d.temp)), st: desv(f.map((d) => d.temp)), mh: media(f.map((d) => d.hum)), sh: desv(f.map((d) => d.hum)) };
  }), []); // eslint-disable-line
  const calc = est.map((e) => {
    const prior = e.n / TENIS_NUM.length;
    const cuenta = (a, v, L) => {
      const k = e.f.filter((d) => d[a] === v).length;
      return laplace ? (k + 1) / (e.n + L) : k / e.n;
    };
    const po = cuenta('outlook', x.outlook, 3);
    const pw = cuenta('windy', x.windy, 2);
    const nt = normal(x.temp, e.mt, e.st);
    const nh = normal(x.hum, e.mh, e.sh);
    return { ...e, prior, po, pw, nt, nh, prod: prior * po * pw * nt * nh };
  });
  const tot = calc.reduce((s, c) => s + c.prod, 0);
  const [mostr, setMostr] = useState([0.5, 0.5]);
  const frames = useMemo(() => {
    const fr = [{ e: '0', ci: -1, k: -1, msg: 'Nuevo caso x. Para cada clase se parte de su prior y se multiplica por la probabilidad de cada atributo.' }];
    calc.forEach((c, ci) => {
      fr.push({ e: '1.0', ci, k: 0, msg: `Clase ${c.c === 'yes' ? 'SÍ' : 'NO'}: se empieza con P(${c.c === 'yes' ? 'sí' : 'no'}) = ${c.n}/${TENIS_NUM.length} = ${redondear(c.prior, 3)}.` });
      const fs = [c.po, c.pw, c.nt, c.nh];
      const nom = [`P(${x.outlook} | ${c.c})`, `P(windy=${x.windy} | ${c.c})`, `N(${x.temp}; μ, σ)`, `N(${x.hum}; μ, σ)`];
      let run = c.prior;
      fs.forEach((v, k) => {
        run *= v;
        fr.push({ e: '1.1', ci, k: k + 1, msg: `× ${nom[k]} = ${v < 0.001 && v > 0 ? v.toExponential(2) : redondear(v, 4)} → producto parcial ${run ? run.toExponential(3) : 0}.` });
      });
    });
    const mx = calc.reduce((a, b) => (b.prod > a.prod ? b : a));
    fr.push({ e: '2', ci: 2, k: 5, norm: true, msg: `Normalizar: cada producto entre la suma (${tot.toExponential(3)}) → ${calc.map((c) => `${c.c === 'yes' ? 'SÍ' : 'NO'} ${redondear(tot ? c.prod / tot : 0, 3)}`).join(' · ')}.` });
    fr.push({ e: '3', ci: 2, k: 5, norm: true, msg: `Clase con mayor valor (MAP): «${mx.c === 'yes' ? 'SÍ' : 'NO'}».` });
    return fr;
  }, [x, laplace]); // eslint-disable-line
  const p = usePasos(frames, { intervalo: 900 });
  const fr = p.frame;
  const vis = (ci, fila) => fr.ci > ci || (fr.ci === ci && fr.k >= fila);
  const objetivo = calc.map((c) => (tot && fr.norm ? c.prod / tot : 0.5));
  useEffect(() => {
    const desde = [...mostr];
    const a = contar(0, 1, (t) => setMostr(desde.map((d, i) => d + (objetivo[i] - d) * t)), 500);
    return () => a && a.pause && a.pause();
  }, [objetivo[0], fr.norm]); // eslint-disable-line
  const W = 420, H = 150, m = { l: 30, r: 10, t: 10, b: 26 };
  const sx = escala(55, 95, m.l, W - m.r);
  const maxN = Math.max(...est.map((e) => normal(e.mt, e.mt, e.st)));
  const sy = escala(0, maxN * 1.1, H - m.b, m.t);
  const curva = (e) => Array.from({ length: 81 }, (_, i) => { const t = 55 + i * 0.5; return `${i ? 'L' : 'M'}${sx(t)},${sy(normal(t, e.mt, e.st))}`; }).join('');
  const f = (v) => (v < 0.001 ? v.toExponential(2) : redondear(v, 4));
  return (
    <Marco
      titulo="¿Se juega? x = (outlook, temperatura, humedad, viento)"
      controles={<label className="fila-control"><input type="checkbox" checked={laplace} onChange={(e) => setLaplace(e.target.checked)} /> Corrección de Laplace</label>}
      pie={`Con (sunny, 87, 90, false) y sin Laplace sale P(no) ≈ 0,82 y P(sí) ≈ 0,18. La diapositiva da 0,8 / 0,2 porque multiplica mal el producto de «no» y usa μ = 86,6 para la humedad (la media real es 86,2). Prueba overcast: P(overcast | no) = 0/5 anula el producto de «no» sin Laplace; con Laplace pasa a (0+1)/(5+3).`}
    >
      <div className="fila-control">
        <label className="fila-control">outlook <select value={x.outlook} onChange={(e) => setX({ ...x, outlook: e.target.value })}>{['sunny', 'overcast', 'rain'].map((o) => <option key={o}>{o}</option>)}</select></label>
        <label className="fila-control">windy <select value={x.windy} onChange={(e) => setX({ ...x, windy: e.target.value })}>{['false', 'true'].map((o) => <option key={o}>{o}</option>)}</select></label>
        <label className="fila-control">temp <input type="range" min={60} max={92} value={x.temp} onChange={(e) => setX({ ...x, temp: Number(e.target.value) })} /> {x.temp}</label>
        <label className="fila-control">hum <input type="range" min={60} max={100} value={x.hum} onChange={(e) => setX({ ...x, hum: Number(e.target.value) })} /> {x.hum}</label>
      </div>
      <Controles p={p} />
      <Mensaje>{fr.msg}</Mensaje>
      <div className="dos-col">
        <div className="tabla-env">
          <table className="t">
            <thead><tr><th></th>{calc.map((c) => <th key={c.c}>{c.c === 'yes' ? 'SÍ' : 'NO'}</th>)}</tr></thead>
            <tbody>
              <tr><td>P(clase)</td>{calc.map((c, i) => <td key={c.c} className="num">{vis(i, 0) ? `${c.n}/14 = ${redondear(c.prior, 3)}` : '·'}</td>)}</tr>
              <tr><td>P({x.outlook} | clase)</td>{calc.map((c, i) => <td key={c.c} className="num">{vis(i, 1) ? redondear(c.po, 3) : '·'}</td>)}</tr>
              <tr><td>P(windy={x.windy} | clase)</td>{calc.map((c, i) => <td key={c.c} className="num">{vis(i, 2) ? redondear(c.pw, 3) : '·'}</td>)}</tr>
              <tr><td>N({x.temp}; μ, σ)</td>{calc.map((c, i) => <td key={c.c} className="num">{vis(i, 3) ? <>{f(c.nt)}<br /><small>μ={redondear(c.mt, 2)} σ={redondear(c.st, 2)}</small></> : '·'}</td>)}</tr>
              <tr><td>N({x.hum}; μ, σ)</td>{calc.map((c, i) => <td key={c.c} className="num">{vis(i, 4) ? <>{f(c.nh)}<br /><small>μ={redondear(c.mh, 2)} σ={redondear(c.sh, 2)}</small></> : '·'}</td>)}</tr>
              <tr><td><b>Producto</b></td>{calc.map((c, i) => <td key={c.c} className="num"><b>{vis(i, 4) ? (c.prod ? c.prod.toExponential(3) : 0) : '·'}</b></td>)}</tr>
            </tbody>
          </table>
        </div>
        <div>
          <p className="marcador">Normalizado</p>
          {calc.map((c, i) => (
            <div key={c.c} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
              <span style={{ width: 28, fontFamily: 'var(--f-titulo)' }}>{c.c === 'yes' ? 'SÍ' : 'NO'}</span>
              <div style={{ flex: 1, background: 'var(--papel-2)', height: 18, borderRadius: 3 }}>
                <div style={{ width: `${mostr[i] * 100}%`, height: '100%', background: c.c === 'yes' ? COLORES.c : COLORES.b, borderRadius: 3 }} />
              </div>
              <b style={{ width: 52, textAlign: 'right' }}>{redondear(mostr[i], 3)}</b>
            </div>
          ))}
          <p className="marcador" style={{ marginTop: 10 }}>Densidad de la temperatura por clase</p>
          <svg viewBox={`0 0 ${W} ${H}`}>
            <Ejes x0={55} x1={95} y0={0} y1={maxN * 1.1} W={W} H={H} m={m} ticksY={0} ticksX={4} />
            {calc.map((e) => <path key={e.c} d={curva(e)} fill="none" stroke={e.c === 'yes' ? COLORES.c : COLORES.b} strokeWidth="2" />)}
            <line x1={sx(x.temp)} x2={sx(x.temp)} y1={m.t} y2={H - m.b} stroke="#1f2b25" strokeDasharray="3 3" />
          </svg>
        </div>
      </div>
    </Marco>
  );
}

// ───────── Funciones de activación ─────────
const ACTS = {
  escalon: { n: 'Escalón', f: (v) => (v >= 0 ? 1 : -1) },
  lineal: { n: 'Lineal', f: (v) => v },
  tramos: { n: 'Lineal a tramos', f: (v) => Math.max(-1, Math.min(1, v)) },
  sigmoide: { n: 'Sigmoidal', f: (v) => 1 / (1 + Math.exp(-v)) },
  radial: { n: 'Base radial', f: (v) => Math.exp(-(v ** 2)) },
};
export function Activaciones() {
  const [k, setK] = useState('sigmoide');
  const [net, setNet] = useState(1);
  const [theta, setTheta] = useState(0);
  const W = 420, H = 200, m = { l: 34, r: 10, t: 10, b: 24 };
  const sx = escala(-4, 4, m.l, W - m.r), sy = escala(-1.4, 1.4, H - m.b, m.t);
  const F = ACTS[k].f;
  const d = Array.from({ length: 161 }, (_, i) => { const v = -4 + i * 0.05; const y = Math.max(-1.4, Math.min(1.4, F(v - theta))); return `${i ? 'L' : 'M'}${sx(v)},${sy(y)}`; }).join('');
  const y = F(net - theta);
  return (
    <Marco
      titulo="y = f(Net − θ)"
      controles={Object.entries(ACTS).map(([c, a]) => <button key={c} className={`boton ${k === c ? 'activo' : ''}`} onClick={() => setK(c)} type="button">{a.n}</button>)}
      pie={`Con Net = ${net} y θ = ${theta}: y = ${redondear(y, 3)}. El umbral θ desplaza la curva a la derecha.`}
    >
      <div className="fila-control">
        <label className="fila-control">Net <input type="range" min={-4} max={4} step={0.1} value={net} onChange={(e) => setNet(Number(e.target.value))} /> {net}</label>
        <label className="fila-control">θ <input type="range" min={-2} max={2} step={0.1} value={theta} onChange={(e) => setTheta(Number(e.target.value))} /> {theta}</label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 520 }}>
        <Ejes x0={-4} x1={4} y0={-1.4} y1={1.4} W={W} H={H} m={m} ticksX={8} ticksY={4} />
        <line x1={sx(-4)} x2={sx(4)} y1={sy(0)} y2={sy(0)} stroke="#d9e0d7" />
        <path d={d} fill="none" stroke={COLORES.a} strokeWidth="2.4" />
        <circle cx={sx(net)} cy={sy(Math.max(-1.4, Math.min(1.4, y)))} r="6" fill={COLORES.b} />
      </svg>
    </Marco>
  );
}

// ───────── Perceptrón: OR de la diapositiva ─────────
const FUNCS = { OR: [0, 1, 1, 1], AND: [0, 0, 0, 1], XOR: [0, 1, 1, 0] };
const ENTRADAS = [[0, 0], [0, 1], [1, 0], [1, 1]];
const r1 = (v) => Math.round(v * 1000) / 1000;
export function Perceptron() {
  const [fn, setFn] = useState('OR');
  const a = 0.2, th = 0.5;
  const ref = useRef(null);
  const { filas, frames } = useMemo(() => {
    const l = [];
    let ww = [0.1, 0.3];
    const fr = [{ e: '0', n: 0, parte: 0, msg: 'Pesos iniciales W₁ = 0,1 y W₂ = 0,3. Se recorren los 4 ejemplos una y otra vez.' }];
    for (let it = 0; it < 12; it++) {
      for (let i = 0; i < 4; i++) {
        const [x1, x2] = ENTRADAS[i];
        const z = FUNCS[fn][i];
        const s = r1(ww[0] * x1 + ww[1] * x2);
        const y = s > th ? 1 : 0;
        const D = z - y;
        const nw = [r1(ww[0] + a * D * x1), r1(ww[1] + a * D * x2)];
        l.push({ it: it + 1, x1, x2, z, w1: ww[0], w2: ww[1], y, D, nw });
        const n = l.length;
        fr.push({ e: '1.0.0', n, parte: 1, msg: `Ejemplo (${x1}, ${x2}), Z = ${z}: ${ww[0]}·${x1} + ${ww[1]}·${x2} = ${s} ${s > th ? '>' : '≤'} 0,5 → Y = ${y}.` });
        fr.push({ e: '1.0.1', n, parte: 2, msg: `D = Z − Y = ${z} − ${y} = ${D}${D ? ' → hay error, hay que corregir.' : ' → acierta, los pesos no cambian.'}` });
        fr.push({ e: '1.0.2', n, parte: 3, msg: D ? `Wᵢ ← Wᵢ + 0,2·${D}·Xᵢ → W₁ = ${nw[0]}, W₂ = ${nw[1]}.` : `Sin cambios: W₁ = ${nw[0]}, W₂ = ${nw[1]}.`, w: nw });
        ww = nw;
      }
      if (l.slice(-4).every((r) => r.D === 0)) {
        fr.push({ e: '2', n: l.length, parte: 3, fin: true, msg: `Una iteración completa sin cambios → convergido con W₁ = ${ww[0]}, W₂ = ${ww[1]}.` });
        break;
      }
      if (it === 11) fr.push({ e: '2', n: l.length, parte: 3, fin: true, msg: 'Tras 12 iteraciones los pesos siguen cambiando: no converge (XOR no es linealmente separable).' });
    }
    return { filas: l, frames: fr };
  }, [fn]);
  const p = usePasos(frames, { intervalo: 750 });
  const fp = p.frame;
  const log = filas.slice(0, fp.n);
  const w = fp.parte >= 3 && log.length ? log[log.length - 1].nw : log.length ? [log[log.length - 1].w1, log[log.length - 1].w2] : [0.1, 0.3];
  const reset = (f = fn) => { setFn(f); };
  useEffect(() => { if (ref.current) anim(ref.current.querySelector('.frontera'), { opacity: [0.2, 1], duration: 400 }); }, [w[0], w[1]]);
  const convergido = fp.fin && fp.msg.startsWith('Una iteración');
  const W = 260, H = 240, sx = escala(-0.3, 1.3, 20, W - 10), sy = escala(-0.3, 1.3, H - 20, 10);
  // frontera: w1 x1 + w2 x2 = 0.5
  const pf = [];
  if (Math.abs(w[1]) > 1e-9) { pf.push([-0.3, (th - w[0] * -0.3) / w[1]], [1.3, (th - w[0] * 1.3) / w[1]]); }
  else if (Math.abs(w[0]) > 1e-9) { pf.push([th / w[0], -0.3], [th / w[0], 1.3]); }
  return (
    <Marco
      titulo={`Una neurona aprende ${fn} · α = 0,2 · umbral 0,5`}
      controles={
        <>
          {Object.keys(FUNCS).map((f) => <button key={f} className={`boton ${fn === f ? 'activo' : ''}`} onClick={() => reset(f)} type="button">{f}</button>)}
        </>
      }
      pie={convergido ? `Convergido: una iteración entera sin errores. Pesos finales ${w[0]} y ${w[1]}.` : fn === 'XOR' ? 'XOR no es linealmente separable: ninguna recta separa los 1 de los 0, así que los pesos nunca se estabilizan. Hace falta una capa oculta (MLP).' : 'Pulsa «Siguiente ejemplo» y mira cómo D = Z − Y corrige los pesos solo cuando la salida es incorrecta.'}
    >
      <Controles p={p} />
      <p className="marcador">W₁ = <b>{w[0]}</b> · W₂ = <b>{w[1]}</b></p>
      <Mensaje>{fp.msg}</Mensaje>
      <div className="dos-col">
        <div className="tabla-env" style={{ maxHeight: 280, overflow: 'auto' }}>
          <table className="t">
            <thead><tr><th>It.</th><th>X₁</th><th>X₂</th><th>Z</th><th>W₁</th><th>W₂</th><th>Y</th><th>D</th><th>W₁′</th><th>W₂′</th></tr></thead>
            <tbody>
              {log.map((r, i) => (
                <tr key={i} className={i === log.length - 1 ? 'resaltado' : ''}>
                  <td>{r.it}</td><td>{r.x1}</td><td>{r.x2}</td><td>{r.z}</td><td>{r.w1}</td><td>{r.w2}</td>
                  <td>{i < log.length - 1 || fp.parte >= 1 ? r.y : '·'}</td><td className={r.D ? 'mal' : ''}>{i < log.length - 1 || fp.parte >= 2 ? r.D : '·'}</td>
                  <td>{i < log.length - 1 || fp.parte >= 3 ? r.nw[0] : '·'}</td><td>{i < log.length - 1 || fp.parte >= 3 ? r.nw[1] : '·'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 300 }}>
          <defs><clipPath id="clip-perc"><rect x="0" y="0" width={W} height={H} /></clipPath></defs>
          <rect x="0" y="0" width={W} height={H} fill="#fbfcfa" />
          {pf.length === 2 && <line clipPath="url(#clip-perc)" className="frontera" x1={sx(pf[0][0])} y1={sy(pf[0][1])} x2={sx(pf[1][0])} y2={sy(pf[1][1])} stroke={COLORES.a} strokeWidth="2.5" />}
          {ENTRADAS.map(([p, q], i) => (
            <g key={i}>
              <circle cx={sx(p)} cy={sy(q)} r="11" fill={FUNCS[fn][i] ? COLORES.c : '#fbfcfa'} stroke="#1f2b25" strokeWidth="1.6" />
              <text x={sx(p)} y={sy(q) + 4} textAnchor="middle" fontSize="11" fontFamily="var(--f-titulo)" fill={FUNCS[fn][i] ? '#fff' : '#1f2b25'}>{FUNCS[fn][i]}</text>
            </g>
          ))}
          <text x="8" y="16" fontSize="11" fontFamily="var(--f-titulo)" fill="#4a5a51">recta: W₁x₁ + W₂x₂ = 0,5</text>
        </svg>
      </div>
    </Marco>
  );
}

// ───────── kNN ─────────
export function Knn() {
  const datos = useMemo(() => {
    const r = semilla(9);
    return Array.from({ length: 46 }, () => {
      const x = r() * 10, y = r() * 6;
      const c = y > 2.2 + 0.35 * x + (r() - 0.5) * 1.6 ? 1 : 0;
      return { x, y, c };
    });
  }, []);
  const [q, setQ] = useState({ x: 5, y: 3.2 });
  const [k, setK] = useState(5);
  const [pond, setPond] = useState(false);
  const ref = useRef(null);
  const ord = datos.map((p) => ({ p, d: Math.hypot(p.x - q.x, p.y - q.y) })).sort((a, b) => a.d - b.d).slice(0, k);
  const votos = [0, 0];
  ord.forEach(({ p, d }) => (votos[p.c] += pond ? 1 / Math.max(d, 1e-6) : 1));
  const pred = votos[1] > votos[0] ? 1 : 0;
  const W = 520, H = 320;
  const sx = escala(0, 10, 12, W - 12), sy = escala(0, 6, H - 12, 12);
  useEffect(() => { if (ref.current) dibujar(ref.current.querySelectorAll('line.vec'), { dur: 300, paso: 40 }); }, [q.x, q.y, k]);
  const click = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W, py = ((e.clientY - r.top) / r.height) * H;
    setQ({ x: ((px - 12) / (W - 24)) * 10, y: ((H - 12 - py) / (H - 24)) * 6 });
  };
  return (
    <Marco
      titulo="Pulsa en el plano para clasificar un punto nuevo"
      controles={
        <>
          <label className="fila-control">k <input type="range" min={1} max={15} step={2} value={k} onChange={(e) => setK(Number(e.target.value))} /> {k}</label>
          <label className="fila-control"><input type="checkbox" checked={pond} onChange={(e) => setPond(e.target.checked)} /> Voto ponderado por 1/d</label>
        </>
      }
      pie={<>Votos: azul {redondear(votos[0], 2)} · rojo {redondear(votos[1], 2)} → clase <b style={{ color: pred ? COLORES.b : COLORES.a }}>{pred ? 'roja' : 'azul'}</b>. En regresión se haría lo mismo, pero devolviendo la media (o la media ponderada) de los valores de los vecinos.</>}
    >
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} onClick={click} style={{ cursor: 'crosshair' }}>
        <rect width={W} height={H} fill="#fbfcfa" />
        <circle cx={sx(q.x)} cy={sy(q.y)} r={(ord[ord.length - 1]?.d || 0) * ((W - 24) / 10)} fill="none" stroke="#a9b5ab" strokeDasharray="4 4" />
        {ord.map(({ p }, i) => <line key={`${q.x}-${i}`} className="vec" x1={sx(q.x)} y1={sy(q.y)} x2={sx(p.x)} y2={sy(p.y)} stroke="#4a5a51" strokeWidth="1.3" />)}
        {datos.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill={p.c ? COLORES.b : COLORES.a} />)}
        <rect x={sx(q.x) - 7} y={sy(q.y) - 7} width="14" height="14" fill={pred ? COLORES.b : COLORES.a} stroke="#1f2b25" strokeWidth="2" transform={`rotate(45 ${sx(q.x)} ${sy(q.y)})`} />
      </svg>
    </Marco>
  );
}

// ───────── Bagging vs boosting: esquema animado ─────────
export function BaggingBoosting() {
  const [modo, setModo] = useState('bagging');
  const ref = useRef(null);
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    const tl = linea();
    const sets = g.querySelectorAll('.conj');
    const mods = g.querySelectorAll('.mod');
    const fl = g.querySelectorAll('.fl');
    g.querySelectorAll('.conj, .mod, .fl, .agg').forEach((el) => (el.style.opacity = 0));
    if (modo === 'bagging') {
      tl.add(sets, { opacity: [0, 1], translateY: [-10, 0], delay: stagger(60) })
        .add(mods, { opacity: [0, 1], scale: [0.6, 1], delay: stagger(60) })
        .add(fl, { opacity: [0, 1], delay: stagger(40) })
        .add(g.querySelectorAll('.agg'), { opacity: [0, 1], scale: [0.8, 1] });
    } else {
      [0, 1, 2, 3].forEach((i) => {
        tl.add(sets[i], { opacity: [0, 1], translateY: [-10, 0], duration: 300 })
          .add(mods[i], { opacity: [0, 1], scale: [0.6, 1], duration: 300 })
          .add(fl[i], { opacity: [0, 1], duration: 200 });
      });
      tl.add(g.querySelectorAll('.agg'), { opacity: [0, 1], scale: [0.8, 1] });
    }
    return () => tl.pause && tl.pause();
  }, [modo]);
  const pesos = [[1, 1, 1, 1, 1, 1], [1, 2.2, 1, 1, 2.6, 1], [1, 1.6, 2.8, 1, 1.4, 1], [2.4, 1, 1.4, 1, 1, 2.2]];
  return (
    <Marco
      titulo="Cómo se construye el comité"
      controles={['bagging', 'boosting'].map((m) => <button key={m} className={`boton ${modo === m ? 'activo' : ''}`} onClick={() => setModo(m)} type="button">{m === 'bagging' ? 'Bagging' : 'Boosting'}</button>)}
      pie={modo === 'bagging' ? 'Bagging: cada clasificador recibe una muestra bootstrap distinta (puntos repetidos y otros que faltan) y se entrenan a la vez, de forma independiente. Se vota por mayoría.' : 'Boosting: los clasificadores se entrenan uno tras otro; los ejemplos mal clasificados por el anterior pesan más (puntos más grandes) en el siguiente. Se vota ponderando por α.'}
    >
      <svg ref={ref} viewBox="0 0 640 250">
        <rect x="250" y="6" width="140" height="34" rx="4" fill="#e4e9e2" stroke="#4a5a51" />
        <text x="320" y="28" textAnchor="middle" fontFamily="var(--f-titulo)" fontWeight="700">Datos</text>
        {[0, 1, 2, 3].map((i) => {
          const x = 40 + i * 150;
          return (
            <g key={i}>
              <g className="conj" style={{ transformOrigin: `${x + 55}px 80px`, transformBox: 'view-box' }}>
                <rect x={x} y={62} width={110} height={40} rx="4" fill="#fbfcfa" stroke="#a9b5ab" />
                {pesos[i].map((p, j) => {
                  const r = modo === 'boosting' ? 2.5 * p : 3.2;
                  const falta = modo === 'bagging' && (i + j) % 4 === 0;
                  return <circle key={j} cx={x + 14 + j * 16} cy={82} r={r} fill={j % 2 ? COLORES.b : COLORES.a} opacity={falta ? 0.15 : 1} />;
                })}
              </g>
              <g className="mod" style={{ transformOrigin: `${x + 55}px 150px`, transformBox: 'view-box' }}>
                <rect x={x + 20} y={132} width={70} height={36} rx="18" fill={COLORES.tinta} />
                <text x={x + 55} y={155} textAnchor="middle" fill="#fff" fontFamily="var(--f-titulo)">C{i + 1}{modo === 'boosting' ? ` α${i + 1}` : ''}</text>
              </g>
              <path className="fl" d={`M${x + 55},170 C${x + 55},200 320,190 320,212`} fill="none" stroke="#4a5a51" strokeWidth="1.5" />
              {modo === 'boosting' && i < 3 && <path className="fl" d={`M${x + 92},150 L${x + 168},150`} stroke={COLORES.b} strokeWidth="2" markerEnd="url(#fb)" />}
            </g>
          );
        })}
        <defs><marker id="fb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={COLORES.b} /></marker></defs>
        <g className="agg" style={{ transformOrigin: '320px 230px', transformBox: 'view-box' }}>
          <rect x="230" y="212" width="180" height="34" rx="4" fill={COLORES.a} />
          <text x="320" y="234" textAnchor="middle" fill="#fff" fontFamily="var(--f-titulo)" fontWeight="700">{modo === 'bagging' ? 'Voto mayoritario' : 'sign(Σ αₜ hₜ(x))'}</text>
        </g>
      </svg>
    </Marco>
  );
}

// ───────── AdaBoost con tocones ─────────
const AB_PTS = [
  { x: 1.2, y: 2.0, c: 1 }, { x: 1.8, y: 6.5, c: 1 }, { x: 3.4, y: 8.2, c: 1 }, { x: 4.4, y: 6.8, c: 1 }, { x: 6.9, y: 8.6, c: 1 },
  { x: 3.0, y: 3.2, c: -1 }, { x: 5.5, y: 4.4, c: -1 }, { x: 8.2, y: 7.0, c: -1 }, { x: 8.6, y: 3.2, c: -1 }, { x: 6.4, y: 1.4, c: -1 },
];
function tocon(D) {
  let mejor = null;
  ['x', 'y'].forEach((eje) => {
    const vs = [...new Set(AB_PTS.map((p) => p[eje]))].sort((a, b) => a - b);
    const cortes = [vs[0] - 0.5, ...vs.slice(0, -1).map((v, i) => (v + vs[i + 1]) / 2), vs[vs.length - 1] + 0.5];
    cortes.forEach((t) => [1, -1].forEach((s) => {
      const h = (p) => (p[eje] <= t ? s : -s);
      const e = AB_PTS.reduce((acc, p, i) => acc + (h(p) !== p.c ? D[i] : 0), 0);
      if (!mejor || e < mejor.e - 1e-12) mejor = { eje, t, s, e, h };
    }));
  });
  return mejor;
}
export function AdaBoost() {
  const rondas = useMemo(() => {
    let D = AB_PTS.map(() => 1 / AB_PTS.length);
    const out = [];
    for (let t = 0; t < 4; t++) {
      const h = tocon(D);
      const eps = Math.max(h.e, 1e-6);
      const alfa = 0.5 * Math.log((1 - eps) / eps);
      const nuevo = D.map((d, i) => d * Math.exp(-alfa * AB_PTS[i].c * h.h(AB_PTS[i])));
      const Z = nuevo.reduce((a, b) => a + b, 0);
      out.push({ D, h, eps, alfa, Dsig: nuevo.map((v) => v / Z) });
      D = nuevo.map((v) => v / Z);
    }
    return out;
  }, []);
  const [t, setT] = useState(0);
  const [verFinal, setVerFinal] = useState(false);
  const ref = useRef(null);
  const R = rondas[t];
  const H = (p) => Math.sign(rondas.slice(0, t + 1).reduce((s, r) => s + r.alfa * r.h.h(p), 0)) || 1;
  const errFinal = AB_PTS.filter((p) => H(p) !== p.c).length;
  useEffect(() => {
    if (!ref.current) return;
    anim(ref.current.querySelectorAll('circle.pt'), { r: (el) => 4 + Math.sqrt(Number(el.dataset.w)) * 26, duration: 600, ease: 'outBack(1.6)' });
  }, [t]);
  const W = 360, Hh = 300, sx = escala(0, 10, 10, W - 10), sy = escala(0, 10, Hh - 10, 10);
  const celdas = [];
  if (verFinal) for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const p = { x: (i + 0.5) / 4, y: (j + 0.5) / 4 }; celdas.push({ ...p, c: H(p) }); }
  return (
    <Marco
      titulo="AdaBoost con clasificadores débiles de un solo corte"
      controles={
        <>
          {rondas.map((_, i) => <button key={i} className={`boton ${t === i ? 'activo' : ''}`} onClick={() => setT(i)} type="button">Ronda {i + 1}</button>)}
          <label className="fila-control"><input type="checkbox" checked={verFinal} onChange={(e) => setVerFinal(e.target.checked)} /> Ver H(x) con {t + 1} {t ? 'rondas' : 'ronda'}</label>
        </>
      }
      pie={<>Ronda {t + 1}: el corte {R.h.eje} ≤ {redondear(R.h.t, 2)} tiene error ponderado ε = <b>{redondear(R.eps, 3)}</b> → α = ½·ln((1−ε)/ε) = <b>{redondear(R.alfa, 3)}</b>. El tamaño de cada punto es su peso Dₜ(i): los que falla la ronda crecen para la siguiente. El combinado con {t + 1} {t ? 'rondas' : 'ronda'} falla {errFinal} de 10. (Diapositivas: ε = 0,30 / 0,21 / 0,14 y α = 0,42 / 0,65 / 0,92.)</>}
    >
      <svg ref={ref} viewBox={`0 0 ${W} ${Hh}`} style={{ maxWidth: 440 }}>
        <rect width={W} height={Hh} fill="#fbfcfa" />
        {celdas.map((c, i) => <rect key={i} x={sx(c.x - 0.125)} y={sy(c.y + 0.125)} width={(W - 20) / 40 + 0.5} height={(Hh - 20) / 40 + 0.5} fill={c.c > 0 ? '#dce6f3' : '#f5e0df'} />)}
        {!verFinal && (R.h.eje === 'x'
          ? <><rect x={R.h.s > 0 ? 0 : sx(R.h.t)} y={0} width={R.h.s > 0 ? sx(R.h.t) : W - sx(R.h.t)} height={Hh} fill="rgba(47,98,168,0.10)" /><line x1={sx(R.h.t)} x2={sx(R.h.t)} y1={0} y2={Hh} stroke="#1f2b25" strokeWidth="2" /></>
          : <><rect x={0} y={R.h.s > 0 ? sy(R.h.t) : 0} width={W} height={R.h.s > 0 ? Hh - sy(R.h.t) : sy(R.h.t)} fill="rgba(47,98,168,0.10)" /><line y1={sy(R.h.t)} y2={sy(R.h.t)} x1={0} x2={W} stroke="#1f2b25" strokeWidth="2" /></>)}
        {AB_PTS.map((p, i) => (
          <g key={i}>
            <circle className="pt" data-w={R.D[i]} cx={sx(p.x)} cy={sy(p.y)} r={4 + Math.sqrt(R.D[i]) * 26} fill={p.c > 0 ? COLORES.a : COLORES.b} opacity="0.85" />
            {R.h.h(p) !== p.c && !verFinal && <circle cx={sx(p.x)} cy={sy(p.y)} r={4 + Math.sqrt(R.D[i]) * 26 + 4} fill="none" stroke="#1f2b25" strokeWidth="2" strokeDasharray="3 2" />}
          </g>
        ))}
      </svg>
    </Marco>
  );
}

// ───────── OVO / OVA ─────────
const CL3 = [
  { c: 0, cx: 2.5, cy: 7, col: COLORES.c, n: '1' },
  { c: 1, cx: 7.5, cy: 6.5, col: COLORES.a, n: '7' },
  { c: 2, cx: 4.5, cy: 2.5, col: COLORES.b, n: '8' },
];
export function OvoOva() {
  const [modo, setModo] = useState('ovo');
  const [m, setM] = useState(3);
  const pts = useMemo(() => {
    const r = semilla(12);
    return CL3.flatMap((k) => Array.from({ length: 22 }, () => ({ x: k.cx + (r() - 0.5) * 3, y: k.cy + (r() - 0.5) * 3, c: k.c })));
  }, []);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) anim(ref.current.querySelectorAll('.mini'), { opacity: [0, 1], scale: [0.85, 1], delay: stagger(120), duration: 420 }); }, [modo]);
  const pares = modo === 'ovo' ? [[0, 1], [0, 2], [2, 1]] : [[0, -1], [1, -1], [2, -1]];
  const S = 170, sx = escala(0, 10, 6, S - 6), sy = escala(0, 10, S - 6, 6);
  return (
    <Marco
      titulo="Descomponer un problema de 3 clases («1», «7», «8»)"
      controles={['ovo', 'ova'].map((x) => <button key={x} className={`boton ${modo === x ? 'activo' : ''}`} onClick={() => setModo(x)} type="button">{x === 'ovo' ? 'One-vs-One' : 'One-vs-All'}</button>)}
      pie={modo === 'ovo' ? 'OVO: cada clasificador solo ve los ejemplos de sus dos clases (los demás no participan). Al clasificar, cada uno vota y gana la clase más votada.' : 'OVA: cada clasificador separa una clase de todas las demás (en gris), usando todos los ejemplos.'}
    >
      <div ref={ref} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pares.map(([a, b], i) => (
          <svg key={`${modo}${i}`} className="mini" viewBox={`0 0 ${S} ${S + 22}`} width={S} style={{ border: '1px solid var(--linea)', borderRadius: 4, background: '#fbfcfa' }}>
            {pts.map((p, j) => {
              const activo = p.c === a || p.c === b || b === -1;
              const col = b === -1 && p.c !== a ? '#c3ccc4' : CL3[p.c].col;
              return <circle key={j} cx={sx(p.x)} cy={sy(p.y)} r={3} fill={col} opacity={activo ? 1 : 0.08} />;
            })}
            <text x={S / 2} y={S + 16} textAnchor="middle" fontFamily="var(--f-titulo)" fontSize="13">
              {b === -1 ? `«${CL3[a].n}» vs resto` : `«${CL3[a].n}» vs «${CL3[b].n}»`}
            </text>
          </svg>
        ))}
      </div>
      <div className="fila-control" style={{ marginTop: 12 }}>
        <label className="fila-control">Con m = <input type="range" min={3} max={12} value={m} onChange={(e) => setM(Number(e.target.value))} /> {m} clases</label>
        <span className="marcador">OVO necesita m(m−1)/2 = <b>{(m * (m - 1)) / 2}</b> clasificadores · OVA necesita m = <b>{m}</b></span>
      </div>
    </Marco>
  );
}
