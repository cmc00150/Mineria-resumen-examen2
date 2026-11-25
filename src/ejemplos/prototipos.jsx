// Selección de prototipos: un ejemplo paso a paso por algoritmo, sincronizado con su esquema.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, COLORES, escala } from './comun.jsx';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';
import { semilla, lunas, d2, barajar, acierto1NN, aciertoLOO } from './vecinos.js';
import { redondear } from '../lib/stats.js';
import { dibujar } from '../lib/anim.js';

const NOMC = ['azul', 'roja'];
const W = 520, H = 300;
const sx = escala(0, 10, 10, W - 10), sy = escala(0, 6, H - 10, 10);

function datosBase(s = 41) {
  const TR = lunas(60, 0.3, s).map((p, i) => ({ ...p, i }));
  const TS = lunas(120, 0.3, s + 100);
  return { TR, TS };
}
const cercanos = (conj, p, k, excluir = true) =>
  conj.filter((q) => !excluir || q !== p).map((q) => [d2(p, q), q]).sort((a, b) => a[0] - b[0]).slice(0, k).map((x) => x[1]);
const mayoria = (vs) => {
  const c = [0, 0];
  vs.forEach((v) => c[v.c]++);
  return c[1] > c[0] ? 1 : 0;
};

// ───────── Visor común ─────────
function Visor({ TR, TS, frame, modo }) {
  const ref = useRef(null);
  const S = new Set(frame.S || []);
  const marc = new Set(frame.marcados || []);
  const act = new Set(frame.actualizados || []);
  useEffect(() => {
    if (ref.current) dibujar(ref.current.querySelectorAll('line.l'), { dur: 260, paso: 30 });
  }, [frame]);
  const accS = frame.S && frame.S.length ? acierto1NN(frame.S.map((i) => TR[i]), TS) : null;
  const COLB = ['#2f62a8', '#3b7a52', '#a8700f'];
  return (
    <>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Instancias de entrenamiento">
        <rect width={W} height={H} fill="#fbfcfa" />
        {(frame.lineas || []).map(([a, b, c], k) => (
          <line key={`${k}-${a}-${b}`} className="l" x1={sx(TR[a].x)} y1={sy(TR[a].y)} x2={sx(TR[b].x)} y2={sy(TR[b].y)} stroke={c || '#1f2b25'} strokeWidth="1.6" />
        ))}
        {TR.map((p, i) => {
          const dentro = S.has(i);
          const col = p.c ? COLORES.b : COLORES.a;
          const pendiente = modo === 'construye' && !dentro;
          return (
            <g key={i}>
              {frame.bloques && <circle cx={sx(p.x)} cy={sy(p.y)} r={8} fill="none" stroke={COLB[frame.bloques[i]] || 'none'} strokeWidth="2" opacity={dentro ? 0.8 : 0.15} />}
              <circle cx={sx(p.x)} cy={sy(p.y)} r={dentro ? 5 : 3.4} fill={dentro ? col : '#fbfcfa'} stroke={col} strokeWidth="1.5" opacity={dentro ? 1 : pendiente ? 0.55 : 0.18} />
              {marc.has(i) && <path d={`M${sx(p.x) - 6},${sy(p.y) - 6}l12,12M${sx(p.x) + 6},${sy(p.y) - 6}l-12,12`} stroke="#1f2b25" strokeWidth="2.2" />}
              {act.has(i) && <circle cx={sx(p.x)} cy={sy(p.y)} r={9} fill="none" stroke={COLORES.d} strokeWidth="2" strokeDasharray="3 2" />}
            </g>
          );
        })}
        {frame.foco != null && <circle cx={sx(TR[frame.foco].x)} cy={sy(TR[frame.foco].y)} r={11} fill="none" stroke="#1f2b25" strokeWidth="2.5" />}
      </svg>
      <div className="leyenda-puntos">
        <span><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={COLORES.a} /></svg>en el conjunto</span>
        <span><svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="#fbfcfa" stroke={COLORES.a} strokeWidth="1.5" /></svg>{modo === 'construye' ? 'aún no está en S' : 'eliminada'}</span>
        <span><svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="none" stroke="#1f2b25" strokeWidth="2" /></svg>instancia que se examina</span>
        {frame.marcados && <span>✕ marcada para borrar</span>}
        {frame.actualizados && <span style={{ color: COLORES.d }}>◌ historial actualizado</span>}
      </div>
      <Mensaje>{frame.msg}</Mensaje>
      <div className="estadisticas">
        <span>en el conjunto: <b>{frame.S ? frame.S.length : 0}</b> / {TR.length}</span>
        <span>reducción: <b>{frame.S ? Math.round((1 - frame.S.length / TR.length) * 100) : 0} %</b></span>
        {accS != null && <span>acierto 1-NN en test: <b>{Math.round(accS * 100)} %</b> (todas: {Math.round(acierto1NN(TR, TS) * 100)} %)</span>}
        {frame.fit != null && <span>fitness: <b>{redondear(frame.fit, 3)}</b></span>}
      </div>
    </>
  );
}

