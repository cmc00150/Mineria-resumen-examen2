// Constructor de árboles paso a paso (TDIDT, ID3, C4.5 y CART).
// Un único generador de fotogramas; cada algoritmo solo cambia el criterio, el tipo de división y
// la correspondencia «fase → paso del esquema» (mapa) para que el esquema se ilumine.
import { useMemo, useState } from 'react';
import { Marco, ArbolSvg, COLORES } from './comun.jsx';
import { TENIS, CREDITO } from './datos.js';
import { entropia, gini, contarClases, particionar, redondear } from '../lib/stats.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

// ───────── conjuntos de datos ─────────
const RUIDO = TENIS.map((f, i) => (i === 6 ? { ...f, play: 'no' } : f)); // «overcast cool normal true» pasa de yes a no
const DATOS = {
  tenis: { nombre: 'Tenis (14 días)', filas: TENIS, clase: 'play', clases: ['yes', 'no'], attrs: ['outlook', 'temperature', 'humidity', 'windy'] },
  ruido: { nombre: 'Tenis con un día ruidoso', filas: RUIDO, clase: 'play', clases: ['yes', 'no'], attrs: ['outlook', 'temperature', 'humidity', 'windy'] },
  credito: { nombre: 'Crédito (10 clientes)', filas: CREDITO, clase: 'credito', clases: ['si', 'no'], attrs: ['ingresos', 'propietario', 'gastos'] },
};

const CRITERIOS = {
  gain: { n: 'Ganancia de información', corto: 'ganancia', max: true },
  ratio: { n: 'Ratio de ganancia', corto: 'ratio', max: true },
  gini: { n: 'Gini', corto: 'gini_split', max: false },
};

// ───────── fases → paso del esquema ─────────
export const MAPAS = {
  tdidt: { datos: '0', inicio: '1', bajar: '5.2', pura: '2', sinAttr: '3', candidatos: '4', evaluar: '4', elegir: '4', ramas: '5.0', reparto: '5.1', poda: '6', fin: '6' },
  id3: { datos: '0', inicio: '0', bajar: '4.0', pura: '4.0', sinAttr: '4.0', candidatos: '1', evaluar: '1', elegir: '1', ramas: '2', reparto: '3', poda: '5', fin: '5' },
  c45: { datos: '0', inicio: '0', bajar: '4', pura: '4', sinAttr: '4', candidatos: '1', evaluar: '2', elegir: '2', ramas: '3', reparto: '3', poda: '5', fin: '6' },
  cart: { datos: '0', inicio: '0', bajar: '4', pura: '4', sinAttr: '4', candidatos: '1', evaluar: '2', elegir: '3', ramas: '4', reparto: '4', poda: '4', fin: '4' },
};

const f3 = (x) => redondear(x, 3);
const mayoria = (cuentas, clases) => clases[cuentas.indexOf(Math.max(...cuentas))];

// subconjuntos no vacíos de valores (mitad, para no repetir complementarios)
function subconjuntos(valores) {
  const out = [];
  const n = valores.length;
  for (let m = 1; m < 2 ** (n - 1); m++) out.push(valores.filter((_, i) => (m >> i) & 1));
  return out;
}

