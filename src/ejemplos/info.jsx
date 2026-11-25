// Infografías: cada una resume una ficha en un solo gráfico, con el mínimo texto.
import { useEffect, useMemo, useRef } from 'react';
import { COLORES } from './comun.jsx';
import { DATASETS } from './datos.js';
import { evaluarAtributo, entropia, contarClases, redondear } from '../lib/stats.js';
import { dibujar, entrada } from '../lib/anim.js';

const TINTA = '#1f2b25', GRIS = '#a9b5ab', SUAVE = '#e4e9e2', BLANCO = '#fbfcfa', T2 = '#4a5a51';

function useRevelar(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    dibujar(ref.current.querySelectorAll('.trazo'), { dur: 700, paso: 30 });
    entrada(ref.current.querySelectorAll('.aparece'), { paso: 60, dur: 400, desde: 0 });
  }, deps); // eslint-disable-line
  return ref;
}

const Caja = ({ x, y, w, h = 26, t, hoja, color, fs = 13 }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={hoja ? h / 2 : 4} fill={color || (hoja ? SUAVE : BLANCO)} stroke={TINTA} strokeWidth="1.3" />
    <text x={x} y={y + fs / 3} textAnchor="middle" fontSize={fs} fontWeight={hoja ? 700 : 600} fill={color ? '#fff' : TINTA}>{t}</text>
  </g>
);
const Titulo = ({ x, y, t }) => <text x={x} y={y} fontSize="16" fontWeight="800" fill={TINTA}>{t}</text>;
const Etq = ({ x, y, t, anchor = 'middle', c = T2, fs = 12, peso = 400 }) => <text x={x} y={y} textAnchor={anchor} fontSize={fs} fill={c} fontWeight={peso}>{t}</text>;
const Flecha = ({ d, c = TINTA }) => <path className="trazo" d={d} fill="none" stroke={c} strokeWidth="1.6" markerEnd="url(#punta)" />;
const Defs = () => (
  <defs>
    <marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={TINTA} /></marker>
  </defs>
);

