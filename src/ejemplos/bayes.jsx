// Clasificadores bayesianos contados como un hilo: por qué probabilidades → Bayes/MAP → el problema de la
// conjunta → Naïve Bayes (aprender una pasada, clasificar multiplicando) y redes bayesianas.
import { useMemo, useState } from 'react';
import { COLORES } from './comun.jsx';
import { TENIS_NUM } from './datos.js';
import { media, desv, normal, redondear } from '../lib/stats.js';
import { Texto, Formula } from '../components/Texto.jsx';
import { Estacion } from './c45.jsx';

const TINTA = '#1f2b25', GRIS = '#a9b5ab', SUAVE = '#e4e9e2', BLANCO = '#fbfcfa', T2 = '#4a5a51';
const coma = (x, d = 3) => String(redondear(x, d)).replace('.', ',');
const exp = (x, d = 2) => {
  if (!x) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  return `${coma(x / 10 ** e, d)}·10${String(e).replace('-', '⁻').replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c])}`;
};
const irAlEjemplo = () => document.getElementById('ejemplo')?.scrollIntoView({ behavior: 'smooth' });
const COL = { no: COLORES.b, yes: COLORES.c };
const NOM = { no: 'NO', yes: 'SÍ' };

// ───────── Grafos: estrella de Naïve Bayes y red con arcos entre atributos ─────────
function Grafo({ arcos = [], titulo, sub }) {
  const attrs = [['X₁', 40], ['X₂', 110], ['X₃', 180], ['X₄', 250]];
  const pos = Object.fromEntries(attrs.map(([a, x]) => [a, x]));
  return (
    <div className="grafo-bayes">
      <svg viewBox="0 0 290 172">
        <defs><marker id="flb" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill={T2} /></marker></defs>
        {attrs.map(([a, x]) => <line key={a} x1={145} y1={40} x2={x} y2={102} stroke={T2} strokeWidth="1.6" markerEnd="url(#flb)" />)}
        {arcos.map(([a, b]) => <path key={a + b} d={`M${pos[a] + 8},${130} Q${(pos[a] + pos[b]) / 2},${172} ${pos[b] - 8},${130}`} fill="none" stroke={COLORES.d} strokeWidth="2.2" markerEnd="url(#flb)" />)}
        <ellipse cx="145" cy="24" rx="40" ry="18" fill={COLORES.a} />
        <text x="145" y="29" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="var(--f-titulo)">Clase Y</text>
        {attrs.map(([a, x]) => (
          <g key={a}><ellipse cx={x} cy={116} rx="24" ry="15" fill={BLANCO} stroke={T2} /><text x={x} y={121} textAnchor="middle" fontSize="13" fontFamily="var(--f-titulo)">{a}</text></g>
        ))}
      </svg>
      <b>{titulo}</b>
      <small><Texto t={sub} /></small>
    </div>
  );
}
export function EstructurasBayes() {
  return (
    <div className="tres-arboles">
      <Grafo titulo="Naïve Bayes" sub="la clase es el **único padre**; ningún arco entre atributos → solo hay que aprender las tablas" />
      <Grafo arcos={[['X₁', 'X₂'], ['X₃', 'X₄']]} titulo="Red bayesiana" sub="además hay **arcos entre atributos** (en naranja) → hay que aprender también qué arcos existen" />
    </div>
  );
}

// ───────── Familia · 1: qué devuelve ─────────
function Bolsa() {
  const P = [['P1', 0.9], ['P2', 0.52]];
  return (
    <div className="bolsa">
      <div className="bolsa-cab"><span /><span className="tv-etq">Árbol de decisión</span><span className="tv-etq">Red bayesiana</span></div>
      {P.map(([p, v]) => (
        <div key={p} className="bolsa-fila">
          <b>{p}</b>
          <span className="etq-dura">invertir</span>
          <div className="bolsa-barra">
            <span style={{ width: `${v * 100}%`, background: COLORES.c }}>invertir {coma(v, 2)}</span>
            <span style={{ width: `${(1 - v) * 100}%`, background: COLORES.b }}>{coma(1 - v, 2)}</span>
          </div>
        </div>
      ))}
      <p className="est-nota">Con el árbol, lo natural es repartir el dinero a partes iguales. Con las probabilidades se ve que P2 es casi una moneda al aire, así que repartir igual ya no parece razonable.</p>
    </div>
  );
}

