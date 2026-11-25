import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export { THREE };

/**
 * Monta una escena three.js en un div. `montar(ctx)` recibe
 * { scene, camera, renderer, controls, THREE } y puede devolver
 * { tick(dt, t), limpiar() }.
 */
export function useEscena3D(montar, deps = []) {
  const ref = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      el.innerHTML = '<p style="padding:16px">Tu navegador no tiene WebGL activado, así que esta vista 3D no se puede mostrar.</p>';
      return undefined;
    }
    const w = el.clientWidth || 600;
    const h = el.clientHeight || 400;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 200);
    camera.position.set(9, 6, 11);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const luz = new THREE.DirectionalLight(0xffffff, 0.9);
    luz.position.set(6, 10, 8);
    scene.add(luz);

    const ctx = { scene, camera, renderer, controls, THREE };
    const r = montar(ctx) || {};
    api.current = r;

    const reloj = new THREE.Clock();
    let id;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(el);
    const bucle = () => {
      id = requestAnimationFrame(bucle);
      if (!visible) return;
      const dt = reloj.getDelta();
      r.tick && r.tick(dt, reloj.elapsedTime);
      controls.update();
      renderer.render(scene, camera);
    };
    bucle();

    const ro = new ResizeObserver(() => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!W || !H) return;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      io.disconnect();
      r.limpiar && r.limpiar();
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, api];
}

/** Sprite de texto para etiquetar objetos 3D. */
export function etiqueta3D(texto, { color = '#1f2b25', tam = 0.5, fondo = 'rgba(251,252,250,0.92)' } = {}) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const fuente = 44;
  ctx.font = `600 ${fuente}px "Bricolage Grotesque", system-ui, sans-serif`;
  const w = Math.ceil(ctx.measureText(texto).width) + 28;
  c.width = w;
  c.height = fuente + 22;
  ctx.font = `600 ${fuente}px "Bricolage Grotesque", system-ui, sans-serif`;
  if (fondo) {
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, 14, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const s = new THREE.Sprite(mat);
  s.scale.set((tam * c.width) / c.height, tam, 1);
  s.renderOrder = 10;
  return s;
}