// ───────── generador de fotogramas ─────────
function generar({ D, crit, binario, minEj, poda, mapa }) {
  const { clase, clases } = D;
  const frames = [];
  let n0 = 0;
  const raiz = { id: 'r', idx: D.filas.map((_, i) => i), libres: D.attrs.slice(), estado: 'pend', hijos: [] };
  const snap = () => JSON.parse(JSON.stringify(raiz));
  const push = (fase, msg, nodo, extra = {}) =>
    frames.push({ fase, e: mapa[fase] ?? mapa.sinAttr, msg, raiz: snap(), foco: nodo ? nodo.id : null, ...extra });

  const filasDe = (n) => n.idx.map((i) => D.filas[i]);

  function candidatosDe(n) {
    const filas = filasDe(n);
    const cands = [];
    const vistos = (a) => [...new Set(filas.map((f) => f[a]))];
    const attrs = binario ? D.attrs.filter((a) => vistos(a).length > 1) : n.libres.filter((a) => vistos(a).length > 1);
    attrs.forEach((a) => {
      const vals = vistos(a).sort();
      const divisiones = binario ? subconjuntos(vals).map((S) => ({ S })) : [{ S: null }];
      divisiones.forEach(({ S }) => {
        let partes;
        if (S) {
          const dentro = filas.filter((f) => S.includes(f[a]));
          const fuera = filas.filter((f) => !S.includes(f[a]));
          partes = [
            { etq: 'sí', valor: S.join(','), filas: dentro },
            { etq: 'no', valor: 'resto', filas: fuera },
          ];
        } else {
          partes = [...particionar(filas, a).entries()].map(([v, sub]) => ({ etq: v, valor: v, filas: sub }));
        }
        partes.forEach((p) => (p.cuentas = contarClases(p.filas, clase, clases)));
        const N = filas.length;
        const hS = entropia(contarClases(filas, clase, clases), 2);
        const eA = partes.reduce((s, p) => s + (p.filas.length / N) * entropia(p.cuentas, 2), 0);
        const splitInfo = entropia(partes.map((p) => p.filas.length), 2);
        const giniSplit = partes.reduce((s, p) => s + (p.filas.length / N) * gini(p.cuentas), 0);
        const gain = hS - eA;
        const ratio = splitInfo === 0 ? 0 : gain / splitInfo;
        const v = crit === 'gain' ? gain : crit === 'ratio' ? ratio : giniSplit;
        cands.push({ attr: a, S, etiqueta: S ? `${a} ∈ {${S.join(', ')}}` : a, partes, hS, eA, splitInfo, giniSplit, gain, ratio, v });
      });
    });
    return cands;
  }

  const hoja = (n, fase, msg) => {
    n.estado = 'hoja';
    n.clase = mayoria(n.cuentas, clases);
    push(fase, msg, n);
  };

  function procesar(n, esRaiz) {
    const filas = filasDe(n);
    n.cuentas = contarClases(filas, clase, clases);
    const resumen = clases.map((c, i) => `${n.cuentas[i]} ${c}`).join(' / ');
    push(esRaiz ? 'inicio' : 'bajar', esRaiz ? `Raíz: ${filas.length} ejemplos (${resumen}).` : `Nodo con ${filas.length} ejemplos (${resumen}).`, n);

    if (n.cuentas.filter((c) => c > 0).length <= 1) {
      hoja(n, 'pura', `Todos los ejemplos son de la clase «${mayoria(n.cuentas, clases)}» → hoja pura.`);
      return;
    }
    if (filas.length < minEj) {
      hoja(n, 'sinAttr', `Solo ${filas.length} ejemplos (menos de ${minEj}) → pre-poda: hoja con la mayoritaria «${mayoria(n.cuentas, clases)}».`);
      return;
    }
    const cands = candidatosDe(n);
    if (!cands.length) {
      hoja(n, 'sinAttr', `No quedan atributos que separen estos ejemplos → hoja con la mayoritaria «${mayoria(n.cuentas, clases)}».`);
      return;
    }
    push('candidatos', binario ? `Se enumeran todas las divisiones binarias posibles: ${cands.length}.` : `Atributos candidatos: ${cands.map((c) => c.attr).join(', ')}.`, n, { cand: cands.map((c) => ({ ...c, partes: c.partes.map((p) => ({ etq: p.etq, valor: p.valor, cuentas: p.cuentas })) })), mostrar: false });
    const mejor = cands.reduce((a, b) => (CRITERIOS[crit].max ? (b.v > a.v + 1e-12 ? b : a) : b.v < a.v - 1e-12 ? b : a));
    const lite = cands.map((c) => ({ ...c, partes: c.partes.map((p) => ({ etq: p.etq, valor: p.valor, cuentas: p.cuentas })) }));
    push('evaluar', `${CRITERIOS[crit].n} de cada ${binario ? 'división' : 'atributo'}.`, n, { cand: lite, mostrar: true });
    const gini0 = gini(n.cuentas);
    const sinMejora = crit === 'gini' ? mejor.giniSplit >= gini0 - 1e-12 : mejor.gain <= 1e-12;
    const formula =
      crit === 'gain'
        ? `G = H(S) − E(A) = ${f3(mejor.hS)} − ${f3(mejor.eA)} = ${f3(mejor.gain)}`
        : crit === 'ratio'
          ? `ratio = G / info. división = ${f3(mejor.gain)} / ${f3(mejor.splitInfo)} = ${f3(mejor.ratio)}`
          : `gini_split = Σ (nᵢ/n)·gini(Tᵢ) = ${f3(mejor.giniSplit)} (gini del nodo: ${f3(gini0)})`;
    push('elegir', `Se elige «${mejor.etiqueta}»: ${formula}.`, n, { cand: lite, mostrar: true, mejor: mejor.etiqueta });
    if (sinMejora) {
      hoja(n, 'sinAttr', `Ninguna división mejora al nodo → hoja con la mayoritaria «${mayoria(n.cuentas, clases)}».`);
      return;
    }
    n.estado = 'int';
    n.attr = mejor.attr;
    n.test = binario ? `${mejor.attr} ∈ {${mejor.S.join(', ')}}?` : mejor.attr;
    n.hijos = mejor.partes.map((p, k) => ({
      a: p.etq,
      n: { id: `${n.id}.${k}`, idx: p.filas.map((f) => D.filas.indexOf(f)), libres: binario ? n.libres : n.libres.filter((x) => x !== mejor.attr), estado: 'pend', hijos: [], cuentas: p.cuentas },
    }));
    push('ramas', binario ? `Se crea el nodo «${n.test}» con dos ramas (sí / no).` : `Se crea el nodo «${mejor.attr}» con una rama por valor: ${mejor.partes.map((p) => p.etq).join(', ')}.`, n);
    push('reparto', `Los ejemplos se reparten: ${mejor.partes.map((p) => `${p.etq} → ${p.filas.length}`).join(' · ')}.`, n);
    n.hijos.forEach((h) => procesar(h.n, false));
  }

  push('datos', `Conjunto de entrenamiento: ${D.filas.length} ejemplos, ${D.attrs.length} atributos, clase «${clase}».`, null);
  procesar(raiz, true);

  if (poda) {
    const error = (n) => n.cuentas.reduce((a, b) => a + b, 0) - Math.max(...n.cuentas);
    const visitar = (n) => {
      if (n.estado !== 'int') return;
      n.hijos.forEach((h) => visitar(h.n));
      if (!n.hijos.every((h) => h.n.estado === 'hoja')) return;
      const eSub = n.hijos.reduce((s, h) => s + error(h.n) + 0.5, 0);
      const eHoja = error(n) + 0.5;
      const txt = `Subárbol «${n.test}»: error pesimista = ${n.hijos.map((h) => `${error(h.n)}+½`).join(' + ')} = ${redondear(eSub, 1)}; como hoja «${mayoria(n.cuentas, clases)}»: ${error(n)}+½ = ${redondear(eHoja, 1)}.`;
      if (eHoja <= eSub + 1e-9) {
        n.estado = 'hoja';
        n.clase = mayoria(n.cuentas, clases);
        n.hijos = [];
        push('poda', `${txt} No es peor → se reemplaza por una hoja.`, n);
      } else {
        push('poda', `${txt} Es peor → se conserva el subárbol.`, n);
      }
    };
    visitar(raiz);
  }
  push('fin', 'Árbol terminado.', null);
  return frames;
}

