// Ejemplos en 3D (three.js). Se cargan bajo demanda para no inflar el resto de la web.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Marco, COLORES, escala } from './comun.jsx';
import { useEscena3D, THREE, etiqueta3D } from './tres.js';
import { semilla, redondear, metricas, media } from '../lib/stats.js';
import { anim } from '../lib/anim.js';

const sig = (v) => 1 / (1 + Math.exp(-v));

// ═════════ MLP 2-3-1 aprendiendo XOR con backpropagation ═════════
const XOR = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
function redNueva(s = 4) {
  const r = semilla(s);
  const u = () => (r() - 0.5) * 2;
  return { w1: [[u(), u()], [u(), u()], [u(), u()]], b1: [u(), u(), u()], w2: [u(), u(), u()], b2: u() };
}
function forward(net, x) {
  const h = net.w1.map((w, j) => sig(w[0] * x[0] + w[1] * x[1] + net.b1[j]));
  const o = sig(net.w2.reduce((s, w, j) => s + w * h[j], 0) + net.b2);
  return { h, o };
}
function epoch(net, alfa) {
  let e2 = 0;
  XOR.forEach(([a, b, t]) => {
    const x = [a, b];
    const { h, o } = forward(net, x);
    const errO = o * (1 - o) * (t - o); // Err salida = O(1−O)(T−O)
    const errH = h.map((hj, j) => hj * (1 - hj) * errO * net.w2[j]); // Err oculta = O(1−O) Σ Err_k w_jk
    net.w2 = net.w2.map((w, j) => w + alfa * errO * h[j]); // w_ij += α Err_j O_i
    net.b2 += alfa * errO; // θ_j += α Err_j
    net.w1 = net.w1.map((w, j) => [w[0] + alfa * errH[j] * x[0], w[1] + alfa * errH[j] * x[1]]);
    net.b1 = net.b1.map((b, j) => b + alfa * errH[j]);
    e2 += (t - o) ** 2;
  });
  return e2 / XOR.length;
}

