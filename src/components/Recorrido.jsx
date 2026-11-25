import { useEffect, useRef } from 'react';
import { PARTES, ORDEN_PARTE, POR_ID, SALIDAS, ancestros, nombreCorto } from '../data/index.js';
import { Texto, EtiquetaSalida } from './Texto.jsx';
import { entrada } from '../lib/anim.js';

export default function Recorrido({ n }) {
  const parte = PARTES.find((p) => String(p.n) === String(n));
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) entrada(ref.current.querySelectorAll('li'), { paso: 30, dur: 380 });
  }, [n]);
  if (!parte) return <div className="columna"><h1>Esa parte no existe</h1><p><a href="#/">Volver al mapa</a></p></div>;

  const ids = ORDEN_PARTE(parte.n);
  const base = Math.min(...ids.map((id) => ancestros(id).length));
  const sig = PARTES.find((p) => p.n === parte.n + 1);
  const ant = PARTES.find((p) => p.n === parte.n - 1);

  return (
    <div className="columna">
      <p className="migas"><a href="#/">Mapa</a><span className="sep"> / </span>Parte {parte.romano}</p>
      <h1>{parte.nombre}</h1>
      <p className="resumen" style={{ fontSize: 19, color: 'var(--tinta-2)', marginTop: 10 }}>
        {parte.temas}. Recorrido de lectura en el orden del árbol: primero cada familia y después sus algoritmos.
      </p>
      <ol className="recorrido" ref={ref}>
        {ids.map((id) => {
          const nodo = POR_ID[id];
          const prof = Math.min(4, ancestros(id).length - base);
          return (
            <li key={id} className={`${nodo.tipo === 'familia' ? 'fam' : ''} prof-${prof}`}>
              <a href={`#/n/${id}`}>
                <h3>
                  {nombreCorto(nodo)}
                  <EtiquetaSalida salida={nodo.salida} />
                  {nodo.esquema && <span className="chip">esquema</span>}
                  {nodo.ejemplo && <span className="chip">ejemplo interactivo</span>}
                </h3>
              </a>
              <p><Texto t={nodo.resumen} /></p>
            </li>
          );
        })}
      </ol>
      <nav className="paginacion">
        {ant ? <a href={`#/parte/${ant.n}`}><small>Parte anterior</small>{ant.nombre}</a> : <span />}
        {sig && <a className="sig" href={`#/parte/${sig.n}`}><small>Parte siguiente</small>{sig.nombre}</a>}
      </nav>
    </div>
  );
}
