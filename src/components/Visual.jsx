// Bloques visuales: sustituyen párrafos por gráficos compactos.
// Cada bloque es un objeto con una clave de tipo y un `ti` (título corto) opcional.
//   tarjetas: [{ i, t, s, c }]           i = pictograma o glifo corto, c = acento
//   vs:       [{ t, i, c, items: [] }]   columnas comparadas
//   barras:   { series: [{ n, c }], filas: [{ e, v: [] }], unidad, log }
//   linea:    [{ a, t, c }]               cronología
//   matriz:   { cab: [], filas: [[]] }     cuadrícula compacta (✓ ✗ y fichas)
//   flujo:    [{ i, t, s }]               pasos encadenados con flechas
//   cifras:   [{ v, t, c }]               números grandes
//   reglas:   [[condiciones, clase], …]   SI … ENTONCES …
//   arbol:    nodo de ArbolSvg
//   formulas: [[nombre, latex]]
//   chips:    ['…']
//   clave:    'idea para el examen'       aviso: ['corto', 'largo']
//   demo:     'NombreDelEjemplo'          pseudo: 'código'
import { useEffect, useRef } from 'react';
import { Texto, Formula } from './Texto.jsx';
import { Picto, PICTOS } from './Iconos.jsx';
import { Demo } from './Bloques.jsx';
import { ArbolSvg } from '../ejemplos/comun.jsx';
import { anim, stagger } from '../lib/anim.js';

const ACENTO = { cat: 'var(--cat)', num: 'var(--num)', ambas: 'var(--ambas)', prep: 'var(--prep)', concepto: 'var(--concepto)', si: 'var(--si)', no: 'var(--no)', aviso: '#c26a2e' };

function Icono({ i, size = 34 }) {
  if (!i) return null;
  if (PICTOS[i]) return <Picto k={i} size={size} />;
  return <span className="glifo">{i}</span>;
}

