# Atlas de minería de datos predictiva

Web didáctica en React con los temas del examen: Tema 3 (2.ª mitad), 4, 6, 7 y 8.
El temario está organizado como un árbol (preparación de datos → clasificación → regresión,
más los conceptos compartidos). Cada nodo es una ficha que incluye:

- **la salida**: categórica (clasificación), numérica (regresión), ambas, datos (preprocesado) o concepto;
- **un esquema** de su funcionamiento para memorizarlo, con un botón para repasarlo paso a paso;
- **una ficha técnica**: entrada, si es interpretable, cómo funciona, qué devuelve, puntos fuertes y débiles, parámetros y su nombre en Weka;
- **el detalle de las diapositivas**, explicado de otra forma, con las erratas señaladas;
- **un ejemplo interactivo**, animado con anime.js (y en 3D con three.js en MLP, Random Forest y árboles de modelos);
- **sus relaciones** con algoritmos de otras ramas.

## Puesta en marcha

Necesitas Node.js 18 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # genera la web estática en dist/
npm run preview    # sirve dist/ para comprobarla
```

## Despliegue

`npm run build` crea la carpeta `dist/`, que es una web estática. Como el router usa el hash
(`#/n/id3`) y `vite.config.js` tiene `base: './'`, funciona en cualquier ruta sin configurar nada más:

- **Netlify / Cloudflare Pages / Vercel**: comando de build `npm run build` y carpeta de publicación `dist`.
- **GitHub Pages**: sube el contenido de `dist/` a la rama `gh-pages` (por ejemplo, con `npx gh-pages -d dist`).
- **Cualquier servidor**: copia `dist/` tal cual.

## Estructura

```
src/
  data/            ← todo el contenido (un archivo por parte)
    conceptos.js     raíz del árbol + conceptos transversales
    preparacion.js   Parte I · T3 (selección de instancias) y T4 (discretización)
    reglas.js        Parte II · T6 (árboles, reglas, cobertura, evolutivos)
    otras.js         Parte III · T7 (Bayes, redes, kNN, multiclasificadores)
    regresion.js     Parte IV · T8 (regresión)
    index.js         índices, orden de lectura y relaciones
  components/      ← mapa, índice lateral, ficha, esquema, tabla, buscador
  ejemplos/        ← ejemplos interactivos (parte1–4.jsx, tresd.jsx para los 3D)
  lib/             ← anime.js (anim.js), cálculos (stats.js) y router
```

### Añadir o corregir contenido

Cada nodo es un objeto en `src/data/*.js`. En los textos se puede usar:

- `[[id]]` o `[[id|texto]]`: enlace a otra ficha;
- `**negrita**`, `*cursiva*`, `` `código` ``;
- `$fórmula$`: LaTeX en línea (KaTeX).

Bloques disponibles en `secciones[].b`: texto, `{ ul }`, `{ ol }`, `{ tabla: { cab, filas } }`,
`{ f: 'latex' }`, `{ nota, tipo: 'examen' | 'ojo' | 'idea' }`, `{ vs: [...] }`, `{ def: [[término, definición]] }`,
`{ pseudo }` y `{ demo: 'NombreDelEjemplo' }`.

Los esquemas (`esquema`) usan pasos `in`, `paso`, `si` (con `si`/`no`), `bucle` (con `pasos` anidados) y `out`.
