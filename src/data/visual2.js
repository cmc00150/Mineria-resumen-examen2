// Capa visual · Parte II: clasificación basada en reglas (T6)

const CREDITO_ARBOL = [
  ['gastos = altos ∧ ingresos = bajos', 'NO'],
  ['gastos = altos ∧ ingresos = medios', 'NO'],
  ['gastos = altos ∧ ingresos = altos ∧ propietario = no', 'NO'],
  ['gastos = altos ∧ ingresos = altos ∧ propietario = sí', 'SÍ'],
  ['gastos = bajos ∧ propietario = no', 'NO'],
  ['gastos = bajos ∧ propietario = sí', 'SÍ'],
];

export const VISUAL2 = {
  clasificacion: {
    formulas: [['Clasificador', 'C(x): X_1 \\times \\dots \\times X_n \\to \\{c_1, \\dots, c_k\\}']],
    bloques: [
      { clave: 'El problema más estudiado en minería de datos · si la salida es un número → [[regresion]]' },
      {
        ti: 'Ramas',
        tarjetas: [
          { i: 'reglas', t: '[[referencia|Referencia]]', s: '0R · 1R', c: 'cat' },
          { i: 'arbol', t: '[[reglas|Basados en reglas]]', s: 'caja blanca · T6', c: 'cat' },
          { i: 'probs', t: '[[probabilisticos|Bayesianos]]', s: 'probabilidad por clase · T7', c: 'cat' },
          { i: 'red', t: '[[neuronales|Redes neuronales]]', s: 'caja negra · T7', c: 'ambas' },
          { i: '1-NN', t: '[[instancias|Basados en instancias]]', s: 'prototipos · T3/T7', c: 'ambas' },
          { i: 'comite', t: '[[multiclasificadores|Multiclasificadores]]', s: 'comité que vota · T7', c: 'ambas' },
        ],
      },
      {
        ti: 'Conclusiones del T7: tres grupos',
        vs: [
          { t: 'Basados en reglas', i: 'blanca', c: 'si', items: ['interpretables'] },
          { t: 'Prototipos', i: 'gris', items: ['basados en instancias'] },
          { t: 'Caja negra', i: 'negra', c: 'no', items: ['redes, SVM…', 'buscan aproximar'] },
        ],
      },
      { ti: 'Problemas abiertos', chips: ['Multi-label (MLC)', 'Multi-instance (MIL)', 'Semi-supervisado (SSL)', 'Clasificación monotónica', 'Label ranking', 'Datos imperfectos: ruido, perdidos', 'Complejidad de los datos', 'Big Data'] },
    ],
  },
  referencia: {
    bloques: [
      {
        vs: [
          { t: '[[zeror|ZeroR]]', i: 'cat', items: ['siempre la mayoritaria', 'árbol de 1 hoja'] },
          { t: '[[oner|1R]]', i: 'reglas', items: ['el mejor atributo solo', 'árbol de 1 nivel'] },
        ],
      },
      { clave: 'Línea base: todo algoritmo debe superarlos · entraron en el examen anterior' },
    ],
  },
  zeror: {
    entrada: 'discreta', caja: 'blanca', devuelve: 'cat',
    fuertes: ['Línea base', 'Instantáneo'],
    debiles: ['No usa atributos', 'Engaña con clases desiguales'],
    weka: 'ZeroR',
    bloques: [{ ti: 'Datos de crédito', cifras: [{ v: '8 NO · 2 SÍ', t: 'clases' }, { v: '80 %', t: 'acierto prediciendo siempre NO', c: 'cat' }] }],
  },
  oner: {
    entrada: 'discreta', caja: 'blanca', devuelve: 'reglas',
    fuertes: ['Simple y competitivo (Holte 1993)', 'Interpretable'],
    debiles: ['Un solo atributo', 'Sesgo: muchos valores'],
    parametros: ['tamaño mínimo de intervalo'],
    weka: 'OneR',
    wekaBloques: [{ chips: ['minBucketSize = tamaño mínimo de cada intervalo al discretizar'] }],
    bloques: [
      {
        ti: 'Aparece dos veces',
        tarjetas: [
          { i: 'T6', t: '[[cobertura|Cobertura]]', s: 'reglas = árbol de 1 nivel' },
          { i: 'T4', t: '[[supervisada|Discretización supervisada]]', s: 'binning supervisado' },
        ],
      },
      { ti: 'Como discretizador (si el atributo es numérico)', demo: 'OneRDisc' },
    ],
  },
  reglas: {
    bloques: [
      { ti: 'Una regla', flujo: [{ t: 'SI', s: 'antecedente (verdadero/falso)' }, { t: 'ENTONCES', s: 'consecuente = clase' }] },
      {
        ti: 'Árbol ≠ conjunto de reglas',
        vs: [
          { t: 'Árbol', i: 'arbol', items: ['orden implícito de atributos', 'mira todas las clases'] },
          { t: 'Reglas', i: 'reglas', items: ['sin orden (en general)', 'una clase cada vez'] },
        ],
      },
      {
        ti: 'Cuatro formas de obtenerlas',
        matriz: {
          cab: ['Línea', 'Elige', 'Ejemplos'],
          filas: [
            ['[[arboles|Árboles]]', 'mejor **atributo**', '[[id3]] · [[c45]] · [[cart]]'],
            ['[[reglas-arbol|Desde árbol]]', 'camino raíz → hoja', 'SBR · [[listas-decision]]'],
            ['[[cobertura|Cobertura]]', 'mejor **par atributo = valor**', '[[oner|1R]] · [[prism]]'],
            ['[[evolutivos|Evolutivos]]', 'algoritmo genético', '[[pittsburgh]] · [[michigan]] · [[prog-genetica|PG]]'],
          ],
        },
      },
    ],
  },
  arboles: {
    entrada: 'discreta', caja: 'blanca', devuelve: 'arbol',
    fuertes: ['Fáciles y eficientes', 'Reglas interpretables', 'Escalan bien', 'Toleran el ruido'],
    debiles: ['Continuos: difícil', 'Solo cortes rectangulares', 'Valores perdidos', 'Sobreaprendizaje', 'No ven correlaciones'],
    formulas: [['Mejor atributo', 'X^* = \\arg\\max_X \\big(H(C) - H(C\\mid X)\\big)']],
    bloques: [
      { ti: 'Cómo se lee: clasificar un día', demo: 'ArbolTenis' },
      { chips: ['nodo = prueba sobre un atributo', 'rama = un valor del atributo', 'hoja = clase predicha', 'camino raíz → hoja = una regla', 'caso más simple: [[zeror]] = solo una hoja'] },
      {
        ti: 'Ciclo de vida',
        flujo: [
          { i: 'datos', t: 'Datos', s: '[[discretizacion|discretizar]] continuos' },
          { i: 'arbol', t: '[[tdidt|Construir]]', s: 'divide y vencerás con un [[criterios-division|criterio de división]]' },
          { i: 'arbol', t: 'Parar antes', s: 'pre-[[poda]]' },
          { i: 'arbol-podado', t: 'Recortar', s: 'post-[[poda]]: quitar ruido' },
          { i: 'reglas', t: '[[reglas-arbol|Reglas]]', s: 'un camino = una regla' },
        ],
      },
      {
        ti: 'Los árboles del temario',
        matriz: {
          cab: ['', 'Criterio de división', 'Ramas', 'Poda', 'Datos', 'Hoja'],
          filas: [
            ['[[tdidt]]', 'cualquiera (es el esquema)', '—', '—', '—', '—'],
            ['[[id3]]', 'ganancia', 'una por valor', 'no', 'discretos', 'clase'],
            ['[[c45]]', 'ratio de ganancia', '2 (≤θ / >θ) o varias', 'pre y post', 'continuos, perdidos', 'clase'],
            ['[[cart]]', 'Gini (mínimo)', 'siempre 2', 'coste-complejidad', 'mixtos', 'clase o número'],
            ['[[arbol-regresion|Árb. regresión]]', 'SDR', '2 (cortes)', 'sí', 'numéricos', 'media'],
            ['[[arbol-modelos|Árb. modelos]]', 'SDR', '2 (cortes)', 'más fuerte', 'numéricos', 'ecuación lineal'],
          ],
        },
      },
      { clave: 'Se agrupan por cómo miden el desorden: entropía (ID3, C4.5) · Gini (CART) · desviación típica (regresión) → [[criterios-division]]. Mejor árbol: más acierto y menos complejo (navaja de Occam).' },
      { ti: 'Cómo parten el espacio', demo: 'ParticionEspacio' },
      { clave: 'Los cortes son paralelos a los ejes: una frontera diagonal se aproxima con una escalera de cortes. Solución: árboles oblicuos o variables construidas.' },
      {
        ti: 'Crédito: el orden de los atributos cambia el árbol',
        barras: { series: [{ n: 'reglas', c: 'cat' }, { n: 'premisas por regla', c: 'concepto' }], filas: [{ e: '1.º árbol', v: [6, 2.33], d: true }, { e: '2.º árbol', v: [8, 2.5] }, { e: '3.º árbol', v: [6, 2.5] }] },
      },
    ],
  },
  'criterios-division': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'arbol',
    bloques: [
      { clave: 'Todos responden a la misma pregunta: **¿cuánto se ordena la clase si divido por este atributo?** = desorden antes − desorden medio de las ramas. Solo cambia cómo se mide el desorden.' },
      { demo: 'Impureza' },
      {
        ti: 'Las fórmulas',
        formulas: [
          ['Entropía de un nodo', 'H(S) = -\\sum_i p_i \\log_2 p_i'],
          ['Ganancia · ID3', 'G(S,A) = H(S) - \\sum_v \\tfrac{|S_v|}{|S|}\\, H(S_v)'],
          ['Ratio de ganancia · C4.5', '\\text{ratio}(S,A) = \\dfrac{G(S,A)}{-\\sum_v \\tfrac{|S_v|}{|S|}\\log_2 \\tfrac{|S_v|}{|S|}}'],
          ['Gini de un nodo · CART', 'gini(T) = 1 - \\sum_j p_j^2'],
          ['Gini de la división · CART', 'gini_{split} = \\sum_i \\tfrac{N_i}{N}\\, gini(T_i)'],
          ['SDR · árboles de regresión', 'SDR = sd(T) - \\sum_i \\tfrac{|T_i|}{|T|}\\, sd(T_i)'],
        ],
      },
      {
        matriz: {
          cab: ['', 'Desorden de un nodo', 'Se elige', 'Ventaja', 'Problema'],
          filas: [
            ['Ganancia · [[id3]]', 'entropía', 'la mayor', 'se mide en bits', 'favorece atributos con muchos valores (un identificador gana siempre)'],
            ['Ratio · [[c45]]', 'ganancia ÷ información de la división', 'el mayor, entre los de ganancia ≥ media', 'penaliza muchas ramas pequeñas', 'si la información de la división ≈ 0 el ratio se dispara → filtro de la media'],
            ['Gini · [[cart]]', '1 − Σ p²', 'el menor gini_split', 'sin logaritmos', 'con 2 ramas hay que probar todas las agrupaciones'],
            ['SDR · [[arbol-regresion|regresión]]', 'desviación típica', 'el mayor', 'objetivo numérico', '—'],
          ],
        },
      },
    ],
  },
  tdidt: {
    entrada: 'discreta', caja: 'blanca', devuelve: 'arbol',
    fuertes: ['Esquema común a todos', 'Voraz → rápido'],
    debiles: ['No garantiza el mejor árbol', 'Depende de la medida'],
    parametros: ['Medida para elegir atributo'],
    bloques: [
      { ti: 'Paradas', tarjetas: [{ i: '■', t: 'Una sola clase', s: 'o casi' }, { i: '∅', t: 'Sin atributos', s: 'voto mayoritario' }, { i: '0', t: 'Sin ejemplos' }] },
    ],
  },
  id3: {
    entrada: 'discreta', caja: 'blanca', devuelve: 'arbol',
    fuertes: ['Hipótesis completas', 'Usa todos los ejemplos a la vez', 'Tolera ruido', 'Prefiere árboles cortos'],
    debiles: ['Una sola hipótesis', 'No propone ejemplos', 'Sin vuelta atrás: óptimo local', 'Sesgo: atributos con muchos valores', 'Sin continuos, perdidos ni poda'],
    weka: 'Id3',
    avisos: [['Ejemplo de alturas en log₁₀', 'El ejemplo de alturas usa logaritmo en base 10: por eso H(S) = 0,4384 (en base 2 saldría 1,456). El procedimiento es el mismo.']],
    formulas: [
      ['Entropía', 'H(S) = -\\sum_{i} p_i \\log_2 p_i'],
      ['Ganancia', 'G(S,A) = H(S) - \\sum_{v} \\tfrac{|S_v|}{|S|} H(S_v)'],
    ],
    bloques: [
      { clave: 'Es [[tdidt]] con la **ganancia** como medida (cómo se calcula: [[criterios-division]]). Una rama por cada valor, solo atributos discretos y sin poda.' },
      {
        ti: 'Su sesgo: ¿género o altura? (alturas, diapositivas)',
        barras: { series: [{ n: 'ganancia (log₁₀)', c: 'cat' }], filas: [{ e: 'género · 2 valores', v: [0.0969] }, { e: 'altura · 6 rangos', v: [0.3983], d: true }] },
      },
      { clave: 'ID3 elige la altura: con más valores, cada rama tiene menos ejemplos y queda más pura. Llevado al extremo, un identificador sería el «mejor» atributo. Pruébalo abajo con «Tenis + columna día»; [[c45]] lo corrige con el ratio.' },
      { ti: 'Refinamientos (→ C4.5)', chips: ['cuándo parar', 'atributos continuos', 'otras medidas', 'atributos con coste', 'ejemplos incompletos'] },
    ],
  },
  c45: {
    entrada: 'mixta', caja: 'blanca', devuelve: 'arbol-podado',
    fuertes: ['Continuos y perdidos', 'Corrige el sesgo de ID3', 'Pre y post-poda', 'N.º 1 del top-10'],
    debiles: ['Cortes paralelos a los ejes', 'Inestable'],
    parametros: ['Confianza de poda', 'Mín. ejemplos por hoja'],
    weka: 'J48',
    avisos: [['Ratio de alturas: /13 → /15', 'La diapositiva calcula H(2/13, 2/13, 3/13, 4/13, 2/13), pero la altura tiene 6 rangos con 2, 2, 3, 4, 2 y 2 personas: debe ser H(2/15, 2/15, 3/15, 4/15, 2/15, 2/15). Y el último término pone log(13/3) en vez de log(13/2).']],
    formulas: [
      ['Ratio de ganancia', 'GainRatio(S,A) = \\dfrac{G(S,A)}{H\\big(\\tfrac{|S_1|}{|S|},\\dots,\\tfrac{|S_v|}{|S|}\\big)}'],
      ['Corte numérico', 'x \\le \\theta \\;\\text{ o }\\; x > \\theta,\\quad \\theta = \\arg\\max G'],
    ],
    infografia: 'InfoC45',
    bloques: [
      { ti: 'Familia', chips: ['C4.5', 'C4.5 sin poda', 'C4.5-reglas', 'comercial: See5 / C5.0'] },
      {
        ti: 'Tests en los nodos',
        tarjetas: [{ i: '⇄', t: 'Booleana', s: '2 ramas' }, { i: '⋔', t: 'Categórica', s: 'varias (se agrupan las de igual clase)' }, { i: '≤θ', t: 'Numérica', s: '2 ramas' }],
      },
      { ti: 'Para cuando', chips: ['sin variables o ejemplos', 'una sola clase', 'pocos ejemplos (umbral)'] },
      { ti: 'Umbral para un atributo continuo', demo: 'UmbralC45' },
      { ti: 'Umbral', chips: ['ordenar valores', 'probar cada xᵢ (i ≥ 2)', 'solo donde cambia la clase', 'el atributo puede repetirse más abajo', 'la discretización no se propaga'] },
      { ti: 'Hoja', chips: ['clase mayoritaria de la rama'] },
      { ti: 'Poda', vs: [{ t: 'Pre-poda', items: ['poca confianza → no dividir', 'parar si sube el error de validación'] }, { t: 'Post-poda (preferida)', c: 'si', items: ['reemplazar subárbol por hoja', 'elevar subárbol', 'mín. 2 ejemplos por hoja'] }] },
    ],
  },
  cart: {
    entrada: 'mixta', caja: 'blanca', devuelve: 'arbol-binario',
    fuertes: ['Clasifica y hace regresión', 'Gini: sin logaritmos'],
    debiles: ['Enumera todas las divisiones', 'Cortes paralelos a los ejes'],
    parametros: ['Profundidad', 'Poda coste-complejidad'],
    weka: 'SimpleCart',
    formulas: [
      ['Gini', 'gini(T) = 1 - \\sum_j p_j^2'],
      ['Gini de la división', 'gini_{split} = \\tfrac{N_1}{N} gini(T_1) + \\tfrac{N_2}{N} gini(T_2)'],
    ],
    bloques: [
      { clave: 'Se elige el **menor** gini_split · Breiman, Friedman, Olshen y Stone, 1984' },
      { chips: ['divisiones siempre binarias', 'un atributo categórico con k valores → 2^(k−1) − 1 particiones'] },
    ],
  },
  'reglas-arbol': {
    entrada: 'discreta', caja: 'blanca', devuelve: 'reglas',
    fuertes: ['Más legibles que un árbol grande', 'Cubren todo el espacio'],
    debiles: ['Una regla por hoja', 'Premisas repetidas'],
    weka: 'PART',
    bloques: [
      { ti: 'Crédito', reglas: CREDITO_ARBOL },
      { ti: 'Tenis', reglas: [['soleado ∧ humedad alta', 'no'], ['soleado ∧ humedad normal', 'sí'], ['nublado', 'sí'], ['lluvioso ∧ viento fuerte', 'no'], ['lluvioso ∧ viento débil', 'sí']] },
    ],
  },
  'listas-decision': {
    entrada: 'discreta', caja: 'blanca', devuelve: 'lista',
    fuertes: ['Muy compactas', 'No particionan todo el espacio'],
    debiles: ['Cada regla depende de las anteriores'],
    bloques: [
      { ti: 'Crédito (ordenadas)', reglas: [['gastos = altos ∧ ingresos = altos ∧ propietario = sí', 'SÍ'], ['gastos = bajos ∧ propietario = sí', 'SÍ'], [null, 'NO']] },
      { ti: 'Círculos y cuadrados', reglas: [['X = A', 'círculo'], ['X = B ∧ Y = A', 'círculo'], ['X = C ∧ Y = C', 'círculo'], [null, 'cuadrado']] },
      { clave: 'Buscan reglas que cubran el máximo de positivos (o mínimo de negativos)' },
    ],
  },
  cobertura: {
    bloques: [
      { vs: [{ t: 'Árboles', i: 'arbol', items: ['mejor **atributo**', 'todas las clases a la vez'] }, { t: 'Cobertura', i: 'reglas', c: 'cat', items: ['mejor **atributo = valor**', 'reglas que cubren **una** clase'] }] },
      { ti: 'SI ???? ENTONCES alto', chips: ['rellenar ???? con el predicado de mayor probabilidad de «alto»'] },
      { tarjetas: [{ i: 'reglas', t: '[[oner|1R]]', s: 'árbol de 1 nivel' }, { i: 'reglas', t: '[[prism|PRISM]]', s: 'todas las reglas de cada clase' }, { i: '+', t: 'Más avanzados', s: 'RIPPER (Weka: JRip)' }] },
    ],
  },
  prism: {
    entrada: 'discreta', caja: 'blanca', devuelve: 'reglas',
    fuertes: ['Reglas interpretables', 'Entrenamiento perfecto si no hay inconsistencias'],
    debiles: ['Voraz: no garantiza el óptimo', 'Sobreajusta: 1/1 > 19/20', 'Sin numéricos (versión básica)'],
    parametros: ['s = p/t o medida F', 'Regla por defecto'],
    weka: 'Prism',
    avisos: [
      ['Los datos no son los del árbol', 'En PRISM el segundo SÍ es (ingresos altos, propietario sí, gastos bajos); en el árbol de TDIDT es con gastos altos.'],
      ['Empate 1/1 vs 2/2', 'Al refinar, propietario = sí ∧ ingresos = altos (1/1) y ∧ gastos = bajos (2/2) empatan con s. La diapositiva elige la primera; con la medida F ganaría la segunda, más general.'],
    ],
    formulas: [['Exactitud', 's = \\frac{p}{t}'], ['Medida F', 'F = \\frac{2VP}{2VP + FP + FN}']],
    bloques: [
      { ti: 'Primer paso (clase SÍ)', barras: { series: [{ n: 's', c: 'cat' }], max: 1, filas: [{ e: 'ingresos = altos (1/3)', v: [0.33] }, { e: 'ingresos = medios (1/4)', v: [0.25] }, { e: 'ingresos = bajos (0/3)', v: [0] }, { e: 'propietario = sí (2/4)', v: [0.5], d: true }, { e: 'propietario = no (0/6)', v: [0] }, { e: 'gastos = altos (0/5)', v: [0] }, { e: 'gastos = bajos (2/5)', v: [0.4] }] } },
      { ti: 'Conjunto final de la diapositiva', reglas: [['propietario = sí ∧ ingresos = altos', 'SÍ'], ['propietario = sí ∧ gastos = bajos', 'SÍ'], ['propietario = no', 'NO'], ['ingresos = bajos', 'NO'], ['ingresos = medios ∧ gastos = altos', 'NO']] },
      { ti: 'Con regla por defecto', reglas: [['propietario = sí ∧ ingresos = altos', 'SÍ'], ['propietario = sí ∧ gastos = bajos', 'SÍ'], [null, 'NO']] },
    ],
  },
  evolutivos: {
    bloques: [
      { ti: 'Qué codifica el cromosoma', vs: [{ t: 'Clasificación', i: 'cat', items: ['SI condición → Cᵢ'] }, { t: 'Asociación', i: '🛒', items: ['SI pañales → cerveza'] }] },
      {
        ti: 'Tipos de reglas',
        formulas: [
          ['Intervalares', 'x_1 \\in [a_1,b_1] \\wedge \\dots \\Rightarrow C_i'],
          ['Difusas (MP P M G MG)', 'x_1 \\text{ es } M \\wedge \\dots \\Rightarrow C_i \\text{ con certeza } r_i'],
        ],
      },
      {
        ti: 'Dos enfoques',
        matriz: {
          cab: ['', 'Cromosoma = base de reglas', 'Cromosoma = regla'],
          filas: [
            ['Modelos', '[[pittsburgh]]', '[[michigan]] · [[irl]] · [[coop-competitivo]]'],
            ['Interacción entre reglas', '✓ natural', '✗ mecanismo extra'],
            ['Operadores', 'complejos', 'simples'],
          ],
        },
      },
      { ti: 'Mejores reglas ≠ mejor conjunto', demo: 'Solapamiento' },
      { chips: ['regla por defecto con la clase mayoritaria → no hace falta cubrir el 100 %'] },
      {
        ti: 'Qué se codifica',
        vs: [
          { t: 'Antecedente + consecuente', items: ['cuidado al cruzar clases distintas', 'consecuente que maximiza el fitness'] },
          { t: 'Solo antecedente', items: ['un AG por clase', 'independientes → redundancia y solapes', 'o quitar los cubiertos'] },
        ],
      },
      {
        ti: 'Codificaciones',
        tarjetas: [
          { i: '0101', t: 'Binaria', s: '1 bit por valor · DNF · todo 0 = no interviene' },
          { i: '2 0 1', t: 'Entera', s: '1 gen por variable · 0 = no interviene' },
          { i: '2 6 9', t: 'Lingüística', s: 'error Cero ∧ var. Positiva → potencia Alta' },
          { i: '[a,b]', t: 'Intervalar (Pitt)', s: 'L = m(2n+1) · a > b = no interviene' },
          { i: 'var op val', t: 'Con operadores', s: 'bit «activo» o longitud variable' },
        ],
      },
      { chips: ['continuas: discretizar', 'lingüísticas/difusas', 'intervalos', 'umbral + operador'] },
      { ti: 'Pruébalo', demo: 'Codificacion' },
      {
        ti: 'Operadores específicos',
        tarjetas: [{ i: '∪', t: 'Cruce de generalización' }, { i: '∩', t: 'Cruce de especialización' }, { i: '±', t: 'Mutación gen./esp.' }, { i: '+/−', t: 'Insertar / quitar condición' }],
      },
      {
        ti: 'Ejemplo de cruce',
        matriz: {
          cab: ['', 'Género', 'Empleo', 'Salario'],
          filas: [
            ['Padre 1', 'hombre', 'no', '< 40 000'],
            ['Padre 2', 'mujer', 'sí', '> 30 000'],
            ['Generalización', 'igual', 'cualquiera', 'cualquiera'],
            ['Especialización', 'igual', 'el del otro padre', '30 000 – 40 000'],
          ],
        },
      },
    ],
  },
  pittsburgh: { entrada: 'mixta', caja: 'blanca', devuelve: 'reglas', fuertes: ['Interacción natural', 'Fitness del conjunto'], debiles: ['Cromosomas largos', 'Coste alto'], parametros: ['m reglas', 'L = m(2n+1)'] },
  michigan: { entrada: 'mixta', caja: 'blanca', devuelve: 'reglas', fuertes: ['Operadores simples', 'En línea'], debiles: ['Medir cada regla es difícil'], parametros: ['Refuerzo'] },
  irl: { entrada: 'mixta', caja: 'blanca', devuelve: 'reglas', fuertes: ['Operadores simples', 'Como la cobertura'], debiles: ['Muchas ejecuciones', 'Sin control del conjunto'], parametros: ['Diversidad fenotípica o genotípica'] },
  'coop-competitivo': { entrada: 'mixta', caja: 'blanca', devuelve: 'reglas', fuertes: ['Una ejecución, reglas diversas'], debiles: ['Necesita competición de tokens'], parametros: ['Fitness por regla', 'Fitness global'] },
  'prog-genetica': {
    entrada: 'mixta', caja: 'blanca', devuelve: 'reglas',
    fuertes: ['Forma y tamaño libres', 'Gramática → reglas válidas', 'Reglas DNF expresivas'],
    debiles: ['Árboles que crecen sin control', 'Costoso'],
    parametros: ['α = 0,7', 'Pesos Wᵢ', 'Prob. de los 4 operadores', 'Torneo de 2'],
    formulas: [
      ['Fitness de una regla', 'F = 0{,}7\\,confianza + 0{,}3\\,soporte'],
      ['Confianza y soporte', 'conf = \\tfrac{tp}{tp+fp} \\quad sop = \\tfrac{tp}{n_{clase}}'],
      ['Fitness global', 'W_1\\%Tra + W_2(1-\\#V) + W_3(1-\\#C) + W_4(1-\\#R)'],
      ['Competición', 'F_{mod} = F \\cdot \\tfrac{conseguidos}{cubiertos}'],
    ],
    bloques: [
      { ti: 'Credit scoring: solo se busca el antecedente', demo: 'ArbolExpresion' },
      { vs: [{ t: 'AG · EE · PE', items: ['cromosoma lineal', 'bits, enteros, reales, permutaciones', 'tamaño fijo'] }, { t: 'Programación genética', c: 'cat', items: ['árbol (no lineal)', 'varía en profundidad y anchura', 'gramática libre de contexto'] }] },
      { ti: 'Gramática (reglas difusas DNF)', pseudo: 'comienzo        → [Si] antec [entonces] consec.\nantec           → descriptor1 [y] descriptor2.\ndescriptor1     → [nada] | [X1 es] etiqueta.\ndescriptor2     → [nada] | [X2 es] etiqueta.\netiqueta        → B | M | A | B o M | B o A | M o A | B o M o A\nconsec          → [Clase es] descriptorClase.\ndescriptorClase → C1 | C2 | C3' },
      { chips: ['regla tipo 1: «X₁ es Alto o Medio ∧ X₂ es Bajo → C1 (0,75)»', 'tipo 2: para ejemplos sin cubrir', 'se guarda la mejor población de toda la evolución'] },
      { ti: 'Competición de tokens', demo: 'Tokens' },
      { tarjetas: [{ i: '✂', t: 'Cruce', s: '2 cortes · 1 hijo' }, { i: '±', t: 'Mutación', s: 'añadir / quitar / cambiar etiqueta' }, { i: '+', t: 'Inserción', s: 'nueva variable' }, { i: '−', t: 'Dropping condition', s: 'quita variable' }] },
    ],
  },
};