// ───────── Familia · 3: tamaño de la conjunta ─────────
function TamanoDPC() {
  const [n, setN] = useState(10);
  const [v, setV] = useState(2);
  const k = 2;
  const dpc = k * v ** n;
  const nb = k + n * k * v;
  const lg = (x) => Math.log10(x);
  const max = lg(2 * 3 ** 20);
  return (
    <div>
      <div className="fila-control">
        <label className="fila-control">n atributos <input type="range" min={1} max={20} value={n} onChange={(e) => setN(Number(e.target.value))} /> <b style={{ marginRight: 14 }}>{n}</b></label>
        <label className="fila-control">valores por atributo <select value={v} onChange={(e) => setV(Number(e.target.value))}>{[2, 3].map((x) => <option key={x}>{x}</option>)}</select></label>
        <span className="est-nota" style={{ margin: 0 }}>clase con 2 valores</span>
      </div>
      <div className="ratio-filas">
        <div className="ratio-fila dpc">
          <div><b>Tabla conjunta</b><small>una casilla por combinación: 2·{v}<sup>{n}</sup></small></div>
          <div className="ratio-barra"><span style={{ width: `${(lg(dpc) / max) * 100}%`, background: COLORES.b }} /><em>{dpc.toLocaleString('es-ES')} probabilidades</em></div>
        </div>
        <div className="ratio-fila dpc">
          <div><b>Naïve Bayes</b><small>P(Y) + n tablas P(Xᵢ | y): 2 + {n}·2·{v}</small></div>
          <div className="ratio-barra"><span style={{ width: `${(lg(nb) / max) * 100}%`, background: COLORES.c }} /><em>{nb.toLocaleString('es-ES')} probabilidades</em></div>
        </div>
      </div>
      <p className="est-nota">Escala logarítmica. La conjunta crece de forma <b>exponencial</b> con n; Naïve Bayes, de forma <b>lineal</b>. Además, para estimar bien cada casilla de la conjunta harían falta ejemplos de cada combinación. Estas cuentas son un cálculo propio, no vienen en las diapositivas.</p>
    </div>
  );
}

export function HiloBayes() {
  return (
    <div className="hilo-c45">
      <div className="hilo-intro">
        <p><Texto t="**El hilo del tema:** se quiere la clase más probable dado el caso. Bayes dice cómo calcularla, pero exige una tabla gigante (la conjunta). Los dos modelos del tema son dos formas de evitar esa tabla." /></p>
      </div>
      <ol className="hilo">
        <Estacion n="1" titulo="Devolver probabilidades, no solo una etiqueta"
          problema={['Árboles y reglas nítidos', 'representan relaciones **deterministas**: devuelven una etiqueta y nada más.']}
          solLabel="Métodos probabilísticos"
          solucion="representan la **incertidumbre** de forma natural y la llevan a la predicción: devuelven una **distribución de probabilidad** sobre las clases.">
          <Bolsa />
        </Estacion>
        <Estacion n="2" titulo="Teorema de Bayes → hipótesis MAP"
          problema={['Qué se quiere', 'dado un caso $x = (x_1, \\dots, x_n)$, la clase $y$ con mayor probabilidad **a posteriori** (MAP).']}
          solLabel="Cómo se calcula"
          solucion="con el teorema de Bayes. El denominador es el mismo para todas las clases, así que para comparar se puede quitar.">
          <div className="cadena-formulas">
            <Formula bloque tex={'P(y \\mid x_1..x_n) = \\frac{\\overbrace{P(x_1..x_n \\mid y)}^{\\text{verosimilitud}}\\;\\overbrace{P(y)}^{\\text{a priori}}}{\\underbrace{P(x_1..x_n)}_{\\text{igual para todas las clases}}}'} />
            <div className="flecha-abajo">↓ se quita el denominador</div>
            <Formula bloque tex={'C(x) = \\arg\\max_{y} P(x_1..x_n \\mid y)\\,P(y) = \\arg\\max_{y} \\underbrace{P(x_1..x_n,\\, y)}_{\\text{distribución conjunta (DPC)}}'} />
          </div>
        </Estacion>
        <Estacion n="3" titulo="El problema: la distribución conjunta (DPC)"
          problema={['Ventaja y problema a la vez', 'la DPC considera **todas las variables a la vez**, pero necesita una probabilidad por cada combinación de valores: es inmanejable incluso con n pequeño o moderado.']}
          solLabel="Salida"
          solucion="suponer **independencias** entre variables para partir la DPC en tablas pequeñas.">
          <TamanoDPC />
        </Estacion>
        <Estacion n="4" titulo="Dos formas de suponer independencias" ultima
          problema={['[[naive-bayes|Naïve Bayes]]', 'supone que **todos** los atributos son independientes conocida la clase. Es la red bayesiana más simple.']}
          solLabel="[[redes-bayesianas|Redes bayesianas]]"
          solucion="permiten **dependencias** entre atributos (relaciones causales). Son la solución cuando la independencia de Naïve Bayes falla.">
          <EstructurasBayes />
        </Estacion>
      </ol>
    </div>
  );
}

