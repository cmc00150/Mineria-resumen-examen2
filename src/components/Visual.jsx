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