function Demo({ titulo, generar, modo, intervalo = 650, controles, extra, semillaInicial = 41 }) {
  const [s, setS] = useState(semillaInicial);
  const { TR, TS } = useMemo(() => datosBase(s), [s]);
  const frames = useMemo(() => generar(TR), [TR, generar]);
  const p = usePasos(frames, { intervalo });
  return (
    <Marco titulo={titulo} controles={<>{controles}<button className="boton" onClick={() => setS((x) => x + 1)} type="button">Otros datos</button></>}>
      <Controles p={p} />
      <Visor TR={TR} TS={TS} frame={p.frame} modo={modo} />
      {extra && extra(p.frame, TR)}
    </Marco>
  );
}

// ═════════ CNN ═════════
function framesCNN(TR) {
  const r = semilla(7);
  const orden = barajar(TR.map((p) => p.i), r);
  const S = [0, 1].map((c) => orden.find((i) => TR[i].c === c));
  const fr = [{ e: '0', S: [...S], msg: `S empieza con una instancia al azar de cada clase (la ${S[0] + 1} azul y la ${S[1] + 1} roja). Las demás están pendientes.` }];
  let pasada = 1;
  let cambio = true;
  while (cambio && pasada < 6) {
    cambio = false;
    for (const i of orden) {
      if (S.includes(i)) continue;
      const nn = cercanos(S.map((k) => TR[k]), TR[i], 1, false)[0];
      const bien = nn.c === TR[i].c;
      if (pasada === 1 || !bien) fr.push({ e: '1.0', S: [...S], foco: i, lineas: [[i, nn.i, nn.c ? COLORES.b : COLORES.a]], msg: `${pasada > 1 ? `Pasada ${pasada}. ` : ''}Instancia ${i + 1} (${NOMC[TR[i].c]}): su vecino más cercano en S es ${NOMC[nn.c]} → 1-NN la clasifica como ${NOMC[nn.c]}.` });
      if (!bien) {
        S.push(i);
        cambio = true;
        fr.push({ e: '1.1', S: [...S], foco: i, msg: `Mal clasificada: S todavía no «conoce» esta zona (está en el borde entre clases) → se añade a S.` });
      } else if (pasada === 1) {
        fr.push({ e: '1.1', S: [...S], foco: i, msg: 'Bien clasificada: S ya representa esta zona, la instancia es redundante → se descarta.' });
      }
    }
    if (cambio) fr.push({ e: '1', S: [...S], msg: `Fin de la pasada ${pasada}: se añadieron instancias, así que se repite con las pendientes.` });
    pasada++;
  }
  fr.push({ e: '2', S: [...S], msg: `Ninguna pasada añade nada: S queda con ${S.length} instancias, casi todas en el borde. Las del interior se clasifican bien con ellas.` });
  return fr;
}
export function PasoCNN() {
  return <Demo titulo="CNN paso a paso" generar={framesCNN} modo="construye" intervalo={600} />;
}

