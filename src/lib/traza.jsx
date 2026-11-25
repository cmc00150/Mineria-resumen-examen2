// Sincroniza el esquema de una ficha con su ejemplo interactivo.
// El ejemplo avanza por "fotogramas"; cada uno indica qué paso del esquema
// se está ejecutando (e = '0', '1.0', … como en Esquema.jsx) y el esquema lo resalta.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const Ctx = createContext(null);
const VACIO = { activo: null, marcar: () => {}, reproducir: { current: null } };

export function TrazaProvider({ children }) {
  const [activo, setActivo] = useState(null);
  const reproducir = useRef(null);
  const value = useMemo(() => ({ activo, marcar: setActivo, reproducir }), [activo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTraza = () => useContext(Ctx) || VACIO;

/** Reproductor de fotogramas. frames: [{ e, msg, ... }] */
export function usePasos(frames, { intervalo = 700, sync = true } = {}) {
  const t = useTraza();
  const marcar = t.marcar;
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  const [vel, setVel] = useState(1);

  useEffect(() => {
    setI(0);
    setPlay(false);
  }, [frames]);

  useEffect(() => {
    if (!sync) return;
    const f = frames[i];
    marcar(f && f.e != null ? f.e : null);
  }, [i, frames, marcar, sync]);

  useEffect(() => {
    if (!play) return undefined;
    if (i >= frames.length - 1) {
      setPlay(false);
      return undefined;
    }
    const id = setTimeout(() => setI((x) => x + 1), intervalo / vel);
    return () => clearTimeout(id);
  }, [play, i, frames, intervalo, vel]);

  const reproducir = useCallback(() => {
    setI(0);
    setPlay(true);
  }, []);

  useEffect(() => {
    if (!sync) return undefined;
    t.reproducir.current = reproducir;
    return () => {
      if (t.reproducir.current === reproducir) t.reproducir.current = null;
    };
  }, [reproducir]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (sync) marcar(null); }, [marcar, sync]);

  return {
    i,
    frame: frames[i] || frames[frames.length - 1] || {},
    total: frames.length,
    play,
    vel,
    setVel,
    setI,
    alternar: () => {
      if (i >= frames.length - 1) setI(0);
      setPlay((p) => !p);
    },
    paso: () => { setPlay(false); setI((x) => Math.min(frames.length - 1, x + 1)); },
    atras: () => { setPlay(false); setI((x) => Math.max(0, x - 1)); },
    final: () => { setPlay(false); setI(frames.length - 1); },
    reiniciar: () => { setPlay(false); setI(0); },
  };
}

/** Barra de controles común a todos los ejemplos paso a paso. */
export function Controles({ p }) {
  return (
    <div className="controles-paso">
      <button className="boton primario" onClick={p.alternar} type="button" aria-label={p.play ? 'Pausar' : 'Reproducir'}>
        {p.play ? '❚❚ Pausar' : '▶ Reproducir'}
      </button>
      <button className="boton" onClick={p.atras} disabled={p.i === 0} type="button" aria-label="Paso anterior">◀</button>
      <button className="boton" onClick={p.paso} disabled={p.i >= p.total - 1} type="button" aria-label="Paso siguiente">▶</button>
      <button className="boton" onClick={p.final} type="button">Al final</button>
      <button className="boton" onClick={p.reiniciar} type="button" aria-label="Reiniciar">⟲</button>
      <label className="fila-control" style={{ margin: 0 }}>
        velocidad
        <select value={p.vel} onChange={(e) => p.setVel(Number(e.target.value))}>
          <option value={0.5}>lenta</option>
          <option value={1}>normal</option>
          <option value={2.5}>rápida</option>
          <option value={8}>muy rápida</option>
        </select>
      </label>
      <span className="marcador">paso {p.i + 1} / {p.total}</span>
    </div>
  );
}

export function Mensaje({ children }) {
  return <p className="mensaje-paso" aria-live="polite">{children}</p>;
}
