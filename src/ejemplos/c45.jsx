// C4.5 contado como un hilo: cada mejora sobre ID3 aparece en el paso del esquema donde actúa.
import { useMemo, useState } from 'react';
import { Marco, COLORES, escala } from './comun.jsx';
import { TENIS_NUM } from './datos.js';
import { evaluarAtributo, redondear } from '../lib/stats.js';
import { Texto, Formula } from '../components/Texto.jsx';

const TINTA = '#1f2b25', GRIS = '#a9b5ab', SUAVE = '#e4e9e2', BLANCO = '#fbfcfa', T2 = '#4a5a51';
const coma = (x, d = 3) => String(redondear(x, d)).replace('.', ',');
const irAlEjemplo = () => document.getElementById('ejemplo')?.scrollIntoView({ behavior: 'smooth' });

// ───────── Estación del hilo ─────────
export function Estacion({ n, titulo, paso, mejora, problema, solucion, solLabel = 'Qué hace C4.5', children, ultima }) {
  return (
    <li className={`estacion ${ultima ? 'ultima' : ''}`}>
      <div className="est-rail" aria-hidden="true"><span>{n}</span></div>
      <div className="est-cuerpo">
        <header>
          <h3>{titulo}</h3>
          <div className="est-etiquetas">
            {paso && <span className="est-paso">esquema: {paso}</span>}
            {mejora && <span className="est-mejora">mejora: {mejora}</span>}
          </div>
        </header>
        {(problema || solucion) && (
          <div className="est-ps">
            {problema && <div className="est-problema"><b><Texto t={problema[0]} /></b><Texto t={problema[1]} /></div>}
            {solucion && <div className="est-solucion"><b><Texto t={solLabel} /></b><Texto t={solucion} /></div>}
          </div>
        )}
        {children && <div className="est-visual">{children}</div>}
      </div>
    </li>
  );
}