// ═════════ ENN / AllKNN ═════════
function framesENN(TR, ks = [3]) {
  let vivos = TR.map((p) => p.i);
  const fr = [{ e: '0', S: [...vivos], msg: `Entrenamiento completo (${vivos.length} instancias). k = ${ks.join(', ')}.` }];
  ks.forEach((k, ronda) => {
    const marcados = [];
    vivos.forEach((i) => {
      const vs = cercanos(vivos.map((j) => TR[j]), TR[i], k);
      const otra = vs.filter((v) => v.c !== TR[i].c).length;
      const malo = otra > k / 2;
      if (ks.length === 1 || malo) fr.push({ e: '1.0', S: [...vivos], marcados: [...marcados], foco: i, lineas: vs.map((v) => [i, v.i, v.c ? COLORES.b : COLORES.a]), msg: `${ks.length > 1 ? `k = ${k}. ` : ''}Instancia ${i + 1} (${NOMC[TR[i].c]}): de sus ${k} vecinos, ${k - otra} son de su clase y ${otra} de la otra.` });
      if (malo) {
        marcados.push(i);
        fr.push({ e: '1.1', S: [...vivos], marcados: [...marcados], foco: i, msg: 'La mayoría la clasifica mal: es ruido o está en una zona confusa → se marca (aún no se borra).' });
      } else if (ks.length === 1) {
        fr.push({ e: '1.1', S: [...vivos], marcados: [...marcados], foco: i, msg: 'Sus vecinos la clasifican bien → se mantiene.' });
      }
    });
    vivos = vivos.filter((i) => !marcados.includes(i));
    fr.push({ e: '2', S: [...vivos], msg: `Se borran a la vez las ${marcados.length} marcadas (por lotes: el orden no importa).${ks.length > 1 && ronda < ks.length - 1 ? ` Siguiente ronda con k = ${ks[ronda + 1]}.` : ''}` });
  });
  fr.push({ e: '3', S: [...vivos], msg: `Conjunto editado: ${vivos.length} instancias. La frontera queda limpia, pero el interior sigue lleno (reduce poco).` });
  return fr;
}
export function PasoENN() {
  const [all, setAll] = useState(false);
  const gen = useMemo(() => (TR) => framesENN(TR, all ? [3, 5, 7] : [3]), [all]);
  return (
    <Demo
      titulo={all ? 'AllKNN: ENN con k = 3, 5 y 7' : 'ENN paso a paso (k = 3)'}
      generar={gen}
      modo="quita"
      intervalo={550}
      controles={<><button className={`boton ${!all ? 'activo' : ''}`} onClick={() => setAll(false)} type="button">ENN</button><button className={`boton ${all ? 'activo' : ''}`} onClick={() => setAll(true)} type="button">AllKNN</button></>}
    />
  );
}

// ═════════ Multiedit ═════════
function framesMultiedit(TR, b = 3) {
  const r = semilla(12);
  let vivos = TR.map((p) => p.i);
  const fr = [{ e: '0', S: [...vivos], msg: `Entrenamiento completo (${vivos.length}). Se usarán b = ${b} bloques.` }];
  for (let it = 1; it <= 6; it++) {
    const orden = barajar(vivos, r);
    const bloques = {};
    orden.forEach((i, k) => (bloques[i] = k % b));
    fr.push({ e: '1.0', S: [...vivos], bloques: { ...bloques }, msg: `Iteración ${it}: se reparten las ${vivos.length} instancias al azar en ${b} bloques (anillo de color = bloque).` });
    const marcados = [];
    for (let k = 0; k < b; k++) {
      const ref = orden.filter((i) => bloques[i] === (k + 1) % b).map((i) => TR[i]);
      orden.filter((i) => bloques[i] === k).forEach((i) => {
        if (cercanos(ref, TR[i], 1, false)[0].c !== TR[i].c) marcados.push(i);
      });
      fr.push({ e: '1.1', S: [...vivos], bloques: { ...bloques }, marcados: [...marcados], msg: `Bloque ${k + 1} clasificado con 1-NN usando solo el bloque ${((k + 1) % b) + 1}: ${marcados.length} mal clasificadas hasta ahora.` });
    }
    vivos = vivos.filter((i) => !marcados.includes(i));
    fr.push({ e: '1.2', S: [...vivos], msg: `Se quitan las ${marcados.length} mal clasificadas.${marcados.length ? ' Hubo cambios → otra iteración.' : ' No hubo cambios → fin.'}` });
    if (!marcados.length) break;
  }
  fr.push({ e: '2', S: [...vivos], msg: `Conjunto editado: ${vivos.length} instancias. Al clasificar con bloques distintos se eliminan los ruidosos de forma más agresiva que ENN.` });
  return fr;
}
export function PasoMultiedit() {
  return <Demo titulo="Multiedit paso a paso (3 bloques)" generar={framesMultiedit} modo="quita" intervalo={1100} />;
}