export function Red3D() {
  const net = useRef(redNueva());
  const [estado, setEstado] = useState({ ep: 0, err: null, hist: [] });
  const [entrenando, setEntrenando] = useState(false);
  const [ej, setEj] = useState(1);
  const ent = useRef(false);
  const ejRef = useRef(ej);
  const cv = useRef(null);
  ent.current = entrenando;
  ejRef.current = ej;

  const POS = { in: [[-4, 1.3, 0], [-4, -1.3, 0]], hid: [[0, 2.4, 0], [0, 0, 0], [0, -2.4, 0]], out: [[4, 0, 0]] };

  const [ref] = useEscena3D(({ scene, camera }) => {
    camera.position.set(0, 1.5, 13);
    const esfera = new THREE.SphereGeometry(0.55, 32, 20);
    const nodos = {};
    const mkNodo = (k, p, color) => {
      const m = new THREE.Mesh(esfera, new THREE.MeshStandardMaterial({ color, roughness: 0.45 }));
      m.position.set(...p);
      scene.add(m);
      return m;
    };
    nodos.in = POS.in.map((p) => mkNodo('in', p, 0xe4e9e2));
    nodos.hid = POS.hid.map((p) => mkNodo('hid', p, 0xfbfcfa));
    nodos.out = POS.out.map((p) => mkNodo('out', p, 0xfbfcfa));
    [['x₁', POS.in[0]], ['x₂', POS.in[1]]].forEach(([t, p]) => { const s = etiqueta3D(t, { tam: 0.5 }); s.position.set(p[0] - 1.2, p[1], 0); scene.add(s); });
    const eo = etiqueta3D('salida', { tam: 0.45 }); eo.position.set(4, -1.2, 0); scene.add(eo);
    const eh = etiqueta3D('capa oculta', { tam: 0.45 }); eh.position.set(0, -3.4, 0); scene.add(eh);

    // aristas como cilindros (grosor = |peso|)
    const cil = new THREE.CylinderGeometry(1, 1, 1, 10);
    const aristas = [];
    const mkArista = (a, b, get) => {
      const mat = new THREE.MeshStandardMaterial({ color: 0x2f62a8, transparent: true, opacity: 0.8 });
      const m = new THREE.Mesh(cil, mat);
      const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
      const mid = va.clone().add(vb).multiplyScalar(0.5);
      m.position.copy(mid);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
      m.userData = { len: va.distanceTo(vb), get, va, vb };
      scene.add(m);
      aristas.push(m);
    };
    POS.in.forEach((pi, i) => POS.hid.forEach((ph, j) => mkArista(pi, ph, () => net.current.w1[j][i])));
    POS.hid.forEach((ph, j) => mkArista(ph, POS.out[0], () => net.current.w2[j]));

    // pulsos que viajan hacia delante (azules) y hacia atrás (rojos)
    const pulsoGeo = new THREE.SphereGeometry(0.16, 12, 10);
    const pulsos = aristas.map((a) => {
      const m = new THREE.Mesh(pulsoGeo, new THREE.MeshBasicMaterial({ color: 0x2f62a8 }));
      scene.add(m);
      return { m, a };
    });

    const azul = new THREE.Color(0x2f62a8), rojo = new THREE.Color(0xb0413e), claro = new THREE.Color(0xfbfcfa), verde = new THREE.Color(0x3b7a52);
    let marco = 0;
    return {
      tick(dt, t) {
        if (ent.current) {
          let err = 0;
          for (let k = 0; k < 30; k++) err = epoch(net.current, 0.9);
          marco += 1;
          if (marco % 6 === 0) setEstado((s) => ({ ep: s.ep + 180, err, hist: [...s.hist, err].slice(-160) }));
        }
        aristas.forEach((a) => {
          const w = a.userData.get();
          const r = 0.03 + Math.min(Math.abs(w), 6) * 0.035;
          a.scale.set(r, a.userData.len, r);
          a.material.color.copy(w >= 0 ? azul : rojo);
          a.material.opacity = 0.35 + Math.min(Math.abs(w) / 5, 0.6);
        });
        const x = XOR[ejRef.current];
        const { h, o } = forward(net.current, [x[0], x[1]]);
        nodos.in.forEach((n, i) => n.material.color.copy(claro).lerp(verde, x[i]));
        nodos.hid.forEach((n, j) => n.material.color.copy(claro).lerp(azul, h[j]));
        nodos.out[0].material.color.copy(claro).lerp(verde, o);
        // ciclo: 0–1 forward por capa, 1–2 backward
        const c = (t * 0.55) % 2;
        pulsos.forEach(({ m, a }, i) => {
          const capa = i < 6 ? 0 : 1;
          let f;
          let visible = true;
          if (c < 1) { const loc = c * 2 - capa; f = loc; visible = loc >= 0 && loc <= 1; m.material.color.copy(azul); }
          else { const loc = (c - 1) * 2 - (1 - capa); f = 1 - loc; visible = loc >= 0 && loc <= 1; m.material.color.copy(rojo); }
          m.visible = visible;
          if (visible) m.position.copy(a.userData.va).lerp(a.userData.vb, Math.max(0, Math.min(1, f)));
        });
      },
    };
  }, []);

  // Mapa de decisión 2D y curva de error
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const N = 40;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const o = forward(net.current, [i / (N - 1), 1 - j / (N - 1)]).o;
      ctx.fillStyle = `rgb(${Math.round(245 - o * 186)},${Math.round(224 - o * 102)},${Math.round(223 - o * 141)})`;
      ctx.fillRect((i * c.width) / N, (j * c.height) / N, c.width / N + 1, c.height / N + 1);
    }
    XOR.forEach(([a, b, t]) => {
      ctx.beginPath();
      ctx.arc(a * (c.width - 16) + 8, (1 - b) * (c.height - 16) + 8, 7, 0, Math.PI * 2);
      ctx.fillStyle = t ? COLORES.c : '#fbfcfa';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1f2b25';
      ctx.stroke();
    });
  }, [estado]);

  const reiniciar = () => { net.current = redNueva(Math.floor(Math.random() * 1000)); setEstado({ ep: 0, err: null, hist: [] }); setEntrenando(false); };
  const unPaso = () => { const err = epoch(net.current, 0.9); setEstado((s) => ({ ep: s.ep + 1, err, hist: [...s.hist, err].slice(-160) })); };
  const pred = forward(net.current, [XOR[ej][0], XOR[ej][1]]);
  const W = 260, H = 90;
  const maxE = Math.max(0.3, ...estado.hist);
  const curva = estado.hist.map((e, i) => `${i ? 'L' : 'M'}${(i / 159) * W},${H - (e / maxE) * (H - 6)}`).join('');
  return (
    <Marco
      titulo="Perceptrón multicapa 2-3-1 aprendiendo XOR con backpropagation"
      controles={
        <>
          <button className="boton primario" onClick={() => setEntrenando((x) => !x)} type="button">{entrenando ? 'Pausar' : 'Entrenar'}</button>
          <button className="boton" onClick={unPaso} disabled={entrenando} type="button">1 epoch</button>
          <button className="boton" onClick={reiniciar} type="button">Pesos nuevos</button>
        </>
      }
      pie="Grosor de cada conexión = |peso|; azul positivo (excitadora), rojo negativo (inhibidora). Los pulsos azules son la propagación hacia delante y los rojos el error que vuelve hacia atrás. El color de cada neurona es su salida para el ejemplo elegido. Un perceptrón simple no puede aprender XOR; con una capa oculta sí. Arrastra para girar la red."
    >
      <div className="lienzo3d" ref={ref} />
      <div className="dos-col" style={{ marginTop: 12 }}>
        <div>
          <div className="fila-control">
            Ejemplo:
            {XOR.map((x, i) => <button key={i} className={`boton ${ej === i ? 'activo' : ''}`} onClick={() => setEj(i)} type="button">({x[0]},{x[1]}) → {x[2]}</button>)}
          </div>
          <p className="marcador">Epoch <b>{estado.ep}</b> · error cuadrático medio <b>{estado.err == null ? '—' : redondear(estado.err, 4)}</b> · salida para ({XOR[ej][0]},{XOR[ej][1]}): <b>{redondear(pred.o, 3)}</b> (deseado {XOR[ej][2]})</p>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: 300, background: '#fbfcfa', border: '1px solid var(--linea)' }}>
            <path d={curva} fill="none" stroke={COLORES.a} strokeWidth="2" />
            <text x="6" y="14" fontSize="11" fontFamily="var(--f-titulo)" fill="#4a5a51">error por epoch</text>
          </svg>
        </div>
        <div>
          <p className="marcador">Salida de la red en el plano (x₁, x₂)</p>
          <canvas ref={cv} width={180} height={180} style={{ border: '1px solid var(--linea)', borderRadius: 4 }} />
        </div>
      </div>
    </Marco>
  );
}

