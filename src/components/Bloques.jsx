import { Suspense } from 'react';
import { Texto, Formula } from './Texto.jsx';
import { DEMOS } from '../ejemplos/index.js';

const NOMBRE_NOTA = { examen: 'Para el examen', ojo: 'Ojo', idea: 'Idea clave' };

export function Demo({ nombre }) {
  const C = DEMOS[nombre];
  if (!C) return <div className="demo">Ejemplo «{nombre}» no disponible.</div>;
  return (
    <Suspense fallback={<div className="demo">Cargando ejemplo…</div>}>
      <C />
    </Suspense>
  );
}

function Bloque({ b }) {
  if (typeof b === 'string') return <p><Texto t={b} /></p>;
  if (b.ul) return <ul>{b.ul.map((x, i) => <li key={i}><Texto t={x} /></li>)}</ul>;
  if (b.ol) return <ol>{b.ol.map((x, i) => <li key={i}><Texto t={x} /></li>)}</ol>;
  if (b.f) return <Formula tex={b.f} bloque />;
  if (b.pseudo) return <pre className="pseudo">{b.pseudo}</pre>;
  if (b.demo) return <Demo nombre={b.demo} />;
  if (b.nota)
    return (
      <div className={`nota ${b.tipo || 'idea'}`} role="note">
        <span className="nota-tipo">{NOMBRE_NOTA[b.tipo || 'idea']}</span>
        <span><Texto t={b.nota} /></span>
      </div>
    );
  if (b.tabla)
    return (
      <div className="tabla-env">
        <table className="t">
          <thead>
            <tr>{b.tabla.cab.map((c, i) => <th key={i}><Texto t={c} /></th>)}</tr>
          </thead>
          <tbody>
            {b.tabla.filas.map((f, i) => (
              <tr key={i}>{f.map((c, j) => <td key={j}><Texto t={c} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (b.vs)
    return (
      <div className="vs">
        {b.vs.map((col, i) => (
          <div key={i}>
            <h4><Texto t={col.t} /></h4>
            <ul>{col.items.map((x, j) => <li key={j}><Texto t={x} /></li>)}</ul>
          </div>
        ))}
      </div>
    );
  if (b.def)
    return (
      <dl className="def">
        {b.def.map(([t, d], i) => [
          <dt key={`t${i}`}><Texto t={t} /></dt>,
          <dd key={`d${i}`}><Texto t={d} /></dd>,
        ])}
      </dl>
    );
  return null;
}

export default function Bloques({ bloques }) {
  return (
    <div className="bloques">
      {bloques.map((b, i) => <Bloque key={i} b={b} />)}
    </div>
  );
}