// ═════════ IB3 (versión simplificada) ═════════
function framesIB3(TR) {
  const r = semilla(3);
  const orden = barajar(TR.map((p) => p.i), r);
  const S = [];
  const reg = {};
  const ok = (i) => reg[i].tot >= 2 && reg[i].ok / reg[i].tot >= 0.6;
  const fr = [{ e: '0', S: [], msg: 'S empieza vacío. Cada instancia de S lleva un historial: aciertos / intentos.' }];
  orden.forEach((i, n) => {
    const x = TR[i];
    if (!S.length) {
      S.push(i); reg[i] = { ok: 0, tot: 0 };
      fr.push({ e: '1.1', S: [...S], foco: i, msg: `S está vacío: la instancia ${i + 1} entra directamente.` });
      return;
    }
    const aceptables = S.filter(ok);
    const cand = (aceptables.length ? aceptables : S).map((k) => TR[k]);
    const v = aceptables.length ? cercanos(cand, x, 1, false)[0] : cand[Math.floor(r() * cand.length)];
    const dv = d2(v, x);
    if (n < 30) fr.push({ e: '1.0', S: [...S], foco: i, lineas: [[i, v.i, v.c ? COLORES.b : COLORES.a]], msg: `Instancia ${i + 1}: ${aceptables.length ? 'su vecino aceptable más cercano en S' : 'aún no hay aceptables, se toma uno de S al azar'} es ${NOMC[v.c]}.` });
    if (v.c !== x.c) {
      S.push(i); reg[i] = { ok: 0, tot: 0 };
      fr.push({ e: '1.1', S: [...S], foco: i, msg: 'Clase distinta → se añade a S (como en CNN).' });
    }
    const act = S.filter((k) => k !== i && d2(TR[k], x) <= dv + 1e-12);
    act.forEach((k) => { reg[k].tot++; if (TR[k].c === x.c) reg[k].ok++; });
    if (n < 30 && act.length) fr.push({ e: '1.2', S: [...S], foco: i, actualizados: act, msg: `Se actualiza el historial de las ${act.length} de S que están igual de cerca o más: aciertan si son de la misma clase que ${i + 1}.` });
    const malos = S.filter((k) => reg[k].tot >= 3 && reg[k].ok / reg[k].tot < 0.4);
    if (malos.length) {
      malos.forEach((k) => S.splice(S.indexOf(k), 1));
      fr.push({ e: '1.3', S: [...S], marcados: malos, msg: `${malos.length} instancia(s) con mal historial (< 40 % de aciertos) salen de S: así se filtra el ruido.` });
    }
  });
  const finales = S.filter(ok);
  fr.push({ e: '2', S: [...finales], msg: `IB3 devuelve solo las aceptables (≥ 60 % de aciertos con al menos 2 intentos): ${finales.length} de las ${S.length} que había en S. (Versión simplificada: el IB3 original usa intervalos de confianza.)` });
  return fr;
}
export function PasoIB3() {
  return <Demo titulo="IB3 paso a paso (simplificado)" generar={framesIB3} modo="construye" intervalo={750} />;
}

