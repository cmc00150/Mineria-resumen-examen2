// Ejemplos paso a paso de muestreo, estratificación y SI + árboles.
// Todos sincronizan con el esquema de su ficha mediante usePasos (e = id del paso del esquema).
import { useMemo, useState } from 'react';
import { Marco, COLORES, escala } from './comun.jsx';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';
import { semilla, gauss, lunas, barajar, cnn, cart, predCart, acierto1NN } from './vecinos.js';
import { redondear } from '../lib/stats.js';

const BOLAS = ['#2f62a8', '#b0413e', '#3b7a52', '#a8700f', '#7b4c9e', '#1f2b25', '#d0758a', '#4b9fb5', '#8a8f3c', '#c26a2e', '#5c6bc0', '#8d6e63'];

// ═════════ Muestreo con / sin reemplazamiento ═════════
function framesUrna(N, M, reemplazo, s) {
  const r = semilla(s);
  const fr = [{ e: '0', muestra: [], fuera: [], msg: `Urna con N = ${N} ejemplos. Queremos una muestra de M = ${M}.` }];
  const muestra = [];
  for (let k = 0; k < M; k++) {
    const disp = [...Array(N).keys()].filter((b) => reemplazo || !muestra.includes(b));
    const b = disp[Math.floor(r() * disp.length)];
    muestra.push(b);
    const rep = muestra.indexOf(b) !== muestra.length - 1;
    fr.push({ e: '1.0', muestra: [...muestra], nueva: b, msg: `Extracción ${k + 1} de ${M}: sale la bola ${b + 1}${rep ? ' (¡repetida!)' : ''}.` });
    fr.push({ e: '1.1', muestra: [...muestra], nueva: b, devuelta: reemplazo, msg: reemplazo ? `Con reemplazamiento: la bola ${b + 1} vuelve a la urna y puede volver a salir.` : `Sin reemplazamiento: la bola ${b + 1} se queda fuera de la urna.` });
  }
  const distintas = new Set(muestra).size;
  fr.push({ e: '2', muestra: [...muestra], msg: `Muestra final: M = ${M} de N = ${N} (${distintas} bolas distintas).` });
  return fr;
}