// ═════════ Naïve Bayes ═════════
const X = { outlook: 'sunny', temp: 87, hum: 90, windy: 'false' };
function usarModelo(laplace) {
  return useMemo(() => ['no', 'yes'].map((c) => {
    const f = TENIS_NUM.filter((d) => d.play === c);
    const cnt = (a, v) => f.filter((d) => d[a] === v).length;
    const p = (a, v, L) => (laplace ? (cnt(a, v) + 1) / (f.length + L) : cnt(a, v) / f.length);
    const t = f.map((d) => d.temp), h = f.map((d) => d.hum);
    const m = { c, n: f.length, prior: f.length / TENIS_NUM.length, cnt, p, mt: media(t), st: desv(t), mh: media(h), sh: desv(h) };
    m.fac = [m.prior, p('outlook', X.outlook, 3), p('windy', X.windy, 2), normal(X.temp, m.mt, m.st), normal(X.hum, m.mh, m.sh)];
    m.prod = m.fac.reduce((a, b) => a * b, 1);
    return m;
  }), [laplace]);
}

function TablasDiscretas() {
  const [laplace, setLaplace] = useState(false);
  const M = usarModelo(laplace);
  const fr = (m, a, v, L) => (laplace ? `(${m.cnt(a, v)}+1)/(${m.n}+${L})` : `${m.cnt(a, v)}/${m.n}`);
  return (
    <div>
      <label className="fila-control"><input type="checkbox" checked={laplace} onChange={(e) => setLaplace(e.target.checked)} /> corrección de Laplace</label>
      <div className="dos-momentos">
        <div>
          <span className="tv-etq">P(Y): cuántos días de cada clase</span>
          <table className="mini-tabla">
            <thead><tr><th>clase</th><th>días</th><th>P(Y)</th></tr></thead>
            <tbody>{M.map((m) => <tr key={m.c}><td style={{ color: COL[m.c], fontWeight: 700 }}>{NOM[m.c]}</td><td>{m.n}/14</td><td>{coma(m.prior)}</td></tr>)}</tbody>
          </table>
        </div>
        <div>
          <span className="tv-etq">P(outlook | clase): se cuenta dentro de cada clase</span>
          <table className="mini-tabla">
            <thead><tr><th>outlook</th>{M.map((m) => <th key={m.c} style={{ color: COL[m.c] }}>| {NOM[m.c]}</th>)}</tr></thead>
            <tbody>
              {['sunny', 'overcast', 'rain'].map((v) => (
                <tr key={v}><td>{v}</td>{M.map((m) => {
                  const val = m.p('outlook', v, 3);
                  return <td key={m.c} className={val === 0 ? 'hueco' : ''}>{fr(m, 'outlook', v, 3)} = {coma(val, 2)}</td>;
                })}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="est-nota">{laplace
        ? <>Con Laplace se suma 1 a cada recuento y el número de valores posibles (Lᵢ = 3) al total. Ningún valor queda a 0. Con muchos datos se parece a la frecuencia normal; con pocos, tiende a la uniforme.</>
        : <><b>P(overcast | NO) = 0/5 = 0.</b> Un solo 0 anula todo el producto de esa clase, haya lo que haya en los demás atributos. Activa Laplace para ver cómo lo evita.</>}
      </p>
      <Formula bloque tex={'P(x_i \\mid c_j) = \\frac{n(x_i, c_j)}{n(c_j)} \\qquad \\xrightarrow{\\text{Laplace}} \\qquad \\frac{n(x_i, c_j) + 1}{n(c_j) + L_i}'} />
      <p className="est-nota ojo">Errata del PDF: la fórmula aparece desordenada, con n(xᵢ) arriba y n(xᵢ, cⱼ) abajo. La correcta es la de arriba: casos con ese valor y esa clase entre los casos de esa clase.</p>
    </div>
  );
}

function Gaussianas() {
  const M = usarModelo(false);
  const W = 300, H = 120, l = 10, r = 10;
  const panel = (k, nombre, x0, x1, xv) => {
    const sx = (t) => l + ((t - x0) / (x1 - x0)) * (W - l - r);
    const mx = Math.max(...M.map((m) => normal(m[`m${k}`], m[`m${k}`], m[`s${k}`])));
    const sy = (y) => H - 22 - (y / mx) * (H - 34);
    return (
      <div>
        <span className="tv-etq">{nombre}</span>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 340 }}>
          <line x1={l} x2={W - r} y1={H - 22} y2={H - 22} stroke={GRIS} />
          {M.map((m) => <path key={m.c} fill="none" strokeWidth="2.2" stroke={COL[m.c]} d={Array.from({ length: 81 }, (_, i) => { const t = x0 + (i * (x1 - x0)) / 80; return `${i ? 'L' : 'M'}${sx(t)},${sy(normal(t, m[`m${k}`], m[`s${k}`]))}`; }).join('')} />)}
          {TENIS_NUM.map((d, i) => <circle key={i} cx={sx(d[k === 't' ? 'temp' : 'hum'])} cy={H - 22} r="3.5" fill={COL[d.play]} />)}
          {[x0, (x0 + x1) / 2, x1].map((t) => <text key={t} x={sx(t)} y={H - 6} textAnchor="middle" fontSize="11" fill={T2} fontFamily="var(--f-titulo)">{t}</text>)}
          <line x1={sx(xv)} x2={sx(xv)} y1={6} y2={H - 22} stroke={TINTA} strokeDasharray="3 3" />
          <text x={sx(xv) - 4} y={14} textAnchor="end" fontSize="11" fontWeight="700" fill={TINTA} fontFamily="var(--f-titulo)">x = {xv}</text>
        </svg>
        <div className="estadisticas">{M.map((m) => <span key={m.c} style={{ color: COL[m.c] }}>{NOM[m.c]}: μ = {coma(m[`m${k}`], 2)}, σ = {coma(m[`s${k}`], 2)}</span>)}</div>
      </div>
    );
  };
  return (
    <div>
      <div className="dos-momentos">
        {panel('t', 'temperatura', 60, 90, X.temp)}
        {panel('h', 'humedad', 60, 100, X.hum)}
      </div>
      <p className="est-nota">Los puntos son los 14 días y cada curva es la normal estimada para una clase. Para un valor nuevo, P(x | clase) es la <b>altura de la curva</b> en ese punto. La aproximación es mejor cuanto más se parezcan los datos a una campana.</p>
      <Formula bloque tex={'P(x \\mid c) = N(x;\\mu,\\sigma) = \\frac{1}{\\sqrt{2\\pi}\\,\\sigma}\\,e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}'} />
      <p className="est-nota"><b>Alternativa:</b> <Texto t="[[discretizacion|discretizar]] el atributo y contar como en el paso 2. Cómo se discretiza cambia mucho el acierto (experimento con iris en «En Weka», al final)." /></p>
      <p className="est-nota ojo">Errata: la diapositiva da μ = 86,6 para la humedad de «no». Los cinco valores (85, 90, 70, 95, 91) dan 86,2.</p>
    </div>
  );
}

function Producto() {
  const M = usarModelo(false);
  const nombres = ['P(clase)', 'P(sunny | c)', 'P(false | c)', 'N(87)', 'N(90)'];
  return (
    <div>
      <div className="caso-nuevo" style={{ marginBottom: 10 }}>x = (outlook = sunny, temp = 87, hum = 90, windy = false)</div>
      {M.map((m) => (
        <div key={m.c} className="cadena">
          <b style={{ color: COL[m.c] }}>{NOM[m.c]}</b>
          {m.fac.map((v, i) => (
            <span key={i} className="factor"><small>{nombres[i]}</small>{v < 0.01 ? coma(v, 4) : coma(v, 3)}{i < 4 && <i>×</i>}</span>
          ))}
          <span className="factor total"><small>producto</small>= {exp(m.prod)}</span>
        </div>
      ))}
      <p className="est-nota">Los productos son minúsculos y no suman 1: no son probabilidades todavía, pero ya sirven para comparar.</p>
    </div>
  );
}

function Normalizar() {
  const M = usarModelo(false);
  const tot = M.reduce((s, m) => s + m.prod, 0);
  return (
    <div>
      <div className="normaliza">
        {M.map((m) => <div key={m.c}>P({NOM[m.c]} | x) = <span className="frac"><span>{exp(m.prod)}</span><span>{exp(M[0].prod)} + {exp(M[1].prod)}</span></span> = <b>{coma(m.prod / tot, 2)}</b></div>)}
      </div>
      <div className="bolsa-barra" style={{ maxWidth: 520 }}>
        {M.map((m) => <span key={m.c} style={{ width: `${(m.prod / tot) * 100}%`, background: COL[m.c] }}>{NOM[m.c]} {coma(m.prod / tot, 2)}</span>)}
      </div>
      <p className="est-nota"><b>MAP → no se juega.</b> La diapositiva da 0,8 / 0,2: la conclusión es la misma.</p>
      <p className="est-nota ojo">Por qué la diapositiva da 0,8: (1) el producto de NO está mal multiplicado: con sus propios factores da 4,90·10⁻⁵, no 4,08·10⁻⁵; (2) usa μ = 86,6 en la humedad. Arriba los factores salen de los datos exactos (P(NO) = 5/14, μ = 86,2), por eso el producto es {exp(M[0].prod)}; (3) la línea de SÍ empieza por «P(NO)» cuando es P(YES) = 0,64; (4) llama P(x|NO) a lo que es P(x, NO).</p>
      <p className="est-nota"><button type="button" className="enlace-boton" onClick={irAlEjemplo}>En el Pruébalo</button> puedes cambiar el caso, por ejemplo poner overcast para ver el 0 sin Laplace.</p>
    </div>
  );
}

export function HiloNB() {
  return (
    <div className="hilo-c45">
      <div className="hilo-intro">
        <p><Texto t="**Naïve Bayes en dos fases.** Primero **aprende** unas tablas pequeñas en una sola pasada por los datos (pasos 2–3). Después **clasifica** multiplicando probabilidades (pasos 4–5). Todo el ejemplo usa los 14 días de tenis con temperatura y humedad numéricas." /></p>
      </div>
      <ol className="hilo">
        <Estacion n="1" titulo="La suposición «ingenua»"
          problema={['Problema', 'la conjunta $P(x_1..x_n, y)$ es inmanejable (ver [[probabilisticos|la familia]]).']}
          solLabel="Qué supone Naïve Bayes"
          solucion="los atributos son **independientes conocida la clase**. Así la conjunta se parte en un producto de tablas pequeñas.">
          <div className="dos-momentos" style={{ alignItems: 'center' }}>
            <Grafo titulo="La clase es el único padre" sub="no hay arcos entre atributos" />
            <div>
              <Formula bloque tex={'P(x_1..x_n, y) = P(y)\\prod_{i=1}^{n} P(x_i \\mid y)'} />
              <Formula bloque tex={'C(x) = \\arg\\max_{y}\\; P(y)\\prod_{i=1}^{n} P(x_i \\mid y)'} />
            </div>
          </div>
          <p className="est-nota"><b>¿Por qué funciona si la suposición es falsa?</b> Para clasificar no hacen falta probabilidades exactas: basta con que la mayor caiga en la clase correcta. Por eso es buen clasificador pero mal estimador de la probabilidad.</p>
        </Estacion>
        <Estacion n="2" titulo="Aprender: P(Y) y los atributos discretos" paso="aprender P(Y) · P(Xᵢ | y) discreto"
          problema={['Qué hay que estimar', 'la marginal **P(Y)** y **n** distribuciones condicionales **P(Xᵢ | y)**, todas en **una pasada** por los datos.']}
          solLabel="Atributo discreto"
          solucion="**contar** (máxima verosimilitud): de los casos de la clase, qué fracción tiene ese valor. Con **Laplace** se evitan los ceros.">
          <TablasDiscretas />
        </Estacion>
        <Estacion n="3" titulo="Aprender: atributos numéricos" paso="P(Xᵢ | y) numérico"
          problema={['Problema', 'no se puede contar «cuántos días tienen temperatura 87»: casi cada valor es único.']}
          solLabel="Atributo numérico"
          solucion="suponer una **normal dentro de cada clase**: basta con estimar una media μ y una desviación σ por clase.">
          <Gaussianas />
        </Estacion>
        <Estacion n="4" titulo="Clasificar: multiplicar por cada clase" paso="para cada clase: P(y) × P(xᵢ | y)"
          problema={['Entrada', 'un caso nuevo, con los valores de todos sus atributos.']}
          solLabel="Qué se hace"
          solucion="para cada clase, partir de **P(y)** y multiplicar por la probabilidad de cada valor del caso, leída de las tablas o de las curvas.">
          <Producto />
        </Estacion>
        <Estacion n="5" titulo="Normalizar y elegir la mayor (MAP)" paso="normalizar · clase con mayor valor" ultima
          problema={['Opcional', 'normalizar solo hace falta si se quieren probabilidades; para decidir basta comparar los productos.']}
          solLabel="Qué se hace"
          solucion="se divide cada producto entre la suma para que sumen 1, y se devuelve la clase con el valor mayor.">
          <Normalizar />
        </Estacion>
      </ol>
    </div>
  );
}