// ═════════ DROP3 ═════════
function framesDROP3(TR, k = 3) {
  let S = TR.map((p) => p.i);
  const fr = [{ e: '0', S: [...S], msg: `Entrenamiento completo (${S.length}), k = ${k}.` }];
  const ruido = S.filter((i) => mayoria(cercanos(S.map((j) => TR[j]), TR[i], k)) !== TR[i].c);
  fr.push({ e: '1', S: [...S], marcados: ruido, msg: `Filtro de ruido (ENN, k = ${k}): ${ruido.length} instancias mal clasificadas por sus vecinos.` });
  S = S.filter((i) => !ruido.includes(i));
  const enemigo = (i) => Math.min(...S.filter((j) => TR[j].c !== TR[i].c).map((j) => d2(TR[i], TR[j])));
  const orden = [...S].sort((a, b) => enemigo(b) - enemigo(a));
  fr.push({ e: '2', S: [...S], msg: 'Se ordenan por distancia a su enemigo más cercano (instancia de otra clase), de mayor a menor: primero se intenta quitar el interior, el borde se examina al final.' });
  const bienClasif = (conj, a) => mayoria(cercanos(conj.map((j) => TR[j]), TR[a], k)) === TR[a].c;
  orden.forEach((x, n) => {
    if (!S.includes(x)) return;
    const asociados = S.filter((a) => a !== x && cercanos(S.map((j) => TR[j]), TR[a], k + 1).some((q) => q.i === x));
    const con = asociados.filter((a) => bienClasif(S, a)).length;
    const sinX = S.filter((j) => j !== x);
    const sin = asociados.filter((a) => bienClasif(sinX, a)).length;
    const quitar = sin >= con;
    if (quitar) S = sinX;
    if (n < 40 || !quitar) fr.push({ e: '3.0', S: [...S], foco: x, lineas: asociados.map((a) => [x, a, '#a8700f']), msg: `Instancia ${x + 1}: ${asociados.length} asociados (la tienen entre sus ${k + 1} vecinos). Bien clasificados con ella: ${con}, sin ella: ${sin} → ${quitar ? 'no hace falta, se elimina' : 'es necesaria, se queda'}.` });
  });
  fr.push({ e: '4', S: [...S], msg: `Quedan ${S.length} instancias: limpia ruido (paso ENN) y además condensa (híbrido).` });
  return fr;
}
export function PasoDROP3() {
  return <Demo titulo="DROP3 paso a paso (k = 3)" generar={framesDROP3} modo="quita" intervalo={650} />;
}

// ═════════ RMHC ═════════
const fitness = (S, TR) => 0.5 * aciertoLOO(S.map((i) => TR[i]), TR) + 0.5 * (1 - S.length / TR.length);
function framesRMHC(TR, m = 8) {
  const r = semilla(5);
  let S = barajar(TR.map((p) => p.i), r).slice(0, m);
  let acc = aciertoLOO(S.map((i) => TR[i]), TR);
  const fr = [{ e: '0', S: [...S], fit: acc, hist: [acc], msg: `Subconjunto aleatorio de tamaño fijo m = ${m}. Acierto 1-NN sobre el entrenamiento: ${Math.round(acc * 100)} %.` }];
  const hist = [acc];
  for (let it = 1; it <= 40; it++) {
    const fuera = TR.map((p) => p.i).filter((i) => !S.includes(i));
    const sale = S[Math.floor(r() * S.length)];
    const entra = fuera[Math.floor(r() * fuera.length)];
    const nuevo = S.map((i) => (i === sale ? entra : i));
    const a2 = aciertoLOO(nuevo.map((i) => TR[i]), TR);
    const mejora = a2 > acc;
    fr.push({ e: '1.0', S: [...S], foco: entra, marcados: [sale], fit: acc, hist: [...hist], msg: `Iteración ${it}: se prueba a cambiar la ${sale + 1} (✕) por la ${entra + 1} (círculo). Acierto: ${Math.round(a2 * 100)} %.` });
    if (mejora) { S = nuevo; acc = a2; }
    hist.push(acc);
    fr.push({ e: '1.1', S: [...S], fit: acc, hist: [...hist], msg: mejora ? `Mejora (${Math.round(acc * 100)} %) → se acepta el cambio.` : 'No mejora → se deshace.' });
  }
  fr.push({ e: '2', S: [...S], fit: acc, hist: [...hist], msg: `Tras 40 iteraciones: ${m} instancias con ${Math.round(acc * 100)} % de acierto. El tamaño nunca cambia.` });
  return fr;
}
function Curva({ hist, etq }) {
  if (!hist || hist.length < 2) return null;
  const Wc = 260, Hc = 60;
  const mn = Math.min(...hist), mx = Math.max(...hist);
  const d = hist.map((v, i) => `${i ? 'L' : 'M'}${(i / (hist.length - 1)) * Wc},${Hc - 4 - ((v - mn) / (mx - mn || 1)) * (Hc - 8)}`).join('');
  return (
    <div className="estadisticas" style={{ alignItems: 'center' }}>
      <span>{etq}</span>
      <svg viewBox={`0 0 ${Wc} ${Hc}`} width={Wc} height={Hc} style={{ background: '#fbfcfa', border: '1px solid #c3ccc4', borderRadius: 4 }}><path d={d} fill="none" stroke={COLORES.c} strokeWidth="2" /></svg>
    </div>
  );
}
export function PasoRMHC() {
  return <Demo titulo="RMHC paso a paso (m = 8)" generar={framesRMHC} modo="quita" intervalo={600} extra={(f) => <Curva hist={f.hist} etq="acierto por iteración" />} />;
}