export function Urna({ bootstrap = false }) {
  const N = 12;
  const [reemplazo, setReemplazo] = useState(true);
  const [M, setM] = useState(bootstrap ? N : 5);
  const [s, setS] = useState(23);
  const m = bootstrap ? N : M;
  const frames = useMemo(() => framesUrna(N, m, bootstrap || reemplazo, s), [m, reemplazo, s, bootstrap]);
  const p = usePasos(frames, { intervalo: 750 });
  const f = p.frame;
  const enUrna = (b) => (bootstrap || reemplazo ? true : !f.muestra.includes(b) || (f.nueva === b && f.e === '1.0'));
  const fuera = [...Array(N).keys()].filter((b) => !f.muestra.includes(b));
  return (
    <Marco
      titulo={bootstrap ? `Muestra bootstrap: M = N = ${N}, con reemplazamiento` : 'Muestreo de M < N ejemplos'}
      controles={
        !bootstrap && (
          <>
            <button className={`boton ${reemplazo ? 'activo' : ''}`} onClick={() => setReemplazo(true)} type="button">Con reemplazamiento</button>
            <button className={`boton ${!reemplazo ? 'activo' : ''}`} onClick={() => setReemplazo(false)} type="button">Sin reemplazamiento</button>
            <label className="fila-control" style={{ margin: 0 }}>M <input type="range" min={1} max={N - 1} value={M} onChange={(e) => setM(Number(e.target.value))} /> {M}</label>
          </>
        )
      }
    >
      <Controles p={p} />
      <svg viewBox="0 0 680 160" role="img" aria-label="Urna y muestra">
        <path d="M14 34 v95 a12 12 0 0 0 12 12 h196 a12 12 0 0 0 12 -12 v-95" fill="#f4f6f3" stroke="#4a5a51" strokeWidth="2" />
        <text x="124" y="24" textAnchor="middle" fontFamily="var(--f-titulo)" fontSize="13" fill="#4a5a51">Urna · N = {N}</text>
        {[...Array(N).keys()].map((b) => {
          const cx = 40 + (b % 6) * 34, cy = 68 + Math.floor(b / 6) * 40;
          const esNueva = f.nueva === b && f.e !== '2';
          return (
            <g key={b} opacity={enUrna(b) ? 1 : 0.12}>
              <circle cx={cx} cy={cy} r={14} fill={BOLAS[b]} stroke={esNueva ? '#1f2b25' : 'none'} strokeWidth="3" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#fff" fontFamily="var(--f-titulo)">{b + 1}</text>
            </g>
          );
        })}
        <text x="262" y="24" fontFamily="var(--f-titulo)" fontSize="13" fill="#4a5a51">Muestra · M = {m}</text>
        {[...Array(m).keys()].map((k) => (
          <circle key={`h${k}`} cx={280 + (k % 12) * 32} cy={88} r={13} fill="none" stroke="#c3ccc4" strokeDasharray="3 3" />
        ))}
        {f.muestra.map((b, k) => (
          <g key={k}>
            <circle cx={280 + (k % 12) * 32} cy={88} r={13} fill={BOLAS[b]} stroke={f.muestra.indexOf(b) !== k ? '#1f2b25' : 'none'} strokeWidth="2.5" />
            <text x={280 + (k % 12) * 32} y={92} textAnchor="middle" fontSize="11" fill="#fff" fontFamily="var(--f-titulo)">{b + 1}</text>
          </g>
        ))}
      </svg>
      <Mensaje>{f.msg}</Mensaje>
      <div className="estadisticas">
        <span>M/N = <b>{Math.round((m / N) * 100)} %</b></span>
        <span>distintas: <b>{new Set(f.muestra).size}</b></span>
        <span>repetidas (borde negro): <b>{f.muestra.length - new Set(f.muestra).size}</b></span>
        {(bootstrap || reemplazo) && f.e === '2' && <span>fuera de la bolsa: <b>{fuera.map((b) => b + 1).join(', ') || 'ninguna'}</b></span>}
        <button className="boton" onClick={() => setS((x) => x + 1)} type="button">Otra muestra</button>
      </div>
      {bootstrap && <p className="pie">Bagging usa M = N con reemplazamiento: cada modelo ve unos ~63 % de ejemplos distintos y el resto quedan «fuera de la bolsa».</p>}
    </Marco>
  );
}
export function Bootstrap() {
  return <Urna bootstrap />;
}