// ═════════ Random Forest en 3D ═════════
function datosCirculo(n = 160, s = 21) {
  const r = semilla(s);
  return Array.from({ length: n }, () => {
    const x = r() * 10, y = r() * 10;
    const d = Math.hypot(x - 5, y - 5);
    const c = d < 3.1 + (r() - 0.5) * 1.2 ? 1 : 0;
    return { x, y, c };
  });
}
function ginI(S) { if (!S.length) return 0; const p = S.filter((q) => q.c).length / S.length; return 1 - p * p - (1 - p) * (1 - p); }
function arbolRF(S, r, prof = 0, maxProf = 5) {
  const pos = S.filter((p) => p.c).length;
  if (prof >= maxProf || S.length < 4 || pos === 0 || pos === S.length) return { hoja: pos * 2 >= S.length ? 1 : 0 };
  const eje = r() < 0.5 ? 'x' : 'y'; // m = √p = 1 variable al azar en cada nodo
  const vals = [...new Set(S.map((p) => p[eje]))].sort((a, b) => a - b);
  let mejor = null;
  for (let i = 0; i < vals.length - 1; i += Math.max(1, Math.floor(vals.length / 14))) {
    const t = (vals[i] + vals[i + 1]) / 2;
    const A = S.filter((p) => p[eje] <= t), B = S.filter((p) => p[eje] > t);
    const g = (A.length * ginI(A) + B.length * ginI(B)) / S.length;
    if (!mejor || g < mejor.g) mejor = { t, g, A, B };
  }
  if (!mejor) return { hoja: pos * 2 >= S.length ? 1 : 0 };
  return { eje, t: mejor.t, izq: arbolRF(mejor.A, r, prof + 1, maxProf), der: arbolRF(mejor.B, r, prof + 1, maxProf) };
}
const predRF = (a, p) => (a.hoja !== undefined ? a.hoja : predRF(p[a.eje] <= a.t ? a.izq : a.der, p));

