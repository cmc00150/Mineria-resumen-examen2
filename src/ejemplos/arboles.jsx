// Constructor de árboles paso a paso. Un único generador de fotogramas; cada algoritmo usa lo que le distingue:
//  · TDIDT: el esquema con una medida intercambiable (o sin medida: el siguiente atributo de la lista)
//  · ID3:   ganancia, una rama por valor, solo discretos (y su trampa: un identificador)
//  · C4.5:  ratio de ganancia + filtro de ganancia media, umbrales numéricos, post-poda
//  · CART:  divisiones siempre binarias, Gini en clasificación y varianza en regresión
import { useMemo, useState } from 'react';
import { Marco, ArbolSvg, COLORES } from './comun.jsx';
import { TENIS, TENIS_NUM, HORAS } from './datos.js';
import { entropia, gini, contarClases, particionar, redondear, media } from '../lib/stats.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

const dec = (x, n = 3) => String(redondear(x, n)).replace('.', ',');

// ───────── conjuntos de datos ─────────
const CLS = { clase: 'play', clases: ['yes', 'no'] };
const DISC = ['outlook', 'temperature', 'humidity', 'windy'];
const NUM = ['outlook', 'temp', 'hum', 'windy'];
const TIPOS_NUM = { temp: 'num', hum: 'num' };
const DATOS = {
  tenis: { nombre: 'Tenis (14 días, discreto)', filas: TENIS, attrs: DISC, tipos: {}, ...CLS },
  tenisOrden: { nombre: 'Tenis (14 días)', filas: TENIS, attrs: ['temperature', 'windy', 'humidity', 'outlook'], tipos: {}, ...CLS },
  tenisId: { nombre: 'Tenis + columna «día»', filas: TENIS.map((f, i) => ({ dia: `d${i + 1}`, ...f })), attrs: ['dia', ...DISC], tipos: {}, ...CLS },
  num: { nombre: 'Tenis numérico (temp. y humedad)', filas: TENIS_NUM, attrs: NUM, tipos: TIPOS_NUM, ...CLS },
  numRuido: { nombre: 'Tenis numérico con un día ruidoso', filas: TENIS_NUM.map((f, i) => (i === 2 ? { ...f, play: 'no' } : f)), attrs: NUM, tipos: TIPOS_NUM, ...CLS },
  horas: { nombre: 'Tenis: horas jugadas (regresión)', filas: TENIS_NUM.map((f, i) => ({ ...f, horas: HORAS[i] })), attrs: NUM, tipos: TIPOS_NUM, objetivo: 'horas' },
};

const CRITERIOS = {
  orden: { n: 'Sin medida: el siguiente de la lista', corto: '—' },
  gain: { n: 'Ganancia de información', corto: 'ganancia', max: true },
  ratio: { n: 'Ratio de ganancia', corto: 'ratio', max: true },
  gini: { n: 'Gini', corto: 'gini_split', max: false },
  var: { n: 'Varianza (regresión)', corto: 'varianza media', max: false },
};

// ───────── fases → paso del esquema ─────────
const MAPAS = {
  tdidt: { datos: '0', inicio: '1', bajar: '5.2', pura: '2', sinAttr: '3', candidatos: '4', evaluar: '4', elegir: '4', ramas: '5.0', reparto: '5.1', poda: '6', fin: '6' },
  id3: { datos: '0', inicio: '0', bajar: '4.0', pura: '4.0', sinAttr: '4.0', candidatos: '1', evaluar: '1', elegir: '1', ramas: '2', reparto: '3', poda: '5', fin: '5' },
  c45: { datos: '0', inicio: '0', bajar: '4', pura: '4', sinAttr: '4', candidatos: '1', evaluar: '2', elegir: '2', ramas: '3', reparto: '3', poda: '5', fin: '6' },
  cart: { datos: '0', inicio: '0', bajar: '4', pura: '4', sinAttr: '4', candidatos: '1', evaluar: '2', elegir: '3', ramas: '4', reparto: '4', poda: '4', fin: '4' },
};

const varianza = (xs) => (xs.length ? xs.reduce((s, x) => s + (x - media(xs)) ** 2, 0) / xs.length : 0);
const mayoria = (cuentas, clases) => clases[cuentas.indexOf(Math.max(...cuentas))];
function subconjuntos(valores) {
  const out = [];
  for (let m = 1; m < 2 ** (valores.length - 1); m++) out.push(valores.filter((_, i) => (m >> i) & 1));
  return out;
}

