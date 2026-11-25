import { useMemo, useState } from 'react';
import { NODOS, SALIDAS, nombreCorto } from '../data/index.js';
import { irA } from '../lib/router.js';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const INDICE = NODOS.map((n) => ({ n, clave: norm(`${n.nombre} ${n.corto || ''} ${n.resumen || ''} ${n.ficha?.weka || ''}`) }));

export default function Buscador() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const res = useMemo(() => {
    const t = norm(q.trim());
    if (t.length < 2) return [];
    return INDICE.filter((x) => x.clave.includes(t))
      .sort((a, b) => (norm(a.n.nombre).includes(t) ? 0 : 1) - (norm(b.n.nombre).includes(t) ? 0 : 1))
      .slice(0, 9)
      .map((x) => x.n);
  }, [q]);

  const ir = (n) => {
    irA(`/n/${n.id}`);
    setQ('');
  };

  return (
    <div className="buscador">
      <input
        type="search"
        placeholder="Buscar algoritmo o concepto"
        value={q}
        onChange={(e) => { setQ(e.target.value); setSel(0); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, res.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
          if (e.key === 'Enter' && res[sel]) ir(res[sel]);
          if (e.key === 'Escape') setQ('');
        }}
        aria-label="Buscar en el atlas"
      />
      {res.length > 0 && (
        <ul role="listbox">
          {res.map((n, i) => (
            <li key={n.id} role="option" aria-selected={i === sel}>
              <a href={`#/n/${n.id}`} className={`${SALIDAS[n.salida]?.clase || ''} ${i === sel ? 'activo' : ''}`} onClick={() => setQ('')}>
                <span className="punto" />
                {nombreCorto(n)}
                <small>{n.tema}</small>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