export function Bosque3D() {
  const datos = useMemo(() => datosCirculo(), []);
  const T = 11;
  const bosque = useMemo(() => {
    const r = semilla(77);
    return Array.from({ length: T }, () => {
      const boot = Array.from({ length: datos.length }, () => datos[Math.floor(r() * datos.length)]);
      return { arbol: arbolRF(boot, r), distintos: new Set(boot).size };
    });
  }, [datos]);
  const [q, setQ] = useState({ x: 7.6, y: 6.9 });
  const votos = bosque.map((b) => predRF(b.arbol, q));
  const si = votos.filter(Boolean).length;
  const copas = useRef([]);

  const [ref] = useEscena3D(({ scene, camera }) => {
    camera.position.set(0, 7, 14);
    const suelo = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshStandardMaterial({ color: 0xe4e9e2 }));
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);
    const tronco = new THREE.CylinderGeometry(0.14, 0.2, 1.4, 10);
    const copa = new THREE.ConeGeometry(0.75, 2.1, 18);
    copas.current = [];
    for (let i = 0; i < T; i++) {
      const ang = Math.PI * (0.1 + (0.8 * i) / (T - 1));
      const x = -Math.cos(ang) * 6, z = -Math.sin(ang) * 6 + 2;
      const tr = new THREE.Mesh(tronco, new THREE.MeshStandardMaterial({ color: 0x7a5a3a }));
      tr.position.set(x, 0.7, z);
      const cp = new THREE.Mesh(copa, new THREE.MeshStandardMaterial({ color: 0xa9b5ab, roughness: 0.6 }));
      cp.position.set(x, 2.4, z);
      scene.add(tr, cp);
      const et = etiqueta3D(`árbol ${i + 1}`, { tam: 0.32 });
      et.position.set(x, 3.9, z);
      scene.add(et);
      copas.current.push(cp);
    }
    const urna = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x1f2b25 }));
    urna.position.set(0, 0.6, 2.5);
    scene.add(urna);
    copas.current.urna = urna;
    return { tick() {} };
  }, []);

  useEffect(() => {
    const cs = copas.current;
    if (!cs.length) return;
    cs.forEach((cp, i) => {
      cp.material.color.set(votos[i] ? COLORES.a : COLORES.b);
      cp.scale.set(1, 1, 1);
      anim(cp.scale, { x: [0.6, 1], y: [0.6, 1], z: [0.6, 1], duration: 600, delay: i * 50, ease: 'outBack(2)' });
    });
    if (cs.urna) cs.urna.material.color.set(si * 2 > T ? COLORES.a : COLORES.b);
  }, [q.x, q.y]); // eslint-disable-line

  const S = 220, sx = escala(0, 10, 6, S - 6), sy = escala(0, 10, S - 6, 6);
  const click = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setQ({ x: (((e.clientX - r.left) / r.width) * S - 6) / ((S - 12) / 10), y: ((S - 6 - ((e.clientY - r.top) / r.height) * S) / ((S - 12) / 10)) });
  };
  const distintos = media(bosque.map((b) => b.distintos)) / datos.length;
  return (
    <Marco
      titulo={`Un bosque de ${T} árboles vota`}
      pie={<>Cada árbol se entrena con su propia muestra bootstrap (≈ {Math.round(distintos * 100)} % de ejemplos distintos) y en cada nodo solo puede elegir entre m = √p = 1 de las 2 variables, escogida al azar. Ningún árbol se poda. Pulsa en el plano para elegir el punto: votan <b style={{ color: COLORES.a }}>{si} dentro</b> y <b style={{ color: COLORES.b }}>{T - si} fuera</b> → la urna dice <b>{si * 2 > T ? 'dentro del círculo' : 'fuera'}</b>.</>}
    >
      <div className="dos-col" style={{ gridTemplateColumns: 'minmax(0,1fr) 240px' }}>
        <div className="lienzo3d" ref={ref} style={{ height: 360 }} />
        <svg viewBox={`0 0 ${S} ${S}`} onClick={click} style={{ cursor: 'crosshair', background: '#fbfcfa', border: '1px solid var(--linea)', borderRadius: 4 }}>
          {datos.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={2.8} fill={p.c ? COLORES.a : COLORES.b} opacity="0.7" />)}
          <circle cx={sx(5)} cy={sy(5)} r={(3.1 / 10) * (S - 12)} fill="none" stroke="#1f2b25" strokeDasharray="3 3" />
          <rect x={sx(q.x) - 6} y={sy(q.y) - 6} width="12" height="12" fill="#1f2b25" transform={`rotate(45 ${sx(q.x)} ${sy(q.y)})`} />
        </svg>
      </div>
    </Marco>
  );
}

