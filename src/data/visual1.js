// Capa visual · Parte I: preparación de datos (T3 2.ª mitad, T4)

const CNN_FICHA = { entrada: 'continua', caja: 'blanca', devuelve: 'datos' };

export const VISUAL1 = {
  preparacion: {
    bloques: [
      {
        ti: 'Reducción de datos: 5 caminos',
        tarjetas: [
          { i: '▥', t: 'Selección de características', s: 'quita columnas · examen anterior', c: 'concepto' },
          { i: 'datos', t: 'Selección de instancias', s: 'quita filas · entra', c: 'prep' },
          { i: '◎', t: 'Agrupamiento', s: 'no entra', c: 'concepto' },
          { i: '⇲', t: 'Compactación', s: 'no entra', c: 'concepto' },
          { i: 'intervalos', t: 'Discretización', s: 'simplifica columnas · entra', c: 'prep' },
        ],
      },
      {
        ti: 'Los dos que entran',
        vs: [
          { t: '[[seleccion-instancias|Selección de instancias]]', i: 'datos', c: 'prep', items: ['quita **filas**', 'más rápido · generaliza mejor · más simple', 'se apoya en [[knn]]'] },
          { t: '[[discretizacion|Discretización]]', i: 'intervalos', c: 'prep', items: ['continuo → **intervalos**', 'más conciso e interpretable', 'ligada a [[arboles]] y [[naive-bayes]]'] },
        ],
      },
      {
        ti: 'Puentes con el resto del temario',
        tarjetas: [
          { i: '↺', t: 'Con reemplazo = bootstrap', s: '[[bagging]] · [[random-forest]]' },
          { i: '1-NN', t: 'CNN · ENN · SMOTE', s: 'usan [[knn]]' },
          { i: '🧬', t: 'CHC · SSMA', s: 'evolutivos, como [[evolutivos|las reglas]]' },
          { i: 'arbol-podado', t: 'SI → C4.5', s: 'árboles más pequeños ([[si-modelos]])' },
          { i: 'H', t: 'MDLP', s: 'misma [[entropia]] que [[id3]]' },
          { i: '77→94 %', t: 'Naïve Bayes en iris', s: '2 vs 3 intervalos' },
        ],
      },
    ],
  },

  // ───────── Selección de instancias ─────────
  'seleccion-instancias': {
    bloques: [
      {
        ti: 'Qué se gana',
        cifras: [
          { v: 'menos datos', t: 'aprenden más rápido', c: 'prep' },
          { v: 'más exactitud', t: 'generaliza mejor', c: 'si' },
          { v: 'más simple', t: 'modelo más fácil de entender', c: 'cat' },
        ],
      },
      { demo: 'PuntosReduccion' },
      {
        ti: 'Tres estrategias',
        tarjetas: [
          { i: '🎲', t: '[[muestreo|Muestreo]]', s: 'M de N casos al azar o por grupos' },
          { i: '1-NN', t: '[[seleccion-prototipos|Selección de prototipos]]', s: 'mejorar kNN (aprendizaje basado en instancias)' },
          { i: '?', t: 'Aprendizaje activo', s: 'solo se nombra' },
        ],
      },
      {
        ti: 'El precio',
        cifras: [
          { v: '> O(n²)', t: 'orden de los algoritmos', c: 'no' },
          { v: '≈ O(n³)', t: 'lo habitual', c: 'no' },
        ],
      },
      { ti: 'Dificultades', chips: ['eficiencia', 'recursos', 'generalización', 'representación'] },
      { clave: 'Se usa en: [[si-aplicaciones|grandes BD y árboles]] · y para equilibrar [[no-balanceados|clases desiguales]]' },
    ],
  },
  muestreo: {
    bloques: [
      { cifras: [{ v: 'M < N', t: 'casos elegidos de los N originales', c: 'prep' }] },
      { ti: '¿Cuántos?', chips: ['según la complejidad del concepto', 'según la técnica de minería'] },
      {
        ti: 'Técnicas',
        tarjetas: [
          { i: '↛', t: 'Sin reemplazamiento', s: 'cada caso sale 1 vez' },
          { i: '↺', t: 'Con reemplazamiento', s: 'puede repetirse (bootstrap)' },
          { i: '◎', t: 'De clusters', s: 'proporcional al grupo' },
          { i: '10→100 %', t: 'Incremental', s: 'hasta que no mejora' },
          { i: '▤', t: 'Estratificado', s: 'muestra de cada estrato' },
        ],
      },
    ],
  },
  'muestreo-aleatorio': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'datos',
    fuertes: ['Simple y rápido', 'Genera muestras bootstrap'],
    debiles: ['Ignora la estructura', 'Duplicados (con reemplazo)'],
    parametros: ['M (tamaño de la muestra)', 'con / sin reemplazamiento', 'semilla'],
    weka: 'Resample',
    wekaBloques: [
      { ti: 'Ruta', flujo: [{ t: 'Preprocess' }, { t: 'Filter' }, { t: 'unsupervised' }, { t: 'instance' }, { t: 'Resample' }] },
      { matriz: { cab: ['Parámetro', 'Qué hace'], filas: [['sampleSizePercent', 'M como % de N (100 por defecto)'], ['noReplacement', 'False = con reemplazamiento'], ['randomSeed', 'semilla'], ['invertSelection', 'quedarse con los no elegidos']] } },
    ],
    bloques: [
      { cifras: [{ v: 'M < N', t: 'se eligen M de los N ejemplos', c: 'prep' }, { v: 'M = N', t: 'con reemplazamiento = bootstrap ([[bagging]])', c: 'cat' }] },
      { vs: [
        { t: 'SRSWOR', i: '↛', items: ['sin reemplazamiento', 'sin repetidos'] },
        { t: 'SRSWR', i: '↺', items: ['con reemplazamiento', 'repetidos posibles'] },
      ] },
    ],
  },
  'muestreo-clusters': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'datos',
    fuertes: ['Representa mejor los datos', 'Evita outliers'],
    debiles: ['Hay que conocer los grupos'],
    parametros: ['Ejemplos ∝ tamaño del grupo'],
  },
  'muestreo-incremental': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'datos',
    fuertes: ['No fija el tamaño antes', 'Ahorra cómputo'],
    debiles: ['Entrenar varias veces'],
    bloques: [{ ti: 'Patrón típico', linea: [{ a: '10 %' }, { a: '20 %' }, { a: '33 %' }, { a: '50 %' }, { a: '67 %' }, { a: '100 %', t: 'parar si no hay progreso', c: 'si' }] }],
  },
  'muestreo-estratificado': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'datos',
    fuertes: ['Ningún grupo se queda fuera', 'Mejor con grupos homogéneos'],
    debiles: ['Definir bien los estratos'],
  },

  'seleccion-prototipos': {
    bloques: [
      { demo: 'DiagramaPrototipos' },
      { ti: 'Antes de seguir: ¿qué es el borde?', demo: 'Borde' },
      {
        ti: '¿Por qué CNN guarda las mal clasificadas?',
        vs: [
          { t: 'S clasifica mal a x', c: 'si', i: '✗', items: ['S no tiene información de esa zona', 'x está cerca de la frontera (borde)', '→ se **guarda**: hace falta para dibujar la frontera'] },
          { t: 'S clasifica bien a x', c: 'no', i: '✓', items: ['su zona ya está cubierta por S', 'x es redundante (interior)', '→ se **descarta**'] },
        ],
      },
      {
        ti: 'Propiedades',
        matriz: {
          cab: ['Propiedad', 'Opciones'],
          filas: [
            ['Dirección', 'incremental · decremental · por lotes · mezclada · fijada'],
            ['Tipo', '**condensación** (deja el borde) · **edición** (quita ruido) · **híbrido**'],
            ['Evaluación', 'filtro · envolvente ([[filtro-envolvente]])'],
          ],
        },
      },
      {
        ti: 'Taxonomía (García et al., 2012)',
        arbol: {
          t: 'Selección de prototipos',
          hijos: [
            { a: '', n: { t: 'Condensación', hijos: [{ a: 'incremental', n: { t: 'CNN', hoja: true } }, { a: 'decremental', n: { t: 'RNN, Shrink…', hoja: true } }] } },
            { a: '', n: { t: 'Edición', hijos: [{ a: 'decremental', n: { t: 'ENN, Multiedit', hoja: true } }, { a: 'lotes', n: { t: 'AllKNN', hoja: true } }] } },
            { a: '', n: { t: 'Híbridos', hijos: [{ a: 'incremental', n: { t: 'IB3', hoja: true } }, { a: 'filtro', n: { t: 'DROP3', hoja: true } }, { a: 'envolvente', n: { t: 'CHC, SSMA', hoja: true } }, { a: 'fijada', n: { t: 'RMHC', hoja: true } }] } },
          ],
        },
        sepX: 60,
      },
      {
        ti: 'Cómo se evalúa un selector para k-NN',
        tarjetas: [
          { i: '⬇', t: 'Reducción', s: 'almacenamiento' },
          { i: '≈', t: 'Tolerancia al ruido' },
          { i: '✓', t: 'Precisión', s: 'generalización' },
          { i: '⏱', t: 'Cómputo' },
        ],
      },
      {
        ti: 'Familias (Cano, Herrera, Lozano)',
        tarjetas: [
          { i: '1-NN', t: 'Reglas NN', s: '[[multiedit]] · [[ib3]]' },
          { i: '↓', t: 'Eliminación ordenada', s: '[[drop3]]' },
          { i: '🧬', t: 'Evolutivos', s: '[[chc]]' },
          { i: '🎲', t: 'Muestreo', s: 'aleatorio' },
        ],
      },
      { ti: 'Compáralos', demo: 'Prototipos' },
      { chips: ['iris: pétalo largo × ancho · Multiedit, Drop2, Ib3, CHC', 'banana: 5300 inst., 2 clases · CNN, AllKNN, RMHC, DROP3, SSMA'] },
    ],
  },
  cnn: {
    ...CNN_FICHA,
    fuertes: ['Gran reducción', 'Conserva la frontera', 'Simple'],
    debiles: ['Depende del orden', 'Conserva el ruido', 'Solo deja el borde'],
    parametros: ['Orden de presentación'],
    bloques: [
      { matriz: { cab: ['Dirección', 'Tipo', 'Evaluación'], filas: [['Incremental', 'Condensación', 'Filtro']] } },
      { vs: [
        { t: 'Mal clasificada → se añade', c: 'si', items: ['S no conoce esa zona', 'suele ser **borde**: cerca de la otra clase'] },
        { t: 'Bien clasificada → se descarta', c: 'no', items: ['ya la representan otras de S', 'suele ser **interior**'] },
      ] },
      { aviso: ['El ruido también se guarda', 'Un punto ruidoso (rojo rodeado de azules) siempre lo clasifica mal S → CNN lo añade. Por eso CNN no limpia ruido; ENN sí.'] },
    ],
  },
  enn: {
    ...CNN_FICHA,
    fuertes: ['Quita ruido y outliers', 'Suaviza la frontera', 'No depende del orden'],
    debiles: ['Reduce poco (interior redundante)'],
    parametros: ['k = 3, 5 o 9'],
    bloques: [
      { ti: 'AllKNN = ENN repetido', flujo: [{ t: 'ENN k=3' }, { t: 'ENN k=5' }, { t: 'ENN k=7' }, { t: 'frontera aún más suave' }] },
      { matriz: { cab: ['', 'Dirección', 'Tipo'], filas: [['ENN', 'por lotes (decremental en la taxonomía)', 'Edición'], ['AllKNN', 'por lotes', 'Edición']] } },
    ],
  },
  multiedit: { ...CNN_FICHA, fuertes: ['Limpia el ruido a fondo'], debiles: ['Reduce poco'], parametros: ['Nº de particiones'] },
  ib3: {
    ...CNN_FICHA,
    fuertes: ['Más tolerante al ruido que CNN', '0–2 s con estratos (KDD)'],
    debiles: ['Depende del orden'],
    parametros: ['Umbrales de aceptación'],
    bloques: [{ chips: ['IB2 ≈ CNN', 'IB3 = IB2 + historial de aciertos'] }],
  },
  drop3: {
    ...CNN_FICHA,
    fuertes: ['Híbrido: limpia y condensa', 'Gran reducción'],
    debiles: ['Coste ≥ O(n²)', 'C4.5 sobre DROP pierde acierto (35–77 %)'],
    parametros: ['k vecinos'],
  },
  rmhc: { ...CNN_FICHA, fuertes: ['Tamaño final exacto'], debiles: ['Óptimos locales'], parametros: ['Tamaño final', 'Iteraciones'] },
  chc: {
    ...CNN_FICHA, caja: 'blanca',
    fuertes: ['Mejor reducción/acierto', 'KDD: 99,68 % red., 99,43 % test', 'Adult: 359 → 5 reglas'],
    debiles: ['El más lento (1960 s)'],
    parametros: ['Población', 'Evaluaciones', 'Peso reducción/acierto'],
    bloques: [{ ti: 'Cromosoma', chips: ['1 bit por instancia', '1 = se queda', 'fitness = acierto 1-NN + % reducción'] }],
  },
  ssma: { ...CNN_FICHA, fuertes: ['Reducción muy alta'], debiles: ['Coste elevado'], parametros: ['Evolutivo + búsqueda local'] },

  'si-aplicaciones': {
    bloques: [
      { clave: 'No son selectores nuevos: **usan** uno ([[cnn]], [[ib3]], [[chc]]…) dentro de una estrategia mayor' },
      {
        vs: [
          { t: '[[si-grandes-bd|Grandes bases de datos]]', i: 'datos', c: 'prep', items: ['problema: SI cuesta O(n²)–O(n³)', 'solución: estratos pequeños', 'KDD Cup’99: de 5 h a segundos'] },
          { t: '[[si-modelos|Árboles y reglas]]', i: 'arbol-podado', c: 'cat', items: ['problema: árboles enormes', 'solución: entrenar C4.5 con lo seleccionado', 'CHC: de 252 a 9 reglas'] },
        ],
      },
    ],
  },
  'si-grandes-bd': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'datos',
    fuertes: ['Algoritmos caros con 500 000 filas', 'Paralelizable'],
    debiles: ['Cada estrato ve solo una parte'],
    parametros: ['Nº de estratos: 100, 200, 300'],
    bloques: [
      {
        ti: 'La estrategia',
        flujo: [
          { i: 'datos', t: 'Conjunto D', s: 'n instancias' },
          { t: 'T₁ … Tₜ', s: 't estratos disjuntos, misma proporción de clases' },
          { t: 'TRᵢ / TSᵢ', s: 'cada estrato se separa' },
          { t: 'SI en cada TRᵢ', s: 'coste (n/t)² en vez de n²' },
          { i: 'datos', t: 'SS₁ ∪ … ∪ SSₜ', s: 'conjunto reducido' },
        ],
      },
      { ti: 'KDD Cup’99', cifras: [{ v: '494 022', t: 'instancias' }, { v: '41', t: 'atributos' }, { v: '23', t: 'clases' }, { v: '18 568 s', t: '1-NN con todo (≈ 5 h)', c: 'no' }] },
      { clave: 'Para qué sirve esta gráfica: comprobar si estratificar sale a cuenta. Respuesta: el tiempo baja de horas a segundos y el acierto en test se queda por encima del 98 %. Más estratos ⇒ estratos más pequeños ⇒ más rápido, pero CNN e IB2 reducen menos.' },
      {
        ti: 'Resultados con 100, 200 y 300 estratos',
        series: [{ n: '100 estratos', c: '#9fb6d8' }, { n: '200 estratos', c: '#5d87c2' }, { n: '300 estratos', c: '#1f4f8f' }],
        paneles: [
          { t: '% de reducción', min: 50, max: 100, unidad: ' %', grupos: [{ n: 'CNN', v: [81.61, 65.57, 63.38] }, { n: 'IB2', v: [82.01, 65.66, 60.31] }, { n: 'IB3', v: [78.82, 98.27, 97.97] }, { n: 'CHC', v: [99.68, 99.48, 99.28] }], nota: 'CHC e IB3 (200/300) reducen ~98–99 %' },
          { t: '% acierto en test (eje de 97 a 100)', min: 97, max: 100, unidad: ' %', ref: { v: 99.91, n: '1-NN completo' }, grupos: [{ n: 'CNN', v: [99.27, 99.15, 98.23] }, { n: 'IB2', v: [98.19, 98.71, 99.03] }, { n: 'IB3', v: [98.82, 98.93, 99.27] }, { n: 'CHC', v: [99.43, 99.23, 99.19] }], nota: 'todos pierden menos de 2 puntos' },
          { t: 'tiempo en segundos (escala log)', log: true, max: 18568, unidad: ' s', ref: { v: 18568, n: '1-NN completo' }, grupos: [{ n: 'CNN', v: [8, 3, 1] }, { n: 'IB2', v: [0, 3, 2] }, { n: 'IB3', v: [2, 0, 0] }, { n: 'CHC', v: [1960, 418, 208] }], nota: 'CHC: el más lento, pero 10× más rápido que 1-NN' },
          { t: '% acierto en entrenamiento (93 a 100)', min: 93, max: 100, unidad: ' %', ref: { v: 99.91, n: '1-NN' }, grupos: [{ n: 'CNN', v: [99.3, 99.9, 99.89] }, { n: 'IB2', v: [97.9, 99.93, 99.89] }, { n: 'IB3', v: [93.83, 98.37, 97.92] }, { n: 'CHC', v: [99.21, 99.92, 99.93] }] },
        ],
      },
    ],
  },
  'si-modelos': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'arbol-podado',
    fuertes: ['Árboles más pequeños', 'Reglas con más información'],
    debiles: ['Algunos selectores hunden el acierto'],
    parametros: ['Selector', 'Nº de estratos'],
    bloques: [
      {
        ti: 'La idea',
        flujo: [
          { i: 'datos', t: 'Datos grandes' },
          { t: 'SI estratificada', s: 'CNN, IB3, CHC…' },
          { i: 'datos', t: 'TSS', s: 'pocas instancias' },
          { i: 'arbol', t: 'C4.5 sobre TSS' },
          { i: 'arbol-podado', t: 'Árbol pequeño', s: 'menos reglas, más legibles' },
        ],
      },
      { chips: ['alternativa / complemento a la [[poda]] (que elimina nodos)'] },
      { clave: 'Para qué sirve esta gráfica: ver qué selector deja un árbol pequeño sin perder acierto. CHC: de 252 a 9 reglas con 97,5 % en test. DROP1 deja 3 reglas pero acierta un 35 %: reducir no basta.' },
      {
        ti: 'KDD Cup’99 · 100 estratos · C4.5 sobre lo seleccionado',
        series: [{ n: 'valor', c: 'cat' }],
        paneles: [
          { t: 'nº de reglas (hojas)', max: 252, ref: { v: 252, n: 'C4.5 con todo' }, grupos: [{ n: 'Cnn', v: [83] }, { n: 'Drop1', v: [3] }, { n: 'Drop2', v: [82] }, { n: 'Drop3', v: [49] }, { n: 'Ib2', v: [48] }, { n: 'Ib3', v: [74] }, { n: 'Icf', v: [68] }, { n: 'CHC', v: [9] }] },
          { t: '% acierto en test', min: 30, max: 100, unidad: ' %', ref: { v: 99.94, n: 'C4.5' }, grupos: [{ n: 'Cnn', v: [96.43] }, { n: 'Drop1', v: [34.97] }, { n: 'Drop2', v: [76.58] }, { n: 'Drop3', v: [75.38] }, { n: 'Ib2', v: [95.05] }, { n: 'Ib3', v: [96.77] }, { n: 'Icf', v: [99.53] }, { n: 'CHC', v: [97.53] }] },
          { t: '% de reducción de instancias', max: 100, unidad: ' %', grupos: [{ n: 'Cnn', v: [81.61] }, { n: 'Drop1', v: [99.97] }, { n: 'Drop2', v: [76.66] }, { n: 'Drop3', v: [56.74] }, { n: 'Ib2', v: [82.01] }, { n: 'Ib3', v: [78.92] }, { n: 'Icf', v: [23.62] }, { n: 'CHC', v: [99.68] }] },
          { t: '% acierto en entrenamiento', min: 30, max: 100, unidad: ' %', ref: { v: 99.97, n: 'C4.5' }, grupos: [{ n: 'Cnn', v: [98.48] }, { n: 'Drop1', v: [38.63] }, { n: 'Drop2', v: [81.4] }, { n: 'Drop3', v: [77.02] }, { n: 'Ib2', v: [95.81] }, { n: 'Ib3', v: [99.13] }, { n: 'Icf', v: [99.98] }, { n: 'CHC', v: [98.97] }] },
        ],
      },
      {
        ti: 'Reglas con Adult (2 clases · 30 132 inst. · 14 variables)',
        matriz: { cab: ['', 'C4.5', 'IS-CHC / C4.5'], filas: [['Nº reglas', '359', '**5**'], ['Variables por regla', '14', '**3**'], ['Confianza N(Cond,Clas)/N', '0,003', '**0,167**']] },
      },
    ],
  },

  'no-balanceados': {
    bloques: [
      {
        ti: 'Clases desiguales',
        cifras: [
          { v: '90 / 10', t: 'diagnosis: sano / enfermo' },
          { v: '99 / 1', t: 'e-comercio: no compra / compra' },
          { v: '> 99,99 %', t: 'seguridad: conexiones normales' },
          { v: '97 %', t: 'acierto típico… e inútil', c: 'no' },
        ],
      },
      { clave: 'Predecir siempre la mayoritaria ([[zeror]]) ya da ese 97 %' },
      {
        ti: 'Dos salidas',
        vs: [
          { t: 'Reducir la mayoritaria', i: '⬇', items: ['técnicas de reducción de datos'] },
          { t: 'Sobremuestrear la minoritaria', i: '⬆', items: ['copiar → [[sobreajuste]] si hay ruido', 'mejor: [[smote]]'] },
        ],
      },
    ],
  },
  smote: {
    entrada: 'continua', caja: 'blanca', devuelve: 'datos',
    fuertes: ['No copia: evita sobreajuste', 'Rellena la región minoritaria'],
    debiles: ['Propaga el ruido', 'Puede invadir la otra clase'],
    parametros: ['k vecinos', '% de sobremuestreo'],
    weka: 'SMOTE',
    formulas: [['Punto sintético', 'x_{nuevo} = x_i + \\lambda (x_{vecino} - x_i),\\; \\lambda \\in [0,1]']],
  },

  // ───────── Discretización ─────────
  discretizacion: {
    bloques: [
      {
        ti: 'Qué es',
        flujo: [{ i: 'continua', t: 'Nota [0, 10]' }, { i: 'intervalos', t: 'Cortes' }, { i: 'discreta', t: 'Suspenso · Aprobado · Notable · Sobresaliente' }],
      },
      { formulas: [['Esquema de discretización', 'D = \\{[d_0,d_1], (d_1,d_2], \\dots, (d_{m-1},d_m]\\}'], ['Puntos de corte', 'P = \\{d_0, d_1, \\dots, d_m\\},\\; d_0 = \\min,\\; d_m = \\max']] },
      { chips: ['más conciso', 'más fácil de entender', 'nivel de conocimiento', 'también es reducción de datos', 'antes o durante el aprendizaje'] },
      {
        ti: 'Ejemplos de las diapositivas',
        tarjetas: [
          { i: '🚗', t: 'EDAD vs coche propio', s: '[5,15] · [16,24] · [25,67]' },
          { i: '⚖', t: 'PESO por sus picos', s: '50–58 · 59–67 · > 68 kg' },
        ],
      },
      {
        ti: '¿Merece la pena?',
        vs: [
          { t: 'Ventajas', c: 'si', items: ['muchos algoritmos solo aceptan discretos', 'aprendizaje más rápido y efectivo', 'resultados precisos, compactos, sencillos', 'más fácil de interpretar'] },
          { t: 'Inconveniente', c: 'no', items: ['**siempre se pierde información**', 'objetivo: perder lo mínimo'] },
        ],
      },
      {
        ti: '7 criterios para clasificarlos',
        matriz: {
          cab: ['Criterio', 'A', 'B'],
          filas: [
            ['Variables', 'univariable', 'multivariable'],
            ['Clase', 'supervisado', 'no supervisado'],
            ['Momento', 'dinámico (al construir)', 'estático'],
            ['Alcance', 'local (subregión)', 'global'],
            ['Dirección', 'top-down (sin cortes)', 'bottom-up (todos)'],
            ['Optimización', 'directo', 'incremental'],
            ['Operación', 'divisor', 'mezclador'],
          ],
        },
      },
      {
        vs: [
          { t: 'División (top-down)', i: '✂', items: ['1 ordenar', '2 buscar corte', '3 dividir', '4 ¿parar? si no → 2'] },
          { t: 'Mezcla (bottom-up)', i: '⊕', items: ['1 ordenar', '2 mejor par adyacente', '3 fusionar', '4 ¿parar? si no → 2'] },
        ],
      },
      { ti: 'Taxonomía de Liu', demo: 'TaxonomiaDiscretizacion' },
      {
        ti: 'Cómo se comparan',
        tarjetas: [
          { i: '#', t: 'Nº de intervalos', s: 'cuantos menos mejor' },
          { i: '≠', t: 'Inconsistencia', s: 'mismas entradas, distinta clase' },
          { i: '✓', t: 'Capacidad predictiva', s: 'no debe bajar' },
          { i: '⏱', t: 'Tiempo', s: 'clave si es dinámica' },
        ],
      },
      {
        ti: '¿Cuál es mejor? No hay regla general',
        vs: [
          { t: 'Clásicos ganadores', c: 'si', items: ['[[chimerge|ChiMerge]]', '[[mdlp|MDLP]]', 'Distance', 'Chi2'] },
          { t: 'Nuevos prometedores', c: 'cat', items: ['Khiops', 'CAIM', 'MODL', 'Ameva', 'CACC'] },
          { t: 'Observaciones', items: ['inconsistencia: test < entrenamiento', 'depende del aprendiz', 'crítico con reglas'] },
        ],
      },
    ],
  },
  'no-supervisada': {
    bloques: [
      { ti: 'Ignoran la clase y son…', chips: ['binning', 'divisores', 'directos', 'estáticos'] },
      { ti: 'Cuidado con', tarjetas: [{ i: '★', t: 'Valores especiales', s: 'cajas propias' }, { i: 'intervalos', t: 'Cortes', s: 'interpretables' }, { i: 'k', t: 'Aridad', s: 'muy sensibles a k' }] },
    ],
  },
  'igual-amplitud': {
    entrada: 'continua', caja: 'blanca', devuelve: 'intervalos',
    fuertes: ['Trivial', 'Cortes legibles'],
    debiles: ['Cajas desequilibradas (salarios)', 'Outliers y aridad', 'Ignora la clase'],
    parametros: ['k'],
    weka: 'Discretize',
    formulas: [['Anchura', 'a = \\frac{\\max - \\min}{k}']],
    bloques: [
      { ti: 'Temperaturas, k = 7', barras: { series: [{ n: 'valores', c: 'num' }], filas: [{ e: '[64,67)', v: [2] }, { e: '[67,70)', v: [2] }, { e: '[70,73)', v: [4] }, { e: '[73,76)', v: [2] }, { e: '[76,79)', v: [0] }, { e: '[79,82)', v: [2] }, { e: '[82,85]', v: [2] }] } },
      { aviso: ['Salario: casi todo en [0, 200M)', '[1800M, 2000M] casi vacío → mejor igual frecuencia'] },
    ],
  },
  'igual-frecuencia': {
    entrada: 'continua', caja: 'blanca', devuelve: 'intervalos',
    fuertes: ['Cajas equilibradas', 'Sin cajas vacías'],
    debiles: ['Cortes poco legibles', 'Repetidos en cajas distintas', 'Ignora la clase'],
    parametros: ['k (N/k por caja)'],
    weka: 'Discretize (useEqualFrequency)',
    bloques: [{ ti: 'Temperaturas, 4 por caja', barras: { series: [{ n: 'valores', c: 'num' }], filas: [{ e: '[64 … 69]', v: [4] }, { e: '[70 … 72]', v: [4] }, { e: '[73 … 81]', v: [4] }, { e: '[83 … 85]', v: [2] }] } }],
  },
  supervisada: {
    bloques: [
      {
        matriz: {
          cab: ['', '[[mdlp|MDLP]] · Fayyad e Irani 1993', '[[chimerge|ChiMerge]] · Kerber 1992'],
          filas: [['Tipo', 'división · top-down', 'mezcla · bottom-up'], ['Mide', 'entropía / ganancia', 'χ² entre vecinos'], ['Para', 'umbral MDL (δ)', 'significancia + máx. intervalos']],
        },
      },
    ],
  },
  mdlp: {
    entrada: 'continua', caja: 'blanca', devuelve: 'intervalos',
    fuertes: ['Elige solo el nº de intervalos', 'Intervalos puros', 'De los mejores'],
    debiles: ['Necesita la clase', 'Más caro que binning'],
    parametros: ['ninguno: lo fija MDL'],
    weka: 'supervised Discretize',
    formulas: [
      ['Se acepta el corte T si', 'G(A,T;S) > \\frac{\\log_2(N-1)}{N} + \\frac{\\delta(A,T;S)}{N}'],
      ['Umbral', '\\delta = \\log_2(3^c-2) - [c\\,H(S) - c_1 H(S_1) - c_2 H(S_2)]'],
    ],
    bloques: [{ chips: ['c, c₁, c₂ = nº de clases en S, S₁, S₂', 'δ también es el criterio de parada'] }],
  },
  chimerge: {
    entrada: 'continua', caja: 'blanca', devuelve: 'intervalos',
    fuertes: ['Clásico ganador', 'Cortes con sentido estadístico'],
    debiles: ['Fijar significancia', 'Caro con muchos valores'],
    parametros: ['Significancia de χ²', 'Máx. de intervalos'],
    formulas: [['χ² de dos intervalos', '\\chi^2 = \\sum_{i=1}^{2}\\sum_{j=1}^{k} \\frac{(A_{ij}-E_{ij})^2}{E_{ij}},\\; E_{ij} = \\frac{R_i C_j}{N}']],
    bloques: [{ clave: 'χ² bajo = clases repartidas igual → se fusionan' }],
  },
};
