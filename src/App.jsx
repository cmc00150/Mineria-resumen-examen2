import { useEffect, useState } from 'react';
import { useRuta } from './lib/router.js';
import { PARTES } from './data/index.js';
import Indice from './components/Indice.jsx';
import Ficha from './components/Ficha.jsx';
import Inicio from './components/Inicio.jsx';
import Recorrido from './components/Recorrido.jsx';
import Tabla from './components/Tabla.jsx';
import Buscador from './components/Buscador.jsx';

function Marca() {
  return (
    <a className="marca" href="#/">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 4v24M16 12l-8 8M16 12l8 8M16 20l-5 6M16 20l5 6" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="8" cy="20" r="2.6" fill="var(--cat)" />
        <circle cx="24" cy="20" r="2.6" fill="var(--num)" />
        <circle cx="16" cy="4" r="2.6" fill="var(--prep)" />
      </svg>
      <span>Atlas de minería</span>
    </a>
  );
}

export default function App() {
  const { seccion, arg } = useRuta();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [seccion, arg]);

  const actual = seccion === 'n' ? arg : seccion === '' ? 'mineria' : null;
  let vista;
  if (seccion === 'n') vista = <Ficha id={arg} />;
  else if (seccion === 'parte') vista = <Recorrido n={arg} />;
  else if (seccion === 'tabla') vista = <Tabla />;
  else vista = <Inicio />;

  useEffect(() => {
    document.title = seccion === '' ? 'Atlas de minería de datos predictiva' : 'Atlas de minería';
  }, [seccion]);

  return (
    <>
      <header className="barra">
        <button className="boton-menu" onClick={() => setMenu((m) => !m)} aria-expanded={menu} type="button">
          Índice
        </button>
        <Marca />
        <nav aria-label="Secciones">
          <a href="#/" aria-current={seccion === '' ? 'page' : undefined}>Mapa</a>
          {PARTES.slice(0, 4).map((p) => (
            <a key={p.n} className="opcional" href={`#/parte/${p.n}`} aria-current={seccion === 'parte' && arg === String(p.n) ? 'page' : undefined} title={p.nombre}>
              Parte {p.romano}
            </a>
          ))}
          <a href="#/tabla" aria-current={seccion === 'tabla' ? 'page' : undefined}>Tabla</a>
        </nav>
        <span className="hueco" />
        <Buscador />
      </header>
      <div className="cuerpo">
        <aside className={`lateral ${menu ? 'abierto' : ''}`}>
          <Indice actual={actual} />
        </aside>
        <main className="principal" id="contenido">{vista}</main>
      </div>
    </>
  );
}