// ───────── generador ─────────
function generar({ D, crit, binario, minEj, poda, mapa, filtroMedia }) {
  const reg = !!D.objetivo;
  const { clase, clases } = D;
  const frames = [];
  const raiz = { id: 'r', idx: D.filas.map((_, i) => i), libres: D.attrs.slice(), estado: 'pend', hijos: [] };
  const snap = () => JSON.parse(JSON.stringify(raiz));
  const push = (fase, msg, nodo, extra = {}) => frames.push({ fase, e: mapa[fase] ?? mapa.sinAttr, msg, raiz: snap(), foco: nodo ? nodo.id : null, ...extra });
  const filasDe = (n) => n.idx.map((i) => D.filas[i]);
  const ys = (fs) => fs.map((f) => f[D.objetivo]);
  const sdRaiz = reg ? Math.sqrt(varianza(ys(D.filas))) : 0;
  const resumen = (fs) => (reg ? `media ${dec(media(ys(fs)), 1)} h, desv. ${dec(Math.sqrt(varianza(ys(fs))), 2)}` : clases.map((c, i) => `${contarClases(fs, clase, clases)[i]} ${c}`).join(' / '));

  // métricas de una división en «partes»
  function medir(fs, partes) {
    const N = fs.length;
    partes.forEach((p) => { if (!reg) p.cuentas = contarClases(p.filas, clase, clases); p.n = p.filas.length; });
    if (reg) {
      const v = partes.reduce((s, p) => s + (p.n / N) * varianza(ys(p.filas)), 0);
      return { varSplit: v, varNodo: varianza(ys(fs)) };
    }
    const hS = entropia(contarClases(fs, clase, clases), 2);
    const eA = partes.reduce((s, p) => s + (p.n / N) * entropia(p.cuentas, 2), 0);
    const splitInfo = entropia(partes.map((p) => p.n), 2);
    const gain = hS - eA;
    return { hS, eA, gain, splitInfo, ratio: splitInfo ? gain / splitInfo : 0, giniSplit: partes.reduce((s, p) => s + (p.n / N) * gini(p.cuentas), 0) };
  }
  const valor = (m) => (crit === 'gain' ? m.gain : crit === 'ratio' ? m.ratio : crit === 'gini' ? m.giniSplit : crit === 'var' ? m.varSplit : 0);
  const mejorQue = (a, b) => (CRITERIOS[crit].max ? valor(a) > valor(b) + 1e-12 : valor(a) < valor(b) - 1e-12);
  // para C4.5 el umbral de un numérico se elige por ganancia; después se compara por ratio
  const valorUmbral = (m) => (crit === 'ratio' ? m.gain : valor(m));
  const mejorUmbral = (a, b) => (crit === 'ratio' || CRITERIOS[crit].max ? valorUmbral(a) > valorUmbral(b) + 1e-12 : valorUmbral(a) < valorUmbral(b) - 1e-12);

  function candidatosDe(n) {
    const fs = filasDe(n);
    const out = [];
    const distintos = (a) => [...new Set(fs.map((f) => f[a]))];
    const usables = D.attrs.filter((a) => (D.tipos[a] === 'num' || binario ? true : n.libres.includes(a)) && distintos(a).length > 1);
    usables.forEach((a) => {
      const divs = [];
      if (D.tipos[a] === 'num') {
        const vs = distintos(a).sort((x, y) => x - y);
        vs.slice(0, -1).forEach((t) => divs.push({ etiqueta: `${a} ≤ ${t}`, test: binario ? `${a} ≤ ${t}?` : a, ramas: binario ? ['sí', 'no'] : [`≤ ${t}`, `> ${t}`], partes: [{ filas: fs.filter((f) => f[a] <= t) }, { filas: fs.filter((f) => f[a] > t) }], num: true }));
      } else if (binario) {
        subconjuntos(distintos(a).sort()).forEach((S) => divs.push({ etiqueta: `${a} ∈ {${S.join(', ')}}`, test: `${a} ∈ {${S.join(', ')}}?`, ramas: ['sí', 'no'], partes: [{ filas: fs.filter((f) => S.includes(f[a])) }, { filas: fs.filter((f) => !S.includes(f[a])) }] }));
      } else {
        const ps = [...particionar(fs, a).entries()];
        divs.push({ etiqueta: a, test: a, ramas: ps.map(([v]) => v), partes: ps.map(([, sub]) => ({ filas: sub })) });
      }
      divs.forEach((d) => Object.assign(d, medir(fs, d.partes)));
      const mejor = divs.reduce((x, y) => (mejorUmbral(y, x) ? y : x));
      out.push({ ...mejor, attr: a, probadas: divs.length });
    });
    return out;
  }
  const lite = (cs) => cs.map(({ partes, ...c }) => ({ ...c, partes: partes.map((p, k) => ({ etq: c.ramas[k], n: p.n, cuentas: p.cuentas, media: reg ? media(ys(p.filas)) : null })) }));

  const hoja = (n, fase, msg) => {
    n.estado = 'hoja';
    const fs = filasDe(n);
    if (reg) n.valor = media(ys(fs));
    else n.clase = mayoria(n.cuentas, clases);
    push(fase, msg, n);
  };
  const etqHoja = (n) => (reg ? `≈ ${dec(n.valor, 1)} h` : `«${n.clase}»`);

  function procesar(n, esRaiz) {
    const fs = filasDe(n);
    if (!reg) n.cuentas = contarClases(fs, clase, clases);
    n.n = fs.length;
    push(esRaiz ? 'inicio' : 'bajar', `${esRaiz ? 'Raíz' : 'Nodo'}: ${fs.length} ejemplos (${resumen(fs)}).`, n);
    if (!reg && n.cuentas.filter((c) => c > 0).length <= 1) return hoja(n, 'pura', `Todos son «${mayoria(n.cuentas, clases)}» → hoja pura.`);
    if (reg && Math.sqrt(varianza(ys(fs))) <= 0.05 * sdRaiz) return hoja(n, 'pura', `Desviación casi nula → hoja ${etqHoja({ valor: media(ys(fs)) })}.`);
    if (fs.length < minEj) {
      n.cuentas = n.cuentas || null;
      return hoja(n, 'sinAttr', `Solo ${fs.length} ejemplos (menos de ${minEj}) → pre-poda: hoja ${reg ? `con la media ≈ ${dec(media(ys(fs)), 1)} h` : `con la mayoritaria «${mayoria(n.cuentas, clases)}»`}.`);
    }

    // TDIDT sin medida: el siguiente atributo de la lista
    if (crit === 'orden') {
      const a = D.attrs.find((x) => n.libres.includes(x) && new Set(fs.map((f) => f[x])).size > 1);
      if (!a) return hoja(n, 'sinAttr', `A = ∅: no quedan atributos que separen → hoja con la mayoritaria «${mayoria(n.cuentas, clases)}».`);
      const ps = [...particionar(fs, a).entries()];
      push('elegir', `Sin medida: se toma el siguiente atributo de la lista (${D.attrs.join(' → ')}): «${a}».`, n);
      return dividir(n, { attr: a, test: a, ramas: ps.map(([v]) => v), partes: ps.map(([, s]) => ({ filas: s })) });
    }

    const cands = candidatosDe(n);
    if (!cands.length) return hoja(n, 'sinAttr', `A = ∅: no quedan atributos que separen → hoja ${reg ? etqHoja({ valor: media(ys(fs)) }) : `con la mayoritaria «${mayoria(n.cuentas, clases)}»`}.`);
    const numericos = cands.filter((c) => c.num || c.probadas > 1);
    push('candidatos', numericos.length ? `Se prueban todas las divisiones posibles (${cands.reduce((s, c) => s + c.probadas, 0)}) y se guarda la mejor de cada atributo.` : `Atributos candidatos: ${cands.map((c) => c.attr).join(', ')}.`, n, { cand: lite(cands), mostrar: false });

    let validos = cands;
    let mediaG = null;
    if (filtroMedia) {
      mediaG = cands.reduce((s, c) => s + c.gain, 0) / cands.length;
      validos = cands.filter((c) => c.gain >= mediaG - 1e-12);
    }
    const mejor = validos.reduce((x, y) => (mejorQue(y, x) ? y : x));
    const conMarca = lite(cands).map((c) => ({ ...c, fuera: filtroMedia && c.gain < mediaG - 1e-12 }));
    push('evaluar', filtroMedia ? `Ganancia media = ${dec(mediaG)}. Solo compiten por el ratio los que la superan (los demás, tachados).` : `${CRITERIOS[crit].n} de cada ${numericos.length ? 'atributo (en su mejor división)' : 'atributo'}.`, n, { cand: conMarca, mostrar: true, mediaG });
    const formula =
      crit === 'gain' ? `G = H(S) − E(A) = ${dec(mejor.hS)} − ${dec(mejor.eA)} = ${dec(mejor.gain)}`
        : crit === 'ratio' ? `ratio = G / info. división = ${dec(mejor.gain)} / ${dec(mejor.splitInfo)} = ${dec(mejor.ratio)}`
          : crit === 'gini' ? `gini_split = ${dec(mejor.giniSplit)}`
            : `varianza media tras dividir = ${dec(mejor.varSplit, 1)} (antes ${dec(mejor.varNodo, 1)})`;
    push('elegir', `Se elige «${mejor.etiqueta}»: ${formula}.`, n, { cand: conMarca, mostrar: true, mejor: mejor.attr, mediaG });
    const sinMejora = reg ? mejor.varSplit >= mejor.varNodo - 1e-9 : crit === 'gini' ? mejor.giniSplit >= gini(n.cuentas) - 1e-12 : mejor.gain <= 1e-12;
    if (sinMejora) return hoja(n, 'sinAttr', `Ninguna división mejora el nodo → hoja ${reg ? etqHoja({ valor: media(ys(fs)) }) : `«${mayoria(n.cuentas, clases)}»`}.`);
    return dividir(n, mejor);
  }

  function dividir(n, d) {
    n.estado = 'int';
    n.test = d.test;
    const quitar = !binario && D.tipos[d.attr] !== 'num';
    n.hijos = d.partes.map((p, k) => ({ a: d.ramas[k], n: { id: `${n.id}.${k}`, idx: p.filas.map((f) => D.filas.indexOf(f)), libres: quitar ? n.libres.filter((x) => x !== d.attr) : n.libres, estado: 'pend', hijos: [] } }));
    push('ramas', d.partes.length === 2 ? `Nodo «${d.test}» con dos ramas (${d.ramas.join(' / ')}).${quitar ? '' : D.tipos[d.attr] === 'num' ? ' El atributo numérico puede volver a usarse más abajo.' : ''}` : `Nodo «${d.test}» con una rama por valor: ${d.ramas.join(', ')}.`, n);
    push('reparto', `Los ejemplos se reparten: ${d.partes.map((p, k) => `${d.ramas[k]} → ${p.filas.length}`).join(' · ')}.`, n);
    n.hijos.forEach((h) => procesar(h.n, false));
  }

  push('datos', `${D.filas.length} ejemplos, atributos: ${D.attrs.map((a) => (D.tipos[a] === 'num' ? `${a} (numérico)` : a)).join(', ')}. ${reg ? 'Objetivo numérico: horas.' : `Clase «${clase}».`}`, null);
  procesar(raiz, true);

  if (poda && !reg) {
    const error = (n) => n.n - Math.max(...n.cuentas);
    const visitar = (n) => {
      if (n.estado !== 'int') return;
      n.hijos.forEach((h) => visitar(h.n));
      if (!n.hijos.every((h) => h.n.estado === 'hoja')) return;
      const eSub = n.hijos.reduce((s, h) => s + error(h.n) + 0.5, 0);
      const eHoja = error(n) + 0.5;
      const txt = `Subárbol «${n.test}»: error pesimista ${n.hijos.map((h) => `${error(h.n)}+½`).join(' + ')} = ${dec(eSub, 1)}; como hoja «${mayoria(n.cuentas, clases)}»: ${error(n)}+½ = ${dec(eHoja, 1)}.`;
      if (eHoja <= eSub + 1e-9) {
        n.estado = 'hoja';
        n.clase = mayoria(n.cuentas, clases);
        n.hijos = [];
        push('poda', `${txt} No es peor → se reemplaza por la hoja.`, n);
      } else push('poda', `${txt} Es peor → se conserva.`, n);
    };
    visitar(raiz);
  }
  push('fin', 'Árbol terminado.', null);
  return frames;
}