// ═════════ Árboles de decisión ═════════
export function InfoArboles() {
  const ref = useRevelar([]);
  const linea = (x1, y1, x2, y2) => <path className="trazo" d={`M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`} fill="none" stroke={GRIS} strokeWidth="1.6" />;
  return (
    <figure className="demo" style={{ margin: 0 }}>
      <svg ref={ref} className="info" viewBox="0 0 1000 690" role="img" aria-label="Infografía de los árboles de decisión">
        <Defs />
        {/* A · anatomía */}
        <g className="aparece">
          <Titulo x={20} y={30} t="Anatomía" />
          {linea(220, 78, 90, 150)}{linea(220, 78, 220, 150)}{linea(220, 78, 350, 150)}
          {linea(90, 162, 45, 230)}{linea(90, 162, 135, 230)}{linea(350, 162, 305, 230)}{linea(350, 162, 395, 230)}
          <Caja x={220} y={70} w={86} t="tiempo" />
          <Caja x={90} y={156} w={90} t="humedad" />
          <Caja x={220} y={156} w={44} t="sí" hoja color={COLORES.c} />
          <Caja x={350} y={156} w={78} t="viento" />
          <Caja x={45} y={236} w={44} t="no" hoja color={COLORES.b} />
          <Caja x={135} y={236} w={44} t="sí" hoja color={COLORES.c} />
          <Caja x={305} y={236} w={44} t="no" hoja color={COLORES.b} />
          <Caja x={395} y={236} w={44} t="sí" hoja color={COLORES.c} />
          <Etq x={140} y={108} t="soleado" /><Etq x={232} y={118} t="nublado" anchor="start" /><Etq x={300} y={108} t="lluvioso" />
          <Etq x={52} y={200} t="alta" /><Etq x={128} y={200} t="normal" /><Etq x={312} y={200} t="fuerte" /><Etq x={392} y={200} t="débil" />
          {/* leyenda de las partes */}
          <circle cx={30} cy={290} r={11} fill={BLANCO} stroke={TINTA} /><Etq x={30} y={294} t="1" c={TINTA} peso={700} />
          <Etq x={48} y={294} t="nodo = atributo (prueba)" anchor="start" c={TINTA} fs={13} />
          <circle cx={220} cy={290} r={11} fill={BLANCO} stroke={GRIS} /><Etq x={220} y={294} t="2" c={TINTA} peso={700} />
          <Etq x={238} y={294} t="rama = valor" anchor="start" c={TINTA} fs={13} />
          <circle cx={340} cy={290} r={11} fill={COLORES.c} /><Etq x={340} y={294} t="3" c="#fff" peso={700} />
          <Etq x={358} y={294} t="hoja = clase" anchor="start" c={TINTA} fs={13} />
        </g>

        {/* B · ciclo de vida */}
        <g className="aparece">
          <Titulo x={500} y={30} t="Ciclo" />
          {[
            ['Construir', 'divide y vencerás', 560],
            ['Podar', 'quitar ruido', 735],
            ['Clasificar', 'raíz → hoja', 910],
          ].map(([t, s, x], i) => (
            <g key={t}>
              <circle cx={x} cy={120} r={50} fill={i === 1 ? '#f6e4e3' : i === 0 ? '#e3f0e7' : '#dce6f3'} stroke={TINTA} strokeWidth="1.3" />
              <Etq x={x} y={190} t={t} c={TINTA} fs={15} peso={700} />
              <Etq x={x} y={208} t={s} />
            </g>
          ))}
          {/* iconos dentro de los círculos */}
          <path className="trazo" d="M560 92v14M560 106l-18 18M560 106l18 18M542 124v14M578 124v14" stroke={TINTA} strokeWidth="2.2" fill="none" />
          <circle cx={560} cy={90} r={5} fill={TINTA} />
          <path className="trazo" d="M716 100l38 40M754 100l-38 40" stroke={COLORES.b} strokeWidth="2.6" fill="none" />
          <circle cx={714} cy={98} r={7} fill="none" stroke={COLORES.b} strokeWidth="2" /><circle cx={714} cy={142} r={7} fill="none" stroke={COLORES.b} strokeWidth="2" />
          <path className="trazo" d="M910 90v14l-16 18v16" stroke={COLORES.a} strokeWidth="3" fill="none" />
          <circle cx={910} cy={88} r={5} fill={COLORES.a} /><rect x={886} y={138} width={16} height={10} rx="3" fill={COLORES.a} />
          <Flecha d="M614 120h66" /><Flecha d="M789 120h66" />
          <Etq x={735} y={250} t="caso más simple: ZeroR = un único nodo hoja" />
        </g>

        {/* C · criterio de elección */}
        <g className="aparece">
          <Titulo x={20} y={350} t="¿Qué atributo pongo arriba?" />
          <Etq x={20} y={372} t="el que deja los hijos más puros" anchor="start" />
          {[
            ['ID3', 'Ganancia', 'máx', 0.9],
            ['C4.5', 'Ratio de ganancia', 'máx', 0.7],
            ['CART', 'Gini', 'mín', 0.45],
          ].map(([alg, crit, sent, v], i) => {
            const x = 20 + i * 150;
            return (
              <g key={alg}>
                <rect x={x} y={392} width={136} height={112} rx="6" fill={BLANCO} stroke={GRIS} />
                <Etq x={x + 68} y={418} t={alg} c={TINTA} fs={16} peso={800} />
                <Etq x={x + 68} y={438} t={crit} fs={12.5} />
                <rect x={x + 18} y={454} width={100} height={12} rx="3" fill={SUAVE} />
                <rect className="aparece" x={x + 18} y={454} width={100 * v} height={12} rx="3" fill={COLORES.a} />
                <Etq x={x + 68} y={490} t={`elige el ${sent}.`} c={TINTA} fs={12} />
              </g>
            );
          })}
        </g>

        {/* D · espacio */}
        <g className="aparece">
          <Titulo x={500} y={350} t="Cómo corta el espacio" />
          {/* frontera paralela */}
          <rect x={500} y={376} width={150} height={128} fill="#dce6f3" stroke={TINTA} />
          <rect x={575} y={376} width={75} height={64} fill="#f5e0df" />
          <path d="M575 376v128M575 440h75" stroke={TINTA} strokeWidth="2" />
          <Etq x={575} y={524} t="paralelo a los ejes ✓" c={COLORES.c} peso={700} />
          {/* escalera */}
          <rect x={680} y={376} width={150} height={128} fill="#dce6f3" stroke={TINTA} />
          <path d="M680 504 L830 376 L830 504 Z" fill="#f5e0df" />
          <path className="trazo" d="M680 504 L830 376" stroke={COLORES.b} strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M710 504v-26h30v-26h30v-26h30v-26h30v-24" fill="none" stroke={TINTA} strokeWidth="2" />
          <Etq x={755} y={524} t="diagonal: efecto escalera ✗" c={COLORES.b} peso={700} />
          <Etq x={915} y={430} t="solución:" c={TINTA} peso={700} />
          <Etq x={915} y={448} t="árboles oblicuos" />
          <Etq x={915} y={464} t="o variables" />
          <Etq x={915} y={480} t="construidas" />
        </g>

        {/* E · al diseñar y cronología */}
        <g className="aparece">
          <Titulo x={20} y={562} t="Decisiones de diseño" />
          {['Atributo test', 'Orden', 'Divisiones', 'Balanceado', 'Parada', 'Ejemplos', 'Poda'].map((t, i) => (
            <g key={t}>
              <rect x={20 + i * 66} y={576} width={60} height={42} rx="5" fill={SUAVE} />
              <Etq x={50 + i * 66} y={602} t={t} c={TINTA} fs={11} />
            </g>
          ))}
          <Titulo x={500} y={562} t="Cronología" />
          <path className="trazo" d="M510 610 H 980" stroke={TINTA} strokeWidth="2" fill="none" />
          {[['1977', 'Friedman', 520], ['1984', 'CART', 650], ['1986', 'ID3', 760], ['1993', 'C4.5', 930]].map(([a, t, x]) => (
            <g key={a}>
              <circle cx={x} cy={610} r={7} fill={t === 'C4.5' ? COLORES.a : BLANCO} stroke={TINTA} strokeWidth="1.6" />
              <Etq x={x} y={594} t={a} c={TINTA} peso={700} />
              <Etq x={x} y={634} t={t} />
            </g>
          ))}
          <Etq x={930} y={652} t="n.º 1 del top-10" c={COLORES.a} />
          <Etq x={20} y={672} t="Mejor árbol: más acierto y menos complejo (navaja de Occam)" anchor="start" c={TINTA} fs={13} />
        </g>
      </svg>
    </figure>
  );
}

