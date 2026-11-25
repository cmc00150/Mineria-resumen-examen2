// Clasificadores de referencia paso a paso: ZeroR, OneR y OneR como discretizador (binning supervisado).
import { useMemo, useState } from 'react';
import { Marco, COLORES } from './comun.jsx';
import { TENIS, CREDITO, TENIS_NUM } from './datos.js';
import { particionar, redondear } from '../lib/stats.js';
import { usePasos, Controles, Mensaje } from '../lib/traza.jsx';

const col = (i) => (i === 0 ? COLORES.a : i === 1 ? COLORES.b : COLORES.c);

const BALANCEADO = TENIS.map((f, i) => ({ ...f, play: i < 7 ? 'yes' : 'no' }));
const DATOS = {
  credito: { n: 'Crédito (8 no / 2 sí)', filas: CREDITO, clase: 'credito', clases: ['no', 'si'], attrs: ['ingresos', 'propietario', 'gastos'] },
  tenis: { n: 'Tenis (9 sí / 5 no)', filas: TENIS, clase: 'play', clases: ['yes', 'no'], attrs: ['outlook', 'temperature', 'humidity', 'windy'] },
  balanceado: { n: 'Tenis equilibrado (7 / 7)', filas: BALANCEADO, clase: 'play', clases: ['yes', 'no'], attrs: ['outlook', 'temperature', 'humidity', 'windy'] },
};

// ═════════ ZeroR ═════════
function framesZeroR(D) {
  const { filas, clase, clases } = D;
  const fr = [{ e: '0', cont: clases.map(() => 0), hasta: 0, msg: `${filas.length} ejemplos. ZeroR solo mira la columna de clase «${clase}».` }];
  const cont = clases.map(() => 0);
  filas.forEach((f, i) => {
    cont[clases.indexOf(f[clase])]++;
    fr.push({ e: '1', cont: [...cont], hasta: i + 1, msg: `Ejemplo ${i + 1}: clase «${f[clase]}» → ${clases.map((c, j) => `${c}: ${cont[j]}`).join(' · ')}.` });
  });
  const m = cont.indexOf(Math.max(...cont));
  const ac = cont[m] / filas.length;
  fr.push({ e: '2', cont: [...cont], hasta: filas.length, pred: m, msg: `Siempre se predice «${clases[m]}»: acierta ${cont[m]} de ${filas.length} = ${redondear(ac * 100, 0)} %. No usa ningún atributo.` });
  return fr;
}

