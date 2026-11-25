import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, COLORES, escala, ArbolSvg } from './comun.jsx';
import { semilla, redondear } from '../lib/stats.js';
import { anim, entrada, dibujar, latido, stagger } from '../lib/anim.js';

// ───────── datos sintéticos: dos lunas con ruido ─────────
function lunas(n, ruido = 0.18, s = 3) {
  const r = semilla(s);
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
  return Array.from({ length: n }, (_, i) => {
    const c = i % 2;
    const t = Math.PI * r();
    const x = c === 0 ? Math.cos(t) : 1 - Math.cos(t);
    const y = c === 0 ? Math.sin(t) : 0.5 - Math.sin(t);
    return { x: x + gauss() * ruido, y: y + gauss() * ruido, c, i };
  });
}
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
function vecinos(conj, p, k, excluir = true) {
  return conj
    .filter((q) => !excluir || q !== p)
    .map((q) => [d2(p, q), q])
    .sort((a, b) => a[0] - b[0])
    .slice(0, k)
    .map((x) => x[1]);
}
function votar(vs) {
  const cuenta = {};
  vs.forEach((v) => (cuenta[v.c] = (cuenta[v.c] || 0) + 1));
  return Number(Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0][0]);
}

// ───────── PuntosReduccion: 8000 / 2000 / 500 ─────────
export function PuntosReduccion() {
  const todos = useMemo(() => lunas(8000, 0.16, 11), []);
  const [n, setN] = useState(8000);
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const sx = escala(-1.4, 2.4, 10, W - 10);
    const sy = escala(-1.0, 1.5, H - 10, 10);
    const paso = Math.max(1, Math.floor(8000 / n));
    const o = { a: 0 };
    const pintar = (alfa) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = alfa;
      for (let i = 0; i < todos.length; i += paso) {
        const p = todos[i];
        ctx.fillStyle = p.c ? COLORES.b : COLORES.a;
        ctx.beginPath();
        ctx.arc(sx(p.x), sy(p.y), n > 3000 ? 1.4 : n > 1000 ? 2.2 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const a = anim(o, { a: [0.15, 1], duration: 500, ease: 'outQuad', onUpdate: () => pintar(o.a) });
    if (!a) pintar(1);
  }, [n, todos]);
  return (
    <Marco
      titulo="El mismo conjunto con menos ejemplos"
      controles={[8000, 2000, 500].map((k) => (
        <button key={k} className={`boton ${n === k ? 'activo' : ''}`} onClick={() => setN(k)} type="button">{k} puntos</button>
      ))}
      pie="Con 500 puntos la forma de las dos clases se sigue reconociendo: muchos ejemplos eran redundantes. Eso es lo que explota la selección de instancias."
    >
      <canvas ref={ref} width={640} height={300} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </Marco>
  );
}

// ───────── CNN / ENN / AllKNN / muestreo ─────────
function aplicar(modo, train, r) {
  if (modo === 'original') return new Set(train);
  if (modo === 'aleatorio') return new Set(train.filter(() => r() < 0.25));
  if (modo === 'cnn') {
    const orden = [...train].sort(() => r() - 0.5);
    const S = [orden.find((p) => p.c === 0), orden.find((p) => p.c === 1)];
    let cambio = true;
    while (cambio) {
      cambio = false;
      for (const p of orden) {
        if (S.includes(p)) continue;
        const pred = vecinos(S, p, 1, false)[0].c;
        if (pred !== p.c) { S.push(p); cambio = true; }
      }
    }
    return new Set(S);
  }
  const enn = (conj, k) => {
    const malos = new Set(conj.filter((p) => votar(vecinos(conj, p, k)) !== p.c));
    return conj.filter((p) => !malos.has(p));
  };
  if (modo === 'enn') return new Set(enn(train, 3));
  if (modo === 'allknn') return new Set(enn(enn(enn(train, 3), 5), 7));
  return new Set(train);
}

const MODOS = [
  ['original', 'Original'],
  ['aleatorio', 'Muestreo 25 %'],
  ['cnn', 'CNN'],
  ['enn', 'ENN (k=3)'],
  ['allknn', 'AllKNN'],
];
const TEXTO_MODO = {
  original: 'Todos los ejemplos de entrenamiento.',
  aleatorio: 'Muestreo aleatorio: reduce mucho pero no mira la frontera.',
  cnn: 'CNN conserva casi solo los puntos del borde (y el ruido, que siempre está "mal clasificado"). Prueba a repetirlo: depende del orden.',
  enn: 'ENN borra los puntos que sus 3 vecinos clasifican mal: limpia el ruido y suaviza la frontera, pero el interior sigue lleno.',
  allknn: 'AllKNN aplica ENN con k = 3, 5 y 7: frontera todavía más suave.',
};