// ═════════ Muestreo de clusters ═════════
function datosClusters() {
  const r = semilla(14);
  const grupos = [{ cx: 2.5, cy: 3.8, n: 36, s: 0.75 }, { cx: 7.2, cy: 4.3, n: 18, s: 0.55 }, { cx: 5.2, cy: 1.3, n: 8, s: 0.35 }];
  const pts = [];
  grupos.forEach((g, gi) => { for (let i = 0; i < g.n; i++) pts.push({ x: g.cx + gauss(r) * g.s, y: g.cy + gauss(r) * g.s, g: gi }); });
  [[0.6, 0.6], [9.3, 0.8], [9.4, 5.6], [0.5, 5.5], [4.9, 5.7]].forEach(([x, y]) => pts.push({ x, y, g: -1 }));
  return { pts, grupos };
}
export function Clusters() {
  const { pts, grupos } = useMemo(datosClusters, []);
  const [frac, setFrac] = useState(0.25);
  const [comparar, setComparar] = useState(false);
  const frames = useMemo(() => {
    const r = semilla(5);
    const elegidos = new Set();
    const fr = [{ e: '0', sel: new Set(), grupos: false, msg: `Datos sin refinar: ${pts.length} puntos (incluye 5 outliers sueltos).` }];
    fr.push({ e: '1', sel: new Set(), grupos: true, msg: 'Se identifican los grupos: 3 clusters de 36, 18 y 8 puntos. Los outliers no pertenecen a ninguno.' });
    grupos.forEach((g, gi) => {
      const miembros = pts.map((p, i) => [p, i]).filter(([p]) => p.g === gi);
      const k = Math.max(1, Math.round(g.n * frac));
      barajar(miembros, r).slice(0, k).forEach(([, i]) => elegidos.add(i));
      fr.push({ e: '2.0', sel: new Set(elegidos), grupos: true, actual: gi, msg: `Grupo ${gi + 1} (${g.n} puntos): se eligen ${k} = ${Math.round(frac * 100)} % de su tamaño.` });
    });
    fr.push({ e: '3', sel: new Set(elegidos), grupos: true, fin: true, msg: `Reducción simple: ${elegidos.size} puntos que representan a los 3 grupos y ningún outlier.` });
    return fr;
  }, [pts, grupos, frac]);
  const aleatoria = useMemo(() => {
    const r = semilla(9);
    const k = frames[frames.length - 1].sel.size;
    return new Set(barajar(pts.map((_, i) => i), r).slice(0, k));
  }, [frames, pts]);
  const p = usePasos(frames, { intervalo: 1300 });
  const f = p.frame;
  const sel = comparar ? aleatoria : f.sel;
  const W = 520, H = 320, sx = escala(0, 10, 10, W - 10), sy = escala(0, 6, H - 10, 10);
  const COLG = [COLORES.a, COLORES.c, COLORES.d];
  const cuenta = (S, gi) => [...S].filter((i) => pts[i].g === gi).length;
  return (
    <Marco
      titulo="Muestreo de clusters: proporcional al tamaño de cada grupo"
      controles={
        <>
          <label className="fila-control" style={{ margin: 0 }}>% por grupo
            <select value={frac} onChange={(e) => setFrac(Number(e.target.value))}>{[0.15, 0.25, 0.4].map((x) => <option key={x} value={x}>{x * 100} %</option>)}</select>
          </label>
          <button className={`boton ${comparar ? 'activo' : ''}`} onClick={() => setComparar((c) => !c)} type="button">Comparar con aleatorio simple</button>
        </>
      }
    >
      <Controles p={p} />
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Clusters">
        <rect width={W} height={H} fill="#fbfcfa" />
        {f.grupos && !comparar && grupos.map((g, gi) => (
          <ellipse key={gi} cx={sx(g.cx)} cy={sy(g.cy)} rx={g.s * 2.6 * ((W - 20) / 10)} ry={g.s * 2.6 * ((H - 20) / 6)} fill={COLG[gi]} opacity={f.actual === gi ? 0.16 : 0.07} stroke={COLG[gi]} strokeDasharray="4 4" />
        ))}
        {pts.map((q, i) => {
          const elegido = sel.has(i);
          const color = q.g < 0 ? '#1f2b25' : (f.grupos || comparar) ? COLG[q.g] : '#a9b5ab';
          return <circle key={i} cx={sx(q.x)} cy={sy(q.y)} r={elegido ? 6.5 : 3.6} fill={elegido ? color : '#fbfcfa'} stroke={color} strokeWidth={elegido ? 2 : 1.4} opacity={(f.fin || comparar) && !elegido ? 0.35 : 1} />;
        })}
        {pts.filter((q) => q.g < 0).map((q, i) => <text key={i} x={sx(q.x) + 8} y={sy(q.y) + 4} fontSize="11" fontFamily="var(--f-titulo)" fill="#4a5a51">outlier</text>)}
      </svg>
      <Mensaje>{comparar ? `Aleatorio simple con el mismo tamaño: grupo 1 ${cuenta(aleatoria, 0)}, grupo 2 ${cuenta(aleatoria, 1)}, grupo 3 ${cuenta(aleatoria, 2)}, outliers ${cuenta(aleatoria, -1)}. Puede coger outliers e infrarrepresentar el grupo pequeño.` : f.msg}</Mensaje>
      <div className="estadisticas">
        {grupos.map((g, gi) => <span key={gi} style={{ color: COLG[gi] }}>grupo {gi + 1}: <b>{cuenta(f.sel, gi)}</b> / {g.n}</span>)}
        <span>outliers: <b>{cuenta(f.sel, -1)}</b></span>
      </div>
    </Marco>
  );
}

