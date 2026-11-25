// Envoltorio fino sobre anime.js (v4). Toda la web anima a través de aquí,
// así que si cambia la API de la librería solo hay que tocar este archivo.
import { animate, createTimeline, stagger } from 'animejs';

export const sinMovimiento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** animate() respetando "reducir movimiento" del sistema. */
export function anim(targets, params) {
  if (!targets || (Array.isArray(targets) && targets.length === 0)) return null;
  const p = sinMovimiento() ? { ...params, duration: 0, delay: 0 } : params;
  return animate(targets, p);
}

/** Entrada escalonada: aparecer y subir un poco. */
export function entrada(targets, { paso = 55, dur = 480, desde = 10 } = {}) {
  // Ojo: en elementos SVG con atributo transform (nodos colocados con translate)
  // NO se puede animar translate/scale por CSS: la transformación CSS sustituye
  // al atributo y el elemento salta al origen. Con desde = 0 solo se anima la opacidad.
  const lista = Array.from(targets || []);
  const conTransform = lista.some((el) => el instanceof SVGElement && el.hasAttribute('transform'));
  const params = { opacity: [0, 1], duration: dur, delay: stagger(paso), ease: 'outCubic' };
  if (desde && !conTransform) params.translateY = [desde, 0];
  return anim(lista, params);
}

/** Dibuja trazos SVG (path/line/polyline) como si se trazaran a mano. */
export function dibujar(els, { dur = 900, paso = 40, retraso = 0 } = {}) {
  const lista = Array.from(els || []).filter(Boolean);
  lista.forEach((el) => {
    const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 200;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.dataset.len = len;
  });
  const limpiar = () =>
    lista.forEach((el) => {
      el.style.strokeDasharray = '';
      el.style.strokeDashoffset = '';
    });
  if (sinMovimiento()) {
    limpiar();
    return null;
  }
  return anim(lista, {
    strokeDashoffset: (el) => [Number(el.dataset.len), 0],
    duration: dur,
    delay: stagger(paso, { start: retraso }),
    ease: 'inOutQuad',
    onComplete: limpiar,
  });
}

/** Interpola un número y llama a onUpdate con el valor intermedio. */
export function contar(desde, hasta, onUpdate, dur = 700) {
  const o = { v: desde };
  if (sinMovimiento()) {
    onUpdate(hasta);
    return null;
  }
  return animate(o, {
    v: hasta,
    duration: dur,
    ease: 'outCubic',
    onUpdate: () => onUpdate(o.v),
  });
}

/** Pequeño latido para llamar la atención sobre lo que acaba de cambiar. */
export function latido(targets) {
  return anim(targets, {
    scale: [1, 1.12, 1],
    duration: 520,
    ease: 'outQuad',
  });
}

export function linea() {
  return createTimeline({ defaults: { ease: 'outCubic', duration: 450 } });
}

export { stagger };