// ───────── dibujo ─────────
function aSvg(n, clases, foco) {
  const color = (c) => (c === clases[0] ? COLORES.c : COLORES.b);
  if (n.estado === 'hoja') return { id: n.id, t: `${n.clase} (${n.cuentas.join('/')})`, hoja: true, color: color(n.clase) };
  if (n.estado === 'pend') return { id: n.id, t: n.id === foco ? '… (analizando)' : `? (${(n.cuentas || []).join('/') || n.idx.length})` };
  return { id: n.id, t: n.test, hijos: n.hijos.map((h) => ({ a: h.a, n: aSvg(h.n, clases, foco) })) };
}

const prefijos = (id) => {
  if (!id) return [];
  const partes = id.split('.');
  return partes.map((_, i) => partes.slice(0, i + 1).join('.'));
};

function Candidatos({ f, crit }) {
  if (!f.cand) return null;
  const max = Math.max(...f.cand.map((c) => c.v), 1e-9);
  const dato = (c) => (crit === 'gain' ? [`E(A) = ${f3(c.eA)}`, f3(c.gain)] : crit === 'ratio' ? [`G ${f3(c.gain)} / ${f3(c.splitInfo)}`, f3(c.ratio)] : ['', f3(c.giniSplit)]);
  return (
    <div className="tabla-env">
      <table className="t tabla-cand">
        <thead>
          <tr>
            <th>{f.cand[0].S ? 'División' : 'Atributo'}</th>
            <th>Ramas (cuentas por clase)</th>
            {f.mostrar && <th>{CRITERIOS[crit].corto}</th>}
          </tr>
        </thead>
        <tbody>
          {f.cand.map((c) => {
            const es = f.mejor === c.etiqueta;
            const [det, val] = dato(c);
            const w = Math.max(2, (c.v / max) * 70);
            return (
              <tr key={c.etiqueta} className={es ? 'resaltado' : ''}>
                <td><b>{c.etiqueta}</b></td>
                <td style={{ fontSize: 13 }}>{c.partes.map((p) => `${p.valor} (${p.cuentas.join('/')})`).join(' · ')}</td>
                {f.mostrar && (
                  <td className="num" title={det}>
                    <span className="mini-barra"><i style={{ width: w, background: es ? COLORES.a : '#a9b5ab' }} /></span> {val}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Subconjunto({ D, f }) {
  const nodoFoco = (n, id) => {
    if (n.id === id) return n;
    for (const h of n.hijos) {
      const r = nodoFoco(h.n, id);
      if (r) return r;
    }
    return null;
  };
  const n = f.foco ? nodoFoco(f.raiz, f.foco) : null;
  const idx = n ? n.idx : D.filas.map((_, i) => i);
  return (
    <div className="tabla-env" style={{ maxHeight: 210, overflowY: 'auto' }}>
      <table className="t tabla-datos">
        <thead>
          <tr>{D.attrs.map((a) => <th key={a}>{a}</th>)}<th>{D.clase}</th></tr>
        </thead>
        <tbody>
          {idx.map((i) => (
            <tr key={i}>
              {D.attrs.map((a) => <td key={a}>{D.filas[i][a]}</td>)}
              <td><b style={{ color: D.filas[i][D.clase] === D.clases[0] ? COLORES.c : COLORES.b }}>{D.filas[i][D.clase]}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Constructor({ algoritmo, critFijo, binario = false, conPoda = false, titulo }) {
  const [ds, setDs] = useState(conPoda ? 'ruido' : 'tenis');
  const [crit, setCrit] = useState(critFijo || 'gain');
  const [minEj, setMinEj] = useState(1);
  const [poda, setPoda] = useState(conPoda);
  const D = DATOS[ds];
  const frames = useMemo(
    () => generar({ D, crit, binario, minEj, poda, mapa: MAPAS[algoritmo] }),
    [D, crit, binario, minEj, poda, algoritmo],
  );
  const p = usePasos(frames, { intervalo: 900 });
  const f = p.frame;
  const hojas = (n) => (n.estado === 'int' ? n.hijos.reduce((s, h) => s + hojas(h.n), 0) : 1);
  return (
    <Marco
      titulo={titulo}
      controles={
        <>
          <select value={ds} onChange={(e) => setDs(e.target.value)} aria-label="Datos">
            {Object.entries(DATOS).map(([k, d]) => <option key={k} value={k}>{d.nombre}</option>)}
          </select>
          {!critFijo && (
            <select value={crit} onChange={(e) => setCrit(e.target.value)} aria-label="Criterio">
              {Object.entries(CRITERIOS).map(([k, c]) => <option key={k} value={k}>{c.n}</option>)}
            </select>
          )}
          <label className="fila-control" style={{ margin: 0 }} title="Pre-poda: no se divide un nodo con menos ejemplos que este mínimo">
            mín. ejemplos <input type="range" min={1} max={6} value={minEj} onChange={(e) => setMinEj(Number(e.target.value))} /> {minEj}
          </label>
          {conPoda && (
            <label className="fila-control" style={{ margin: 0 }}>
              <input type="checkbox" checked={poda} onChange={(e) => setPoda(e.target.checked)} /> post-poda
            </label>
          )}
        </>
      }
      pie={
        <>
          {CRITERIOS[crit].max ? 'Se elige el mayor valor.' : 'Se elige el menor gini_split (nodos más puros).'}{' '}
          {conPoda && 'Poda por error pesimista: cada hoja suma ½ de penalización; un subárbol se reemplaza por hoja si no es mejor que ella. '}
          Árbol final: {f.fase === 'fin' ? `${hojas(f.raiz)} hojas.` : 'en construcción…'}
        </>
      }
    >
      <Controles p={p} />
      <div className="arbol-paso">
        <div className="arbol-izq">
          <ArbolSvg raiz={aSvg(f.raiz, D.clases, f.foco)} camino={prefijos(f.foco)} ancho={0} sepX={84} sepY={66} animar={false} />
        </div>
        <div className="arbol-der">
          {f.cand ? <Candidatos f={f} crit={crit} /> : <Subconjunto D={D} f={f} />}
        </div>
      </div>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

export const ArbolTDIDT = () => <Constructor algoritmo="tdidt" titulo="TDIDT paso a paso: el criterio es intercambiable" />;
export const ArbolID3 = () => <Constructor algoritmo="id3" critFijo="gain" titulo="ID3 paso a paso (ganancia de información)" />;
export const ArbolC45 = () => <Constructor algoritmo="c45" critFijo="ratio" conPoda titulo="C4.5 paso a paso (ratio de ganancia + post-poda)" />;
export const ArbolCART = () => <Constructor algoritmo="cart" critFijo="gini" binario titulo="CART paso a paso (Gini, divisiones binarias)" />;
