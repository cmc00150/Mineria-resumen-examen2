// Capa visual · Parte III: otras técnicas de clasificación (T7)

export const VISUAL3 = {
  probabilisticos: {
    formulas: [
      ['Bayes', 'P(Y\\mid X_1..X_n) = \\frac{P(X_1..X_n\\mid Y)\\,P(Y)}{P(X_1..X_n)}'],
      ['Hipótesis MAP', 'C(x) = \\arg\\max_y P(x_1..x_n\\mid y)\\,P(y)'],
    ],
    bloques: [
      {
        vs: [
          { t: 'Reglas / árboles nítidos', i: 'arbol', items: ['relaciones deterministas', 'devuelven una etiqueta'] },
          { t: 'Probabilísticos', i: 'probs', c: 'cat', items: ['incertidumbre natural', 'todas las variables a la vez (DPC)', 'devuelven una distribución'] },
        ],
      },
      {
        ti: 'Invertir en bolsa',
        barras: { series: [{ n: 'P(invertir)', c: 'si' }, { n: 'P(no invertir)', c: 'no' }], max: 1, filas: [{ e: 'P1', v: [0.9, 0.1] }, { e: 'P2', v: [0.52, 0.48] }] },
      },
      { clave: 'Un árbol diría «invertir» en los dos → repartir igual no es razonable' },
      { aviso: ['La DPC es inmanejable', 'El número de probabilidades crece enormemente incluso con n moderado → [[naive-bayes]]'] },
    ],
  },
  'naive-bayes': {
    entrada: 'mixta', caja: 'gris', devuelve: 'probs',
    fuertes: ['Competitivo', 'Solo aprende parámetros', 'Eficiente', 'Incremental (streams)', 'Fácil'],
    debiles: ['Independencia supuesta', 'Mal estimador de la probabilidad', 'No modela dependencias', 'Variables redundantes'],
    parametros: ['Laplace', 'Gaussiana o discretizar'],
    weka: 'NaiveBayes',
    avisos: [
      ['Fórmula de Laplace invertida en el PDF', 'Correcta: (n(xᵢ,cⱼ)+1)/(n(cⱼ)+Lᵢ).'],
      ['Ejemplo del tenis: P(no) ≈ 0,82, no 0,8', 'La línea de YES empieza por «P(NO)»; llama P(x|NO) a P(x,NO); μ humedad|no = 86,2 (no 86,6); el producto de NO es 4,90·10⁻⁵ (no 4,08·10⁻⁵).'],
    ],
    formulas: [
      ['Conjunta factorizada', 'P(x_1..x_n,y) = P(y)\\prod_i P(x_i\\mid y)'],
      ['MAP', 'C(x) = \\arg\\max_y P(y)\\prod_i P(x_i\\mid y)'],
      ['Discreta (EMV)', 'P(x_i\\mid c_j) = \\frac{n(x_i,c_j)}{n(c_j)}'],
      ['Laplace', 'P(x_i\\mid c_j) = \\frac{n(x_i,c_j)+1}{n(c_j)+L_i}'],
      ['Numérica', 'P(x\\mid c) = \\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}'],
    ],
    bloques: [
      { demo: 'EstrellaNB' },
      { clave: 'Funciona porque basta con que la clase correcta tenga la mayor probabilidad, aunque el valor no sea exacto' },
      { ti: 'Estimación', chips: ['P(Y) + n tablas P(Xᵢ|y)', 'una sola pasada', 'Laplace → uniforme con pocos datos, EMV con muchos'] },
      {
        ti: 'Tenis: μ y σ por clase',
        matriz: { cab: ['', 'temperatura', 'humedad'], filas: [['no', 'μ 74,6 · σ 7,89', 'μ 86,6* · σ 9,73'], ['sí', 'μ 73 · σ 6,16', 'μ 79,11 · σ 10,21']] },
      },
      {
        ti: 'x = (sunny, 87, 90, false)',
        matriz: {
          cab: ['', 'P(c)', 'P(sunny|c)', 'P(false|c)', 'N(87)', 'N(90)', 'producto'],
          filas: [['NO', '0,36', '0,6', '0,4', '0,014706', '0,038573', '4,08·10⁻⁵ (bien: 4,90·10⁻⁵)'], ['SÍ', '0,64', '0,22', '0,67', '0,004894', '0,022123', '1,02·10⁻⁵']],
        },
      },
      { cifras: [{ v: '0,8 / 0,2', t: 'normalizado (diapositiva) → no se juega', c: 'no' }] },
      { clave: 'Cómo se [[discretizacion|discretiza]] cambia mucho el acierto: iris 96 % (gaussiana) · 77 % (2 intervalos) · 94 % (3 intervalos) — detalle en «En Weka»' },
    ],
    wekaBloques: [
      {
        ti: 'Iris (150 registros, 4 atributos, 3 clases, 10-cv)',
        barras: { series: [{ n: '% acierto', c: 'cat' }], unidad: ' %', max: 100, filas: [{ e: 'Gaussiana', v: [96], d: true }, { e: 'Igual anchura, 2 int.', v: [77.33] }, { e: 'Igual anchura, 3 int.', v: [94] }] },
      },
      { chips: ['144/150 · 116/150 · 141/150 bien clasificados', 'Counts con total 52 / 53 = recuentos con Laplace', 'el nº de intervalos se eligió con un análisis exploratorio'] },
    ],
  },
  'redes-bayesianas': {
    entrada: 'discreta', caja: 'blanca', devuelve: 'probs',
    fuertes: ['Modela dependencias', 'Incertidumbre natural'],
    debiles: ['Aprendizaje estructural'],
    weka: 'BayesNet',
  },

  neuronales: {
    bloques: [
      { ti: 'La neurona biológica', flujo: [{ t: 'Dendritas', s: 'reciben' }, { t: 'Cuerpo', s: 'acumula; se activa al saturar' }, { t: 'Axón', s: 'canaliza' }, { t: 'Sinapsis', s: 'transmite' }] },
      { chips: ['paralelismo masivo', 'computación modular distribuida'] },
      {
        vs: [
          { t: 'Ventajas', c: 'si', items: ['gran acierto', 'robustas: datos incompletos o ambiguos', 'rápidas al predecir', 'visión, audio, series, lenguaje'] },
          { t: 'Desventajas', c: 'no', items: ['entrenamiento lento', 'caja negra', 'difícil meter conocimiento', 'sobreaprendizaje'] },
        ],
      },
      { ti: '¿Cuándo usarlas?', tarjetas: [{ i: '▦', t: 'Alta dimensión' }, { i: '≈', t: 'Datos con ruido' }, { i: '?', t: 'Función desconocida' }, { i: 'negra', t: 'Interpretar no importa' }] },
      {
        ti: 'Historia',
        linea: [
          { a: '1943', t: 'McCulloch-Pitts', c: 'cat' }, { a: '1949', t: 'Hebb' }, { a: '1958', t: 'Perceptrón (Rosenblatt)', c: 'cat' }, { a: '1959', t: 'ADALINE' },
          { a: '1962', t: 'Regla delta / LMS' }, { a: '1969', t: 'Límites del perceptrón (Minsky y Papert)' }, { a: '1972', t: 'Memorias asociativas' },
          { a: '1982', t: 'Hopfield · SOM (Kohonen)' }, { a: '1986', t: 'Backprop + MLP', c: 'cat' }, { a: '1988', t: 'Base radial' },
        ],
      },
    ],
  },
  'neurona-mcp': {
    entrada: 'continua', caja: 'blanca', devuelve: 'numero',
    fuertes: ['Base de todas las redes', 'Umbral = peso con entrada −1'],
    debiles: ['Solo separa linealmente'],
    parametros: ['pesos wⱼᵢ', 'umbral θⱼ', 'activación f'],
    formulas: [['Suma ponderada', 'Net_j = \\sum_i w_{ji}x_i'], ['Salida', 'y_j = f(Net_j - \\theta_j)']],
    bloques: [
      { ti: 'Signo del peso', tarjetas: [{ i: '+', t: 'Excitadora', c: 'si' }, { i: '−', t: 'Inhibidora', c: 'no' }, { i: '0', t: 'Sin conexión' }] },
      { ti: 'Activaciones', demo: 'Activaciones' },
    ],
  },
  perceptron: {
    entrada: 'continua', caja: 'blanca', devuelve: 'ecuacion',
    fuertes: ['Regla muy simple', 'Converge si es separable'],
    debiles: ['Solo fronteras lineales (no XOR)'],
    parametros: ['α = 0,2', 'umbral 0,5', 'pesos iniciales 0,1 y 0,3'],
    formulas: [['Corrección', 'W_i \\leftarrow W_i + \\alpha\\,D\\,X_i,\\quad D = Z - Y']],
    bloques: [{ ti: 'OR inclusivo', cifras: [{ v: '0,1 · 0,3', t: 'pesos iniciales' }, { v: '4', t: 'iteraciones' }, { v: '0,7 · 0,7', t: 'pesos finales', c: 'si' }, { v: '0,5 → 0', t: 'it. 3: no supera el umbral', c: 'no' }] }],
  },
  mlp: {
    entrada: 'continua', caja: 'negra', devuelve: 'red',
    fuertes: ['Funciones no lineales', 'Gran acierto', 'Rápida al clasificar', 'Regresión con 1 neurona'],
    debiles: ['Entrenamiento lento', 'Caja negra', 'Arquitectura difícil', 'Sobreaprendizaje', 'Sin conexiones hacia atrás'],
    parametros: ['capas ocultas', 'α', 'epochs'],
    weka: 'MultilayerPerceptron',
    avisos: [['Tⱼ es el valor deseado', 'La diapositiva dice «Tⱼ el valor predicho»; es el valor real/deseado y Oⱼ el que produce la red.']],
    formulas: [
      ['Error de salida', 'Err_j = O_j(1-O_j)(T_j - O_j)'],
      ['Error oculto', 'Err_j = O_j(1-O_j)\\sum_k Err_k\\,w_{jk}'],
      ['Actualización', 'w_{ij} \\mathrel{+}= \\alpha\\,Err_j\\,O_i \\quad \\theta_j \\mathrel{+}= \\alpha\\,Err_j'],
    ],
    bloques: [
      { ti: 'La arquitectura depende de', tarjetas: [{ i: '≡', t: 'Nº de capas', s: 'más capas → funciones más complejas' }, { i: '●●●', t: 'Neuronas por capa', s: 'las ocultas: difícil' }, { i: '⇄', t: 'Conexiones', s: 'anterior, previas o misma capa' }] },
      { chips: ['numéricos normalizados a [−1, 1]', '1 epoch = toda la BD', 'gradiente descendente'] },
      { ti: 'Regresión con CPU (100 epochs)', cifras: [{ v: '6,10 %', t: 'EMA' }, { v: '6,98 %', t: 'EAR', c: 'si' }] },
    ],
    wekaBloques: [
      {
        ti: 'Diseño de la red',
        matriz: {
          cab: ['Capa', 'Neuronas'],
          filas: [
            ['Entrada', '1 por numérica/binaria · 1 por **valor** si nominal > 2'],
            ['Salida', '1 por clase (probabilidad)'],
            ['Oculta', '0 = solo lineal · «4,3,5» = 3 capas · i · o · t = i+o · **a = t/2 (defecto)**'],
          ],
        },
      },
      { chips: ['BD lentes: capas ocultas 0 · a · t · «a,t»'] },
    ],
  },

  instancias: {
    bloques: [{ ti: 'Aparece en', tarjetas: [{ i: 'T3', t: 'Selección de prototipos', s: 'para mejorarlo' }, { i: 'T6', t: 'Top-10', s: 'kNN' }, { i: 'T7', t: 'Conclusiones', s: '«prototipos»' }, { i: 'T8', t: 'Regresión', s: 'media de vecinos' }] }],
  },
  knn: {
    entrada: 'continua', caja: 'gris', devuelve: 'ambas',
    fuertes: ['Sin entrenamiento', 'Fronteras de cualquier forma', 'Clasifica y hace regresión'],
    debiles: ['Predecir es caro', 'Ruido (k=1) y escala', 'Guarda todos los datos'],
    parametros: ['k', 'distancia', 'peso 1/d'],
    weka: 'IBk',
    formulas: [['Regresión', '\\hat v = \\tfrac{1}{k}\\sum v_i \\quad\\text{o}\\quad \\tfrac{\\sum w_i v_i}{\\sum w_i},\\; w_i = \\tfrac{1}{d}']],
    bloques: [
      {
        ti: 'CPU · 5-cv',
        barras: { series: [{ n: 'EMA', c: 'num' }, { n: 'EAR', c: 'concepto' }], unidad: ' %', filas: [{ e: '1-NN', v: [15.13, 17.31] }, { e: '5-NN', v: [17.53, 20.06] }, { e: '5-NN ponderado', v: [13.15, 15.04] }, { e: 'Red neuronal', v: [6.1, 6.98], d: true }] },
      },
    ],
  },

  multiclasificadores: {
    bloques: [
      { vs: [{ t: 'Tradicional', i: 'arbol', items: ['un predictor'] }, { t: 'Ensemble', i: 'comite', c: 'ambas', items: ['varios predictores base', 'votan (comité de expertos)', 'normalmente misma técnica', 'distintos ejemplos y/o variables'] }] },
      {
        matriz: {
          cab: ['', '[[bagging|Bagging]]', '[[adaboost|Boosting]]', '[[binarizacion|Binarización]]'],
          filas: [
            ['Modelos', 'independientes', 'secuenciales', '1 por subproblema'],
            ['Datos', 'bootstrap', 'pesos a los difíciles', 'pares / uno vs resto'],
            ['Combina', 'voto / media', 'voto con α', 'agregación'],
            ['Reduce', 'varianza', 'sesgo', 'complejidad'],
            ['Estrella', '[[random-forest]]', '[[adaboost]]', '[[svm]] (OVO)'],
          ],
        },
      },
      { demo: 'BaggingBoosting' },
    ],
  },
  bagging: {
    entrada: 'mixta', caja: 'negra', devuelve: 'comite',
    fuertes: ['Más precisión', 'Reduce la varianza', 'Ideal con árboles (inestables)', 'Paralelo'],
    debiles: ['Pierde interpretabilidad', 'Inútil con modelos estables', 'm veces más coste'],
    parametros: ['m modelos', 'algoritmo base', 'bolsa 100 %'],
    weka: 'Bagging',
    bloques: [
      { ti: 'Fuentes de error', tarjetas: [{ i: '≈', t: 'Ruido', s: 'en la función objetivo' }, { i: '↗', t: 'Sesgo', s: 'no puede aprenderla' }, { i: '↕', t: 'Varianza', s: 'por el muestreo', c: 'si' }] },
      { clave: 'Bagging ataca la **varianza** · fronteras de 4 árboles / 3 redes → combinación más suave' },
    ],
  },
  'random-forest': {
    entrada: 'mixta', caja: 'negra', devuelve: 'comite',
    fuertes: ['Árboles menos correlados', 'Top con boosting', 'Muy usado'],
    debiles: ['Difícil de interpretar', 'Vigilar sobreaprendizaje'],
    parametros: ['m = √p (clasif.)', 'm = p/3 o p/2 (regr.)', '½√p · 2√p', 'nº de árboles'],
    weka: 'RandomForest',
    bloques: [
      { cifras: [{ v: 'm = √p', t: 'clasificación' }, { v: 'p/3 · p/2', t: 'regresión' }, { v: 'm = p', t: '= bagging con árboles', c: 'cat' }] },
      { ti: 'Construcción', flujo: [{ t: 'Bootstrap' }, { t: 'm variables al azar', s: 'en cada nodo' }, { t: 'Mejor corte entre esas m' }, { t: 'Árbol entero sin podar' }, { i: 'comite', t: 'Voto / media' }] },
      { chips: ['Breiman 2001', 'gene expression: 15 clases, 500 variables'] },
    ],
  },
  adaboost: {
    entrada: 'mixta', caja: 'negra', devuelve: 'comite',
    fuertes: ['Rápido', 'Sencillo', 'Pocos parámetros', 'Cualquier algoritmo base', 'Efectivo', 'Multiclase y regresión'],
    debiles: ['Depende de datos y base', 'Base compleja → sobreajuste', 'Base simple → poca precisión'],
    parametros: ['T rondas', 'algoritmo base'],
    weka: 'AdaBoostM1',
    formulas: [
      ['Pesos iniciales', 'D_1(i) = 1/m'],
      ['Peso del clasificador', '\\alpha_t = \\tfrac12\\ln\\frac{1-\\epsilon_t}{\\epsilon_t}'],
      ['Nuevos pesos', 'D_{t+1}(i) = \\frac{D_t(i)\\,e^{-\\alpha_t y_i h_t(x_i)}}{Z_t}'],
      ['Final', 'H(x) = \\operatorname{sign}\\textstyle\\sum_t \\alpha_t h_t(x)'],
    ],
    bloques: [
      { chips: ['para si εₜ > 0,5', 'Zₜ normaliza', 'acierta → peso × e^(−α)', 'falla → peso × e^(α)'] },
      { ti: 'Ejemplo de las diapositivas', barras: { series: [{ n: 'ε', c: 'no' }, { n: 'α', c: 'si' }], max: 1, filas: [{ e: 'Ronda 1', v: [0.3, 0.42] }, { e: 'Ronda 2', v: [0.21, 0.65] }, { e: 'Ronda 3', v: [0.14, 0.92] }] } },
    ],
    wekaBloques: [{ chips: ['Bagging y AdaBoostM1 sobre nci.arff con C4.5 y 5-cv'] }],
  },
  binarizacion: {
    bloques: [
      { flujo: [{ i: 'cat', t: 'Multiclase' }, { t: 'Descomponer', s: 'divide y vencerás' }, { t: 'Clasificadores binarios' }, { t: 'Agregar' }, { i: 'cat', t: 'Clase final' }] },
      { matriz: { cab: ['', '[[ovo|OVO]]', '[[ova|OVA]]'], filas: [['Problemas', 'cada par de clases', 'cada clase vs resto'], ['Nº clasificadores', 'm(m−1)/2', 'm'], ['3 clases', '1-7 · 1-8 · 8-7', '7 · 1 · 8 vs resto']] } },
      { ti: 'Ventajas', chips: ['clasificadores más pequeños', 'fronteras más simples'] },
      { tarjetas: [{ i: '★', t: '[[svm|SVM]]', s: 'estado del arte · usa OVO' }, { i: 'comite', t: '[[random-forest]]', s: 'bagging de árboles, muy usado' }] },
      { demo: 'OvoOva' },
    ],
  },
  ovo: { entrada: 'mixta', caja: 'gris', devuelve: 'comite', fuertes: ['Pocas instancias por modelo', 'Fronteras simples', 'Lo usa SVM'], debiles: ['m(m−1)/2 modelos'], parametros: ['base', 'agregación'], bloques: [{ chips: ['pairwise learning', 'round robin', 'all-vs-all'] }] },
  ova: { entrada: 'mixta', caja: 'gris', devuelve: 'comite', fuertes: ['Solo m modelos'], debiles: ['Subproblemas desbalanceados', 'Todos los ejemplos en cada uno'], parametros: ['base'] },
  svm: { entrada: 'continua', caja: 'negra', devuelve: 'cat', fuertes: ['Estado del arte'], debiles: ['Caja negra', 'Binario de serie'], parametros: ['kernel', 'C'], weka: 'SMO' },
};
