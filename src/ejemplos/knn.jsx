// kNN: clasificación (voto / voto ponderado) y regresión (media / media ponderada),
// con distancia euclídea o Manhattan. El punto nuevo se arrastra; el ejemplo se sincroniza con el esquema.
import { useMemo, useRef, useState } from 'react';
import { Marco, COLORES, escala } from './comun.jsx';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';
import { semilla, gauss } from './vecinos.js';
import { redondear } from '../lib/stats.js';

const DIST = {
  euclidea: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  manhattan: (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
};

/** Convierte un evento de puntero a coordenadas del viewBox del SVG. */
function aSVG(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const m = svg.getScreenCTM();
  return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
}

function datosClas() {
  const r = semilla(9);
  const pts = [];
  [[2.6, 2.2, 0], [3.4, 4.4, 0], [6.8, 4.2, 1], [7.4, 1.8, 1]].forEach(([cx, cy, c]) => {
    for (let i = 0; i < 11; i++) pts.push({ x: cx + gauss(r) * 0.9, y: cy + gauss(r) * 0.8, c });
  });
  pts.push({ x: 4.9, y: 3.3, c: 1 }, { x: 5.4, y: 2.6, c: 0 }, { x: 5.1, y: 4.9, c: 1 });
  return pts.map((p, i) => ({ ...p, i }));
}
function datosReg() {
  const r = semilla(4);
  return Array.from({ length: 26 }, (_, i) => {
    const x = 0.3 + (i / 25) * 9.4 + (r() - 0.5) * 0.3;
    return { x, y: 2.6 + 1.6 * Math.sin(x / 1.6) + 0.12 * x + gauss(r) * 0.35, i };
  });
}

export function Knn() {
  const [tarea, setTarea] = useState('clas');
  const [k, setK] = useState(5);
  const [pond, setPond] = useState(false);
  const [dist, setDist] = useState('euclidea');
  const [mapa, setMapa] = useState(false);
  const [q, setQ] = useState({ x: 5.0, y: 3.4 });
  const [qx, setQx] = useState(4.4);
  const svgRef = useRef(null);
  const arrastrando = useRef(false);
  const clas = useMemo(datosClas, []);
  const reg = useMemo(datosReg, []);
  const D = DIST[dist];

  // ── cálculo ──
  const res = useMemo(() => {
    if (tarea === 'clas') {
      const orden = clas.map((p) => ({ p, d: D(p, q) })).sort((a, b) => a.d - b.d);
      const vec = orden.slice(0, k).map((v) => ({ ...v, w: pond ? 1 / Math.max(v.d, 1e-6) : 1 }));
      const votos = [0, 0];
      vec.forEach((v) => (votos[v.p.c] += v.w));
      return { orden, vec, votos, pred: votos[1] > votos[0] ? 1 : 0 };
    }
    const orden = reg.map((p) => ({ p, d: Math.abs(p.x - qx) })).sort((a, b) => a.d - b.d);
    const vec = orden.slice(0, k).map((v) => ({ ...v, w: 1 / Math.max(v.d, 1e-6) }));
    const media = vec.reduce((s, v) => s + v.p.y, 0) / vec.length;
    const ponderada = vec.reduce((s, v) => s + v.w * v.p.y, 0) / vec.reduce((s, v) => s + v.w, 0);
    return { orden, vec, media, ponderada, pred: pond ? ponderada : media };
  }, [tarea, clas, reg, q, qx, k, pond, D]);

  // ── fotogramas para sincronizar con el esquema ──
  const frames = useMemo(() => {
    const nombre = tarea === 'clas' ? 'clasificación' : 'regresión';
    return [
      { e: '0', fase: 0, msg: `Llega un ejemplo nuevo (${tarea === 'clas' ? 'el rombo' : `x = ${redondear(qx, 2)}`}). No hay modelo entrenado: solo los ejemplos guardados.` },
      { e: '1', fase: 1, msg: `Se calcula la distancia ${dist === 'euclidea' ? 'euclídea' : 'Manhattan'} a los ${tarea === 'clas' ? clas.length : reg.length} ejemplos guardados.` },
      { e: '2', fase: 2, msg: `Se quedan los k = ${k} más cercanos (el más lejano de ellos a ${redondear(res.vec[res.vec.length - 1].d, 2)}).` },
      { e: '3', fase: 3, msg: tarea === 'clas' ? `Es ${nombre}: ${pond ? 'voto ponderado por 1/d' : 'cada vecino vale un voto'} → azul ${redondear(res.votos[0], 2)}, rojo ${redondear(res.votos[1], 2)}.` : `Es ${nombre}: ${pond ? `media ponderada por 1/d = ${redondear(res.ponderada, 2)}` : `media de sus valores = ${redondear(res.media, 2)}`}.` },
      { e: '4', fase: 4, msg: tarea === 'clas' ? `Predicción: clase ${res.pred ? 'roja' : 'azul'}.` : `Predicción: y = ${redondear(res.pred, 2)}.` },
    ];
  }, [tarea, res, k, pond, dist, qx, clas.length, reg.length]);
  const p = usePasos(frames, { intervalo: 1500 });
  const fase = p.play || p.i > 0 ? p.frame.fase : 4;

  const W = 520, H = 320;
  const sx = escala(0, 10, 10, W - 10), sy = escala(0, 6, H - 10, 10);
  const mover = (e) => {
    if (!arrastrando.current && e.type === 'pointermove') return;
    const v = aSVG(svgRef.current, e);
    if (tarea === 'clas') setQ({ x: Math.max(0, Math.min(10, ((v.x - 10) / (W - 20)) * 10)), y: Math.max(0, Math.min(6, ((H - 10 - v.y) / (H - 20)) * 6)) });
    else setQx(Math.max(0.2, Math.min(9.8, ((v.x - 10) / (W - 20)) * 10)));
  };
  const eventos = {
    onPointerDown: (e) => { arrastrando.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); mover(e); },
    onPointerMove: mover,
    onPointerUp: () => (arrastrando.current = false),
    onPointerLeave: () => (arrastrando.current = false),
  };

  // fondo con la región de decisión
  const celdas = useMemo(() => {
    if (!mapa || tarea !== 'clas') return [];
    const out = [];
    for (let i = 0; i < 40; i++) for (let j = 0; j < 24; j++) {
      const c = { x: (i + 0.5) / 4, y: (j + 0.5) / 4 };
      const vs = clas.map((p2) => ({ p: p2, d: D(p2, c) })).sort((a, b) => a.d - b.d).slice(0, k);
      const vt = [0, 0];
      vs.forEach((v) => (vt[v.p.c] += pond ? 1 / Math.max(v.d, 1e-6) : 1));
      out.push({ ...c, c: vt[1] > vt[0] ? 1 : 0 });
    }
    return out;
  }, [mapa, tarea, clas, k, pond, D]);

  const vecSet = new Set(res.vec.map((v) => v.p.i));
  const maxW = Math.max(...res.vec.map((v) => v.w));
  const radio = res.vec[res.vec.length - 1].d;

  return (
    <Marco
      titulo="kNN: arrastra el punto nuevo"
      controles={
        <>
          <button className={`boton ${tarea === 'clas' ? 'activo' : ''}`} onClick={() => setTarea('clas')} type="button">Clasificación</button>
          <button className={`boton ${tarea === 'reg' ? 'activo' : ''}`} onClick={() => setTarea('reg')} type="button">Regresión</button>
        </>
      }
    >
      <div className="fila-control">
        <label className="fila-control" style={{ margin: 0 }}>k <input type="range" min={1} max={tarea === 'clas' ? 15 : 12} value={k} onChange={(e) => setK(Number(e.target.value))} /> {k}</label>
        <button className={`boton ${!pond ? 'activo' : ''}`} onClick={() => setPond(false)} type="button">{tarea === 'clas' ? 'Voto mayoritario' : 'Media'}</button>
        <button className={`boton ${pond ? 'activo' : ''}`} onClick={() => setPond(true)} type="button">{tarea === 'clas' ? 'Voto ponderado 1/d' : 'Media ponderada 1/d'}</button>
        {tarea === 'clas' && (
          <>
            <select value={dist} onChange={(e) => setDist(e.target.value)} aria-label="Distancia"><option value="euclidea">Euclídea</option><option value="manhattan">Manhattan</option></select>
            <label className="fila-control" style={{ margin: 0 }}><input type="checkbox" checked={mapa} onChange={(e) => setMapa(e.target.checked)} /> región de decisión</label>
          </>
        )}
      </div>
      <Controles p={p} />
      <div className="dos-col" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} {...eventos} style={{ cursor: 'grab', touchAction: 'none' }} role="img" aria-label="Plano de kNN">
          <rect width={W} height={H} fill="#fbfcfa" />
          {celdas.map((c, i) => <rect key={i} x={sx(c.x - 0.125)} y={sy(c.y + 0.125)} width={(W - 20) / 40 + 0.5} height={(H - 20) / 24 + 0.5} fill={c.c ? '#f5e0df' : '#dce6f3'} />)}
          {tarea === 'clas' ? (
            <>
              {fase >= 2 && (dist === 'euclidea'
                ? <circle cx={sx(q.x)} cy={sy(q.y)} r={radio * ((W - 20) / 10)} fill="none" stroke="#a9b5ab" strokeDasharray="4 4" />
                : <path d={`M${sx(q.x - radio)},${sy(q.y)} L${sx(q.x)},${sy(q.y + radio)} L${sx(q.x + radio)},${sy(q.y)} L${sx(q.x)},${sy(q.y - radio)} Z`} fill="none" stroke="#a9b5ab" strokeDasharray="4 4" />)}
              {fase === 1 && clas.map((p2) => <line key={`d${p2.i}`} x1={sx(q.x)} y1={sy(q.y)} x2={sx(p2.x)} y2={sy(p2.y)} stroke="#c3ccc4" strokeWidth="0.8" />)}
              {fase >= 2 && res.vec.map((v) => <line key={`v${v.p.i}`} x1={sx(q.x)} y1={sy(q.y)} x2={sx(v.p.x)} y2={sy(v.p.y)} stroke={v.p.c ? COLORES.b : COLORES.a} strokeWidth={fase >= 3 && pond ? 1 + (v.w / maxW) * 4 : 1.6} />)}
              {clas.map((p2) => <circle key={p2.i} cx={sx(p2.x)} cy={sy(p2.y)} r={fase >= 2 && vecSet.has(p2.i) ? 6.5 : 4.5} fill={p2.c ? COLORES.b : COLORES.a} stroke={fase >= 2 && vecSet.has(p2.i) ? '#1f2b25' : 'none'} strokeWidth="1.5" />)}
              <rect x={sx(q.x) - 8} y={sy(q.y) - 8} width="16" height="16" fill={fase >= 4 ? (res.pred ? COLORES.b : COLORES.a) : '#fbfcfa'} stroke="#1f2b25" strokeWidth="2.2" transform={`rotate(45 ${sx(q.x)} ${sy(q.y)})`} />
            </>
          ) : (
            <>
              {fase >= 3 && (
                <>
                  <line x1={sx(0)} x2={sx(10)} y1={sy(res.media)} y2={sy(res.media)} stroke={COLORES.d} strokeWidth={pond ? 1 : 2.4} strokeDasharray={pond ? '4 3' : ''} />
                  <line x1={sx(0)} x2={sx(10)} y1={sy(res.ponderada)} y2={sy(res.ponderada)} stroke={COLORES.sint} strokeWidth={pond ? 2.4 : 1} strokeDasharray={pond ? '' : '4 3'} />
                </>
              )}
              <line x1={sx(qx)} x2={sx(qx)} y1={sy(6)} y2={sy(0)} stroke="#1f2b25" strokeWidth="2" />
              {fase >= 2 && <rect x={sx(qx - radio)} y={sy(6)} width={sx(qx + radio) - sx(qx - radio)} height={H - 20} fill="#1f2b25" opacity="0.05" />}
              {reg.map((p2) => <circle key={p2.i} cx={sx(p2.x)} cy={sy(p2.y)} r={fase >= 2 && vecSet.has(p2.i) ? 6.5 : 4.2} fill={fase >= 2 && vecSet.has(p2.i) ? COLORES.d : '#a9b5ab'} stroke="#1f2b25" strokeWidth={fase >= 2 && vecSet.has(p2.i) ? 1.5 : 0} />)}
              {fase >= 4 && <circle cx={sx(qx)} cy={sy(res.pred)} r="8" fill={pond ? COLORES.sint : COLORES.d} stroke="#1f2b25" strokeWidth="2" />}
            </>
          )}
        </svg>
        <div>
          <p className="marcador" style={{ marginTop: 0 }}>Los {k} vecinos</p>
          <table className="t">
            <thead><tr><th>#</th><th>{tarea === 'clas' ? 'clase' : 'valor y'}</th><th>distancia</th><th>peso</th></tr></thead>
            <tbody>
              {res.vec.map((v, i) => (
                <tr key={v.p.i}>
                  <td>{i + 1}</td>
                  <td style={{ color: tarea === 'clas' ? (v.p.c ? COLORES.b : COLORES.a) : undefined, fontWeight: 700 }}>{tarea === 'clas' ? (v.p.c ? 'roja' : 'azul') : redondear(v.p.y, 2)}</td>
                  <td className="num">{redondear(v.d, 2)}</td>
                  <td className="num">{pond ? redondear(v.w, 2) : 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tarea === 'clas' ? (
            <div style={{ marginTop: 10 }}>
              {[0, 1].map((c) => (
                <div key={c} className="vb-fila" style={{ gridTemplateColumns: '50px 1fr' }}>
                  <span className="vb-e" style={{ color: c ? COLORES.b : COLORES.a }}>{c ? 'roja' : 'azul'}</span>
                  <div className="vb-barra"><i style={{ width: `${(res.votos[c] / (res.votos[0] + res.votos[1])) * 100}%`, background: c ? COLORES.b : COLORES.a, transition: 'width .3s' }} /><span>{redondear(res.votos[c], 2)}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="estadisticas" style={{ flexDirection: 'column', gap: 4 }}>
              <span style={{ color: COLORES.d }}>media = <b>{redondear(res.media, 3)}</b></span>
              <span style={{ color: COLORES.sint }}>media ponderada 1/d = <b>{redondear(res.ponderada, 3)}</b></span>
            </div>
          )}
        </div>
      </div>
      <Mensaje>{p.frame.msg}</Mensaje>
      <p className="pie">{tarea === 'clas' ? 'Con voto ponderado, los vecinos cercanos pesan más (grosor de la línea): un vecino muy próximo puede ganar a varios lejanos. Manhattan mide distancias «en cuadrícula» (la vecindad es un rombo).' : 'Arrastra la línea vertical. La media trata igual a todos los vecinos; la ponderada se pega más al vecino más próximo.'}</p>
    </Marco>
  );
}