// ═════════ Muestreo incremental ═════════
const TAM = [10, 20, 33, 50, 67, 100];
const ACC = [72.0, 80.5, 85.1, 87.2, 87.6, 87.8];
export function Incremental() {
  const [umbral, setUmbral] = useState(1);
  const frames = useMemo(() => {
    const fr = [{ e: '0', hechos: 0, msg: 'Secuencia de tamaños: 10 %, 20 %, 33 %, 50 %, 67 % y 100 % de los datos.' }];
    let parar = null;
    for (let i = 0; i < TAM.length; i++) {
      fr.push({ e: '1.0', hechos: i + 1, msg: `Se muestrea el ${TAM[i]} % y se aprende: acierto ${String(ACC[i]).replace('.', ',')} %.` });
      if (i === 0) continue;
      const g = ACC[i] - ACC[i - 1];
      const mejora = g >= umbral;
      fr.push({ e: '1.1', hechos: i + 1, msg: `¿Mejora? ${g >= 0 ? '+' : ''}${redondear(g, 1)} puntos ${mejora ? `≥ ${umbral} → sí, siguiente tamaño` : `< ${umbral} → no, se para`}.` });
      if (!mejora) { parar = i; break; }
    }
    const usado = parar == null ? TAM.length - 1 : parar - 1;
    fr.push({ e: '2', hechos: parar == null ? TAM.length : parar + 1, final: usado, msg: `Basta con el ${TAM[usado]} % de los datos (${String(ACC[usado]).replace('.', ',')} %). ${parar == null ? 'Se llegó al 100 %.' : `Se ahorra entrenar con el ${TAM.slice(parar + 1).join(' % y ') || '—'} %.`}` });
    return fr;
  }, [umbral]);
  const p = usePasos(frames, { intervalo: 1100 });
  const f = p.frame;
  const W = 520, H = 250, m = { l: 40, r: 10, t: 14, b: 36 };
  const sy = escala(60, 90, H - m.b, m.t);
  const bw = (W - m.l - m.r) / TAM.length;
  return (
    <Marco
      titulo="Muestreo incremental: crecer hasta que deje de mejorar"
      controles={<label className="fila-control" style={{ margin: 0 }}>mejora mínima <select value={umbral} onChange={(e) => setUmbral(Number(e.target.value))}>{[0.3, 1, 3].map((x) => <option key={x} value={x}>{String(x).replace('.', ',')} puntos</option>)}</select></label>}
    >
      <Controles p={p} />
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de aprendizaje">
        {[60, 70, 80, 90].map((t) => <g key={t}><line x1={m.l} x2={W - m.r} y1={sy(t)} y2={sy(t)} stroke="#e4e9e2" /><text x={m.l - 6} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#6f7d75" fontFamily="var(--f-titulo)">{t} %</text></g>)}
        {TAM.map((t, i) => {
          const hecho = i < f.hechos;
          const x = m.l + i * bw + 8;
          const esFinal = f.final === i;
          return (
            <g key={t}>
              <rect x={x} y={sy(ACC[i])} width={bw - 16} height={H - m.b - sy(ACC[i])} fill={esFinal ? COLORES.c : hecho ? COLORES.a : '#fbfcfa'} stroke={hecho ? 'none' : '#c3ccc4'} strokeDasharray="4 3" opacity={hecho ? 1 : 0.8} />
              {hecho && <text x={x + (bw - 16) / 2} y={sy(ACC[i]) - 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1f2b25" fontFamily="var(--f-titulo)">{String(ACC[i]).replace('.', ',')}</text>}
              <text x={x + (bw - 16) / 2} y={H - m.b + 16} textAnchor="middle" fontSize="12" fill="#1f2b25" fontFamily="var(--f-titulo)">{t} %</text>
            </g>
          );
        })}
        <text x={m.l} y={H - 4} fontSize="11" fill="#6f7d75" fontFamily="var(--f-titulo)">tamaño de la muestra · barras grises = no hizo falta entrenar</text>
      </svg>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

// ═════════ Muestreo estratificado ═════════
const NOM_CL = ['A', 'B', 'C'];
const NOM_ZO = ['Norte', 'Sur', 'Este'];
const COLE = [COLORES.a, COLORES.d, COLORES.b];
const POB = (() => {
  const r = semilla(8);
  const clases = [...Array(72).fill(0), ...Array(36).fill(1), ...Array(12).fill(2)];
  const zonas = barajar([...Array(50).fill(0), ...Array(40).fill(1), ...Array(30).fill(2)], r);
  const az = barajar(clases.map((_, i) => i), r);
  const rango = new Map(az.map((i, k) => [i, k % 3]));
  return barajar(clases.map((c, i) => ({ i, clase: c, zona: zonas[i], azar: rango.get(i) })), r);
})();
const CRITERIOS_EST = {
  clase: { nombre: 'la clase', clave: 'clase', vals: NOM_CL, etq: (v) => `Clase ${NOM_CL[v]}` },
  zona: { nombre: 'la zona', clave: 'zona', vals: NOM_ZO, etq: (v) => NOM_ZO[v] },
  azar: { nombre: 'un sorteo', clave: 'azar', vals: ['1', '2', '3'], etq: (v) => `Grupo ${v + 1}` },
};
export function Estratificado() {
  const [crit, setCrit] = useState('clase');
  const [reparto, setReparto] = useState('prop');
  const [semAl, setSemAl] = useState(3);
  const C = CRITERIOS_EST[crit];
  const estratos = useMemo(() => [0, 1, 2].map((v) => POB.filter((o) => o[C.clave] === v)), [C]);
  const cuota = useMemo(() => estratos.map((E) => (reparto === 'prop' ? Math.round(E.length * 0.2) : 8)), [estratos, reparto]);
  const frames = useMemo(() => {
    const r = semilla(21);
    const fr = [{ e: '0', dividido: false, sel: new Set(), msg: 'Población de 120 elementos con dos atributos conocidos: clase (A 60 %, B 30 %, C 10 %) y zona. Queremos una muestra de unos 24 (20 %).' }];
    const msgDiv = {
      clase: 'Los estratos NO se sortean: los define un atributo conocido. Con «clase» sale un estrato por valor (A, B, C) y cada elemento cae en uno solo, así que no se solapan.',
      zona: 'Los estratos los define el atributo «zona»: Norte, Sur y Este. Mira que cada caja mezcla clases: estratificar por zona no garantiza el 60 / 30 / 10 de la clase.',
      azar: 'Estratos al azar: se reparten los 120 en tres grupos de 40 echando a suertes. Cada grupo ya se parece a toda la población, así que muestrear dentro no aporta nada: equivale a un aleatorio simple.',
    };
    fr.push({ e: '1', dividido: true, sel: new Set(), msg: msgDiv[crit] });
    const sel = new Set();
    [0, 1, 2].forEach((g) => {
      const E = estratos[g];
      barajar(E, r).slice(0, cuota[g]).forEach((o) => sel.add(o.i));
      const regla = reparto === 'prop' ? `el 20 % de ${E.length} = ${cuota[g]}` : `cuota fija = ${cuota[g]}`;
      fr.push({ e: '2.0', dividido: true, sel: new Set(sel), actual: g, msg: `${C.etq(g)} (${E.length} elementos): se eligen ${regla}, al azar dentro del estrato.` });
    });
    const porClase = [0, 1, 2].map((g) => POB.filter((o) => sel.has(o.i) && o.clase === g).length);
    fr.push({ e: '3', dividido: true, sel: new Set(sel), fin: true, msg: `La muestra final es la unión: ${sel.size} elementos, con clases A ${porClase[0]}, B ${porClase[1]}, C ${porClase[2]}. ${crit === 'clase' && reparto === 'prop' ? 'Mantiene exactamente el 60 / 30 / 10.' : crit === 'clase' ? 'Con cuota igual todas las clases pesan lo mismo: sirve para que C no desaparezca, pero ya no refleja la población.' : 'Las clases quedan como el azar quiera.'}` });
    return fr;
  }, [estratos, cuota, crit, reparto, C]);
  const total = frames[frames.length - 1].sel.size;
  const aleat = useMemo(() => new Set(barajar(POB.map((o) => o.i), semilla(semAl)).slice(0, total)), [semAl, total]);
  const p = usePasos(frames, { intervalo: 1300 });
  const f = p.frame;
  const cuentaClase = (S) => [0, 1, 2].map((g) => POB.filter((o) => S.has(o.i) && o.clase === g).length);
  const pe = cuentaClase(f.sel), pa = cuentaClase(aleat);
  const cajas = f.dividido ? estratos.map((E, g) => ({ g, E, titulo: C.etq(g) })) : [{ g: -1, E: POB, titulo: 'Población' }];
  return (
    <Marco
      titulo="Muestreo estratificado: de dónde salen los estratos y cómo se reparte la muestra"
      controles={
        <>
          <label className="fila-control" style={{ margin: 0 }}>estratificar por
            <select value={crit} onChange={(e) => setCrit(e.target.value)}>
              <option value="clase">clase (conocida)</option>
              <option value="zona">zona (conocida)</option>
              <option value="azar">sorteo (estratos al azar)</option>
            </select>
          </label>
          <label className="fila-control" style={{ margin: 0 }}>reparto
            <select value={reparto} onChange={(e) => setReparto(e.target.value)}>
              <option value="prop">proporcional (20 % de cada uno)</option>
              <option value="igual">igual (8 de cada uno)</option>
            </select>
          </label>
        </>
      }
    >
      <Controles p={p} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {cajas.map(({ g, E, titulo }) => {
          const activa = f.actual == null || f.actual === g || f.fin || g < 0;
          return (
            <div key={g} style={{ flex: `1 1 ${Math.max(96, E.length * 2.2)}px`, border: '2px solid #1f2b25', borderRadius: 8, padding: 6, background: '#fbfcfa', opacity: activa ? 1 : 0.35, transition: 'opacity .3s' }}>
              <div style={{ fontFamily: 'var(--f-titulo)', fontSize: 12, marginBottom: 5 }}>
                <b>{titulo}</b> · {E.length}{g >= 0 && <span> · cuota <b>{cuota[g]}</b></span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 14px)', gap: 3 }}>
                {E.map((o) => {
                  const el = f.sel.has(o.i);
                  return <span key={o.i} title={`clase ${NOM_CL[o.clase]} · ${NOM_ZO[o.zona]}`} style={{ width: 14, height: 14, borderRadius: 3, background: el ? COLE[o.clase] : '#fbfcfa', border: `2px solid ${COLE[o.clase]}`, transition: 'all .3s' }} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="estadisticas" style={{ marginTop: 6 }}>
        {NOM_CL.map((n, g) => <span key={n} style={{ color: COLE[g] }}>■ clase {n}</span>)}
        <span>relleno = elegido · hueco = no elegido</span>
      </div>
      <Mensaje>{f.msg}</Mensaje>
      <div className="vb-barras" style={{ marginTop: 10 }}>
        {[['Población', [72, 36, 12], 120], ['Estratificada', pe, Math.max(1, pe[0] + pe[1] + pe[2])], ['Aleatoria simple', pa, Math.max(1, total)]].map(([n, v, tot]) => (
          <div className="vb-fila" key={n}>
            <span className="vb-e">{n}</span>
            <div style={{ display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden', border: '1px solid #c3ccc4' }}>
              {v.map((x, g) => <span key={g} style={{ width: `${(x / tot) * 100}%`, background: COLE[g], color: '#fff', fontSize: 11, fontFamily: 'var(--f-titulo)', textAlign: 'center', lineHeight: '18px' }}>{x ? `${NOM_CL[g]} ${Math.round((x / tot) * 100)}%` : ''}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="estadisticas"><button className="boton" onClick={() => setSemAl((x) => x + 1)} type="button">Otra muestra aleatoria</button><span>las barras muestran la proporción de clases en cada muestra</span></div>
    </Marco>
  );
}

// ═════════ SI en grandes BD: estrategia de estratificación ═════════
export function Estratificacion() {
  const [t, setT] = useState(3);
  const datos = useMemo(() => lunas(180, 0.2, 31), []);
  const frames = useMemo(() => {
    const r = semilla(4);
    // estratos que conservan la proporción de clases
    const porClase = [0, 1].map((c) => barajar(datos.filter((d) => d.c === c), r));
    const estratos = Array.from({ length: t }, () => []);
    porClase.forEach((lista) => lista.forEach((d, i) => estratos[i % t].push(d)));
    const fr = [{ e: '0', est: null, msg: `Conjunto de datos «grande»: ${datos.length} instancias. Aplicar CNN a todo costaría ~${datos.length}² = ${(datos.length ** 2).toLocaleString('es-ES')} comparaciones.` }];
    fr.push({ e: '1', est: estratos, msg: `Se divide en t = ${t} estratos disjuntos de ~${Math.round(datos.length / t)} instancias, cada uno con la misma proporción de clases.` });
    const sel = [];
    const ts = new Set();
    estratos.forEach((E, k) => {
      const nTR = Math.round(E.length * 0.8);
      const TR = E.slice(0, nTR);
      E.slice(nTR).forEach((d) => ts.add(d));
      fr.push({ e: '2.0', est: estratos, actual: k, ts: new Set(ts), sel: [...sel], msg: `Estrato ${k + 1}: se separa en TR${k + 1} (${TR.length}) y TS${k + 1} (${E.length - nTR}) — los huecos son el test.` });
      const S = cnn(TR, r);
      sel.push(...S);
      fr.push({ e: '2.1', est: estratos, actual: k, ts: new Set(ts), sel: [...sel], msg: `Se aplica la selección (CNN) solo dentro de TR${k + 1}: ${TR.length}² = ${(TR.length ** 2).toLocaleString('es-ES')} comparaciones → SS${k + 1} con ${S.length} instancias.` });
    });
    const acc = acierto1NN(sel, [...ts]);
    fr.push({ e: '3', est: estratos, ts: new Set(ts), sel: [...sel], fin: true, msg: `Unión de los SSᵢ: ${sel.length} instancias (${Math.round((1 - sel.length / (datos.length - ts.size)) * 100)} % de reducción), acierto 1-NN en test ${Math.round(acc * 100)} %. Coste total ≈ t·(n/t)² = n²/t.` });
    return fr;
  }, [t, datos]);
  const p = usePasos(frames, { intervalo: 1300 });
  const f = p.frame;
  const W = 520, H = 280, sx = escala(0, 10, 10, W - 10), sy = escala(0, 6, H - 10, 10);
  const COLS = ['#2f62a8', '#3b7a52', '#a8700f', '#7b4c9e', '#b0413e', '#4b9fb5'];
  const estDe = new Map();
  (f.est || []).forEach((E, k) => E.forEach((d) => estDe.set(d, k)));
  const selSet = new Set(f.sel || []);
  const n = datos.length;
  const costes = [1, 2, 3, 4, 6].map((k) => ({ k, c: (n * 0.8) ** 2 / k }));
  return (
    <Marco
      titulo="Estrategia de estratificación paso a paso"
      controles={<label className="fila-control" style={{ margin: 0 }}>t estratos <select value={t} onChange={(e) => setT(Number(e.target.value))}>{[2, 3, 4, 6].map((k) => <option key={k} value={k}>{k}</option>)}</select></label>}
    >
      <Controles p={p} />
      <div className="dos-col" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Estratos">
          <rect width={W} height={H} fill="#fbfcfa" />
          {datos.map((d, i) => {
            const k = estDe.get(d);
            const enActual = f.actual == null || k === f.actual || f.fin;
            const esTest = f.ts && f.ts.has(d);
            const elegido = selSet.has(d);
            const col = k == null ? (d.c ? COLORES.b : COLORES.a) : COLS[k % COLS.length];
            return (
              <g key={i} opacity={enActual ? 1 : 0.15}>
                <circle cx={sx(d.x)} cy={sy(d.y)} r={elegido ? 5.5 : 3.6} fill={esTest ? '#fbfcfa' : col} stroke={col} strokeWidth={esTest ? 1.6 : 0} />
                {elegido && <circle cx={sx(d.x)} cy={sy(d.y)} r={7.5} fill="none" stroke="#1f2b25" strokeWidth="1.4" />}
                {k != null && !esTest && <text x={sx(d.x)} y={sy(d.y) + 3} textAnchor="middle" fontSize="7" fill="#fff" fontFamily="var(--f-titulo)">{d.c ? '×' : ''}</text>}
              </g>
            );
          })}
        </svg>
        <div>
          <p className="marcador" style={{ marginTop: 0 }}>¿Por qué estratificar? Comparaciones de CNN (∝ n²)</p>
          {costes.map(({ k, c }) => (
            <div key={k} className="vb-fila" style={{ gridTemplateColumns: '70px 1fr' }}>
              <span className="vb-e">{k === 1 ? 'sin estratos' : `t = ${k}`}</span>
              <div className="vb-barra"><i style={{ width: `${(c / costes[0].c) * 100}%`, background: k === t ? COLORES.c : '#a9b5ab' }} /><span>{Math.round(c).toLocaleString('es-ES')}</span></div>
            </div>
          ))}
          <p className="pie">Con t estratos el coste baja de n² a n²/t (y de n³ a n³/t²). Con medio millón de instancias es la diferencia entre horas y segundos.</p>
          <div className="leyenda-puntos">
            <span>color = estrato</span><span>× = clase 2</span><span>hueco = test</span><span>anillo negro = seleccionada</span>
          </div>
        </div>
      </div>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

// ═════════ SI + árboles: árbol entrenado con todo vs con lo seleccionado ═════════
export function SiArbol() {
  const [sel, setSel] = useState('cnn');
  const datos = useMemo(() => lunas(320, 0.32, 12), []);
  const TR = useMemo(() => datos.filter((_, i) => i % 4 !== 0), [datos]);
  const TS = useMemo(() => datos.filter((_, i) => i % 4 === 0), [datos]);
  const completo = useMemo(() => cart(TR), [TR]);
  const frames = useMemo(() => {
    const r = semilla(6);
    const S = sel === 'cnn' ? cnn(TR, r) : sel === 'enn' ? (() => { const v = (p) => { const vs = TR.filter((q) => q !== p).map((q) => [(q.x - p.x) ** 2 + (q.y - p.y) ** 2, q]).sort((a, b) => a[0] - b[0]).slice(0, 3); return vs.filter(([, q]) => q.c === p.c).length >= 2; }; return TR.filter(v); })() : barajar(TR, r).slice(0, Math.round(TR.length * 0.25));
    const hojas = cart(S);
    const acc = TS.filter((p) => predCart(hojas, p) === p.c).length / TS.length;
    const accC = TS.filter((p) => predCart(completo, p) === p.c).length / TS.length;
    return [
      { e: '0', S: null, hojas: null, msg: `Datos de entrenamiento: ${TR.length} instancias (con ruido). Un árbol sin podar sobre todo tiene ${completo.length} hojas (= reglas) y acierta el ${Math.round(accC * 100)} % en test.` },
      { e: '1', S, hojas: null, msg: `Selección de instancias (${sel === 'cnn' ? 'CNN' : sel === 'enn' ? 'ENN' : 'muestreo aleatorio 25 %'}): quedan ${S.length} instancias (TSS).` },
      { e: '2', S, hojas, msg: 'Se entrena el árbol solo con TSS: cada rectángulo es una hoja.' },
      { e: '3', S, hojas, fin: true, acc, accC, msg: `Árbol con ${hojas.length} hojas (antes ${completo.length}) y ${Math.round(acc * 100)} % de acierto en test (antes ${Math.round(accC * 100)} %).` },
    ];
  }, [sel, TR, TS, completo]);
  const p = usePasos(frames, { intervalo: 1600 });
  const f = p.frame;
  const W = 520, H = 300, sx = escala(0, 10, 0, W), sy = escala(0, 6, H, 0);
  const hojas = f.hojas || (f.e === '0' ? completo : null);
  const S = f.S ? new Set(f.S) : null;
  return (
    <Marco
      titulo="Árbol con todos los datos frente a árbol con instancias seleccionadas"
      controles={['cnn', 'enn', 'aleatorio'].map((k) => <button key={k} className={`boton ${sel === k ? 'activo' : ''}`} onClick={() => setSel(k)} type="button">{k === 'cnn' ? 'CNN' : k === 'enn' ? 'ENN' : 'Aleatorio 25 %'}</button>)}
    >
      <Controles p={p} />
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Particiones del árbol">
        <rect width={W} height={H} fill="#fbfcfa" />
        {hojas && hojas.map((h, i) => <rect key={i} x={sx(h.x0)} y={sy(h.y1)} width={sx(h.x1) - sx(h.x0)} height={sy(h.y0) - sy(h.y1)} fill={h.c ? '#f5e0df' : '#dce6f3'} stroke="#4a5a51" strokeWidth="0.7" opacity={f.e === '0' ? 0.6 : 1} />)}
        {TR.map((d, i) => <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={S && S.has(d) ? 4.2 : 2.6} fill={d.c ? COLORES.b : COLORES.a} opacity={S && !S.has(d) ? 0.12 : 0.9} />)}
      </svg>
      <Mensaje>{f.msg}</Mensaje>
      <div className="estadisticas"><span>hojas (todo): <b>{completo.length}</b></span>{f.hojas && <span>hojas (TSS): <b>{f.hojas.length}</b></span>}<span>menos hojas = reglas más cortas y legibles</span></div>
    </Marco>
  );
}