export function PasoZeroR() {
  const [ds, setDs] = useState('credito');
  const D = DATOS[ds];
  const frames = useMemo(() => framesZeroR(D), [D]);
  const p = usePasos(frames, { intervalo: 450 });
  const f = p.frame;
  const max = Math.max(...f.cont, 1);
  return (
    <Marco
      titulo="ZeroR: contar y predecir siempre la mayoritaria"
      controles={
        <select value={ds} onChange={(e) => setDs(e.target.value)} aria-label="Datos">
          {Object.entries(DATOS).map(([k, d]) => <option key={k} value={k}>{d.n}</option>)}
        </select>
      }
      pie="Con clases desiguales el acierto engaña: con 8 «no» y 2 «sí» ya acierta un 80 % sin aprender nada. Con clases equilibradas se queda en torno al 50 %, que es la verdadera línea base."
    >
      <Controles p={p} />
      <svg viewBox="0 0 620 190" role="img" aria-label="Recuento de clases">
        {D.filas.map((fila, i) => {
          const c = D.clases.indexOf(fila[D.clase]);
          const contado = i < f.hasta;
          const fallo = f.pred != null && c !== f.pred;
          return (
            <g key={i}>
              <circle cx={24 + i * 40} cy={24} r={13} fill={contado ? col(c) : '#fff'} stroke={contado ? col(c) : '#a9b5ab'} strokeWidth="2" strokeDasharray={contado ? '' : '3 3'} />
              {f.pred != null && <text x={24 + i * 40} y={29} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">{fallo ? '✗' : '✓'}</text>}
            </g>
          );
        })}
        {D.clases.map((c, j) => (
          <g key={c} transform={`translate(${40 + j * 280},60)`}>
            <text x={0} y={14} fontSize="14" fontFamily="var(--f-titulo)" fontWeight="700" fill={col(j)}>{c}</text>
            <rect x={0} y={22} width={230} height={22} rx="3" fill="#eef1ed" />
            <rect x={0} y={22} width={(f.cont[j] / max) * 230} height={22} rx="3" fill={col(j)} opacity={f.pred === j || f.pred == null ? 1 : 0.35} />
            <text x={236} y={39} fontSize="16" fontFamily="var(--f-titulo)" fontWeight="700" fill="#1f2b25">{f.cont[j]}</text>
            {f.pred === j && <text x={0} y={72} fontSize="14" fontFamily="var(--f-titulo)" fill={col(j)} fontWeight="700">← predicción para todos los ejemplos</text>}
          </g>
        ))}
        {f.pred != null && (
          <text x={20} y={160} fontSize="16" fontFamily="var(--f-titulo)" fill="#1f2b25" fontWeight="700">
            acierto = {f.cont[f.pred]}/{D.filas.length} = {redondear((f.cont[f.pred] / D.filas.length) * 100, 0)} %
          </text>
        )}
      </svg>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

// ═════════ OneR ═════════
function framesOneR(D) {
  const { filas, clase, clases, attrs } = D;
  const fr = [{ e: '0', reglas: {}, tot: {}, actual: null, msg: `${filas.length} ejemplos y ${attrs.length} atributos. Se probará cada atributo por separado.` }];
  const reglas = {};
  const tot = {};
  attrs.forEach((a) => {
    reglas[a] = [];
    fr.push({ e: '1', reglas: JSON.parse(JSON.stringify(reglas)), tot: { ...tot }, actual: a, msg: `Atributo «${a}»: una regla por cada uno de sus valores.` });
    let err = 0;
    [...particionar(filas, a).entries()].forEach(([v, sub]) => {
      const cuentas = clases.map((c) => sub.filter((x) => x[clase] === c).length);
      const m = cuentas.indexOf(Math.max(...cuentas));
      const e = sub.length - cuentas[m];
      err += e;
      reglas[a].push({ v, c: clases[m], e, n: sub.length, cuentas });
      fr.push({ e: '1.0.0', reglas: JSON.parse(JSON.stringify(reglas)), tot: { ...tot }, actual: a, valor: v, msg: `${a} = ${v}: ${clases.map((c, j) => `${cuentas[j]} ${c}`).join(' / ')} → regla «${clases[m]}», ${e} ${e === 1 ? 'error' : 'errores'} de ${sub.length}.` });
    });
    tot[a] = err;
    fr.push({ e: '1.1', reglas: JSON.parse(JSON.stringify(reglas)), tot: { ...tot }, actual: a, msg: `Error total de «${a}»: ${err} de ${filas.length}.` });
  });
  const mejor = attrs.reduce((x, y) => (tot[y] < tot[x] ? y : x), attrs[0]);
  const empate = attrs.filter((a) => tot[a] === tot[mejor]);
  fr.push({ e: '2', reglas: JSON.parse(JSON.stringify(reglas)), tot: { ...tot }, actual: null, mejor, msg: `Se queda con «${mejor}» (${tot[mejor]} errores)${empate.length > 1 ? `; empata con ${empate.filter((a) => a !== mejor).join(', ')} y gana el primero.` : '.'}` });
  return fr;
}

export function PasoOneR() {
  const [ds, setDs] = useState('tenis');
  const D = DATOS[ds];
  const frames = useMemo(() => framesOneR(D), [D]);
  const p = usePasos(frames, { intervalo: 800 });
  const f = p.frame;
  return (
    <Marco
      titulo="OneR paso a paso: una regla por valor, un solo atributo"
      controles={
        <select value={ds} onChange={(e) => setDs(e.target.value)} aria-label="Datos">
          {['credito', 'tenis'].map((k) => <option key={k} value={k}>{DATOS[k].n}</option>)}
        </select>
      }
      pie="Es un árbol de decisión de un solo nivel. Tiende a elegir atributos con muchos valores (cada valor tiene pocos ejemplos y casi ningún error)."
    >
      <Controles p={p} />
      <div className="oner-rejilla">
        {D.attrs.map((a) => {
          const rs = f.reglas[a];
          const activo = f.actual === a;
          const gana = f.mejor === a;
          return (
            <div key={a} className={`oner-attr ${activo ? 'activo' : ''} ${gana ? 'gana' : ''}`}>
              <strong>{a}</strong>
              {!rs && <small className="marcador">pendiente</small>}
              {rs && rs.map((r) => (
                <div key={r.v} className={`oner-regla ${activo && f.valor === r.v ? 'foco' : ''}`}>
                  <span>{r.v} →</span> <b style={{ color: col(D.clases.indexOf(r.c)) }}>{r.c}</b>
                  <small>{r.e}/{r.n}</small>
                </div>
              ))}
              {f.tot[a] != null && <div className="oner-total">error {f.tot[a]}/{D.filas.length}</div>}
            </div>
          );
        })}
      </div>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}

// ═════════ OneR como discretizador (binning supervisado) ═════════
function framesBucket(min) {
  const datos = [...TENIS_NUM].sort((a, b) => a.temp - b.temp).map((d) => ({ v: d.temp, c: d.play === 'yes' ? 0 : 1 }));
  const fr = [{ cubos: [], actual: [], n: 0, msg: 'Se ordenan los valores de temperatura y se recorren de menor a mayor.' }];
  const cubos = [];
  let act = [];
  const mayor = (a) => {
    const c = [0, 0];
    a.forEach((x) => c[x.c]++);
    return { m: c[0] === c[1] ? a[a.length - 1].c : c[0] > c[1] ? 0 : 1, n: Math.max(...c) };
  };
  datos.forEach((d, i) => {
    act.push(d);
    const { m, n } = mayor(act);
    const sig = datos[i + 1];
    let cierra = false;
    if (n >= min && (!sig || (sig.c !== m && sig.v !== d.v))) cierra = true;
    fr.push({ cubos: cubos.map((c) => ({ ...c })), actual: [...act], n: i + 1, msg: `Se añade ${d.v} (${d.c ? 'no' : 'sí'}). En el cubo: ${n} de la clase mayoritaria «${m ? 'no' : 'sí'}»${n >= min ? ` (≥ ${min})` : ` (faltan ${min - n} para ${min})`}.` });
    if (cierra) {
      cubos.push({ desde: act[0].v, hasta: d.v, c: m, n: act.length });
      fr.push({ cubos: cubos.map((c) => ({ ...c })), actual: [], n: i + 1, msg: `Hay ${n} de «${m ? 'no' : 'sí'}» y el siguiente es de otra clase → se cierra el cubo [${act[0].v}, ${d.v}] → «${m ? 'no' : 'sí'}».` });
      act = [];
    }
  });
  if (act.length) {
    const { m } = mayor(act);
    cubos.push({ desde: act[0].v, hasta: act[act.length - 1].v, c: m, n: act.length });
    fr.push({ cubos: cubos.map((c) => ({ ...c })), actual: [], n: datos.length, msg: `El último cubo [${act[0].v}, ${act[act.length - 1].v}] se queda con «${m ? 'no' : 'sí'}».` });
  }
  const fus = [];
  cubos.forEach((c) => {
    if (fus.length && fus[fus.length - 1].c === c.c) {
      fus[fus.length - 1].hasta = c.hasta;
      fus[fus.length - 1].n += c.n;
    } else fus.push({ ...c });
  });
  fr.push({ cubos: fus, actual: [], n: datos.length, fin: true, msg: fus.length < cubos.length ? 'Los cubos vecinos con la misma clase se fusionan. Estos son los intervalos finales.' : 'No hay cubos vecinos con la misma clase: estos son los intervalos finales.' });
  return { fr, datos };
}

export function OneRDisc() {
  const [min, setMin] = useState(3);
  const { fr, datos } = useMemo(() => framesBucket(min), [min]);
  const p = usePasos(fr, { intervalo: 700, sync: false });
  const f = p.frame;
  const W = 620, x0 = 24, dx = (W - 48) / (datos.length - 1);
  return (
    <Marco
      titulo="OneR como discretizador: temperatura del tenis (14 días)"
      controles={<label className="fila-control" style={{ margin: 0 }}>mín. de la clase mayoritaria por cubo <input type="range" min={1} max={6} value={min} onChange={(e) => setMin(Number(e.target.value))} /> {min}</label>}
      pie="Versión simplificada del binning supervisado de Holte: un cubo se cierra al tener al menos «mín.» ejemplos de su clase mayoritaria y cambiar la clase del siguiente. Es el parámetro minBucketSize de Weka."
    >
      <Controles p={p} />
      <svg viewBox={`0 0 ${W} 150`} role="img" aria-label="Cubos de OneR">
        {f.cubos.map((c, i) => {
          const a = datos.findIndex((d) => d.v === c.desde);
          const b = datos.map((d) => d.v).lastIndexOf(c.hasta);
          return (
            <g key={i}>
              <rect x={x0 + a * dx - 14} y={64} width={(b - a) * dx + 28} height={30} rx="6" fill={col(c.c)} opacity="0.85" />
              <text x={x0 + ((a + b) / 2) * dx} y={84} textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#fff" fontFamily="var(--f-titulo)">{c.c ? 'no' : 'sí'}</text>
            </g>
          );
        })}
        {datos.map((d, i) => {
          const hecho = i < f.n;
          const enActual = f.actual.some((x) => x === d) ;
          return (
            <g key={i}>
              <circle cx={x0 + i * dx} cy={34} r={11} fill={hecho ? col(d.c) : '#fff'} stroke={enActual ? '#1f2b25' : hecho ? col(d.c) : '#a9b5ab'} strokeWidth={enActual ? 3 : 2} strokeDasharray={hecho ? '' : '3 3'} />
              <text x={x0 + i * dx} y={64 - 18} textAnchor="middle" fontSize="10.5" fill="#4a5a51" fontFamily="var(--f-titulo)" opacity="0">{d.v}</text>
              <text x={x0 + i * dx} y={118} textAnchor="middle" fontSize="11.5" fill="#4a5a51" fontFamily="var(--f-titulo)">{d.v}</text>
            </g>
          );
        })}
        {f.fin && f.cubos.map((c, i) => <text key={i} x={x0} y={142} fontSize="13" fontFamily="var(--f-titulo)" fill="#1f2b25" dx={i * 190}>{`${c.desde}–${c.hasta} → ${c.c ? 'no' : 'sí'}`}</text>)}
      </svg>
      <Mensaje>{f.msg}</Mensaje>
    </Marco>
  );
}