export function CnnEnn() {
  const datos = useMemo(() => lunas(300, 0.25, 5), []);
  const train = useMemo(() => datos.filter((_, i) => i % 5 !== 0), [datos]);
  const test = useMemo(() => datos.filter((_, i) => i % 5 === 0), [datos]);
  const [modo, setModo] = useState('original');
  const [rep, setRep] = useState(0);
  const ref = useRef(null);
  const sel = useMemo(() => aplicar(modo, train, semilla(17 + rep)), [modo, train, rep]);
  const acierto = useMemo(() => {
    const S = [...sel];
    return test.filter((p) => vecinos(S, p, 1, false)[0].c === p.c).length / test.length;
  }, [sel, test]);

  const W = 560, H = 330;
  const sx = escala(-1.6, 2.6, 12, W - 12);
  const sy = escala(-1.2, 1.6, H - 12, 12);

  useEffect(() => {
    if (!ref.current) return;
    const quedan = [...ref.current.querySelectorAll('circle.pt')];
    anim(quedan, {
      opacity: (el) => (sel.has(train[Number(el.dataset.i)]) ? 1 : 0.1),
      r: (el) => (sel.has(train[Number(el.dataset.i)]) ? 4 : 2.2),
      duration: 450,
      delay: stagger(1.5),
      ease: 'outQuad',
    });
  }, [sel, train]);

  return (
    <Marco
      titulo="Selección de prototipos sobre dos clases con ruido"
      controles={MODOS.map(([k, t]) => (
        <button key={k} className={`boton ${modo === k ? 'activo' : ''}`} onClick={() => { setModo(k); if (k === modo) setRep((x) => x + 1); }} type="button">{t}</button>
      ))}
      pie={TEXTO_MODO[modo]}
    >
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Puntos de entrenamiento">
        {train.map((p, i) => (
          <circle key={i} className="pt" data-i={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={p.c ? COLORES.b : COLORES.a} />
        ))}
      </svg>
      <p className="marcador">
        Quedan <b>{sel.size}</b> de {train.length} · reducción <b>{redondear((1 - sel.size / train.length) * 100, 1)} %</b> · acierto 1-NN en test <b>{redondear(acierto * 100, 1)} %</b>
        {modo === 'cnn' && <> · <button className="boton" onClick={() => setRep((x) => x + 1)} type="button">Otro orden</button></>}
      </p>
    </Marco>
  );
}
export const Prototipos = CnnEnn;

// ───────── Urna: muestreo con y sin reemplazamiento / bootstrap ─────────
const BOLAS = ['#2f62a8', '#b0413e', '#3b7a52', '#a8700f', '#7b4c9e', '#1f2b25', '#d0758a', '#4b9fb5', '#8a8f3c', '#c26a2e'];
export function Urna({ bootstrap = false }) {
  const [reemplazo, setReemplazo] = useState(true);
  const [muestra, setMuestra] = useState([]);
  const r = useRef(semilla(23));
  const ref = useRef(null);
  const N = 10;
  const enUrna = reemplazo ? [...Array(N).keys()] : [...Array(N).keys()].filter((b) => !muestra.includes(b));
  const extraer = () => {
    if (muestra.length >= N || enUrna.length === 0) return;
    const b = enUrna[Math.floor(r.current() * enUrna.length)];
    setMuestra((m) => [...m, b]);
  };
  const llenar = () => {
    let m = [...muestra];
    const disp = reemplazo ? [...Array(N).keys()] : [...Array(N).keys()].filter((b) => !m.includes(b));
    while (m.length < N && disp.length) {
      const k = Math.floor(r.current() * disp.length);
      m.push(disp[k]);
      if (!reemplazo) disp.splice(k, 1);
    }
    setMuestra(m);
  };
  useEffect(() => {
    if (!ref.current || muestra.length === 0) return;
    const ult = ref.current.querySelectorAll('.extraida > g');
    const el = ult[ult.length - 1];
    if (el) anim(el, { translateX: [-200, 0], translateY: [-30, 0], opacity: [0, 1], duration: 520, ease: 'outBack(1.4)' });
  }, [muestra.length]);
  const distintas = new Set(muestra).size;
  const fuera = [...Array(N).keys()].filter((b) => !muestra.includes(b));
  return (
    <Marco
      titulo={bootstrap ? 'Una muestra bootstrap' : 'Muestreo con y sin reemplazamiento'}
      controles={
        <>
          <button className={`boton ${reemplazo ? 'activo' : ''}`} onClick={() => { setReemplazo(true); setMuestra([]); }} type="button">Con reemplazamiento</button>
          <button className={`boton ${!reemplazo ? 'activo' : ''}`} onClick={() => { setReemplazo(false); setMuestra([]); }} type="button">Sin reemplazamiento</button>
        </>
      }
      pie={
        reemplazo
          ? `Con reemplazamiento cada bola vuelve a la urna: en ${muestra.length} extracciones han salido ${distintas} bolas distintas. Si completas las 10, en promedio solo un 63 % son distintas: eso es una muestra bootstrap, la que usa cada modelo de bagging.`
          : 'Sin reemplazamiento cada bola sale una sola vez: no hay repetidas y, con 10 extracciones, la muestra es el conjunto entero.'
      }
    >
      <div className="grupo-botones" style={{ marginBottom: 10 }}>
        <button className="boton primario" onClick={extraer} disabled={muestra.length >= N} type="button">Extraer una bola</button>
        <button className="boton" onClick={llenar} disabled={muestra.length >= N} type="button">Completar 10</button>
        <button className="boton" onClick={() => setMuestra([])} type="button">Vaciar</button>
      </div>
      <svg ref={ref} viewBox="0 0 640 150" role="img" aria-label="Urna y muestra">
        <path d="M20 30 v95 a12 12 0 0 0 12 12 h150 a12 12 0 0 0 12 -12 v-95" fill="#f4f6f3" stroke="#4a5a51" strokeWidth="2" />
        <text x="106" y="22" textAnchor="middle" fontFamily="var(--f-titulo)" fontSize="13" fill="#4a5a51">Urna (datos)</text>
        {[...Array(N).keys()].map((b) => (
          <g key={b} opacity={enUrna.includes(b) ? 1 : 0.15}>
            <circle cx={45 + (b % 5) * 30} cy={70 + Math.floor(b / 5) * 34} r={12} fill={BOLAS[b]} />
            <text x={45 + (b % 5) * 30} y={74 + Math.floor(b / 5) * 34} textAnchor="middle" fontSize="11" fill="#fff" fontFamily="var(--f-titulo)">{b + 1}</text>
          </g>
        ))}
        <text x="230" y="22" fontFamily="var(--f-titulo)" fontSize="13" fill="#4a5a51">Muestra</text>
        {muestra.map((b, i) => (
          <g key={i} className="extraida" transform={`translate(${244 + i * 38},80)`}>
            <g>
              <circle r={14} fill={BOLAS[b]} stroke={muestra.indexOf(b) !== i ? '#1f2b25' : 'none'} strokeWidth="2.5" />
              <text y={4} textAnchor="middle" fontSize="12" fill="#fff" fontFamily="var(--f-titulo)">{b + 1}</text>
            </g>
          </g>
        ))}
      </svg>
      {reemplazo && muestra.length === N && (
        <p className="marcador">Repetidas: las que tienen borde negro. Fuera de la bolsa (<em>out-of-bag</em>): {fuera.length ? fuera.map((b) => b + 1).join(', ') : 'ninguna'}.</p>
      )}
    </Marco>
  );
}
export function Bootstrap() { return <Urna bootstrap />; }

// ───────── SMOTE ─────────
export function Smote() {
  const base = useMemo(() => {
    const r = semilla(41);
    const may = Array.from({ length: 70 }, () => ({ x: r() * 10, y: r() * 6, c: 0 }));
    const men = Array.from({ length: 9 }, () => ({ x: 6.2 + r() * 2.8, y: 3.4 + r() * 2.2, c: 1 }));
    return [...may.filter((p) => !(p.x > 6 && p.y > 3.2)), ...men];
  }, []);
  const [sint, setSint] = useState([]);
  const [k, setK] = useState(3);
  const ref = useRef(null);
  const W = 560, H = 320;
  const sx = escala(0, 10, 16, W - 16);
  const sy = escala(0, 6, H - 16, 16);
  const min = base.filter((p) => p.c === 1);
  const generar = () => {
    const r = semilla(100 + sint.length);
    const nuevos = min.map((p) => {
      const vs = vecinos(min, p, k);
      const v = vs[Math.floor(r() * vs.length)];
      const l = r();
      return { x: p.x + l * (v.x - p.x), y: p.y + l * (v.y - p.y), de: p, a: v, l };
    });
    setSint((s) => [...s, ...nuevos]);
  };
  useEffect(() => {
    if (!ref.current) return;
    const lineas = [...ref.current.querySelectorAll('line.nueva')];
    const pts = [...ref.current.querySelectorAll('circle.nueva')];
    dibujar(lineas, { dur: 400, paso: 50 });
    anim(pts, { opacity: [0, 1], r: [0, 4.5], duration: 400, delay: stagger(50, { start: 300 }), ease: 'outBack(2)' });
    [...lineas, ...pts].forEach((el) => el.classList.remove('nueva'));
  }, [sint.length]);
  const ult = sint.length - min.length;
  return (
    <Marco
      titulo="SMOTE: ejemplos sintéticos de la clase minoritaria"
      controles={
        <>
          <label className="fila-control">k vecinos
            <select value={k} onChange={(e) => setK(Number(e.target.value))}>{[1, 2, 3, 4, 5].map((x) => <option key={x}>{x}</option>)}</select>
          </label>
          <button className="boton primario" onClick={generar} type="button">Generar una ronda</button>
          <button className="boton" onClick={() => setSint([])} type="button">Reiniciar</button>
        </>
      }
      pie={`Mayoritaria: ${base.length - min.length} · minoritaria: ${min.length} originales + ${sint.length} sintéticos. Cada punto nuevo cae en el segmento entre un ejemplo minoritario y uno de sus ${k} vecinos minoritarios: no se copia ningún punto, se rellena la región.`}
    >
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="SMOTE">
        {base.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={p.c ? 5 : 3.6} fill={p.c ? COLORES.sint : '#a9b5ab'} />
        ))}
        {sint.map((s, i) => (
          <g key={i}>
            <line className={i >= ult ? 'nueva' : ''} x1={sx(s.de.x)} y1={sy(s.de.y)} x2={sx(s.a.x)} y2={sy(s.a.y)} stroke={COLORES.sint} strokeOpacity="0.35" strokeWidth="1.2" />
            <circle className={i >= ult ? 'nueva' : ''} cx={sx(s.x)} cy={sy(s.y)} r={4.5} fill="#fbfcfa" stroke={COLORES.sint} strokeWidth="2" />
          </g>
        ))}
      </svg>
    </Marco>
  );
}