// ═════════ Regresión global vs árbol de regresión vs árbol de modelos ═════════
function verdad(x, y) {
  if (x < 0) return 0.5 * x + 0.3 * y + 2.6;
  if (y < 0) return -0.6 * x + 0.5 * y + 2.2;
  return 0.7 * x - 0.3 * y + 1.2;
}
function ajustarPlano(P) {
  // mínimos cuadrados z = a + b x + c y (ecuaciones normales 3×3)
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const v = [0, 0, 0];
  P.forEach(({ x, y, z }) => {
    const f = [1, x, y];
    for (let i = 0; i < 3; i++) { v[i] += f[i] * z; for (let j = 0; j < 3; j++) S[i][j] += f[i] * f[j]; }
  });
  const M = S.map((r, i) => [...r, v[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i;
    for (let k = i + 1; k < 3; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    for (let k = 0; k < 3; k++) if (k !== i) { const f = M[k][i] / M[i][i]; for (let j = i; j < 4; j++) M[k][j] -= f * M[i][j]; }
  }
  const [a, b, c] = M.map((r, i) => r[3] / r[i]);
  return { a, b, c, f: (x, y) => a + b * x + c * y };
}
const sd = (zs) => { const m = media(zs); return Math.sqrt(zs.reduce((s, z) => s + (z - m) ** 2, 0) / zs.length); };
function arbolSDR(P, caja, prof = 0) {
  if (prof >= 2 || P.length < 20) return [{ caja, P }];
  let mejor = null;
  ['x', 'y'].forEach((eje) => {
    for (let t = -2.5; t <= 2.5; t += 0.25) {
      const A = P.filter((p) => p[eje] <= t), B = P.filter((p) => p[eje] > t);
      if (A.length < 10 || B.length < 10) continue;
      const sdr = sd(P.map((p) => p.z)) - (A.length / P.length) * sd(A.map((p) => p.z)) - (B.length / P.length) * sd(B.map((p) => p.z));
      if (!mejor || sdr > mejor.sdr) mejor = { eje, t, sdr, A, B };
    }
  });
  if (!mejor || mejor.sdr < 0.05) return [{ caja, P }];
  const c1 = { ...caja }, c2 = { ...caja };
  if (mejor.eje === 'x') { c1.x1 = mejor.t; c2.x0 = mejor.t; } else { c1.y1 = mejor.t; c2.y0 = mejor.t; }
  return [...arbolSDR(mejor.A, c1, prof + 1), ...arbolSDR(mejor.B, c2, prof + 1)];
}

export function Modelos3D() {
  const P = useMemo(() => {
    const r = semilla(31);
    return Array.from({ length: 170 }, () => {
      const x = (r() - 0.5) * 6, y = (r() - 0.5) * 6;
      return { x, y, z: verdad(x, y) + (r() - 0.5) * 0.7 };
    });
  }, []);
  const modelos = useMemo(() => {
    const global = ajustarPlano(P);
    const hojas = arbolSDR(P, { x0: -3, x1: 3, y0: -3, y1: 3 });
    const reg = hojas.map((h) => ({ caja: h.caja, k: media(h.P.map((p) => p.z)) }));
    const mod = hojas.map((h) => ({ caja: h.caja, plano: ajustarPlano(h.P) }));
    const dentro = (c, p) => p.x >= c.x0 && p.x <= c.x1 && p.y >= c.y0 && p.y <= c.y1;
    const pr = {
      lineal: (p) => global.f(p.x, p.y),
      arbol: (p) => reg.find((h) => dentro(h.caja, p)).k,
      modelos: (p) => mod.find((h) => dentro(h.caja, p)).plano.f(p.x, p.y),
    };
    const z = P.map((p) => p.z);
    const m = Object.fromEntries(Object.entries(pr).map(([k, f]) => [k, metricas(z, P.map(f))]));
    return { global, reg, mod, m, hojas };
  }, [P]);
  const [ver, setVer] = useState('modelos');
  const grupos = useRef({});

  const [ref] = useEscena3D(({ scene, camera }) => {
    camera.position.set(9, 7, 9);
    const esc = 1;
    const g = new THREE.Group();
    g.position.y = -1.5;
    scene.add(g);
    // ejes
    const ejes = new THREE.GridHelper(6, 6, 0xa9b5ab, 0xd9e0d7);
    g.add(ejes);
    const ptG = new THREE.SphereGeometry(0.07, 8, 6);
    const ptM = new THREE.MeshStandardMaterial({ color: 0x1f2b25 });
    P.forEach((p) => { const m = new THREE.Mesh(ptG, ptM); m.position.set(p.x * esc, p.z, p.y * esc); g.add(m); });
    const parche = (c, f, color) => {
      const geo = new THREE.PlaneGeometry(c.x1 - c.x0, c.y1 - c.y0, 8, 8);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) + (c.x0 + c.x1) / 2, y = -pos.getY(i) + (c.y0 + c.y1) / 2;
        pos.setXYZ(i, x, f(x, y), y);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      return new THREE.Mesh(geo, mat);
    };
    const mk = (lista) => { const gg = new THREE.Group(); lista.forEach((m) => gg.add(m)); g.add(gg); return gg; };
    const cols = [0x2f62a8, 0xa8700f, 0x7b4c9e, 0x3b7a52];
    grupos.current = {
      lineal: mk([parche({ x0: -3, x1: 3, y0: -3, y1: 3 }, modelos.global.f, 0x6e7a73)]),
      arbol: mk(modelos.reg.map((h, i) => parche(h.caja, () => h.k, cols[i % 4]))),
      modelos: mk(modelos.mod.map((h, i) => parche(h.caja, h.plano.f, cols[i % 4]))),
    };
    Object.entries(grupos.current).forEach(([k, gg]) => (gg.visible = k === 'modelos'));
    return { tick(dt) { g.rotation.y += dt * 0.08; } };
  }, [modelos]);

  useEffect(() => {
    Object.entries(grupos.current).forEach(([k, gg]) => {
      gg.visible = k === ver;
      if (k === ver) gg.children.forEach((m) => anim(m.material, { opacity: [0, 0.55], duration: 500, ease: 'outQuad' }));
    });
  }, [ver]);

  const NOMBRES = { lineal: 'Regresión lineal múltiple', arbol: 'Árbol de regresión', modelos: 'Árbol de modelos' };
  return (
    <Marco
      titulo="Tres formas de ajustar z = f(x, y)"
      controles={Object.keys(NOMBRES).map((k) => <button key={k} className={`boton ${ver === k ? 'activo' : ''}`} onClick={() => setVer(k)} type="button">{NOMBRES[k]}</button>)}
      pie={<>El árbol (construido aquí con SDR) divide el plano en {modelos.hojas.length} regiones. {ver === 'lineal' ? 'Un único plano para todo: no capta los cambios de pendiente.' : ver === 'arbol' ? 'Cada región predice una constante (la media): predicción a escalones.' : 'Cada región tiene su propio plano de regresión: el mejor ajuste con muy pocas hojas.'} Errores con estos datos: {Object.keys(NOMBRES).map((k) => `${NOMBRES[k]} EAR ${redondear(modelos.m[k].ear * 100, 1)} %`).join(' · ')}.</>}
    >
      <div className="lienzo3d" ref={ref} />
    </Marco>
  );
}