function Barras({ b }) {
  const ref = useRef(null);
  const max = b.max || Math.max(...b.filas.flatMap((f) => f.v.filter((x) => x != null)));
  const escala = (v) => (b.log ? Math.log10(1 + v) / Math.log10(1 + max) : v / max);
  useEffect(() => {
    if (ref.current) anim(ref.current.querySelectorAll('.vb-barra i'), { scaleX: [0, 1], duration: 650, delay: stagger(25), ease: 'outCubic' });
  }, []);
  return (
    <div ref={ref}>
      {b.series.length > 1 && (
        <div className="vb-leyenda">
          {b.series.map((s) => <span key={s.n}><i style={{ background: ACENTO[s.c] || s.c }} />{s.n}</span>)}
        </div>
      )}
      <div className="vb-barras">
        {b.filas.map((f, k) => (
          <div className={`vb-fila ${f.d ? 'dest' : ''}`} key={k}>
            <span className="vb-e"><Texto t={f.e} /></span>
            <div className="vb-pila">
              {f.v.map((v, j) => (
                <div className="vb-barra" key={j}>
                  {v != null && <i style={{ width: `${Math.max(0.6, escala(v) * 100)}%`, background: ACENTO[b.series[j].c] || b.series[j].c }} />}
                  <span>{v == null ? '—' : `${String(v).replace('.', ',')}${(Array.isArray(b.unidad) ? b.unidad[j] : b.unidad) ?? ''}`}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Columnas verticales agrupadas. panel = { t, grupos: [{ n, v: [] }], series: [{ n, c }], min, max, log, ref: { v, n }, unidad, nota }
function Panel({ p }) {
  const ref = useRef(null);
  const giro = p.grupos.length > 5;
  const W = 300, H = giro ? 228 : 210, m = { l: 40, r: 8, t: 24, b: giro ? 56 : 40 };
  const vals = p.grupos.flatMap((g) => g.v.filter((x) => x != null));
  const min = p.min ?? 0;
  const max = p.max ?? Math.max(...vals, p.ref?.v ?? 0);
  const f = (v) => (p.log ? Math.log10(1 + Math.max(v, 0)) / Math.log10(1 + max) : (Math.max(v, min) - min) / (max - min));
  const y = (v) => H - m.b - f(v) * (H - m.b - m.t);
  const gw = (W - m.l - m.r) / p.grupos.length;
  const bw = Math.min(22, (gw - 10) / p.series.length);
  const ticks = p.log ? [1, 10, 100, 1000, 10000].filter((t) => t <= max) : Array.from({ length: 5 }, (_, i) => min + ((max - min) * i) / 4);
  useEffect(() => {
    if (ref.current) anim(ref.current.querySelectorAll('rect.col'), { scaleY: [0, 1], duration: 600, delay: stagger(30), ease: 'outCubic' });
  }, []);
  const fmt = (v) => (Math.abs(v) >= 100 ? Math.round(v).toLocaleString('es-ES') : String(Number(v.toFixed(2))).replace('.', ','));
  return (
    <figure className="vb-panel">
      <figcaption><Texto t={p.t} /></figcaption>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.t}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="#e4e9e2" />
            <text x={m.l - 5} y={y(t) + 4} textAnchor="end" fontSize="10.5" fill="#6f7d75" fontFamily="var(--f-titulo)">{fmt(t)}</text>
          </g>
        ))}
        {p.ref && (
          <g>
            <line x1={m.l} x2={W - m.r} y1={y(p.ref.v)} y2={y(p.ref.v)} stroke="#1f2b25" strokeDasharray="5 3" strokeWidth="1.5" />
            <text x={W - m.r} y={11} textAnchor="end" fontSize="10.5" fill="#1f2b25" fontFamily="var(--f-titulo)" fontWeight="700">- - {p.ref.n} {fmt(p.ref.v)}</text>
          </g>
        )}
        {p.grupos.map((g, gi) => {
          const x0 = m.l + gi * gw + (gw - bw * p.series.length) / 2;
          return (
            <g key={g.n}>
              {g.v.map((v, si) => v == null ? null : (
                <g key={si}>
                  <rect className="col" x={x0 + si * bw + 1} y={y(v)} width={bw - 2} height={H - m.b - y(v)} fill={ACENTO[p.series[si].c] || p.series[si].c} style={{ transformOrigin: `0 ${H - m.b}px`, transformBox: 'view-box' }}>
                    <title>{`${g.n} · ${p.series[si].n}: ${fmt(v)}${p.unidad || ''}`}</title>
                  </rect>
                </g>
              ))}
              {p.series.length === 1 && g.v[0] != null && (() => {
                const cx = m.l + gi * gw + gw / 2, yv = y(g.v[0]), dentro = yv < m.t + 30;
                return dentro
                  ? <text x={cx} y={yv + 5} transform={`rotate(-90 ${cx} ${yv + 5})`} textAnchor="end" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#fff" fontFamily="var(--f-titulo)">{fmt(g.v[0])}</text>
                  : <text x={cx} y={yv - 3} textAnchor="middle" fontSize="9.5" fill="#4a5a51" fontFamily="var(--f-titulo)">{fmt(g.v[0])}</text>;
              })()}
              <text x={m.l + gi * gw + gw / 2} y={H - m.b + 15} textAnchor={giro ? 'end' : 'middle'} transform={giro ? `rotate(-40 ${m.l + gi * gw + gw / 2} ${H - m.b + 15})` : undefined} fontSize={giro ? 11 : 12} fontWeight="700" fill="#1f2b25" fontFamily="var(--f-titulo)">{g.n}</text>
              {g.s && <text x={m.l + gi * gw + gw / 2} y={H - m.b + 29} textAnchor="middle" fontSize="10.5" fill="#6f7d75" fontFamily="var(--f-titulo)">{g.s}</text>}
            </g>
          );
        })}
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="#4a5a51" />
      </svg>
      {p.nota && <small><Texto t={p.nota} /></small>}
    </figure>
  );
}

function Celda({ v }) {
  if (v === '✓') return <span className="vb-si">✓</span>;
  if (v === '✗') return <span className="vb-no">✗</span>;
  return <Texto t={v} />;
}

function Bloque({ b }) {
  if (b.tarjetas)
    return (
      <div className="vb-tarjetas" style={b.cols ? { gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` } : undefined}>
        {b.tarjetas.map((t, k) => (
          <div className="vb-tarjeta" key={k} style={t.c ? { borderTopColor: ACENTO[t.c] || t.c } : undefined} title={t.largo}>
            <Icono i={t.i} />
            <strong><Texto t={t.t} /></strong>
            {t.s && <small><Texto t={t.s} /></small>}
          </div>
        ))}
      </div>
    );
  if (b.vs)
    return (
      <div className="vb-vs">
        {b.vs.map((col, k) => (
          <div key={k} className="vb-col" style={col.c ? { borderTopColor: ACENTO[col.c] || col.c } : undefined}>
            <div className="vb-col-cab"><Icono i={col.i} size={26} /><strong><Texto t={col.t} /></strong></div>
            {col.items.map((x, j) => <span key={j} className="vb-chip"><Texto t={x} /></span>)}
          </div>
        ))}
      </div>
    );
  if (b.barras) return <Barras b={b.barras} />;
  if (b.paneles)
    return (
      <div>
        {b.series && (
          <div className="vb-leyenda">
            {b.series.map((x) => <span key={x.n}><i style={{ background: ACENTO[x.c] || x.c }} />{x.n}</span>)}
          </div>
        )}
        <div className="vb-paneles">{b.paneles.map((p, k) => <Panel key={k} p={{ series: b.series, ...p }} />)}</div>
      </div>
    );
  if (b.linea)
    return (
      <ol className="vb-linea">
        {b.linea.map((h, k) => (
          <li key={k} style={h.c ? { '--c': ACENTO[h.c] || h.c } : undefined}>
            <b>{h.a}</b>
            <span><Texto t={h.t} /></span>
          </li>
        ))}
      </ol>
    );
  if (b.matriz)
    return (
      <div className="tabla-env">
        <table className="t vb-matriz">
          <thead><tr>{b.matriz.cab.map((c, k) => <th key={k}><Texto t={c} /></th>)}</tr></thead>
          <tbody>{b.matriz.filas.map((f, k) => <tr key={k}>{f.map((c, j) => (j === 0 ? <th key={j}><Texto t={c} /></th> : <td key={j}><Celda v={c} /></td>))}</tr>)}</tbody>
        </table>
      </div>
    );
  if (b.flujo)
    return (
      <div className="vb-flujo">
        {b.flujo.map((p, k) => (
          <div className="vb-paso" key={k}>
            <div className="vb-paso-caja">
              <Icono i={p.i} size={28} />
              <strong><Texto t={p.t} /></strong>
              {p.s && <small><Texto t={p.s} /></small>}
            </div>
            {k < b.flujo.length - 1 && <span className="vb-flecha" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>
    );
  if (b.cifras)
    return (
      <div className="vb-cifras">
        {b.cifras.map((c, k) => (
          <div key={k} className="vb-cifra" style={c.c ? { color: ACENTO[c.c] || c.c } : undefined}>
            <b><Texto t={c.v} /></b>
            <span><Texto t={c.t} /></span>
          </div>
        ))}
      </div>
    );
  if (b.reglas)
    return (
      <ol className="vb-reglas">
        {b.reglas.map(([cond, clase], k) => (
          <li key={k}>
            {cond ? <><span className="si-k">SI</span> <Texto t={cond} /> <span className="si-k">→</span></> : <span className="si-k">EN OTRO CASO →</span>}
            <span className={`vb-clase ${/^(no|NO)\b/.test(clase) ? 'no' : 'si'}`}><Texto t={clase} /></span>
          </li>
        ))}
      </ol>
    );
  if (b.arbol) return <ArbolSvg raiz={b.arbol} sepX={b.sepX || 80} sepY={b.sepY || 70} />;
  if (b.formulas)
    return (
      <div className="formulas">
        {b.formulas.map(([n, tex], k) => (
          <div key={k} className="formula-tarjeta">
            <span className="tv-etq">{n}</span>
            <Formula tex={tex} bloque />
          </div>
        ))}
      </div>
    );
  if (b.chips) return <div className="vb-chips">{b.chips.map((c, k) => <span key={k} className="vb-chip"><Texto t={c} /></span>)}</div>;
  if (b.clave) return <div className="vb-clave"><span>★</span><Texto t={b.clave} /></div>;
  if (b.aviso) return <div className="vb-aviso" title={b.aviso[1]}><span>⚠</span><span><Texto t={b.aviso[0]} />{b.aviso[1] && <small><Texto t={b.aviso[1]} /></small>}</span></div>;
  if (b.demo) return <Demo nombre={b.demo} />;
  if (b.pseudo) return <pre className="pseudo">{b.pseudo}</pre>;
  return null;
}

export default function BloquesVisuales({ bloques }) {
  return (
    <div className="vb">
      {bloques.map((b, k) => (
        <section key={k} className="vb-sec">
          {b.ti && <h3 className="vb-ti"><Texto t={b.ti} /></h3>}
          <Bloque b={b} />
        </section>
      ))}
    </div>
  );
}
