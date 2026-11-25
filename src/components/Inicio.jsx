import { lazy, Suspense } from 'react';
import { PARTES, ORDEN_PARTE, POR_ID, SALIDAS } from '../data/index.js';
import { EtiquetaSalida } from './Texto.jsx';

const Mapa = lazy(() => import('./Mapa.jsx'));
const COLOR = { cat: 'var(--cat)', num: 'var(--num)', ambas: 'var(--ambas)', prep: 'var(--prep)', concepto: 'var(--concepto)' };

export default function Inicio() {
  return (
    <div className="ancho">
      <header className="portada">
        <h1>Atlas de minería de datos predictiva</h1>
        <p className="entradilla">Temas 3–8 en un árbol. Pulsa cualquier nodo.</p>
        <div className="leyenda">
          <span className="nota-leyenda">Color = tipo de salida:</span>
          {Object.keys(SALIDAS).map((s) => <EtiquetaSalida key={s} salida={s} />)}
        </div>
      </header>

      <Suspense fallback={<div className="mapa-marco" style={{ height: 520 }} />}>
        <Mapa />
      </Suspense>

      <section className="partes" aria-label="Partes del temario">
        {PARTES.map((p) => {
          const nodos = ORDEN_PARTE(p.n);
          const alg = nodos.filter((id) => POR_ID[id].tipo === 'algoritmo').length;
          return (
            <a key={p.n} className="parte-tarjeta" href={`#/parte/${p.n}`}>
              <span className="barra-color" style={{ background: COLOR[p.salida] }} />
              <span className="romano">{p.romano}</span>
              <h3>{p.nombre}</h3>
              <p>{p.temas} · {nodos.length} fichas{alg ? `, ${alg} algoritmos` : ''}</p>
            </a>
          );
        })}
      </section>
    </div>
  );
}