// ───────── 1 · Valores perdidos ─────────
const MINI = [
  { o: 'sunny', h: 85, p: 'no' },
  { o: '?', h: 90, p: 'no' },
  { o: 'overcast', h: 86, p: 'sí' },
  { o: 'rain', h: 96, p: 'sí' },
  { o: 'rain', h: 70, p: 'sí' },
];
function Perdidos() {
  const tabla = (atenuar) => (
    <table className="mini-tabla">
      <thead><tr><th>outlook</th><th>hum</th><th>juega</th></tr></thead>
      <tbody>
        {MINI.map((f, i) => (
          <tr key={i} className={atenuar && f.o === '?' ? 'ignorada' : ''}>
            <td className={f.o === '?' ? 'hueco' : ''}>{f.o}</td><td>{f.h}</td><td>{f.p}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="dos-momentos">
      <div>
        <span className="tv-etq">Al construir el árbol</span>
        {tabla(true)}
        <p className="est-nota">Para calcular la ganancia de <b>outlook</b> se usan solo las 4 filas que tienen valor. Para <b>hum</b> se usan las 5.</p>
      </div>
      <div>
        <span className="tv-etq">Al clasificar un caso nuevo</span>
        <div className="caso-nuevo">outlook = <span className="hueco">?</span> · hum = 70</div>
        <div className="flecha-abajo">↓</div>
        <p className="est-nota">El nodo pregunta por <b>outlook</b> y el caso no lo tiene. C4.5 <b>predice ese valor</b> con lo que sabe del atributo en los demás registros y sigue bajando por el árbol.</p>
      </div>
    </div>
  );
}

// ───────── 2 · Umbral para un atributo continuo ─────────
export function UmbralC45({ incrustado = false }) {
  const datos = useMemo(() => [...TENIS_NUM].sort((a, b) => a.temp - b.temp), []);
  const vals = useMemo(() => [...new Set(datos.map((d) => d.temp))], [datos]);
  const cand = useMemo(() => vals.slice(0, -1).map((u, iu) => {
    const fil = datos.map((d) => ({ ...d, t: d.temp <= u ? 'bajo' : 'alto' }));
    const e = evaluarAtributo(fil, 't', 'play', ['yes', 'no']);
    const cls = (v) => new Set(datos.filter((d) => d.temp === v).map((d) => d.play));
    const a = cls(u), b = cls(vals[iu + 1]);
    const cambia = a.size > 1 || b.size > 1 || [...a][0] !== [...b][0];
    const izq = datos.filter((d) => d.temp <= u), der = datos.filter((d) => d.temp > u);
    const cuenta = (S) => [S.filter((d) => d.play === 'yes').length, S.filter((d) => d.play === 'no').length];
    return { u, sig: vals[iu + 1], gain: e.gain, cambia, izq: cuenta(izq), der: cuenta(der) };
  }), [datos, vals]);
  const mejor = cand.reduce((a, b) => (b.gain > a.gain ? b : a));
  const [i, setI] = useState(cand.indexOf(mejor));
  const c = cand[i];
  const W = 640, H = 270, l = 30, r = 20;
  const sx = escala(63, 86, l, W - r);
  const corte = (k) => (sx(k.u) + sx(k.sig)) / 2;
  const yPts = 74, yBase = 226, alto = 70;
  const maxG = Math.max(...cand.map((k) => k.gain));
  const xc = corte(c);
  const cuerpo = (
    <>
      <label className="fila-control">corte entre <b>{c.u}</b> y <b>{c.sig}</b>
        <input type="range" min={0} max={cand.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} />
        <button className="boton" type="button" onClick={() => setI(cand.indexOf(mejor))}>Ir al mejor</button>
      </label>
      <div className="umbral-lados">
        <span style={{ background: '#dce6f3' }}>temp ≤ {c.u}: <b>{c.izq[0]} juega · {c.izq[1]} no</b></span>
        <span style={{ background: '#f2e6cf' }}>temp &gt; {c.u}: <b>{c.der[0]} juega · {c.der[1]} no</b></span>
      </div>
      <svg className="umbral-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Búsqueda del umbral de temperatura">
        <rect x={l - 10} y={18} width={xc - l + 10} height={yPts - 2} fill="#dce6f3" />
        <rect x={xc} y={18} width={W - r + 10 - xc} height={yPts - 2} fill="#f2e6cf" />
        {datos.map((d, j) => {
          const rep = datos.slice(0, j).filter((x) => x.temp === d.temp).length;
          return <circle key={j} cx={sx(d.temp)} cy={yPts - rep * 12 + 6} r={5} fill={d.play === 'yes' ? COLORES.c : COLORES.b} />;
        })}
        <line x1={l - 10} x2={W - r + 10} y1={yPts + 16} y2={yPts + 16} stroke={GRIS} />
        {vals.map((v) => <text key={v} x={sx(v)} y={yPts + 30} textAnchor="middle" fontSize="11" fontFamily="var(--f-titulo)" fill={T2}>{v}</text>)}
        <text x={l - 10} y={128} fontSize="12" fontFamily="var(--f-titulo)" fill={T2}>ganancia de cortar en cada hueco</text>
        <line x1={l - 10} x2={W - r + 10} y1={yBase} y2={yBase} stroke={GRIS} />
        {cand.map((k, j) => {
          const x = corte(k), h = (k.gain / maxG) * alto;
          if (!k.cambia) return <text key={j} x={x} y={yBase - 4} textAnchor="middle" fontSize="12" fill={GRIS} fontFamily="var(--f-titulo)">×</text>;
          return (
            <g key={j} onClick={() => setI(j)} style={{ cursor: 'pointer' }}>
              <rect x={x - 6} y={yBase - h} width={12} height={h} fill={j === i ? COLORES.a : k === mejor ? COLORES.c : '#c3ccc4'} />
              {(j === i || k === mejor) && <text x={x} y={yBase - h - 5} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="var(--f-titulo)" fill={TINTA}>{coma(k.gain)}</text>}
            </g>
          );
        })}
        <line x1={xc} x2={xc} y1={18} y2={yBase} stroke={COLORES.a} strokeWidth="2" strokeDasharray="5 4" />
        <text x={xc} y={13} textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="var(--f-titulo)" fill={COLORES.a}>θ</text>
        <g fontSize="11" fontFamily="var(--f-titulo)" fill={T2}>
          <circle cx={l} cy={H - 10} r="5" fill={COLORES.c} /><text x={l + 8} y={H - 6}>juega</text>
          <circle cx={l + 62} cy={H - 10} r="5" fill={COLORES.b} /><text x={l + 70} y={H - 6}>no juega</text>
          <text x={l + 140} y={H - 6}>× = la clase no cambia en ese hueco: no hace falta probarlo</text>
        </g>
      </svg>
      <p className="est-nota" style={{ marginTop: 4 }}>
        {c.cambia ? <>Cortar entre {c.u} y {c.sig} deja {c.izq[0] + c.izq[1]} días a la izquierda y {c.der[0] + c.der[1]} a la derecha: ganancia <b>{coma(c.gain, 4)}</b>.</> : <>Entre {c.u} y {c.sig} la clase no cambia, así que este corte no puede ser el mejor y C4.5 no lo prueba.</>}
        {' '}El mejor corte es <b>temp ≤ {mejor.u}</b> ({coma(mejor.gain, 4)}). Ese corte pasa a competir con los demás atributos en el paso 3.
      </p>
    </>
  );
  return incrustado ? <div>{cuerpo}</div> : <Marco titulo="C4.5: buscar el mejor umbral de «temperatura»">{cuerpo}</Marco>;
}

// ───────── 3 · Ratio de ganancia ─────────
const ALTURAS = [
  { a: 'género', ramas: '2 valores (9 y 6 personas)', g: 0.0969, h: 0.292 },
  { a: 'altura', ramas: '6 rangos (2, 2, 3, 4, 2, 2)', g: 0.3983, h: 0.7596 },
];
function Ratio() {
  const maxG = 0.4, maxR = 0.6;
  return (
    <div>
      <Formula bloque tex={'GainRatio(S,A) = \\dfrac{G(S,A)}{H\\big(\\tfrac{|S_1|}{|S|},\\dots,\\tfrac{|S_v|}{|S|}\\big)}'} />
      <p className="est-nota">El divisor solo mira <b>cuántos ejemplos van a cada rama</b>, no la clase: crece cuantas más ramas haya. Ejemplo de las alturas (15 personas, log₁₀):</p>
      <div className="ratio-filas">
        {ALTURAS.map((x) => (
          <div key={x.a} className="ratio-fila">
            <div><b>{x.a}</b><small>{x.ramas}</small></div>
            <div className="ratio-barra"><span style={{ width: `${(x.g / maxG) * 100}%`, background: '#a9b5ab' }} /><em>ganancia {coma(x.g, 4)}</em></div>
            <div className="ratio-op">÷ {coma(x.h)}</div>
            <div className="ratio-barra"><span style={{ width: `${(x.g / x.h / maxR) * 100}%`, background: 'var(--cat)' }} /><em>ratio {coma(x.g / x.h)}</em></div>
          </div>
        ))}
      </div>
      <p className="est-nota">Con la ganancia, la altura gana por <b>×4,1</b>; con el ratio, solo por <b>×1,6</b>. Aquí sigue ganando, pero el castigo por tener 6 ramas ya se nota.</p>
      <p className="est-nota ojo">Errata de la diapositiva: el divisor de la altura debe ser H(2/15, 2/15, 3/15, 4/15, 2/15, 2/15). La diapositiva pone /13, se deja un rango y escribe log(13/3) donde va log(13/2). Con la errata corregida, el divisor es 0,760.</p>
    </div>
  );
}

// ───────── 4 · Ramas según el tipo de atributo ─────────
function MiniNodo({ t, ramas }) {
  const W = 230, H = 96, n = ramas.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mini-nodo">
      {ramas.map((rm, k) => {
        const x = n === 2 ? (k ? W * 0.76 : W * 0.24) : (W / (n + 1)) * (k + 1);
        return (
          <g key={k}>
            <path d={`M${W / 2},30L${x},70`} stroke={GRIS} strokeWidth="1.6" />
            <rect x={x - 46} y={64} width={92} height={22} rx={11} fill={SUAVE} stroke={TINTA} />
            <text x={x} y={79} textAnchor="middle" fontSize="11" fontFamily="var(--f-titulo)" fill={TINTA}>{rm}</text>
          </g>
        );
      })}
      <rect x={W / 2 - 42} y={8} width={84} height={24} rx={3} fill={BLANCO} stroke={TINTA} />
      <text x={W / 2} y={25} textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--f-titulo)" fill={TINTA}>{t}</text>
    </svg>
  );
}
function Ramas() {
  return (
    <div className="tres-ramas">
      <div><span className="tv-etq">Booleano → 2 ramas</span><MiniNodo t="¿viento?" ramas={['sí', 'no']} /></div>
      <div><span className="tv-etq">Categórico → varias ramas</span><MiniNodo t="outlook" ramas={['{sunny, rain}', '{overcast}']} /><small>Si dos valores predicen la misma clase, comparten rama.</small></div>
      <div><span className="tv-etq">Numérico → 2 ramas</span><MiniNodo t="temp" ramas={['≤ θ', '> θ']} /><small>θ es el umbral del paso 2. En los hijos se vuelve a calcular.</small></div>
    </div>
  );
}

// ───────── 5 · Cuándo parar ─────────
function Parar() {
  return (
    <div className="parar">
      <div className="parar-conds">
        <span className="tv-etq">El nodo se convierte en hoja si…</span>
        <ul>
          <li>no quedan atributos o ejemplos</li>
          <li>todos los ejemplos son de la misma clase</li>
          <li>hay menos ejemplos que un umbral</li>
        </ul>
      </div>
      <div className="parar-flecha">→</div>
      <div className="parar-hoja"><span className="hoja-ovalo">clase mayoritaria</span><small>etiqueta de la hoja</small></div>
      <div className="parar-pre">
        <span className="tv-etq">Pre-poda: parar antes de tiempo</span>
        <ul>
          <li>no dividir un nodo si hay poca confianza en él</li>
          <li>parar cuando el error en un conjunto de validación empieza a subir</li>
        </ul>
      </div>
    </div>
  );
}

// ───────── 6 · Post-poda ─────────
function MiniArbol({ tipo }) {
  const nodo = (cx, cy, hoja, c, k) => <rect key={k} x={cx - 10} y={cy - 8} width={20} height={16} rx={hoja ? 8 : 2} fill={hoja ? c || SUAVE : BLANCO} stroke={TINTA} strokeWidth="1.2" />;
  const ln = (a, b, c, d, k) => <path key={k} d={`M${a},${b}L${c},${d}`} stroke={GRIS} strokeWidth="1.5" />;
  const x = 80, y = 16;
  let g;
  if (tipo === 'completo') g = [ln(x, y, x - 40, y + 40, 1), ln(x, y, x + 40, y + 40, 2), ln(x + 40, y + 40, x + 18, y + 80, 3), ln(x + 40, y + 40, x + 62, y + 80, 4), ln(x + 62, y + 80, x + 46, y + 116, 5), ln(x + 62, y + 80, x + 78, y + 116, 6),
    nodo(x, y, false, null, 7), nodo(x - 40, y + 40, true, null, 8), nodo(x + 40, y + 40, false, null, 9), nodo(x + 18, y + 80, true, null, 10), nodo(x + 62, y + 80, false, null, 11), nodo(x + 46, y + 116, true, null, 12), nodo(x + 78, y + 116, true, null, 13),
    <rect key="m" x={x + 6} y={y + 26} width={84} height={104} rx="8" fill="none" stroke={COLORES.b} strokeWidth="1.6" strokeDasharray="4 3" />];
  else if (tipo === 'reemplazo') g = [ln(x, y, x - 40, y + 40, 1), ln(x, y, x + 40, y + 40, 2), nodo(x, y, false, null, 3), nodo(x - 40, y + 40, true, null, 4), nodo(x + 40, y + 40, true, COLORES.c, 5)];
  else g = [ln(x, y, x - 40, y + 40, 1), ln(x, y, x + 40, y + 40, 2), ln(x + 40, y + 40, x + 22, y + 80, 3), ln(x + 40, y + 40, x + 58, y + 80, 4), nodo(x, y, false, null, 5), nodo(x - 40, y + 40, true, null, 6), nodo(x + 40, y + 40, false, COLORES.c, 7), nodo(x + 22, y + 80, true, null, 8), nodo(x + 58, y + 80, true, null, 9)];
  return <svg viewBox="0 0 170 152" className="mini-arbol">{g}</svg>;
}
function PostPoda() {
  return (
    <div>
      <div className="tres-arboles">
        <div><MiniArbol tipo="completo" /><b>Árbol completo</b><small>se construye entero; el recuadro rojo es el candidato a podar</small></div>
        <div><MiniArbol tipo="reemplazo" /><b>Reemplazar subárbol</b><small>todo el subárbol pasa a ser una hoja si el error es similar</small></div>
        <div><MiniArbol tipo="elevacion" /><b>Elevar subárbol</b><small>un subárbol hijo sustituye a su padre y sube un nivel</small></div>
      </div>
      <p className="est-nota">Además, la diapositiva aplica <b>poda por número de ejemplos</b>: cada hoja debe tener al menos 2. <button type="button" className="enlace-boton" onClick={irAlEjemplo}>En el Pruébalo</button>, activa «post-poda» con el conjunto «con un día ruidoso» y verás un subárbol reemplazado por una hoja.</p>
    </div>
  );
}

// ───────── Hilo completo ─────────
export function HiloC45() {
  return (
    <div className="hilo-c45">
      <div className="hilo-intro">
        <p><Texto t="**C4.5 = [[id3|ID3]] + soluciones a cuatro problemas.** Cada solución actúa en un momento distinto de la construcción del árbol. Abajo van en el mismo orden que el esquema." /></p>
        <div className="hilo-mapa">
          {[['Valores perdidos', '1'], ['Atributos continuos', '2'], ['Sesgo hacia muchos valores', '3'], ['Sobreaprendizaje', '5 y 6']].map(([t, n]) => (
            <span key={t}><b>{t}</b> → paso {n}</span>
          ))}
        </div>
      </div>
      <ol className="hilo">
        <Estacion n="1" titulo="Datos con huecos" paso="Datos (…con huecos)" mejora="valores perdidos"
          problema={['Problema en ID3', 'una fila sin valor en un atributo no se puede contar en ninguna rama.']}
          solucion="al construir, **ignora** esa fila solo para ese atributo; al clasificar, **predice** el valor que falta.">
          <Perdidos />
        </Estacion>
        <Estacion n="2" titulo="Buscar el umbral de cada atributo numérico" paso="probar umbrales y quedarse con el mejor" mejora="atributos continuos"
          problema={['Problema en ID3', 'solo sabe dividir atributos discretos: no puede crear una rama por cada temperatura.']}
          solucion="parte cada numérico en dos, $x \le \theta$ y $x > \theta$. Ordena los valores y prueba **solo los cortes donde cambia la clase**. Se queda con el de mayor ganancia.">
          <UmbralC45 incrustado />
          <p className="est-nota"><b>La discretización no se propaga:</b> θ solo vale en este nodo y para sus ejemplos. Por eso el mismo atributo puede volver a aparecer más abajo con otro umbral.</p>
        </Estacion>
        <Estacion n="3" titulo="Elegir el atributo con mayor ratio de ganancia" paso="elegir el atributo con mayor ratio" mejora="sesgo hacia muchos valores"
          problema={['Problema en ID3', 'la ganancia premia a los atributos con muchos valores: cada rama tiene pocos ejemplos y parece pura. Ver [[id3]].']}
          solucion="divide la ganancia entre la **información de la división**, que crece con el número de ramas. Ver [[ratio-ganancia]].">
          <Ratio />
        </Estacion>
        <Estacion n="4" titulo="Crear las ramas según el tipo de atributo" paso="ramas: booleano · categórico · numérico"
          problema={['Qué cambia', 'el nodo ya tiene atributo; el número de ramas depende de su tipo.']}
          solucion="booleano y numérico dan **2 ramas**; un categórico da **varias**, y agrupa los valores que predicen la misma clase.">
          <Ramas />
        </Estacion>
        <Estacion n="5" titulo="¿Seguir dividiendo o crear una hoja?" paso="¿sin atributos, una clase o pocos ejemplos?" mejora="sobreaprendizaje (pre-poda)"
          problema={['Problema en ID3', 'divide hasta que las hojas son puras y acaba memorizando el ruido.']}
          solucion="para cuando se cumple alguna condición de parada y pone la **clase mayoritaria** en la hoja. Si no para, repite los pasos 2–5 en cada rama. La pre-poda añade criterios para parar antes.">
          <Parar />
        </Estacion>
        <Estacion n="6" titulo="Post-poda" paso="reemplazar o elevar subárboles" mejora="sobreaprendizaje (post-poda)" ultima
          problema={['Por qué', 'la pre-poda decide sin ver el árbol entero.']}
          solucion="construye el árbol completo y **después** lo poda. Es la forma de poda habitual en C4.5. Ver [[poda]].">
          <PostPoda />
        </Estacion>
      </ol>
      <div className="hilo-familia">
        <span className="tv-etq">La familia C4.5: qué devuelve cada versión</span>
        <div className="familia-filas">
          <div><b>C4.5</b><small>árbol podado (pasos 1–6)</small></div>
          <div><b>C4.5 sin poda</b><small>se salta el paso 6: árbol completo</small></div>
          <div><b>C4.5-reglas</b><small>convierte el árbol en reglas: <Texto t="[[reglas-arbol|reglas desde árbol]]" /></small></div>
          <div><b>See5 / C5.0</b><small>versión comercial mejorada (RuleQuest Research)</small></div>
        </div>
      </div>
    </div>
  );
}
