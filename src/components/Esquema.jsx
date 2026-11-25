import { useEffect, useRef, useState } from 'react';
import { Texto } from './Texto.jsx';
import { entrada } from '../lib/anim.js';
import { useTraza } from '../lib/traza.jsx';

// Esquema de funcionamiento: un diagrama de flujo vertical pensado para memorizar.
//   in  → entrada (píldora clara)       paso → acción (caja)
//   si  → decisión con dos salidas       bucle → bloque que se repite (raíl con ↻)
//   out → resultado (píldora oscura)

const ICONOS = {
  in: (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h10M9 5l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
  ),
  paso: (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="3.5" y="3.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
  ),
  si: (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2l7 7-7 7-7-7z" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
  ),
  out: (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="currentColor" /></svg>
  ),
  bucle: (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M14 9a5 5 0 1 1-1.6-3.7M14 3v3.3h-3.3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
  ),
};

/** Aplana el árbol de pasos para poder "recorrerlo" en orden. */
function aplanar(pasos, pref = '') {
  const out = [];
  pasos.forEach((p, i) => {
    const id = `${pref}${i}`;
    out.push(id);
    if (p.pasos) out.push(...aplanar(p.pasos, `${id}.`));
  });
  return out;
}

function Pasos({ pasos, pref, encendido }) {
  return (
    <ol>
      {pasos.map((p, i) => {
        const id = `${pref}${i}`;
        const on = encendido === id;
        return (
          <li key={id} className={`paso-e k-${p.k}${on ? ' encendido' : ''}`} data-paso={id}>
            <div className="caja">
              <span className="icono">{ICONOS[p.k]}</span>
              <span>
                <Texto t={p.t} />
                {p.d && <span className="detalle"><Texto t={p.d} /></span>}
                {p.k === 'si' && (
                  <span className="ramas">
                    <span className="r-si">sí: <Texto t={p.si} /></span>
                    <span className="r-no">no: <Texto t={p.no} /></span>
                  </span>
                )}
              </span>
            </div>
            {p.pasos && <Pasos pasos={p.pasos} pref={`${id}.`} encendido={encendido} />}
          </li>
        );
      })}
    </ol>
  );
}

export default function Esquema({ pasos, compacto = false, titulo = 'Esquema' }) {
  const ref = useRef(null);
  const [local, setLocal] = useState(null);
  const temporizador = useRef(null);
  const traza = useTraza();
  const encendido = traza.activo ?? local;

  useEffect(() => {
    if (!ref.current || compacto) return undefined;
    entrada(ref.current.querySelectorAll('.caja'), { paso: 45, dur: 420 });
    return () => clearTimeout(temporizador.current);
  }, [pasos, compacto]);

  // En la versión compacta (junto al ejemplo), mantener a la vista el paso activo
  useEffect(() => {
    if (!compacto || !ref.current || encendido == null) return;
    const el = ref.current.querySelector(`[data-paso="${encendido}"]`);
    const cont = ref.current.closest('aside');
    if (!el || !cont) return;
    const r = el.getBoundingClientRect();
    const c = cont.getBoundingClientRect();
    if (r.top < c.top || r.bottom > c.bottom) cont.scrollTop += r.top - c.top - c.height / 3;
  }, [encendido, compacto]);

  const repasar = () => {
    if (traza.reproducir.current) {
      const ej = document.getElementById('ejemplo');
      if (ej) ej.scrollIntoView({ behavior: 'smooth', block: 'start' });
      traza.reproducir.current();
      return;
    }
    clearTimeout(temporizador.current);
    const orden = aplanar(pasos);
    let i = 0;
    const tick = () => {
      if (i >= orden.length) {
        setLocal(null);
        return;
      }
      setLocal(orden[i]);
      i += 1;
      temporizador.current = setTimeout(tick, 900);
    };
    tick();
  };

  return (
    <div className={`esquema ${compacto ? 'compacto' : ''}`} ref={ref}>
      <div className="panel-titulo">
        <h2>{titulo}</h2>
        {!compacto && (
          <button className="boton" onClick={repasar} type="button">
            {traza.reproducir.current ? '▶ Reproducir en el ejemplo' : 'Repasar paso a paso'}
          </button>
        )}
      </div>
      <Pasos pasos={pasos} pref="" encendido={encendido} />
    </div>
  );
}
