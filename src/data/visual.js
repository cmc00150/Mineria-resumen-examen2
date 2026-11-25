// Capa visual de cada ficha: pictogramas, fichas cortas (el texto largo de la ficha
// técnica aparece al pasar el ratón, en el mismo orden) y bloques gráficos.
//   entrada: discreta | continua | mixta        caja: blanca | negra | gris
//   devuelve: pictograma de lo que produce el algoritmo (ver components/Iconos.jsx)
//   avisos: [corto, explicación] · formulas: [nombre, latex] · infografia: componente
//   bloques: ver components/Visual.jsx
import { VISUAL1 } from './visual1.js';
import { VISUAL2 } from './visual2.js';
import { VISUAL3 } from './visual3.js';
import { VISUAL4 } from './visual4.js';

export const VISUAL = { ...VISUAL1, ...VISUAL2, ...VISUAL3, ...VISUAL4 };
