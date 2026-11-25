// Capa visual · Parte IV (T8), conceptos y raíz

export const VISUAL4 = {
  mineria: {
    bloques: [
      {
        tarjetas: [
          { i: 'prep', t: '[[preparacion|Preparación]]', s: 'antes de aprender', c: 'prep' },
          { i: 'cat', t: '[[clasificacion|Clasificación]]', s: 'salida = clase', c: 'cat' },
          { i: 'num', t: '[[regresion|Regresión]]', s: 'salida = número', c: 'num' },
          { i: 'concepto', t: '[[conceptos|Conceptos]]', s: 'compartidos', c: 'concepto' },
        ],
      },
    ],
  },
  regresion: {
    formulas: [['Predecir un número', 'f(x_1, \\dots, x_n) \\to y \\in \\mathbb{R}']],
    bloques: [
      { chips: ['como clasificación, pero la salida es numérica', 'predictoras casi siempre numéricas', 'modelar la relación estado → control'] },
      {
        ti: 'Ejemplos',
        tarjetas: [
          { i: '⛽', t: 'Consumo de un coche', s: 'peso, cilindrada, potencia' },
          { i: '📦', t: 'Artículos del pedido' },
          { i: '🗓', t: 'Meses de un proyecto' },
          { i: '✉', t: 'Respuesta a publicidad', s: 'probabilidad' },
          { i: '🚑', t: 'Urgencias en Nochebuena' },
        ],
      },
      {
        ti: 'Ramas',
        tarjetas: [
          { i: '1-NN', t: '[[regresion-adaptados|Adaptados]]', s: 'kNN · redes', c: 'num' },
          { i: 'ecuacion', t: '[[analisis-regresion|Ecuación]]', s: 'lineal · exp. · múltiple', c: 'num' },
          { i: 'arbol', t: '[[arbol-regresion|Árbol de regresión]]', s: 'media en la hoja', c: 'num' },
          { i: 'regiones', t: '[[arbol-modelos|Árbol de modelos]]', s: 'recta en la hoja', c: 'num' },
          { i: 'reglas', t: '[[sbrd|Reglas difusas]]', s: 'SI X es Alto…', c: 'ambas' },
        ],
      },
      { clave: 'Validación: igual que en clasificación · cambia la [[metricas-regresion|medida de error]]' },
      {
        ti: 'CPU: EAR de cada método (menos es mejor)',
        barras: {
          series: [{ n: 'EAR', c: 'num' }],
          unidad: ' %',
          filas: [
            { e: 'Lineal múltiple', v: [39.26] },
            { e: 'Árbol de regresión', v: [20.74] },
            { e: '5-NN', v: [20.06] },
            { e: '1-NN', v: [17.31] },
            { e: '5-NN ponderado', v: [15.04] },
            { e: 'Árbol de modelos', v: [11.49] },
            { e: 'Red neuronal', v: [6.98], d: true },
          ],
        },
      },
    ],
  },
  'metricas-regresion': {
    formulas: [
      ['ECM', '\\tfrac1n\\sum (v_i - v\\prime_i)^2'],
      ['ECME (raíz)', '\\sqrt{\\tfrac1n\\sum (v_i - v\\prime_i)^2}'],
      ['EMA', '\\tfrac1n\\sum |v_i - v\\prime_i|'],
      ['EAR', '\\frac{\\sum |v_i - v\\prime_i|}{\\sum |v_i - \\bar v|}'],
      ['Correlación', 'r = \\frac{\\sum (v_i-\\bar v)(v\\prime_i - \\bar v\\prime)}{(n-1)\\,s_v\\,s_{v\\prime}}'],
    ],
    bloques: [
      { tarjetas: [{ i: '²', t: 'ECM', s: 'castiga errores grandes' }, { i: '√', t: 'ECME', s: 'unidades de la variable' }, { i: '|·|', t: 'EMA', s: 'error típico' }, { i: '÷', t: 'EAR', s: '< 100 % = mejor que la media' }, { i: 'r', t: 'Correlación', s: 'cerca de 1 = bien' }] },
      { demo: 'Metricas' },
    ],
  },
  'regresion-adaptados': {
    bloques: [
      { tarjetas: [{ i: '1-NN', t: '[[knn|kNN]]', s: 'media (o ponderada 1/d) de los vecinos' }, { i: 'red', t: '[[mlp|Red neuronal]]', s: '1 neurona de salida' }, { i: '+', t: 'Otros', s: '[[cart]] · [[random-forest]] · [[bagging]] · [[adaboost]]' }] },
      { ti: 'BD CPU (sin el fabricante)', chips: ['MYCT', 'MMIN', 'MMAX', 'CACH', 'CHMIN', 'CHMAX', '→ PRP (rendimiento)'] },
    ],
  },
  'analisis-regresion': {
    bloques: [
      { matriz: { cab: ['Modelo', 'Ecuación', 'Se estima con'], filas: [['[[regresion-lineal|Lineal]]', '$y = a + bx$', 'mínimos cuadrados'], ['[[regresion-exponencial|Exponencial]]', '$y = a e^{bx}$', 'logaritmos + lineal'], ['[[regresion-multiple|Múltiple]]', '$y = a + \\sum b_i x_i$', 'matrices e inversas']] } },
      { ti: 'Más complejas', chips: ['segmentada', 'logística'] },
    ],
  },
  'regresion-lineal': {
    entrada: 'continua', caja: 'blanca', devuelve: 'ecuacion',
    fuertes: ['Fórmula cerrada', 'Interpretable'],
    debiles: ['Solo relaciones lineales'],
    weka: 'SimpleLinearRegression',
    formulas: [['Pendiente', 'b = \\frac{\\sum (x_i-\\bar x)(y_i-\\bar y)}{\\sum (x_i-\\bar x)^2}'], ['Ordenada', 'a = \\bar y - b\\bar x']],
    bloques: [{ vs: [{ t: 'Nube recta', c: 'si', items: ['bastante apropiado'] }, { t: 'Nube curva', c: 'no', items: ['no tan apropiado → [[regresion-exponencial|exponencial]]'] }] }],
  },
  'regresion-exponencial': {
    entrada: 'continua', caja: 'blanca', devuelve: 'ecuacion',
    fuertes: ['Reutiliza la lineal', 'Crecimientos y caídas'],
    debiles: ['Solo y > 0', 'Minimiza en escala log'],
    formulas: [['Linealizar', '\\ln y = \\ln a + bx \\Rightarrow y^* = a^* + bx'], ['Deshacer', 'a = e^{a^*}']],
  },
  'regresion-multiple': {
    entrada: 'continua', caja: 'blanca', devuelve: 'ecuacion',
    fuertes: ['Cada coeficiente se interpreta', 'Rápida'],
    debiles: ['Un plano para todo: CPU EAR 39 %'],
    weka: 'LinearRegression',
    formulas: [['Modelo', 'y = a + b_1x_1 + \\dots + b_nx_n'], ['CPU', 'class = 0{,}066 MYCT + 0{,}0143 MMIN + 0{,}0066 MMAX + 0{,}4945 CACH - 0{,}1723 CHMIN + 1{,}2012 CHMAX - 66{,}4814']],
    bloques: [{ cifras: [{ v: '34,31 %', t: 'EAM' }, { v: '39,26 %', t: 'EAR', c: 'no' }] }],
  },
  'arbol-regresion': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'arbol',
    fuertes: ['Interpretable', 'No lineal por tramos', 'CPU: EAR 20,7 % vs 39,3 %'],
    debiles: ['Escalones → suavizado', 'Necesita poda'],
    parametros: ['poda', 'useUnsmoothed'],
    weka: 'M5P (buildRegressionTree) · REPTree',
    formulas: [['Reducción de la desviación', 'SDR = sd(T) - \\sum_i \\tfrac{|T_i|}{|T|}\\, sd(T_i)']],
    bloques: [
      { chips: ['hoja = media de sus ejemplos', 'se usa igual que un [[arboles|árbol de decisión]]', 'SDR ≈ [[ganancia-informacion]] con desviación'] },
      { ti: 'CPU · sin suavizar · poda = 1', cifras: [{ v: 'MMAX ≤ 14000', t: 'raíz' }, { v: '15 hojas', t: 'LM1 = 24,3 … LM15 = 971' }, { v: '18,13', t: 'EAM' }, { v: '20,74 %', t: 'EAR' }] },
    ],
  },
  'arbol-modelos': {
    entrada: 'continua', caja: 'blanca', devuelve: 'regiones',
    fuertes: ['CPU: EAR 11,5 %', '4 hojas en vez de 15'],
    debiles: ['Ecuaciones menos legibles'],
    parametros: ['poda', 'suavizado', 'mín. por hoja'],
    weka: 'M5P',
    bloques: [
      { demo: 'Modelos3D' },
      { ti: 'CPU · sin suavizar · poda = 0', pseudo: 'MMAX <= 14000 :\n|  CACH <= 8.5 : LM1 (108/3.99%)\n|  CACH >  8.5 : LM2 (33/3.89%)\nMMAX >  14000 :\n|  MMAX <= 22500 : LM3 (37/4.73%)\n|  MMAX >  22500 : LM4 (31/69.2%)\n\nLM1: class = 15.9 - 0.00453 MYCT + 0.00327 MMAX\nLM2: class = -0.609 + 0.004 MMAX + 0.59 CACH + 1.57 CHMIN\nLM3: class = 1.64 - 0.0266 MYCT + 0.00485 MMIN + 0.00346 MMAX\n             + 0.627 CACH + 1.43 CHMIN + 0.127 CHMAX\nLM4: class = -350 - 0.843 MYCT + 0.0183 MMAX + 1.62 CACH' },
      { cifras: [{ v: '10,04', t: 'EMR' }, { v: '11,49 %', t: 'EAR', c: 'si' }] },
    ],
  },
  sbrd: {
    entrada: 'continua', caja: 'blanca', devuelve: 'numero',
    fuertes: ['Interpretable (lingüístico)', 'Buen aproximador (preciso)', 'Modelado, control, clasificación'],
    debiles: ['Interpretable vs preciso', 'Muchas reglas'],
    parametros: ['etiquetas y pertenencia', 'reglas', 'factores de escala', 'inferencia y defuzzificación'],
    bloques: [
      { ti: 'Componentes', flujo: [{ i: 'continua', t: 'Fuzzificación', s: 'nítido → difuso' }, { i: 'reglas', t: 'Inferencia', s: 'base de reglas + base de datos' }, { i: 'numero', t: 'Defuzzificación', s: 'difuso → nítido' }] },
      { matriz: { cab: ['Pieza', 'Contiene'], filas: [['Base de datos', 'etiquetas, funciones de pertenencia, escalas'], ['Base de reglas', 'R1: X₁ Alto ∧ X₂ Bajo → Y Medio'], ['Base de conocimiento', 'las dos anteriores']] } },
      { demo: 'Difuso' },
      { vs: [{ t: 'Modelado lingüístico', items: ['poder **descriptivo**'] }, { t: 'Modelado preciso', items: ['poder **aproximativo**'] }] },
      { ti: 'Etiquetas típicas', chips: ['EB', 'MB', 'B', 'N', 'A', 'MA', 'EA'] },
      { ti: 'Aprendizaje', flujo: [{ i: 'datos', t: 'Datos del sistema' }, { t: 'Selección de características' }, { t: 'Aprendizaje del SBRD' }, { t: 'Mejora de la precisión' }] },
    ],
  },

  // ───────── Conceptos ─────────
  entropia: {
    formulas: [['Dos clases', 'I(p,n) = -\\tfrac{p}{p+n}\\log_2\\tfrac{p}{p+n} - \\tfrac{n}{p+n}\\log_2\\tfrac{n}{p+n}'], ['k clases', 'H(S) = -\\sum_i p_i \\log_2 p_i']],
    bloques: [
      { cifras: [{ v: '0', t: 'nodo puro' }, { v: '1 bit', t: 'dos clases al 50 %' }, { v: 'log₁₀', t: 'solo cambia la escala (alturas)', c: 'aviso' }] },
      { demo: 'CurvaEntropia' },
    ],
  },
  'ganancia-informacion': {
    formulas: [['Entropía esperada', 'E(A) = \\sum_i \\tfrac{p_i+n_i}{p+n} I(p_i,n_i)'], ['Ganancia', 'Gain(A) = I(p,n) - E(A)']],
    bloques: [{ clave: 'Se elige la mayor · sesgo: favorece atributos con muchos valores → [[ratio-ganancia]]' }],
  },
  'ratio-ganancia': {
    formulas: [['Ratio', 'GainRatio = \\frac{H(C) - H(C\\mid X)}{H(X)}']],
    bloques: [{ chips: ['denominador = información de la división', 'muchos trozos pequeños → denominador grande'] }],
  },
  gini: {
    formulas: [['Gini', 'gini(T) = 1 - \\sum_j p_j^2'], ['División', 'gini_{split} = \\tfrac{N_1}{N}gini(T_1) + \\tfrac{N_2}{N}gini(T_2)']],
    bloques: [{ cifras: [{ v: '0', t: 'puro' }, { v: '0,5', t: 'máximo con 2 clases' }, { v: 'mín.', t: 'se elige el menor gini_split', c: 'cat' }] }],
  },
  poda: {
    bloques: [
      { vs: [{ t: 'Pre-poda', items: ['decidir cuándo parar', 'poca confianza → no dividir', 'parar si sube el error de validación', 'riesgo: parar pronto'] }, { t: 'Post-poda (habitual)', c: 'si', items: ['construir y luego podar', 'reemplazar subárbol → hoja', 'elevar subárbol'] }] },
      { chips: ['también: mínimo de ejemplos por hoja'] },
      { demo: 'Sobreajuste' },
    ],
  },
  sobreajuste: {
    bloques: [{ ti: 'Dónde aparece', tarjetas: [{ i: 'arbol', t: 'Árboles grandes', s: '→ [[poda]]' }, { i: 'reglas', t: '[[prism|PRISM]]', s: 'reglas perfectas' }, { i: 'red', t: '[[mlp|Redes]] · [[random-forest|RF]]' }, { i: 'comite', t: '[[adaboost|AdaBoost]]', s: 'base compleja' }, { i: 'datos', t: 'Sobremuestreo', s: '→ [[smote]]' }] }],
  },
  bootstrap: {
    bloques: [
      { cifras: [{ v: 'n de n', t: 'con reemplazamiento' }, { v: '≈ 63,2 %', t: 'ejemplos distintos (1 − 1/e)', c: 'cat' }] },
      { flujo: [{ t: '[[muestreo-aleatorio|Muestreo T3]]' }, { t: '[[bagging]]' }, { t: '[[random-forest]]' }] },
      { demo: 'Bootstrap' },
    ],
  },
  'sesgo-varianza': {
    bloques: [
      { tarjetas: [{ i: '≈', t: 'Ruido', s: 'inevitable' }, { i: '↗', t: 'Sesgo', s: 'modelo demasiado simple' }, { i: '↕', t: 'Varianza', s: 'modelo inestable' }] },
      { vs: [{ t: '[[bagging]]', i: 'comite', items: ['baja la **varianza**'] }, { t: '[[adaboost|Boosting]]', i: 'comite', items: ['baja el **sesgo** de los débiles'] }] },
    ],
  },
  'filtro-envolvente': {
    bloques: [
      { vs: [{ t: 'Filtro', items: ['medida propia de los datos', 'rápido', 'ej. [[drop3]]'] }, { t: 'Envolvente (wrapper)', items: ['entrena el clasificador final', 'preciso y caro', 'ej. [[chc]]'] }] },
      { chips: ['selección de atributos (examen anterior)', '[[seleccion-prototipos|selección de prototipos]]'] },
    ],
  },
  'medida-f': {
    formulas: [['Medida F', 'F = \\frac{2VP}{2VP + FP + FN}']],
    bloques: [{ vs: [{ t: 'Exactitud s', c: 'no', items: ['1/1 gana a 19/20'] }, { t: 'Medida F', c: 'si', items: ['cuenta los FN', 'premia reglas generales'] }] }],
  },
  'confianza-soporte': {
    formulas: [['Confianza', '\\frac{tp}{tp+fp}'], ['Soporte', '\\frac{tp}{n_{clase}}']],
    bloques: [{ chips: ['PG: F = 0,7·conf + 0,3·sop', 'SI + C4.5 en Adult: 0,003 → 0,167'] }],
  },
  'logica-difusa': {
    bloques: [
      { demo: 'Pertenencia' },
      { ti: 'Aparece en', tarjetas: [{ i: 'reglas', t: '[[evolutivos|Reglas difusas]]', s: 'con grado de certeza' }, { i: 'arbol', t: '[[prog-genetica|PG]]', s: 'reglas DNF' }, { i: 'numero', t: '[[sbrd|SBRD]]', s: 'regresión' }] },
    ],
  },
  'validacion-cruzada': {
    bloques: [
      { flujo: [{ t: 'k partes' }, { t: 'entrenar con k−1' }, { t: 'probar con 1' }, { t: 'repetir k veces' }] },
      { chips: ['10-cv: Naïve Bayes con iris', '5-cv: nci (ensembles), CPU (regresión)', 'en regresión solo cambia la medida de error'] },
    ],
  },
  conceptos: { bloques: [{ clave: 'Cada concepto se explica una vez y enlaza a los algoritmos que lo usan' }] },
};