// ═════════ ID3: el ejemplo de las alturas en un gráfico ═════════
export function InfoID3() {
  const ref = useRevelar([]);
  const D = DATASETS.alturas;
  const ev = useMemo(() => ['genero', 'altura'].map((a) => evaluarAtributo(D.filas, a, D.clase, D.clases, 10)), []); // eslint-disable-line
  const hS = entropia(contarClases(D.filas, D.clase, D.clases), 10);
  const COL = { short: COLORES.a, medium: COLORES.d, tall: COLORES.b };
  const puntos = (filas, x, y, cols = 5) =>
    filas.map((f, i) => <circle key={i} cx={x + (i % cols) * 13} cy={y + Math.floor(i / cols) * 13} r={5} fill={COL[f.clase]} />);
  const maxG = Math.max(...ev.map((e) => e.gain));
  return (
    <figure className="demo" style={{ margin: 0 }}>
      <svg ref={ref} className="info" viewBox="0 0 1000 410" role="img" aria-label="Ejemplo de ID3 con las alturas">
        <Defs />
        <g className="aparece">
          <Titulo x={20} y={30} t="Alturas: ¿género o altura?" />
          <rect x={20} y={52} width={150} height={110} rx="6" fill={BLANCO} stroke={GRIS} />
          {puntos(D.filas, 46, 74)}
          <Etq x={95} y={150} t={`H(S) = ${redondear(hS, 4)}`} c={TINTA} peso={700} />
          {[['short', 'Short'], ['medium', 'Medium'], ['tall', 'Tall']].map(([k, t], i) => (
            <g key={k}><circle cx={26 + i * 66} cy={186} r={5} fill={COL[k]} /><Etq x={35 + i * 66} y={190} t={t} anchor="start" /></g>
          ))}
          <Etq x={20} y={218} t="log₁₀, como en la diapositiva" anchor="start" c="#8f4b12" />
        </g>
        {ev.map((e, k) => {
          const y0 = 52 + k * 180;
          const ancho = 640 / e.parts.length;
          return (
            <g key={e.attr} className="aparece">
              <Flecha d={`M175 ${105} C 220 ${105}, 220 ${y0 + 50}, 250 ${y0 + 50}`} />
              <Etq x={258} y={y0 - 8} t={e.attr === 'genero' ? 'Dividir por género' : 'Dividir por altura (6 rangos)'} anchor="start" c={TINTA} fs={14} peso={700} />
              {[...e.parts].sort((a, b) => String(a.valor).localeCompare(String(b.valor))).map((p, i) => {
                const sub = D.filas.filter((f) => f[e.attr] === p.valor);
                const x = 258 + i * ancho;
                return (
                  <g key={p.valor}>
                    <rect x={x} y={y0} width={ancho - 10} height={96} rx="6" fill={p.h === 0 ? '#e3f0e7' : BLANCO} stroke={GRIS} />
                    {puntos(sub, x + 12, y0 + 14, Math.max(2, Math.floor((ancho - 24) / 13)))}
                    <Etq x={x + (ancho - 10) / 2} y={y0 + 88} t={`${e.attr === 'genero' ? p.valor : 'rango ' + p.valor} · H=${redondear(p.h, 3)}`} fs={11.5} />
                  </g>
                );
              })}
              <rect x={258} y={y0 + 108} width={640} height={14} rx="4" fill={SUAVE} />
              <rect className="aparece" x={258} y={y0 + 108} width={(640 * e.gain) / maxG} height={14} rx="4" fill={e.gain === maxG ? COLORES.c : GRIS} />
              <Etq x={906} y={y0 + 120} t={`G = ${redondear(e.gain, 4)}${e.gain === maxG ? '  ✓' : ''}`} anchor="start" c={e.gain === maxG ? COLORES.c : TINTA} fs={14} peso={700} />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// ═════════ C4.5: qué añade sobre ID3 y cómo poda ═════════
export function InfoC45() {
  const ref = useRevelar([]);
  const mini = (x, y, sub = 'normal') => {
    // árbol pequeño: raíz, dos hijos, y un subárbol a la derecha
    const nodo = (cx, cy, hoja, c) => <rect x={cx - 9} y={cy - 7} width={18} height={14} rx={hoja ? 7 : 2} fill={hoja ? c || SUAVE : BLANCO} stroke={TINTA} strokeWidth="1.2" />;
    const l = (a, b, c, d, col = GRIS) => <path d={`M${a},${b}L${c},${d}`} stroke={col} strokeWidth="1.5" />;
    if (sub === 'normal') return (
      <g>{l(x, y, x - 40, y + 40)}{l(x, y, x + 40, y + 40)}{l(x + 40, y + 40, x + 20, y + 80)}{l(x + 40, y + 40, x + 60, y + 80)}{l(x + 60, y + 80, x + 45, y + 115)}{l(x + 60, y + 80, x + 75, y + 115)}
        {nodo(x, y)}{nodo(x - 40, y + 40, true)}{nodo(x + 40, y + 40, false)}{nodo(x + 20, y + 80, true)}{nodo(x + 60, y + 80, false)}{nodo(x + 45, y + 115, true)}{nodo(x + 75, y + 115, true)}</g>
    );
    if (sub === 'reemplazo') return (
      <g>{l(x, y, x - 40, y + 40)}{l(x, y, x + 40, y + 40)}{nodo(x, y)}{nodo(x - 40, y + 40, true)}{nodo(x + 40, y + 40, true, COLORES.c)}</g>
    );
    return (
      <g>{l(x, y, x - 40, y + 40)}{l(x, y, x + 40, y + 40)}{l(x + 40, y + 40, x + 25, y + 75)}{l(x + 40, y + 40, x + 55, y + 75)}{nodo(x, y)}{nodo(x - 40, y + 40, true)}{nodo(x + 40, y + 40, false, null)}{nodo(x + 25, y + 75, true)}{nodo(x + 55, y + 75, true)}
        <rect x={x + 26} y={y + 28} width={30} height={60} rx="6" fill="none" stroke={COLORES.c} strokeWidth="2" strokeDasharray="4 3" /></g>
    );
  };
  const mejoras = [
    ['Valores perdidos', 'se ignoran al construir'],
    ['Atributos continuos', 'corte binario x ≤ θ'],
    ['Sobreajuste', 'pre-poda y post-poda'],
    ['Muchos valores', 'ratio de ganancia'],
  ];
  return (
    <figure className="demo" style={{ margin: 0 }}>
      <svg ref={ref} className="info" viewBox="0 0 1000 440" role="img" aria-label="Infografía de C4.5">
        <Defs />
        <g className="aparece">
          <Titulo x={20} y={30} t="ID3 + 4 mejoras = C4.5" />
          {mejoras.map(([t, s], i) => {
            const x = 20 + i * 240;
            return (
              <g key={t}>
                <rect x={x} y={48} width={224} height={110} rx="8" fill={BLANCO} stroke={GRIS} />
                <Etq x={x + 112} y={128} t={t} c={TINTA} fs={15} peso={700} />
                <Etq x={x + 112} y={147} t={s} />
              </g>
            );
          })}
          {/* iconos de las mejoras */}
          <g>
            {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={100 + c * 22} y={62 + r * 15} width={20} height={13} fill={r === 1 && c === 1 ? '#f7e7d8' : SUAVE} />))}
            <Etq x={132} y={95} t="?" c="#8f4b12" fs={14} peso={800} />
          </g>
          <g>
            <path d="M300 92h120" stroke={TINTA} strokeWidth="2" />
            {[310, 330, 345, 372, 392, 410].map((x, i) => <circle key={x} cx={x} cy={92} r={5} fill={i < 3 ? COLORES.a : COLORES.b} />)}
            <path d="M358 70v44" stroke={COLORES.d} strokeWidth="2.5" strokeDasharray="4 3" /><Etq x={358} y={66} t="θ" c={COLORES.d} fs={14} peso={800} />
          </g>
          <g>
            <path d="M560 66l40 44M600 66l-40 44" stroke={COLORES.b} strokeWidth="2.6" /><circle cx={557} cy={64} r={6} fill="none" stroke={COLORES.b} strokeWidth="2" /><circle cx={557} cy={112} r={6} fill="none" stroke={COLORES.b} strokeWidth="2" />
          </g>
          <g>
            <Etq x={852} y={84} t="Ganancia" c={TINTA} fs={14} peso={700} />
            <path d="M808 92h88" stroke={TINTA} strokeWidth="1.6" />
            <Etq x={852} y={110} t="H(división)" c={TINTA} fs={14} peso={700} />
          </g>
        </g>
        <g className="aparece">
          <Titulo x={20} y={200} t="Post-poda" />
          {mini(110, 236, 'normal')}
          <Etq x={110} y={380} t="árbol completo" c={TINTA} peso={700} />
          <Flecha d="M215 300h80" />
          {mini(370, 236, 'reemplazo')}
          <Etq x={370} y={380} t="reemplazar subárbol" c={TINTA} peso={700} />
          <Etq x={370} y={398} t="→ hoja si el error es similar" />
          <Flecha d="M150 226 C 260 180, 520 180, 610 226" />
          {mini(660, 236, 'elevacion')}
          <Etq x={660} y={380} t="elevar subárbol" c={TINTA} peso={700} />
          <Etq x={660} y={398} t="el más usado sube un nivel" />
        </g>
        <g className="aparece">
          <Titulo x={790} y={200} t="Ratio (género)" />
          <Etq x={880} y={250} t="0,09688" c={TINTA} fs={18} peso={700} />
          <path d="M820 262h120" stroke={TINTA} strokeWidth="2" />
          <Etq x={880} y={288} t="0,292" c={TINTA} fs={18} peso={700} />
          <Etq x={880} y={330} t="= 0,332" c={COLORES.a} fs={22} peso={800} />
          <Etq x={880} y={356} t="H(9/15, 6/15) en log₁₀" />
        </g>
      </svg>
    </figure>
  );
}
