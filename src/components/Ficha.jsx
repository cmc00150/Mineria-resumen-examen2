import { useEffect, useRef } from 'react';
import { POR_ID, HIJOS, ALIAS, ORDEN, PARTES, SALIDAS, ancestros, nombreCorto, parteDe } from '../data/index.js';
import { Texto, EtiquetaSalida, Formula } from './Texto.jsx';
import Bloques, { Demo } from './Bloques.jsx';
import Esquema from './Esquema.jsx';
import RelGrafo from './RelGrafo.jsx';
import { Picto, NOMBRE_PICTO } from './Iconos.jsx';
import BloquesVisuales from './Visual.jsx';
import { entrada } from '../lib/anim.js';

const TIPOS = { familia: 'Familia', algoritmo: 'Algoritmo', concepto: 'Concepto' };
const SAL_PICTO = { cat: 'cat', num: 'num', ambas: 'ambas', prep: 'prep', concepto: 'concepto' };

function Insignia({ k, texto }) {
  return (
    <span className="insignia" title={NOMBRE_PICTO[k]}>
      <Picto k={k} size={26} />
      <span>{texto || NOMBRE_PICTO[k]}</span>
    </span>
  );
}

/** Ficha técnica compacta: pictogramas + fichas cortas; el texto largo queda en el tooltip. */
function TarjetaVisual({ n }) {
  const v = n.visual;
  const f = n.ficha || {};
  return (
    <section className="tarjeta-visual" aria-label="Ficha técnica">
      <div className="tv-devuelve">
        <Picto k={v.devuelve} size={64} />
        <div>
          <span className="tv-etq">Devuelve</span>
          <strong>{NOMBRE_PICTO[v.devuelve]}</strong>
        </div>
      </div>
      <div className="balanza">
        <div className="platillo pro">
          <span className="tv-etq">A favor</span>
          {(v.fuertes || []).map((c, i) => (
            <span key={i} className="ficha-chip pro" title={f.fuertes?.[i] || c}>{c}</span>
          ))}
        </div>
        <div className="platillo contra">
          <span className="tv-etq">En contra</span>
          {(v.debiles || []).map((c, i) => (
            <span key={i} className="ficha-chip contra" title={f.debiles?.[i] || c}>{c}</span>
          ))}
        </div>
      </div>
      {(v.parametros || v.weka) && (
        <div className="tv-pie">
          {(v.parametros || []).map((p, i) => <span key={i} className="ficha-chip param"><Texto t={p} /></span>)}
          {v.weka && <span className="ficha-chip weka" title="Nombre en Weka">Weka · {v.weka}</span>}
        </div>
      )}
    </section>
  );
}

function FichaTecnicaTexto({ n }) {
  const f = n.ficha;
  const s = SALIDAS[n.salida];
  return (
    <section aria-labelledby="ft-titulo">
      <div className="panel-titulo"><h2 id="ft-titulo">Ficha técnica</h2></div>
      <div className="ficha-tecnica">
        <dl>
          <div className="fila-ft"><dt>Salida</dt><dd><EtiquetaSalida salida={n.salida} /> <span style={{ marginLeft: 6 }}>{s?.largo}</span></dd></div>
          {f.entrada && <div className="fila-ft"><dt>Entrada</dt><dd><Texto t={f.entrada} /></dd></div>}
          {f.interpretable && <div className="fila-ft"><dt>Interpretable</dt><dd><Texto t={f.interpretable} /></dd></div>}
          <div className="fila-ft"><dt>Cómo funciona</dt><dd><Texto t={f.funcionamiento} /></dd></div>
          <div className="fila-ft"><dt>Qué devuelve</dt><dd><Texto t={f.devuelve} /></dd></div>
          <div className="fila-ft"><dt>Puntos fuertes</dt><dd><ul className="fuerte">{f.fuertes.map((x, i) => <li key={i}><Texto t={x} /></li>)}</ul></dd></div>
          <div className="fila-ft"><dt>Puntos débiles</dt><dd><ul className="debil">{f.debiles.map((x, i) => <li key={i}><Texto t={x} /></li>)}</ul></dd></div>
          {f.parametros && <div className="fila-ft"><dt>Parámetros</dt><dd><ul>{f.parametros.map((x, i) => <li key={i}><Texto t={x} /></li>)}</ul></dd></div>}
          {f.weka && <div className="fila-ft"><dt>En Weka</dt><dd><Texto t={f.weka} /></dd></div>}
        </dl>
      </div>
    </section>
  );
}

function Tarjeta({ id }) {
  const h = POR_ID[id];
  const v = h.visual;
  return (
    <a className={`hijo ${SALIDAS[h.salida]?.clase || ''}`} href={`#/n/${id}`}>
      <h4>
        {v?.devuelve ? <Picto k={v.devuelve} size={22} /> : <span className={`punto ${h.tipo === 'familia' ? 'familia' : ''}`} />}
        {nombreCorto(h)}
      </h4>
      {!v && <p>{h.resumen}</p>}
    </a>
  );
}