// ═════════ CHC y SSMA (evolutivos) ═════════
function Cromosoma({ bits }) {
  if (!bits) return null;
  return (
    <div className="estadisticas" style={{ alignItems: 'center' }}>
      <span>mejor cromosoma</span>
      <span style={{ display: 'inline-flex', gap: 1, flexWrap: 'wrap', maxWidth: 420 }}>
        {bits.map((b, i) => <i key={i} style={{ width: 6, height: 12, background: b ? '#1f2b25' : '#e4e9e2' }} />)}
      </span>
    </div>
  );
}
function evolutivo(TR, { memetico }) {
  const r = semilla(memetico ? 9 : 2);
  const n = TR.length;
  const fit = (bits) => fitness(bits.map((b, i) => (b ? i : -1)).filter((i) => i >= 0), TR);
  const aleatorio = () => Array.from({ length: n }, () => (r() < 0.3 ? 1 : 0));
  let pob = Array.from({ length: 8 }, aleatorio).map((b) => ({ b, f: fit(b) }));
  const mejor = () => pob.reduce((a, c) => (c.f > a.f ? c : a));
  const S = (b) => b.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
  const hist = [mejor().f];
  const fr = [{ e: '0', S: S(mejor().b), bits: mejor().b, fit: mejor().f, hist: [...hist], msg: `Población de 8 cromosomas de ${n} bits (1 = la instancia se queda). Fitness = ½·acierto 1-NN + ½·reducción.` }];
  for (let g = 1; g <= 25; g++) {
    if (!memetico) {
      // CHC: cruce HUX de parejas al azar + selección elitista de los 8 mejores
      const hijos = [];
      const orden = barajar(pob, r);
      for (let k = 0; k < orden.length; k += 2) {
        const a = orden[k].b, c = orden[k + 1].b;
        const dif = a.map((x, i) => (x !== c[i] ? i : -1)).filter((i) => i >= 0);
        if (dif.length < 4) continue; // prevención de incesto
        const cambiar = new Set(barajar(dif, r).slice(0, Math.floor(dif.length / 2)));
        hijos.push(a.map((x, i) => (cambiar.has(i) ? c[i] : x)), c.map((x, i) => (cambiar.has(i) ? a[i] : x)));
      }
      const evaluados = hijos.map((b) => ({ b, f: fit(b) }));
      fr.push({ e: '1.0', S: S(mejor().b), bits: mejor().b, fit: mejor().f, hist: [...hist], msg: `Generación ${g}: ${hijos.length} hijos por cruce HUX (intercambia la mitad de los bits en que difieren los padres) y se evalúan.` });
      pob = [...pob, ...evaluados].sort((x, y) => y.f - x.f).slice(0, 8);
      if (!hijos.length) pob = [pob[0], ...Array.from({ length: 7 }, () => { const b = pob[0].b.map((x) => (r() < 0.35 ? 1 - x : x)); return { b, f: fit(b) }; })];
      hist.push(mejor().f);
      fr.push({ e: '1.1', S: S(mejor().b), bits: mejor().b, fit: mejor().f, hist: [...hist], msg: `${hijos.length ? 'Selección elitista: sobreviven los 8 mejores entre padres e hijos.' : 'Población demasiado parecida: reinicio alrededor del mejor (divergencia).'} Mejor: ${S(mejor().b).length} instancias.` });
    } else {
      // SSMA: un hijo por generación (cruce + mutación) + búsqueda local que intenta quitar instancias
      const [a, c] = barajar(pob, r).slice(0, 2);
      let hijo = a.b.map((x, i) => (r() < 0.5 ? x : c.b[i])).map((x) => (r() < 0.02 ? 1 - x : x));
      let fh = fit(hijo);
      fr.push({ e: '1.0', S: S(hijo), bits: hijo, fit: fh, hist: [...hist], msg: `Generación ${g}: un hijo por cruce uniforme y mutación (${S(hijo).length} instancias, fitness ${redondear(fh, 3)}).` });
      let mejoras = 0;
      barajar(S(hijo), r).slice(0, 10).forEach((i) => {
        const prueba = hijo.map((x, k) => (k === i ? 0 : x));
        const fp = fit(prueba);
        if (fp >= fh) { hijo = prueba; fh = fp; mejoras++; }
      });
      const peor = pob.reduce((x, y) => (y.f < x.f ? y : x));
      if (fh > peor.f) pob = pob.map((x) => (x === peor ? { b: hijo, f: fh } : x));
      hist.push(mejor().f);
      fr.push({ e: '1.1', S: S(hijo), bits: hijo, fit: fh, hist: [...hist], msg: `Búsqueda local: se intenta quitar instancias del hijo una a una; ${mejoras} eliminaciones no empeoran el fitness → aceptadas. ${fh > peor.f ? 'El hijo sustituye al peor de la población.' : 'No supera al peor, se descarta.'}` });
    }
  }
  const m = mejor();
  fr.push({ e: '2', S: S(m.b), bits: m.b, fit: m.f, hist: [...hist], msg: `Mejor subconjunto encontrado: ${S(m.b).length} instancias (${Math.round((1 - S(m.b).length / n) * 100)} % de reducción).` });
  return fr;
}
const genCHC = (TR) => evolutivo(TR, { memetico: false });
const genSSMA = (TR) => evolutivo(TR, { memetico: true });
export function PasoCHC() {
  return <Demo titulo="CHC paso a paso (evolutivo)" generar={genCHC} modo="quita" intervalo={700} extra={(f) => <><Cromosoma bits={f.bits} /><Curva hist={f.hist} etq="fitness del mejor" /></>} />;
}
export function PasoSSMA() {
  return <Demo titulo="SSMA paso a paso (memético)" generar={genSSMA} modo="quita" intervalo={700} extra={(f) => <><Cromosoma bits={f.bits} /><Curva hist={f.hist} etq="fitness del mejor" /></>} />;
}

