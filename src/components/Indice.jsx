import { useEffect, useState } from 'react';
import { POR_ID, HIJOS, ALIAS, SALIDAS, ancestros, nombreCorto } from '../data/index.js';

const CLAVE = 'atlas-indice-abiertos';
const leer = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (Array.isArray(v)) return new Set(v);
  } catch (e) { /* almacenamiento no disponible */ }
  return new Set(['mineria', 'preparacion', 'clasificacion', 'regresion']);
};

function Nodo({ id, actual, abiertos, alternar, esAlias = false }) {
  const n = POR_ID[id];
  const hijos = esAlias ? [] : [...(HIJOS[id] || []), ...(ALIAS[id] || []).map((a) => `alias:${a}`)];
  const abierto = abiertos.has(id);
  const cls = [SALIDAS[n.salida]?.clase, id === actual ? 'actual' : '', n.tipo === 'familia' ? 'familia-l' : '', esAlias ? 'alias' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <li>
      <div className="fila">
        {hijos.length ? (
          <button className="plegar" onClick={() => alternar(id)} aria-expanded={abierto} aria-label={`${abierto ? 'Plegar' : 'Desplegar'} ${n.nombre}`} type="button">
            {abierto ? '▾' : '▸'}
          </button>
        ) : (
          <span className="sin-hijos" />
        )}
        <a href={id === 'mineria' ? '#/' : `#/n/${id}`} className={cls} aria-current={id === actual ? 'page' : undefined} title={esAlias ? 'También aparece aquí' : n.resumen}>
          <span className={`punto ${n.tipo === 'familia' ? 'familia' : ''}`} />
          <span>{nombreCorto(n)}</span>
        </a>
      </div>
      {abierto && hijos.length > 0 && (
        <ul>
          {hijos.map((h) =>
            h.startsWith('alias:') ? (
              <Nodo key={h} id={h.slice(6)} actual={actual} abiertos={abiertos} alternar={alternar} esAlias />
            ) : (
              <Nodo key={h} id={h} actual={actual} abiertos={abiertos} alternar={alternar} />
            ),
          )}
        </ul>
      )}
    </li>
  );
}

export default function Indice({ actual }) {
  const [abiertos, setAbiertos] = useState(leer);

  useEffect(() => {
    if (!actual || !POR_ID[actual]) return;
    setAbiertos((prev) => {
      const s = new Set(prev);
      ancestros(actual).forEach((a) => s.add(a.id));
      return s;
    });
  }, [actual]);

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify([...abiertos])); } catch (e) { /* nada */ }
  }, [abiertos]);

  const alternar = (id) =>
    setAbiertos((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  return (
    <nav className="indice" aria-label="Índice en árbol">
      <div className="atajos">
        <a className="boton" href="#/">Mapa</a>
        {[1, 2, 3, 4].map((n) => <a key={n} className="boton" href={`#/parte/${n}`}>Parte {['I', 'II', 'III', 'IV'][n - 1]}</a>)}
        <a className="boton" href="#/tabla">Tabla</a>
      </div>
      <p className="titulo-indice">Índice del árbol</p>
      <ul>
        <Nodo id="mineria" actual={actual} abiertos={abiertos} alternar={alternar} />
      </ul>
    </nav>
  );
}