// ───────── Binning: igual amplitud / igual frecuencia ─────────
const TEMPS = [64, 65, 68, 69, 70, 71, 72, 72, 75, 75, 80, 81, 83, 85];
export function Binning() {
  const [modo, setModo] = useState('amplitud');
  const [k, setK] = useState(modo === 'amplitud' ? 7 : 4);
  const ref = useRef(null);
  const bins = useMemo(() => {
    const min = TEMPS[0], max = TEMPS[TEMPS.length - 1];
    if (modo === 'amplitud') {
      const a = (max - min) / k;
      return Array.from({ length: k }, (_, i) => {
        const lo = min + i * a, hi = min + (i + 1) * a;
        const vals = TEMPS.filter((v) => v >= lo && (i === k - 1 ? v <= hi : v < hi));
        return { lo, hi, vals, etq: `[${redondear(lo, 1)}, ${redondear(hi, 1)}${i === k - 1 ? ']' : ')'}` };
      });
    }
    const t = Math.ceil(TEMPS.length / k);
    const out = [];
    for (let i = 0; i < TEMPS.length; i += t) {
      const vals = TEMPS.slice(i, i + t);
      out.push({ lo: vals[0], hi: vals[vals.length - 1], vals, etq: `[${vals[0]} … ${vals[vals.length - 1]}]` });
    }
    return out;
  }, [modo, k]);
  useEffect(() => {
    if (!ref.current) return;
    anim(ref.current.querySelectorAll('rect.barra-b'), { scaleY: [0, 1], duration: 500, delay: stagger(60), ease: 'outBack(1.3)' });
  }, [bins]);
  const W = 620, H = 250, m = 30;
  const sx = escala(63, 86, m, W - m);
  const maxF = Math.max(...bins.map((b) => b.vals.length));
  const hb = (n) => (n / Math.max(maxF, 4)) * 120;
  return (
    <Marco
      titulo="Temperaturas: 64 65 68 69 70 71 72 72 75 75 80 81 83 85"
      controles={
        <>
          <button className={`boton ${modo === 'amplitud' ? 'activo' : ''}`} onClick={() => { setModo('amplitud'); setK(7); }} type="button">Igual amplitud</button>
          <button className={`boton ${modo === 'frecuencia' ? 'activo' : ''}`} onClick={() => { setModo('frecuencia'); setK(4); }} type="button">Igual frecuencia</button>
          <label className="fila-control">{modo === 'amplitud' ? 'k intervalos' : 'k intervalos'}
            <input type="range" min={2} max={7} value={k} onChange={(e) => setK(Number(e.target.value))} /> {k}
          </label>
        </>
      }
      pie={
        modo === 'amplitud'
          ? `Anchura = (85 − 64)/${k} = ${redondear(21 / k, 2)}. Las cajas tienen el mismo ancho pero no el mismo número de valores${bins.some((b) => b.vals.length === 0) ? '; incluso queda alguna vacía' : ''}.`
          : `Cada caja recibe ${Math.ceil(TEMPS.length / k)} valores consecutivos (la última, los que sobren). Las anchuras cambian, las frecuencias no.`
      }
    >
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Histograma de intervalos">
        {bins.map((b, i) => {
          const x0 = modo === 'amplitud' ? sx(b.lo) : sx(b.lo - 0.5);
          const x1 = modo === 'amplitud' ? sx(b.hi) : sx(b.hi + 0.5);
          return (
            <g key={`${modo}-${k}-${i}`}>
              <rect className="barra-b" x={x0 + 1} y={170 - hb(b.vals.length)} width={Math.max(2, x1 - x0 - 2)} height={hb(b.vals.length)} fill={i % 2 ? '#d9b26a' : '#c4881c'} style={{ transformOrigin: `0 170px`, transformBox: 'view-box' }} />
              <text x={(x0 + x1) / 2} y={162 - hb(b.vals.length)} textAnchor="middle" fontFamily="var(--f-titulo)" fontSize="14" fontWeight="700" fill="#1f2b25">{b.vals.length}</text>
              <text x={(x0 + x1) / 2} y={215} textAnchor="middle" fontFamily="var(--f-titulo)" fontSize="11" fill="#4a5a51">{b.etq}</text>
            </g>
          );
        })}
        <line x1={m} x2={W - m} y1={170} y2={170} stroke="#4a5a51" />
        {TEMPS.map((v, i) => {
          const rep = TEMPS.slice(0, i).filter((x) => x === v).length;
          return <circle key={i} cx={sx(v)} cy={186 + rep * 9} r={3.6} fill="#1f2b25" />;
        })}
      </svg>
    </Marco>
  );
}

