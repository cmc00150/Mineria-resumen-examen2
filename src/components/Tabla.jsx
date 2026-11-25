import { useMemo, useState } from 'react';
import { ALGORITMOS, POR_ID, SALIDAS, ancestros, nombreCorto } from '../data/index.js';
import { EtiquetaSalida, Texto } from './Texto.jsx';
import { Picto, NOMBRE_PICTO } from './Iconos.jsx';

const COLUMNAS = [
  { k: 'nombre', t: 'Algoritmo', v: (n) => nombreCorto(n) },
  { k: 'rama', t: 'Rama', v: (n) => nombreCorto(POR_ID[n.padre]) },
  { k: 'salida', t: 'Salida', v: (n) => SALIDAS[n.salida]?.nombre },
  { k: 'entrada', t: 'Entrada', v: (n) => NOMBRE_PICTO[n.visual?.entrada] || '' },
  { k: 'interp', t: 'Caja', v: (n) => NOMBRE_PICTO[n.visual?.caja] || '' },
  { k: 'devuelve', t: 'Devuelve', v: (n) => NOMBRE_PICTO[n.visual?.devuelve] || '' },
  { k: 'tema', t: 'Tema', v: (n) => n.tema },
];

export default function Tabla() {
  const [filtro, setFiltro] = useState('todas');
  const [orden, setOrden] = useState({ k: null, asc: true });

  const filas = useMemo(() => {
    let f = ALGORITMOS.filter((n) => filtro === 'todas' || n.salida === filtro);
    if (orden.k) {
      const col = COLUMNAS.find((c) => c.k === orden.k);
      f = [...f].sort((a, b) => String(col.v(a)).localeCompare(String(col.v(b)), 'es') * (orden.asc ? 1 : -1));
    }
    return f;
  }, [filtro, orden]);

  return (
    <div className="ancho">
      <p className="migas"><a href="#/">Mapa</a><span className="sep"> / </span>Tabla</p>
      <h1>Todos los algoritmos</h1>
      <p style={{ fontSize: 19, color: 'var(--tinta-2)', marginTop: 10, maxWidth: '62ch' }}>
        {ALGORITMOS.length} algoritmos · pulsa una cabecera para ordenar
      </p>
      <div className="filtros" role="group" aria-label="Filtrar por salida">
        <button className={`boton ${filtro === 'todas' ? 'activo' : ''}`} onClick={() => setFiltro('todas')} type="button">Todas</button>
        {['cat', 'num', 'ambas', 'prep'].map((s) => (
          <button key={s} className={`boton ${filtro === s ? 'activo' : ''}`} onClick={() => setFiltro(s)} type="button">
            {SALIDAS[s].largo}
          </button>
        ))}
      </div>
      <div className="tabla-env">
        <table className="t resumen-t">
          <thead>
            <tr>
              {COLUMNAS.map((c) => (
                <th key={c.k} aria-sort={orden.k === c.k ? (orden.asc ? 'ascending' : 'descending') : 'none'}>
                  <button onClick={() => setOrden((o) => ({ k: c.k, asc: o.k === c.k ? !o.asc : true }))} type="button">
                    {c.t}{orden.k === c.k ? (orden.asc ? ' ▴' : ' ▾') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((n) => (
              <tr key={n.id}>
                <td><a href={`#/n/${n.id}`}>{nombreCorto(n)}</a></td>
                <td>{ancestros(n.id).slice(2).map((a) => nombreCorto(a)).join(' › ') || nombreCorto(POR_ID[n.padre])}</td>
                <td><EtiquetaSalida salida={n.salida} /></td>
                <td title={NOMBRE_PICTO[n.visual?.entrada]}><Picto k={n.visual?.entrada} size={26} /></td>
                <td title={NOMBRE_PICTO[n.visual?.caja]}><Picto k={n.visual?.caja} size={26} /></td>
                <td title={n.ficha?.devuelve}><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Picto k={n.visual?.devuelve} size={26} />{NOMBRE_PICTO[n.visual?.devuelve]}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{n.tema}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