// ═════════ ¿Qué es el borde? ═════════
export function Borde() {
  const { TR } = useMemo(() => datosBase(44), []);
  const [umbral, setUmbral] = useState(1.0);
  const enemigo = (p) => Math.sqrt(Math.min(...TR.filter((q) => q.c !== p.c).map((q) => d2(p, q))));
  const [sel, setSel] = useState(null);
  const borde = TR.filter((p) => enemigo(p) < umbral);
  return (
    <Marco
      titulo="¿Qué es el «borde»?"
      controles={<label className="fila-control" style={{ margin: 0 }}>anchura <input type="range" min={0.4} max={2} step={0.1} value={umbral} onChange={(e) => setUmbral(Number(e.target.value))} /></label>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Borde entre clases">
        <rect width={W} height={H} fill="#fbfcfa" />
        {sel && (() => {
          const en = TR.filter((q) => q.c !== sel.c).reduce((a, q) => (d2(sel, q) < d2(sel, a) ? q : a));
          return <line x1={sx(sel.x)} y1={sy(sel.y)} x2={sx(en.x)} y2={sy(en.y)} stroke="#1f2b25" strokeWidth="2" strokeDasharray="4 3" />;
        })()}
        {TR.map((p, i) => {
          const b = enemigo(p) < umbral;
          const col = p.c ? COLORES.b : COLORES.a;
          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSel(p)}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={b ? 6 : 4} fill={b ? col : '#fbfcfa'} stroke={col} strokeWidth="1.6" opacity={b ? 1 : 0.5} />
              {b && <circle cx={sx(p.x)} cy={sy(p.y)} r={9} fill="none" stroke="#1f2b25" strokeWidth="1" opacity="0.6" />}
            </g>
          );
        })}
      </svg>
      <Mensaje>
        {sel
          ? `Instancia ${sel.i + 1}: su «enemigo» más cercano (de la otra clase) está a ${redondear(enemigo(sel), 2)} → ${enemigo(sel) < umbral ? 'es de BORDE: cerca de la frontera, decide por dónde pasa.' : 'es INTERIOR: rodeada de su clase, sus vecinas ya la representan.'}`
          : `Rellenas = borde (${borde.length}): su vecina de la otra clase está cerca. Huecas = interior (${TR.length - borde.length}). Pulsa un punto para ver su enemigo más cercano.`}
      </Mensaje>
    </Marco>
  );
}