// ───────── ChiMerge ─────────
const KERBER = [[1, 1], [3, 2], [7, 1], [8, 1], [9, 1], [11, 2], [23, 2], [37, 1], [39, 2], [45, 1], [46, 1], [59, 1]];
function chi2(a, b) {
  const filas = [a.cuentas, b.cuentas];
  const C = [0, 1].map((j) => filas[0][j] + filas[1][j]);
  const R = filas.map((f) => f[0] + f[1]);
  const N = R[0] + R[1];
  let x = 0;
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const E = (R[i] * C[j]) / N;
      if (E === 0) continue; // clase ausente en los dos intervalos: no aporta
      x += (filas[i][j] - E) ** 2 / E;
    }
  return x;
}
export function ChiMerge() {
  const inicial = () => KERBER.map(([v, c]) => ({ lo: v, hi: v, cuentas: c === 1 ? [1, 0] : [0, 1] }));
  const [ints, setInts] = useState(inicial);
  const [umbral, setUmbral] = useState(2.706);
  const ref = useRef(null);
  const chis = ints.slice(0, -1).map((a, i) => chi2(a, ints[i + 1]));
  const iMin = chis.length ? chis.indexOf(Math.min(...chis)) : -1;
  const terminado = iMin < 0 || chis[iMin] > umbral;
  const paso = () => {
    if (terminado) return;
    setInts((I) => {
      const n = [...I];
      const a = n[iMin], b = n[iMin + 1];
      n.splice(iMin, 2, { lo: a.lo, hi: b.hi, cuentas: [a.cuentas[0] + b.cuentas[0], a.cuentas[1] + b.cuentas[1]], nuevo: true });
      return n.map((x, j) => (j === iMin ? x : { ...x, nuevo: false }));
    });
  };
  useEffect(() => {
    if (ref.current) latido(ref.current.querySelectorAll('.nuevo'));
  }, [ints]);
  return (
    <Marco
      titulo="ChiMerge sobre 12 valores con 2 clases"
      controles={
        <>
          <label className="fila-control">Umbral χ²
            <select value={umbral} onChange={(e) => setUmbral(Number(e.target.value))}>
              <option value={2.706}>2,706 (α = 0,10)</option>
              <option value={3.841}>3,841 (α = 0,05)</option>
              <option value={6.635}>6,635 (α = 0,01)</option>
            </select>
          </label>
          <button className="boton primario" onClick={paso} disabled={terminado} type="button">Mezclar el par más parecido</button>
          <button className="boton" onClick={() => setInts(inicial())} type="button">Reiniciar</button>
        </>
      }
      pie={terminado ? `Fin: todos los pares adyacentes tienen χ² > ${redondear(umbral)}; sus distribuciones de clase son distintas con ese nivel de significancia. Quedan ${ints.length} intervalos.` : `El par resaltado tiene el χ² más bajo (${redondear(chis[iMin])}): sus clases se reparten casi igual, así que se fusionan. Con 2 clases hay 1 grado de libertad.`}
    >
      <div className="tabla-env" ref={ref}>
        <table className="t">
          <thead>
            <tr><th>Intervalo</th><th>Clase 1</th><th>Clase 2</th><th>χ² con el siguiente</th></tr>
          </thead>
          <tbody>
            {ints.map((it, i) => (
              <tr key={`${it.lo}-${it.hi}`} className={`${it.nuevo ? 'nuevo' : ''} ${!terminado && (i === iMin || i === iMin + 1) ? 'resaltado' : ''}`}>
                <td>{it.lo === it.hi ? it.lo : `[${it.lo}, ${it.hi}]`}</td>
                <td className="num">{it.cuentas[0]}</td>
                <td className="num">{it.cuentas[1]}</td>
                <td className="num">{i < chis.length ? redondear(chis[i]) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Marco>
  );
}

// ───────── Taxonomía de discretización (Liu et al.) ─────────
const TAX = {
  t: 'Discretización',
  hijos: [
    {
      a: 'nivel 1',
      n: {
        t: 'Mezcla',
        hijos: [
          { a: 'superv.', n: { t: 'Dependencia', hijos: [{ a: '', n: { t: 'ChiMerge, Chi2, ConMerge', hoja: true } }] } },
          { a: 'no superv.', n: { t: '(ninguno)', hoja: true } },
        ],
      },
    },
    {
      a: 'nivel 1',
      n: {
        t: 'División',
        hijos: [
          { a: 'no superv.', n: { t: 'Binning', hijos: [{ a: '', n: { t: 'Igual amplitud, igual frec.', hoja: true } }] } },
          {
            a: 'superv.',
            n: {
              t: 'Supervisada',
              hijos: [
                { a: '', n: { t: 'Entropía', hijos: [{ a: '', n: { t: 'ID3, D2, MDLP, Mántaras', hoja: true } }] } },
                { a: '', n: { t: 'Binning', hijos: [{ a: '', n: { t: '1R (OneR)', hoja: true } }] } },
                { a: '', n: { t: 'Dependencia', hijos: [{ a: '', n: { t: 'Marginal Ent., Zeta', hoja: true } }] } },
                { a: '', n: { t: 'Exactitud', hijos: [{ a: '', n: { t: 'Adaptive Quantizer', hoja: true } }] } },
              ],
            },
          },
        ],
      },
    },
  ],
};
export function TaxonomiaDiscretizacion() {
  return (
    <Marco titulo="Taxonomía jerárquica (Liu, Hussain, Tan y Dash, 2002)" pie="Nivel 1: mezcla o división · nivel 2: supervisado o no · nivel 3: medida · nivel 4: métodos concretos.">
      <ArbolSvg raiz={TAX} sepX={70} sepY={70} />
    </Marco>
  );
}
