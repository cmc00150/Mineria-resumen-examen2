import katex from 'katex';
import { POR_ID, SALIDAS, nombreCorto } from '../data/index.js';

export function Formula({ tex, bloque = false }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: bloque, strict: false });
  return bloque ? (
    <div className="formula" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function Enlace({ id, children }) {
  const n = POR_ID[id];
  if (!n) return <span>{children || id}</span>;
  const s = SALIDAS[n.salida]?.clase || '';
  return (
    <a className={`enlace ${s}`} href={`#/n/${id}`} title={n.resumen}>
      {children || nombreCorto(n)}
    </a>
  );
}

// Orden importa: enlaces, fórmulas y código primero (pueden contener asteriscos).
const RE = /(\[\[[^\]]+\]\]|\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;

/** Texto con [[id|enlaces]], **negrita**, *cursiva*, $fórmulas$ y `código`. */
export function Texto({ t }) {
  if (t == null) return null;
  const partes = String(t).split(RE).filter((p) => p !== '');
  return partes.map((p, i) => {
    if (p.startsWith('[[')) {
      const [id, label] = p.slice(2, -2).split('|');
      return (
        <Enlace key={i} id={id}>
          {label ? <Texto t={label} /> : null}
        </Enlace>
      );
    }
    if (p.startsWith('$') && p.endsWith('$') && p.length > 2) return <Formula key={i} tex={p.slice(1, -1)} />;
    if (p.startsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith('**')) return <strong key={i}><Texto t={p.slice(2, -2)} /></strong>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

export function EtiquetaSalida({ salida, largo = false }) {
  const s = SALIDAS[salida];
  if (!s) return null;
  return (
    <span className={`etiqueta-salida ${s.clase}`} title={s.largo}>
      <span className="punto" />
      {largo ? s.largo : s.nombre}
    </span>
  );
}
