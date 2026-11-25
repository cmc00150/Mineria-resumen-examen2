import { useEffect, useMemo, useRef } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { dibujar, entrada } from '../lib/anim.js';

export function Marco({ titulo, controles, children, pie }) {
  return (
    <figure className="demo" style={{ margin: 0 }}>
      <div className="demo-cabecera">
        <h3>{titulo}</h3>
        {controles && <div className="grupo-botones">{controles}</div>}
      </div>
      {children}
      {pie && <figcaption className="pie">{pie}</figcaption>}
    </figure>
  );
}

export const COLORES = {
  a: '#2f62a8', // clase A / positivo / sí
  b: '#b0413e', // clase B / negativo / no
  c: '#3b7a52',
  d: '#a8700f',
  tinta: '#1f2b25',
  gris: '#a9b5ab',
  sint: '#7b4c9e',
};

export const escala = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

/**
 * Árbol SVG genérico.
 * nodo = { t: 'texto', hoja?: bool, color?, hijos?: [{ a: 'arista', n: nodo }], id? }
 * camino: lista de ids a resaltar.
 */
export function ArbolSvg({ raiz, ancho = 640, sepX = 120, sepY = 78, camino = [], animar = true, alto }) {
  const ref = useRef(null);
  const { nodos, ramas, w, h, dx } = useMemo(() => {
    const r = hierarchy(raiz, (d) => (d.hijos || []).map((x) => ({ ...x.n, _a: x.a })));
    const wN = (d) => Math.max(44, d.data.t.length * 7.4 + 18);
    tree()
      .nodeSize([sepX, sepY])
      .separation((a, b) => Math.max(1, ((wN(a) + wN(b)) / 2 + 18) / sepX) * (a.parent === b.parent ? 1 : 1.1))(r);
    const ns = r.descendants();
    const minX = Math.min(...ns.map((d) => d.x - wN(d) / 2)) - 12;
    const maxX = Math.max(...ns.map((d) => d.x + wN(d) / 2)) + 12;
    const maxY = Math.max(...ns.map((d) => d.y));
    return { nodos: ns, ramas: r.links(), w: maxX - minX, h: maxY + 60, dx: -minX };
  }, [raiz, sepX, sepY]);

  const clave = useMemo(() => JSON.stringify(raiz), [raiz]);
  useEffect(() => {
    if (!animar || !ref.current) return;
    dibujar(ref.current.querySelectorAll('path'), { dur: 500, paso: 30 });
    entrada(ref.current.querySelectorAll('g.na'), { paso: 40, dur: 350, desde: 0 });
  }, [clave, animar]);

  const enCamino = new Set(camino);
  return (
    <svg ref={ref} viewBox={`0 0 ${Math.max(w, 200)} ${alto || h}`} width="100%" style={{ maxWidth: Math.max(w, ancho), margin: '0 auto' }} role="img" aria-label="Árbol">
      <g transform={`translate(${dx},26)`}>
        {ramas.map((l, i) => {
          const on = enCamino.has(l.target.data.id) && enCamino.has(l.source.data.id);
          return (
            <g key={i}>
              <path d={`M${l.source.x},${l.source.y + 14} C${l.source.x},${(l.source.y + l.target.y) / 2} ${l.target.x},${(l.source.y + l.target.y) / 2} ${l.target.x},${l.target.y - 14}`} fill="none" stroke={on ? COLORES.a : '#a9b5ab'} strokeWidth={on ? 3 : 1.6} />
              <text x={(l.source.x + l.target.x) / 2 + (l.target.x < l.source.x ? -6 : l.target.x > l.source.x ? 6 : 6)} y={(l.source.y + l.target.y) / 2 + 4} fontSize="12.5" textAnchor={l.target.x < l.source.x ? 'end' : 'start'} fill="#4a5a51" fontFamily="var(--f-titulo)">
                {l.target.data._a}
              </text>
            </g>
          );
        })}
        {nodos.map((d, i) => {
          const t = d.data.t;
          const wn = Math.max(44, t.length * 7.4 + 18);
          const on = enCamino.has(d.data.id);
          const hoja = d.data.hoja;
          const fondo = hoja ? d.data.color || '#e4e9e2' : '#fbfcfa';
          return (
            <g key={i} className="na" transform={`translate(${d.x},${d.y})`}>
              <rect x={-wn / 2} y={-14} width={wn} height={28} rx={hoja ? 14 : 4} fill={fondo} stroke={on ? COLORES.a : '#4a5a51'} strokeWidth={on ? 2.6 : 1.2} />
              <text textAnchor="middle" y={4.5} fontSize="13" fontFamily="var(--f-titulo)" fontWeight={hoja ? 700 : 600} fill={hoja && d.data.color ? '#fff' : '#1f2b25'}>
                {t}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Ejes simples para gráficos de dispersión en SVG. */
export function Ejes({ x0, x1, y0, y1, W, H, m, etqX, etqY, ticksX = 5, ticksY = 5 }) {
  const sx = escala(x0, x1, m.l, W - m.r);
  const sy = escala(y0, y1, H - m.b, m.t);
  const tx = ticksX <= 0 ? [] : Array.from({ length: ticksX + 1 }, (_, i) => x0 + ((x1 - x0) * i) / ticksX);
  const ty = ticksY <= 0 ? [] : Array.from({ length: ticksY + 1 }, (_, i) => y0 + ((y1 - y0) * i) / ticksY);
  const f = (v) => (Math.abs(v) >= 100 ? Math.round(v) : Number(v.toFixed(2)));
  return (
    <g fontFamily="var(--f-titulo)" fontSize="11.5" fill="#6f7d75">
      <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="#a9b5ab" />
      <line x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} stroke="#a9b5ab" />
      {tx.map((v, i) => (
        <text key={`x${i}`} x={sx(v)} y={H - m.b + 15} textAnchor="middle">{f(v)}</text>
      ))}
      {ty.map((v, i) => (
        <text key={`y${i}`} x={m.l - 6} y={sy(v) + 4} textAnchor="end">{f(v)}</text>
      ))}
      {etqX && <text x={(m.l + W - m.r) / 2} y={H - 4} textAnchor="middle" fill="#4a5a51">{etqX}</text>}
      {etqY && <text x={12} y={m.t - 6} fill="#4a5a51">{etqY}</text>}
    </g>
  );
}