export default function Ficha({ id }) {
  const n = POR_ID[id];
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) entrada(ref.current.querySelectorAll('.cabecera-ficha > *'), { paso: 70 });
  }, [id]);

  if (!n) {
    return (
      <div className="columna">
        <h1>No existe esa ficha</h1>
        <p>El enlace apunta a «{id}», que no está en el mapa. Vuelve al <a href="#/">mapa general</a> o usa el buscador.</p>
      </div>
    );
  }

  const v = n.visual;
  const migas = ancestros(id);
  const hijos = HIJOS[id] || [];
  const alias = ALIAS[id] || [];
  const i = ORDEN.indexOf(id);
  const prev = ORDEN[i - 1] ? POR_ID[ORDEN[i - 1]] : null;
  const sig = ORDEN[i + 1] ? POR_ID[ORDEN[i + 1]] : null;
  const parte = PARTES.find((p) => p.n === parteDe(n));

  const cabecera = (
    <div className="columna cabecera-ficha">
      <nav className="migas" aria-label="Ruta en el árbol">
        {migas.map((m, k) => (
          <span key={m.id}>
            <a href={m.id === 'mineria' ? '#/' : `#/n/${m.id}`}>{nombreCorto(m)}</a>
            {k < migas.length - 1 && <span className="sep"> / </span>}
          </span>
        ))}
      </nav>
      <h1>{n.nombre}</h1>
      <p className="resumen"><Texto t={n.resumen} /></p>
      {v ? (
        <div className="insignias">
          {n.salida && <Insignia k={SAL_PICTO[n.salida]} texto={SALIDAS[n.salida]?.largo} />}
          {v.entrada && <Insignia k={v.entrada} />}
          {v.caja && <Insignia k={v.caja} />}
          <span className="insignia tema">{n.tema}</span>
          {(v.avisos || []).map((a, k) => <span key={k} className="insignia aviso" title={a[1]}>⚠ {a[0]}</span>)}
        </div>
      ) : (
        <div className="distintivos">
          <EtiquetaSalida salida={n.salida} largo />
          <span>{TIPOS[n.tipo]}</span>
          <span>{n.tema}</span>
          {parte && <a href={`#/parte/${parte.n}`}>Parte {parte.romano}: {parte.nombre}</a>}
        </div>
      )}
    </div>
  );

  const hijosBloque = hijos.length + alias.length > 0 && (
    <section className="seccion">
      <h2>{n.tipo === 'familia' ? 'Qué contiene' : 'Variantes'}</h2>
      <div className="hijos">
        {hijos.map((h) => <Tarjeta key={h} id={h} />)}
        {alias.map((h) => <Tarjeta key={`a-${h}`} id={h} />)}
      </div>
    </section>
  );

  const relaciones = (
    <section className="seccion">
      <h2>En el mapa</h2>
      <RelGrafo id={id} />
    </section>
  );

  const paginacion = (
    <nav className="paginacion" aria-label="Orden de lectura">
      {prev ? <a href={prev.id === 'mineria' ? '#/' : `#/n/${prev.id}`}><small>Anterior</small>{nombreCorto(prev)}</a> : <span />}
      {sig && <a className="sig" href={`#/n/${sig.id}`}><small>Siguiente</small>{nombreCorto(sig)}</a>}
    </nav>
  );

  if (v) {
    return (
      <article ref={ref} key={id}>
        {cabecera}
        {(n.esquema || v.devuelve) && (
          <div className={n.esquema && v.devuelve ? 'lamina ancho' : 'columna'} style={{ marginTop: 26 }}>
            {n.esquema && <Esquema pasos={n.esquema} />}
            {v.devuelve && <TarjetaVisual n={n} />}
          </div>
        )}
        <div className="ancho">
          {v.infografia && (
            <section className="seccion">
              <Demo nombre={v.infografia} />
            </section>
          )}
          {v.bloques && <BloquesVisuales bloques={v.bloques} />}
          {v.formulas && (
            <section className="seccion">
              <h2>Fórmulas</h2>
              <div className="formulas">
                {v.formulas.map(([nombre, tex], k) => (
                  <div key={k} className="formula-tarjeta">
                    <span className="tv-etq">{nombre}</span>
                    <Formula tex={tex} bloque />
                  </div>
                ))}
              </div>
            </section>
          )}
          {n.ejemplo && (
            <section className="seccion">
              <h2>Pruébalo</h2>
              <Demo nombre={n.ejemplo} />
            </section>
          )}
          {hijosBloque}
          {relaciones}
          {n.secciones?.length > 0 && (
            <details className="detalle-texto">
              <summary>Detalle de las diapositivas en texto</summary>
              <div className="columna">
                {n.secciones.map((s, k) => (
                  <section className="seccion" key={k}>
                    <h2><Texto t={s.t} /></h2>
                    <Bloques bloques={s.b} />
                  </section>
                ))}
              </div>
            </details>
          )}
          {paginacion}
        </div>
      </article>
    );
  }

  return (
    <article ref={ref} key={id}>
      {cabecera}
      {(n.esquema || n.ficha) && (
        <div className={n.esquema && n.ficha ? 'lamina ancho' : 'columna'} style={{ marginTop: 30 }}>
          {n.esquema && <Esquema pasos={n.esquema} />}
          {n.ficha && <FichaTecnicaTexto n={n} />}
        </div>
      )}
      <div className="columna">
        {(n.secciones || []).map((s, k) => (
          <section className="seccion" key={k}>
            <h2><Texto t={s.t} /></h2>
            <Bloques bloques={s.b} />
          </section>
        ))}
        {n.ejemplo && (
          <section className="seccion">
            <h2>Ejemplo interactivo</h2>
            <Demo nombre={n.ejemplo} />
          </section>
        )}
        {hijosBloque}
        {relaciones}
        {paginacion}
      </div>
    </article>
  );
}