// ───────── dibujo ─────────
const nom = (c) => (c === 'yes' ? 'sí' : c === 'no' ? 'no' : c);
function aSvg(n, D, foco) {
  if (n.estado === 'hoja') {
    if (D.objetivo) return { id: n.id, t: `${dec(n.valor, 1)} h (${n.n})`, hoja: true, color: COLORES.d };
    return { id: n.id, t: `${nom(n.clase)} ${n.cuentas.join('/')}`, hoja: true, color: n.clase === D.clases[0] ? COLORES.c : COLORES.b };
  }
  if (n.estado === 'pend') return { id: n.id, t: n.id === foco ? '…' : `? (${n.idx.length})` };
  return { id: n.id, t: n.test, hijos: n.hijos.map((h) => ({ a: h.a, n: aSvg(h.n, D, foco) })) };
}
const prefijos = (id) => (id ? id.split('.').map((_, i, a) => a.slice(0, i + 1).join('.')) : []);
const buscar = (x, id) => {
  if (x.id === id) return x;
  for (const h of x.hijos) {
    const r = buscar(h.n, id);
    if (r) return r;
  }
  return null;
};

function Candidatos({ f, crit, D }) {
  const c45 = crit === 'ratio';
  const reg = !!D.objetivo;
  const valor = (c) => (crit === 'gain' ? c.gain : c45 ? c.ratio : crit === 'gini' ? c.giniSplit : c.varSplit);
  const vs = f.cand.map(valor);
  const max = Math.max(...vs, 1e-9);
  const hayVarias = f.cand.some((c) => c.probadas > 1);
  return (
    <div className="tabla-env">
      <table className="t tabla-cand">
        <thead>
          <tr>
            <th>{hayVarias ? 'Mejor división del atributo' : 'Atributo'}</th>
            <th>Ramas ({reg ? 'nº · media' : 'cuentas sí/no'})</th>
            {f.mostrar && c45 && <th>G</th>}
            {f.mostrar && c45 && <th>info. div.</th>}
            {f.mostrar && <th>{CRITERIOS[crit].corto}</th>}
          </tr>
        </thead>
        <tbody>
          {f.cand.map((c) => {
            const es = f.mejor === c.attr;
            const w = Math.max(2, (valor(c) / max) * 60);
            return (
              <tr key={c.attr} className={es ? 'resaltado' : ''} style={c.fuera ? { opacity: 0.45, textDecoration: 'line-through' } : undefined}>
                <td><b>{c.etiqueta}</b>{c.probadas > 1 && <small className="marcador"> · {c.probadas} probadas</small>}</td>
                <td style={{ fontSize: 12.5 }}>{c.partes.map((p) => `${p.etq} (${reg ? `${p.n} · ${dec(p.media, 1)}` : p.cuentas.join('/')})`).join(' · ')}</td>
                {f.mostrar && c45 && <td className="num" style={c.fuera ? undefined : { color: '#2f7d4f' }}>{dec(c.gain)}</td>}
                {f.mostrar && c45 && <td className="num">{dec(c.splitInfo)}</td>}
                {f.mostrar && (
                  <td className="num"><span className="mini-barra"><i style={{ width: w, background: es ? COLORES.a : '#a9b5ab' }} /></span> {dec(valor(c), reg ? 1 : 3)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {f.mostrar && <small className="marcador">{CRITERIOS[crit].max ? 'Se elige el mayor.' : 'Se elige el menor (ramas más puras).'}{f.mediaG != null && ` Ganancia media: ${dec(f.mediaG)}.`}</small>}
    </div>
  );
}

function Subconjunto({ D, f }) {
  const n = f.foco ? buscar(f.raiz, f.foco) : null;
  const idx = n ? n.idx : D.filas.map((_, i) => i);
  const col = D.objetivo || D.clase;
  return (
    <div className="tabla-env" style={{ maxHeight: 240, overflowY: 'auto' }}>
      <table className="t tabla-datos">
        <thead><tr>{D.attrs.map((a) => <th key={a}>{a}</th>)}<th>{col}</th></tr></thead>
        <tbody>
          {idx.map((i) => (
            <tr key={i}>
              {D.attrs.map((a) => <td key={a}>{D.filas[i][a]}</td>)}
              <td><b style={{ color: D.objetivo ? COLORES.d : D.filas[i][D.clase] === D.clases[0] ? COLORES.c : COLORES.b }}>{D.filas[i][col]}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Constructor({ algoritmo, crits, conjuntos, binario = false, filtroMedia = false, conPoda = false, minIni = 1, titulo, pie }) {
  const [ds, setDs] = useState(conjuntos[0]);
  const D = DATOS[ds];
  const opciones = D.objetivo ? ['var'] : crits;
  const [critSel, setCrit] = useState(crits[0]);
  const crit = opciones.includes(critSel) ? critSel : opciones[0];
  const [minEj, setMinEj] = useState(minIni);
  const [poda, setPoda] = useState(false);
  const frames = useMemo(
    () => generar({ D, crit, binario, minEj: D.objetivo ? Math.max(minEj, 4) : minEj, poda: conPoda && poda, mapa: MAPAS[algoritmo], filtroMedia: filtroMedia && crit === 'ratio' }),
    [D, crit, binario, minEj, poda, algoritmo, conPoda, filtroMedia],
  );
  const p = usePasos(frames, { intervalo: 850 });
  const f = p.frame;
  const hojas = (n) => (n.estado === 'int' ? n.hijos.reduce((s, h) => s + hojas(h.n), 0) : 1);
  const prof = (n) => (n.estado === 'int' ? 1 + Math.max(...n.hijos.map((h) => prof(h.n))) : 0);
  return (
    <Marco
      titulo={titulo}
      controles={
        <>
          {conjuntos.length > 1 && (
            <select value={ds} onChange={(e) => setDs(e.target.value)} aria-label="Datos">
              {conjuntos.map((k) => <option key={k} value={k}>{DATOS[k].nombre}</option>)}
            </select>
          )}
          {opciones.length > 1 && (
            <select value={crit} onChange={(e) => setCrit(e.target.value)} aria-label="Criterio">
              {opciones.map((k) => <option key={k} value={k}>{CRITERIOS[k].n}</option>)}
            </select>
          )}
          <label className="fila-control" style={{ margin: 0 }} title="Pre-poda: no se divide un nodo con menos ejemplos que este mínimo">
            mín. ejemplos para dividir <input type="range" min={1} max={6} value={minEj} onChange={(e) => setMinEj(Number(e.target.value))} /> {D.objetivo ? Math.max(minEj, 4) : minEj}
          </label>
          {conPoda && !D.objetivo && (
            <label className="fila-control" style={{ margin: 0 }}><input type="checkbox" checked={poda} onChange={(e) => setPoda(e.target.checked)} /> post-poda</label>
          )}
        </>
      }
      pie={<>{pie} {f.fase === 'fin' && <b>Resultado: {hojas(f.raiz)} hojas, profundidad {prof(f.raiz)}.</b>}</>}
    >
      <Controles p={p} />
      <div className="arbol-paso">
        <div className="arbol-izq">
          <ArbolSvg raiz={aSvg(f.raiz, D, f.foco)} camino={prefijos(f.foco)} ancho={0} sepX={binario ? 96 : 84} sepY={66} animar={false} />
        </div>
        <div className="arbol-der">{f.cand ? <Candidatos f={f} crit={crit} D={D} /> : <Subconjunto D={D} f={f} />}</div>
      </div>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

export const ArbolTDIDT = () => (
  <Constructor
    algoritmo="tdidt"
    crits={['orden', 'gain', 'gini']}
    conjuntos={['tenisOrden']}
    titulo="TDIDT: el mismo esquema, con o sin una buena medida"
    pie="Sin medida, el árbol divide por el orden de la lista (temperature → windy → humidity → outlook) y sale mucho más grande. Con una medida (ganancia o Gini) la raíz es outlook y bastan 5 hojas. TDIDT no fija la medida: ID3, C4.5 y CART son TDIDT con una medida concreta."
  />
);
export const ArbolID3 = () => (
  <Constructor
    algoritmo="id3"
    crits={['gain']}
    conjuntos={['tenis', 'tenisId']}
    titulo="ID3 paso a paso: ganancia y una rama por valor"
    pie="Con «Tenis + columna día» se ve el sesgo de ID3: el identificador deja 14 ramas puras (ganancia 0,940, la máxima posible) y el árbol no sirve para días nuevos. C4.5 lo corrige con el ratio de ganancia."
  />
);
export const ArbolC45 = () => (
  <Constructor
    algoritmo="c45"
    crits={['ratio']}
    conjuntos={['num', 'numRuido']}
    filtroMedia
    conPoda
    titulo="C4.5 paso a paso: umbrales numéricos, ratio de ganancia y post-poda"
    pie="temp y hum son numéricos: C4.5 prueba cada umbral y se queda con el de mayor ganancia (hum ≤ 70 en la rama sunny). Solo compiten por el ratio los atributos con ganancia ≥ media. Con el día ruidoso (un día overcast marcado como «no») el árbol crece para memorizarlo; activa la post-poda y verás cómo un subárbol se reemplaza por una hoja."
  />
);
export const ArbolCART = () => (
  <Constructor
    algoritmo="cart"
    crits={['gini']}
    conjuntos={['num', 'horas']}
    binario
    titulo="CART paso a paso: siempre dos ramas, clasificación o regresión"
    pie="Cada nodo hace una pregunta de sí/no: outlook ∈ {overcast}? agrupa valores, hum ≤ 80? corta un numérico y temp aparece dos veces (un atributo puede repetirse). Con «horas jugadas» CART hace regresión: minimiza la varianza y cada hoja predice la media."
  />
);