// ═════════ Diagrama del proceso (como en la diapositiva, explicado) ═════════
export function DiagramaPrototipos() {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) dibujar(ref.current.querySelectorAll('.fl'), { dur: 600, paso: 250 });
  }, []);
  const Cil = ({ x, y, w = 130, h = 82, t, s, c = '#c5dbe6' }) => (
    <g>
      <path d={`M${x},${y + 10} v${h - 20} a${w / 2},10 0 0 0 ${w},0 v${-(h - 20)}`} fill={c} stroke="#1f2b25" strokeWidth="1.4" />
      <ellipse cx={x + w / 2} cy={y + 10} rx={w / 2} ry={10} fill={c} stroke="#1f2b25" strokeWidth="1.4" />
      <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#1f2b25" fontFamily="var(--f-titulo)">{t}</text>
      <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fontSize="11.5" fill="#4a5a51" fontFamily="var(--f-titulo)">{s}</text>
    </g>
  );
  const Caja = ({ x, y, w = 150, h = 58, t, s, c = '#fbfcfa' }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={c} stroke="#1f2b25" strokeWidth="1.4" />
      <text x={x + w / 2} y={y + 25} textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#1f2b25" fontFamily="var(--f-titulo)">{t}</text>
      <text x={x + w / 2} y={y + 43} textAnchor="middle" fontSize="11.5" fill="#4a5a51" fontFamily="var(--f-titulo)">{s}</text>
    </g>
  );
  const fl = (d, dash) => <path className="fl" d={d} fill="none" stroke="#1f2b25" strokeWidth="1.8" strokeDasharray={dash} markerEnd="url(#pfl)" />;
  return (
    <Marco titulo="Cómo se usa la selección de prototipos">
      <svg ref={ref} viewBox="0 0 860 300" role="img" aria-label="Flujo de la selección de prototipos">
        <defs><marker id="pfl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1f2b25" /></marker></defs>
        <Cil x={20} y={30} t="Entrenamiento" s="TR · muchas instancias" />
        <Caja x={225} y={42} t="Selector" s="CNN, ENN, DROP3, CHC…" c="#e4e9e2" />
        <Cil x={450} y={30} w={120} t="Seleccionadas" s="S ⊂ TR · pocas" c="#d8e8dc" />
        <Caja x={665} y={205} w={170} t="Clasificador 1-NN" s="usa solo S como memoria" />
        <Cil x={20} y={195} t="Prueba" s="TS · no se toca" c="#f2e6cf" />
        {fl('M150,73 H223')}
        {fl('M375,71 H448')}
        {fl('M570,92 C660,92 750,120 750,203')}
        {fl('M150,236 H663')}
        <text x={406} y={226} textAnchor="middle" fontSize="12" fill="#4a5a51" fontFamily="var(--f-titulo)">cada ejemplo de TS se clasifica con su vecino más cercano en S</text>
        <text x={750} y={282} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#2f7d4f" fontFamily="var(--f-titulo)">↓ % de acierto, rapidez</text>
        {fl('M570,52 H636', '5 4')}
        <rect x={638} y={26} width={214} height={52} rx="6" fill="#fbfcfa" stroke="#7b4c9e" strokeDasharray="5 4" />
        <text x={745} y={47} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#7b4c9e" fontFamily="var(--f-titulo)">o entrenar otro algoritmo</text>
        <text x={745} y={65} textAnchor="middle" fontSize="11" fill="#4a5a51" fontFamily="var(--f-titulo)">C4.5, reglas… → modelo más pequeño</text>
      </svg>
      <p className="pie">Uso principal: S sustituye a TR como «memoria» del 1-NN (más rápido, menos ruido). Uso alternativo (línea discontinua): S se usa como conjunto de entrenamiento de otro algoritmo, ver «SI + árboles y reglas».</p>
    </Marco>
  );
}
