import { useEffect, useRef } from 'react';
import { POR_ID, HIJOS, ALIAS, MENCIONES, nombreCorto } from '../data/index.js';
import { dibujar, entrada } from '../lib/anim.js';
import { irA } from '../lib/router.js';

const COLOR = { cat: '#2f62a8', num: '#a8700f', ambas: '#7b4c9e', prep: '#3b7a52', concepto: '#6e7a73' };
const ancho = (t) => Math.max(70, t.length * 7.2 + 30);

/** Grafo de vecindad: padre arriba, hijos abajo, relaciones a los lados. */
export default function RelGrafo({ id }) {
  const n = POR_ID[id];
  const ref = useRef(null);
  const padre = n.padre && n.padre !== 'mineria' ? [{ id: n.padre, tipo: 'padre', motivo: 'rama a la que pertenece' }] : [];
  const hijos = [...(HIJOS[id] || []), ...(ALIAS[id] || [])].map((h) => ({ id: h, tipo: 'hijo', motivo: 'contiene' }));
  const vistos = new Set([id, ...padre.map((p) => p.id), ...hijos.map((h) => h.id)]);
  const rel = [];
  (n.rel || []).forEach(([d, motivo]) => { if (!vistos.has(d) && POR_ID[d]) { vistos.add(d); rel.push({ id: d, tipo: 'rel', motivo }); } });
  [...(MENCIONES[id] || [])].forEach((d) => { if (!vistos.has(d) && POR_ID[d] && rel.length < 10) { vistos.add(d); rel.push({ id: d, tipo: 'men', motivo: 'lo menciona' }); } });

  const W = 820;
  const filasHijos = Math.ceil(hijos.length / 5);
  const H = 250 + Math.max(0, filasHijos - 1) * 44 + Math.max(0, Math.ceil(rel.length / 2) - 4) * 40;
  const cx = W / 2, cy = padre.length ? 118 : 90;
  const pos = [];
  padre.forEach((p) => pos.push({ ...p, x: cx, y: 26 }));
  hijos.forEach((h, i) => {
    const fila = Math.floor(i / 5);
    const enFila = Math.min(5, hijos.length - fila * 5);
    const k = i % 5;
    pos.push({ ...h, x: cx + (k - (enFila - 1) / 2) * 150, y: H - 30 - (filasHijos - 1 - fila) * 44 });
  });
  const izq = rel.filter((_, i) => i % 2 === 0), der = rel.filter((_, i) => i % 2 === 1);
  [izq, der].forEach((lado, s) => lado.forEach((r, i) => {
    const total = lado.length;
    const y = cy + (i - (total - 1) / 2) * 40;
    pos.push({ ...r, x: s === 0 ? 120 : W - 120, y });
  }));

  useEffect(() => {
    if (!ref.current) return;
    dibujar(ref.current.querySelectorAll('path.l'), { dur: 500, paso: 40 });
    entrada(ref.current.querySelectorAll('.sat'), { paso: 35, dur: 300, desde: 0 });
  }, [id]);

  if (!pos.length) return null;
  const wc = ancho(nombreCorto(n));
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="rel-grafo" role="img" aria-label={`Relaciones de ${n.nombre}`}>
      {pos.map((p) => {
        const dx = p.x - cx;
        const d = p.tipo === 'padre' || p.tipo === 'hijo'
          ? `M${cx},${cy} C${cx},${(cy + p.y) / 2} ${p.x},${(cy + p.y) / 2} ${p.x},${p.y}`
          : `M${cx + Math.sign(dx) * wc / 2},${cy} C${cx + dx * 0.5},${cy} ${p.x - Math.sign(dx) * 40},${p.y} ${p.x + (dx < 0 ? ancho(nombreCorto(POR_ID[p.id])) / 2 : -ancho(nombreCorto(POR_ID[p.id])) / 2)},${p.y}`;
        return (
          <path key={`l-${p.id}`} className="l" d={d} fill="none" stroke={p.tipo === 'rel' || p.tipo === 'men' ? '#7b4c9e' : '#a9b5ab'} strokeWidth={p.tipo === 'men' ? 1 : 1.6} strokeDasharray={p.tipo === 'rel' ? '5 4' : p.tipo === 'men' ? '2 4' : undefined} />
        );
      })}
      {pos.map((p) => {
        const m = POR_ID[p.id];
        const t = nombreCorto(m);
        const w = ancho(t);
        return (
          <g key={p.id} className="sat" style={{ cursor: 'pointer' }} onClick={() => irA(`/n/${p.id}`)} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && irA(`/n/${p.id}`)}>
            <title>{`${m.nombre}: ${p.motivo}`}</title>
            <rect x={p.x - w / 2} y={p.y - 13} width={w} height={26} rx={m.tipo === 'familia' ? 4 : 13} fill={m.tipo === 'familia' ? '#e4e9e2' : '#fbfcfa'} stroke="#a9b5ab" />
            <circle cx={p.x - w / 2 + 13} cy={p.y} r={4.5} fill={COLOR[m.salida] || '#1f2b25'} />
            <text x={p.x - w / 2 + 23} y={p.y + 4.5} fontFamily="var(--f-titulo)" fontSize="13" fill="#1f2b25">{t}</text>
          </g>
        );
      })}
      <g>
        <rect x={cx - wc / 2} y={cy - 16} width={wc} height={32} rx={16} fill="#1f2b25" />
        <circle cx={cx - wc / 2 + 15} cy={cy} r={5} fill={COLOR[n.salida] || '#fbfcfa'} />
        <text x={cx - wc / 2 + 26} y={cy + 5} fontFamily="var(--f-titulo)" fontWeight="700" fontSize="14" fill="#fbfcfa">{nombreCorto(n)}</text>
      </g>
    </svg>
  );
}
