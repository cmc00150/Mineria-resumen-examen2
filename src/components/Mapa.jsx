import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { POR_ID, HIJOS, ALIAS, RELACIONES, nombreCorto, SALIDAS } from '../data/index.js';
import { dibujar, entrada } from '../lib/anim.js';
import { irA } from '../lib/router.js';

const COLOR = { cat: 'var(--cat)', num: 'var(--num)', ambas: 'var(--ambas)', prep: 'var(--prep)', concepto: 'var(--concepto)' };
const anchoEtiqueta = (t) => Math.max(60, t.length * 7.3 + 34);
const INICIALES = ['mineria', 'preparacion', 'clasificacion', 'regresion'];

function construir(id, abiertos, alias = false) {
  const hijos = alias ? [] : [...(HIJOS[id] || []).map((h) => ({ h, a: false })), ...(ALIAS[id] || []).map((h) => ({ h, a: true }))];
  return {
    id,
    alias,
    total: hijos.length,
    children: abiertos.has(id) && hijos.length ? hijos.map(({ h, a }) => construir(h, abiertos, a)) : undefined,
  };
}

export default function Mapa() {
  const [abiertos, setAbiertos] = useState(() => new Set(INICIALES));
  const [verRel, setVerRel] = useState(true);
  const [foco, setFoco] = useState(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const primeraVez = useRef(true);
  const previos = useRef(new Set());

  const { nodos, ramas, ext } = useMemo(() => {
    const raiz = hierarchy(construir('mineria', abiertos));
    tree().nodeSize([34, 230]).separation((a, b) => (a.parent === b.parent ? 1 : 1.25))(raiz);
    const nodos = raiz.descendants();
    const ramas = raiz.links();
    // Columnas según el ancho real de las etiquetas de cada nivel
    const anchoNivel = [];
    nodos.forEach((d) => {
      anchoNivel[d.depth] = Math.max(anchoNivel[d.depth] || 0, anchoEtiqueta(nombreCorto(POR_ID[d.data.id])));
    });
    const col = [0];
    for (let i = 1; i < anchoNivel.length; i++) col[i] = col[i - 1] + anchoNivel[i - 1] + 64;
    nodos.forEach((d) => (d.y = col[d.depth]));
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    nodos.forEach((d) => {
      x0 = Math.min(x0, d.x); x1 = Math.max(x1, d.x);
      y0 = Math.min(y0, d.y); y1 = Math.max(y1, d.y + anchoEtiqueta(nombreCorto(POR_ID[d.data.id])));
    });
    return { nodos, ramas, ext: { x0, x1, y0, y1 } };
  }, [abiertos]);

  const posicion = useMemo(() => {
    const m = {};
    nodos.forEach((d) => { if (!d.data.alias) m[d.data.id] = d; });
    return m;
  }, [nodos]);

  const relVisibles = useMemo(
    () => RELACIONES.filter((r) => posicion[r.a] && posicion[r.b]),
    [posicion],
  );

  // Zoom y desplazamiento
  useEffect(() => {
    const svg = select(svgRef.current);
    const z = zoom()
      .scaleExtent([0.25, 2.5])
      .on('zoom', (ev) => gRef.current && gRef.current.setAttribute('transform', ev.transform.toString()));
    svg.call(z).on('dblclick.zoom', null);
    zoomRef.current = z;
    return () => svg.on('.zoom', null);
  }, []);

  const encajar = (animado = true) => {
    const svg = svgRef.current;
    if (!svg || !zoomRef.current) return;
    const { width, height } = svg.getBoundingClientRect();
    const w = ext.y1 - ext.y0 + 60;
    const h = ext.x1 - ext.x0 + 60;
    const k = Math.min(width / w, height / h, 1.15);
    const t = zoomIdentity
      .translate((width - w * k) / 2 - (ext.y0 - 30) * k, (height - h * k) / 2 - (ext.x0 - 30) * k)
      .scale(k);
    const sel = select(svg);
    const destino = animado && typeof sel.transition === 'function' ? sel.transition().duration(500) : sel;
    destino.call(zoomRef.current.transform, t);
  };

  useLayoutEffect(() => {
    encajar(false);
  }, [ext]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animación: el árbol "crece" la primera vez; después solo las ramas nuevas.
  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const nuevos = nodos.filter((d) => !previos.current.has(`${d.data.alias ? 'a:' : ''}${d.data.id}`));
    const sel = (cls) =>
      nuevos.map((d) => g.querySelector(`[data-k="${d.data.alias ? 'a:' : ''}${d.data.id}"]${cls}`)).filter(Boolean);
    if (primeraVez.current) {
      dibujar(g.querySelectorAll('path.rama'), { dur: 700, paso: 12 });
      entrada(g.querySelectorAll('g.nodo-mapa'), { paso: 14, dur: 380, desde: 0 });
      dibujar(g.querySelectorAll('path.relacion'), { dur: 900, paso: 10, retraso: 900 });
      primeraVez.current = false;
    } else {
      dibujar(sel('.rama'), { dur: 450, paso: 20 });
      entrada(sel('.nodo-mapa'), { paso: 20, dur: 320, desde: 0 });
    }
    previos.current = new Set(nodos.map((d) => `${d.data.alias ? 'a:' : ''}${d.data.id}`));
  }, [nodos]);

  const alternar = (id) =>
    setAbiertos((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const desplegarTodo = () => setAbiertos(new Set(Object.keys(HIJOS).concat(Object.keys(ALIAS))));
  const plegar = () => setAbiertos(new Set(INICIALES));

  const relFoco = foco ? RELACIONES.filter((r) => r.a === foco || r.b === foco) : [];
  const vecinosFoco = new Set(relFoco.flatMap((r) => [r.a, r.b]));

  return (
    <div className="mapa-marco">
      <div className="mapa-controles">
        <button className="boton" onClick={desplegarTodo} type="button">Desplegar todo</button>
        <button className="boton" onClick={plegar} type="button">Plegar</button>
        <button className={`boton ${verRel ? 'activo' : ''}`} onClick={() => setVerRel((v) => !v)} aria-pressed={verRel} type="button">
          Relaciones entre ramas
        </button>
        <button className="boton" onClick={() => encajar()} type="button">Centrar</button>
      </div>

      {foco && relFoco.length > 0 && (
        <div className="relacion-info" aria-live="polite">
          <h4>{nombreCorto(POR_ID[foco])} se relaciona con</h4>
          <ul>
            {relFoco.map((r) => {
              const otro = r.a === foco ? r.b : r.a;
              return <li key={otro}><b>{nombreCorto(POR_ID[otro])}</b>: {r.motivo}</li>;
            })}
          </ul>
        </div>
      )}

      <svg ref={svgRef} className="mapa" role="img" aria-label="Mapa del temario en forma de árbol">
        <g ref={gRef}>
          {ramas.map((l) => {
            const k = `${l.target.data.alias ? 'a:' : ''}${l.target.data.id}`;
            const x0 = l.source.y + anchoEtiqueta(nombreCorto(POR_ID[l.source.data.id]));
            const y0 = l.source.x;
            const x1 = l.target.y;
            const y1 = l.target.x;
            const mx = (x0 + x1) / 2;
            return (
              <path
                key={k}
                data-k={k}
                className={`rama ${l.target.data.alias ? 'alias' : ''}`}
                d={`M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`}
              />
            );
          })}

          {verRel &&
            relVisibles.map((r) => {
              const a = posicion[r.a];
              const b = posicion[r.b];
              const xa = a.y + anchoEtiqueta(nombreCorto(POR_ID[r.a])) / 2;
              const xb = b.y + anchoEtiqueta(nombreCorto(POR_ID[r.b])) / 2;
              const cx = (xa + xb) / 2 + 60 + Math.abs(a.x - b.x) * 0.12;
              const cy = (a.x + b.x) / 2;
              const activa = foco && (r.a === foco || r.b === foco);
              return (
                <path
                  key={`${r.a}|${r.b}`}
                  className={`relacion ${activa ? 'foco' : ''}`}
                  style={{ opacity: foco && !activa ? 0.08 : undefined }}
                  d={`M${xa},${a.x + 11} Q${cx},${cy} ${xb},${b.x + 11}`}
                >
                  <title>{`${nombreCorto(POR_ID[r.a])} — ${nombreCorto(POR_ID[r.b])}: ${r.motivo}`}</title>
                </path>
              );
            })}

          {nodos.map((d) => {
            const n = POR_ID[d.data.id];
            const k = `${d.data.alias ? 'a:' : ''}${d.data.id}`;
            const w = anchoEtiqueta(nombreCorto(n));
            const tieneHijos = d.data.total > 0;
            const abierto = abiertos.has(d.data.id);
            const atenuado = foco && foco !== d.data.id && !vecinosFoco.has(d.data.id);
            return (
              <g
                key={k}
                data-k={k}
                className={`nodo-mapa ${n.tipo === 'familia' ? 'familia' : ''} ${d.data.alias ? 'alias' : ''} ${foco === d.data.id ? 'foco' : ''} ${atenuado ? 'atenuado' : ''}`}
                transform={`translate(${d.y},${d.x - 12})`}
                onMouseEnter={() => setFoco(d.data.id)}
                onMouseLeave={() => setFoco(null)}
              >
                <rect
                  width={w}
                  height={24}
                  rx={n.tipo === 'familia' ? 4 : 12}
                  role="link"
                  tabIndex={0}
                  aria-label={`${n.nombre} (${SALIDAS[n.salida]?.nombre || 'raíz'})`}
                  onClick={() => irA(d.data.id === 'mineria' ? '/' : `/n/${d.data.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && irA(`/n/${d.data.id}`)}
                  onFocus={() => setFoco(d.data.id)}
                  onBlur={() => setFoco(null)}
                />
                <circle cx={13} cy={12} r={4.5} fill={COLOR[n.salida] || 'var(--tinta)'} pointerEvents="none" />
                <text x={24} y={16.5} pointerEvents="none">{nombreCorto(n)}</text>
                {tieneHijos && !d.data.alias && (
                  <g
                    transform={`translate(${w + 12},12)`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); alternar(d.data.id); }}
                    role="button"
                    aria-label={`${abierto ? 'Plegar' : 'Desplegar'} ${n.nombre}`}
                  >
                    <circle r={9} fill="var(--papel)" stroke="var(--linea-2)" />
                    <text className="mas" textAnchor="middle" y={4}>{abierto ? '−' : d.data.total}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <p className="mapa-ayuda">Pulsa un nodo para abrir su ficha · el círculo de la derecha despliega la rama · arrastra y usa la rueda para moverte</p>
    </div>
  );
}
