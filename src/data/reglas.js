// PARTE II · Clasificación basada en reglas (Tema 6) + raíz de la clasificación

export const reglas = [
  {
    id: 'clasificacion',
    nombre: 'Clasificación',
    padre: 'mineria',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T6 · T7',
    parte: 2,
    resumen: 'Aprender una función f(X₁,…,Xₙ) → C que asigna a cada ejemplo una clase (valor categórico).',
    secciones: [
      {
        t: 'El problema',
        b: [
          'Tenemos atributos de entrada $X_1, \\dots, X_n$ y una variable de clase $Y$ con dominio $\\{c_1, \\dots, c_k\\}$. Un clasificador es una hipótesis $C(x): X_1 \\times \\dots \\times X_n \\to \\{c_1,\\dots,c_k\\}$.',
          'La clasificación es **el tipo de problema más estudiado en minería de datos**. Si la salida fuera un número, sería [[regresion]].',
        ],
      },
      {
        t: 'Las ramas',
        b: [
          'Existen muchas aproximaciones con buenos resultados; se eligen según el tipo de modelo que queremos obtener:',
          {
            tabla: {
              cab: ['Rama', 'Qué modelo da', 'Interpretable', 'Tema'],
              filas: [
                ['[[referencia]]', 'Una regla trivial (0R) o de un atributo (1R)', 'Sí', 'T6'],
                ['[[reglas|Basados en reglas]]', 'Árboles, listas o conjuntos de reglas', 'Sí (caja blanca)', 'T6'],
                ['[[probabilisticos]]', 'Una distribución de probabilidad por clase', 'Parcialmente', 'T7'],
                ['[[neuronales]]', 'Pesos de una red', 'No (caja negra)', 'T7'],
                ['[[instancias|Basados en instancias]]', 'Los propios ejemplos (prototipos)', 'Parcialmente', 'T3 · T7'],
                ['[[multiclasificadores]]', 'Un comité de clasificadores que vota', 'No', 'T7'],
              ],
            },
          },
          'Las conclusiones del Tema 7 lo resumen en tres grupos: **sistemas basados en reglas** (interpretables), **prototipos de clasificación** (basados en instancias) y **algoritmos de caja negra** (redes neuronales, SVM…), cuya finalidad es la aproximación.',
        ],
      },
      {
        t: 'Problemas abiertos que se citan',
        b: [
          'Multi-label Classification (MLC), Multi-Instance Learning (MIL), Semi-supervised Learning (SSL), Monotonic Classification, Label Ranking, datos imperfectos (ruido, valores perdidos), análisis de la complejidad de los datos y algoritmos de clasificación para Big Data.',
        ],
      },
    ],
    rel: [['regresion', 'mismo planteamiento con salida numérica']],
  },

  // ───────────────────────── REFERENCIA ─────────────────────────
  {
    id: 'referencia',
    nombre: 'Clasificadores de referencia',
    padre: 'clasificacion',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T6',
    parte: 2,
    resumen: 'Los modelos más simples posibles. Sirven de línea base: cualquier algoritmo serio debe superarlos.',
    secciones: [
      {
        t: 'Por qué importan',
        b: [
          '[[zeror|ZeroR]] es el árbol más simple que se puede inducir (un único nodo hoja) y [[oner|1R]] es el algoritmo de cobertura más básico (equivale a un árbol de un solo nivel). Ambos entraron en el examen anterior y reaparecen en el Tema 6.',
        ],
      },
    ],
  },
  {
    id: 'zeror',
    nombre: 'ZeroR (0R)',
    padre: 'referencia',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 1.2',
    parte: 2,
    resumen: 'Predice siempre la clase mayoritaria. Es un árbol con un solo nodo hoja.',
    ficha: {
      entrada: 'Solo mira la variable de clase',
      interpretable: 'Caja blanca',
      devuelve: 'Una única clase (la mayoritaria) para cualquier ejemplo',
      funcionamiento: 'Cuenta cuántos ejemplos hay de cada clase y devuelve siempre la más frecuente. No usa ningún atributo.',
      fuertes: ['Línea base para comparar', 'Instantáneo'],
      debiles: ['No aprende nada de los atributos', 'En datos no balanceados da un acierto alto pero inútil'],
      parametros: ['Ninguno'],
      weka: 'rules › ZeroR',
    },
    esquema: [
      { k: 'in', t: 'Columna de clase' },
      { k: 'paso', t: 'Contar ejemplos por clase' },
      { k: 'out', t: 'Predecir siempre la mayoritaria' },
    ],
    secciones: [{ t: 'Con los datos de crédito', b: ['8 NO y 2 SÍ → ZeroR predice siempre NO y acierta el 80 %.'] }],
    ejemplo: 'PasoZeroR',
    rel: [
      ['no-balanceados', 'por qué el 97 % de acierto puede no valer nada'],
      ['arboles', 'es el árbol más simple: un nodo hoja'],
    ],
  },
  {
    id: 'oner',
    nombre: '1R (OneR)',
    padre: 'referencia',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 2.3 · T4',
    parte: 2,
    resumen: 'Elige el atributo con el que una regla por valor comete menos errores. Equivale a un árbol de decisión de primer nivel.',
    ficha: {
      entrada: 'Atributos discretos (los numéricos se discretizan)',
      interpretable: 'Caja blanca',
      devuelve: 'Un conjunto de reglas sobre un único atributo: "si A = v entonces clase"',
      funcionamiento:
        'Para cada atributo, crea una regla por cada valor que predice la clase mayoritaria de ese valor y cuenta los errores. Se queda con el atributo cuyo conjunto de reglas tiene menos errores.',
      fuertes: ['Muy simple y sorprendentemente competitivo (Holte, 1993: "Very simple classification rules perform well…")', 'Totalmente interpretable'],
      debiles: ['Solo usa un atributo', 'Tiende a elegir atributos con muchos valores (sobreajuste)'],
      parametros: ['Tamaño mínimo de cada intervalo al discretizar (en Weka, minBucketSize)'],
      weka: 'rules › OneR',
    },
    esquema: [
      { k: 'in', t: 'Datos discretos' },
      {
        k: 'bucle',
        t: 'Para cada atributo A',
        pasos: [
          { k: 'bucle', t: 'Para cada valor v de A', pasos: [{ k: 'paso', t: 'Regla: A = v → clase mayoritaria con A = v' }] },
          { k: 'paso', t: 'Error total de las reglas de A' },
        ],
      },
      { k: 'out', t: 'Reglas del atributo con menor error' },
    ],
    ejemplo: 'PasoOneR',
    secciones: [
      {
        t: 'Dónde aparece en el temario',
        b: [
          'En el Tema 6 es el **ejemplo básico de [[cobertura|algoritmo de cobertura]]**: «genera un conjunto de reglas equivalente a un árbol de decisión de primer nivel» y elige el mejor atributo con los datos de entrenamiento.',
          'En la taxonomía de [[discretizacion]] del Tema 4 aparece como **discretizador supervisado por binning** (al discretizar un atributo numérico agrupa valores consecutivos con la misma clase mayoritaria).',
        ],
      },
    ],
    rel: [
      ['prism', 'cobertura más elaborada'],
      ['arboles', 'árbol de un solo nivel'],
    ],
  },

  // ───────────────────────── BASADOS EN REGLAS ─────────────────────────
  {
    id: 'reglas',
    nombre: 'Clasificadores basados en reglas',
    corto: 'Basados en reglas',
    padre: 'clasificacion',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T6',
    parte: 2,
    resumen: 'Modelos simbólicos e interpretables: árboles de decisión, reglas sacadas de árboles, reglas por cobertura y reglas evolutivas.',
    secciones: [
      {
        t: 'Qué es una regla',
        b: [
          'Una regla de clasificación tiene un **antecedente** (predicado que se evalúa como verdadero o falso para cada ejemplo) y un **consecuente** (una etiqueta de clase): SI antecedente ENTONCES clase.',
          'Se pueden obtener reglas de un árbol, pero **árbol y reglas no son equivalentes**:',
          {
            vs: [
              { t: 'Árbol', items: ['Tiene implícito un orden en que se comprueban los atributos.', 'Se construye mirando todas las clases a la vez.'] },
              { t: 'Reglas', items: ['En general no hay orden.', 'Cuando se genera una regla solo se examina una clase.'] },
            ],
          },
        ],
      },
      {
        t: 'Cuatro formas de obtener el modelo',
        b: [
          {
            tabla: {
              cab: ['Línea', 'Cómo elige', 'Ejemplos'],
              filas: [
                ['[[arboles|Árboles de decisión]]', 'El **mejor atributo** en cada nodo (divide y vencerás)', '[[id3]], [[c45]], [[cart]]'],
                ['[[reglas-arbol|Reglas desde árboles]]', 'Un camino raíz-hoja = una regla', 'SBR, [[listas-decision]]'],
                ['[[cobertura|Cobertura]]', 'El **mejor par (atributo, valor)** para una clase', '[[oner|1R]], [[prism]]'],
                ['[[evolutivos|Extracción evolutiva]]', 'Un algoritmo evolutivo busca reglas o bases de reglas', '[[pittsburgh]], [[michigan]], [[prog-genetica]]'],
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'arboles',
    nombre: 'Árboles de decisión',
    padre: 'reglas',
    tipo: 'familia',
    salida: 'ambas',
    tema: 'T6 · 1',
    parte: 2,
    resumen: 'Clasificador en forma de árbol: cada nodo interno es una prueba sobre un atributo, cada rama un valor, cada hoja una clase.',
    ficha: {
      entrada: 'Atributos discretos (los continuos requieren cortes)',
      interpretable: 'Caja blanca',
      devuelve: 'Un árbol que se recorre de la raíz a una hoja para clasificar',
      funcionamiento: 'Se construye de arriba abajo con divide y vencerás ([[tdidt]]) eligiendo en cada nodo el atributo que mejor separa las clases; después se poda.',
      fuertes: ['Fáciles de utilizar y eficientes', 'Las reglas que generan son fáciles de interpretar', 'Escalan mejor que otras técnicas', 'Tratan bien los datos con ruido'],
      debiles: ['No manejan fácilmente los atributos continuos', 'Dividen el dominio en regiones rectangulares y no todos los problemas son así', 'Dificultad con valores perdidos', 'Pueden sobreaprender', 'No detectan correlaciones entre atributos'],
      parametros: ['Criterio de selección de atributo', 'Criterio de parada', 'Poda'],
    },
    esquema: [
      { k: 'in', t: 'Ejemplo a clasificar' },
      { k: 'paso', t: 'Empezar en la raíz' },
      { k: 'bucle', t: 'Mientras no se llegue a una hoja', pasos: [{ k: 'paso', t: 'Aplicar la prueba del nodo y bajar por la rama de su valor' }] },
      { k: 'out', t: 'Clase = etiqueta de la hoja' },
    ],
    secciones: [
      {
        t: 'Estructura',
        b: [
          {
            def: [
              ['Nodo interno', 'una variable de entrada con una prueba simple.'],
              ['Rama', 'uno de los valores que puede tomar esa variable.'],
              ['Hoja', 'una categoría (clase) de la variable objetivo.'],
            ],
          },
          'Un ejemplo se clasifica recorriendo el árbol desde la raíz hasta una hoja: $f(X_1, \\dots, X_n) \\to C$. Con el árbol del tenis, (tiempo = soleado, viento = débil, temperatura = 72, humedad = normal) → **sí**.',
          { demo: 'ArbolTenis' },
          'Ese árbol equivale a 5 reglas (un [[reglas-arbol|SBR]]): soleado ∧ humedad alta → no; soleado ∧ humedad normal → sí; nublado → sí; lluvioso ∧ viento fuerte → no; lluvioso ∧ viento débil → sí.',
        ],
      },
      {
        t: 'Construcción',
        b: [
          '**1. Construcción**: divide y vencerás recursivo; al principio todos los ejemplos están en la raíz y se van dividiendo por los atributos seleccionados ([[tdidt]]). **2. [[poda|Poda]]**: identificar y quitar ramas que describen ruido o datos anómalos. Para **usarlo**, se comprueban los valores del ejemplo contra el árbol.',
          'El caso más simple es [[zeror|ZeroR]]: un único nodo hoja.',
          'El orden de los atributos cambia la complejidad del árbol. Con los datos de crédito, tres árboles válidos:',
          {
            tabla: {
              cab: ['Árbol', 'Reglas', 'Premisas por regla'],
              filas: [['1.º (gastos → ingresos → propietario)', '6', '2,33'], ['2.º', '8', '2,5'], ['3.º', '6', '2,5']],
            },
          },
          'Lo ideal es tomar en cada momento el atributo que mejor clasifica. **¿Cómo decidir cuál es el mejor?** → [[ganancia-informacion]] ([[id3]]), [[ratio-ganancia]] ([[c45]]) o [[gini]] ([[cart]]).',
          { f: 'X^* = \\arg\\max_X \\big(H(C) - H(C\\mid X)\\big)' },
        ],
      },
      {
        t: 'Cómo particionan el espacio',
        b: [
          'Los árboles particionan el espacio de forma **exhaustiva**, pero **no pueden generar cualquier partición**: los cortes son siempre **paralelos a los ejes** y dividen completamente el espacio considerado.',
          {
            ul: [
              'Con variables discretas el particionamiento es limitado (una celda por combinación de valores).',
              'Con variables continuas se generan rectángulos (ej.: género × altura).',
              'Si la frontera entre clases no es paralela a los ejes aparece el **efecto escalera** y el árbol se complica.',
              'Soluciones: **árboles oblicuos** (cortes con combinaciones de variables) o árboles estándar con **variables construidas** previamente.',
            ],
          },
          { demo: 'ParticionEspacio' },
        ],
      },
      {
        t: 'Interpretabilidad y tamaño',
        b: [
          'Uno de los principales motivos de su éxito es que son **interpretables**: imitan la forma en que los humanos deciden y apenas requieren conocimientos estadísticos, matemáticos o informáticos.',
          'Son mejores los **árboles compactos**: generalizan mejor (**navaja de Occam**) y son más eficientes. Ayuda elegir primero las variables más informativas. ¿Qué árbol es mejor? Se mira el **acierto** y la **complejidad** del árbol.',
        ],
      },
      {
        t: 'Aspectos importantes en cualquier algoritmo de árboles',
        b: [
          {
            def: [
              ['Elección de los atributos test', 'tiene gran influencia en el rendimiento; a veces se usa información de expertos.'],
              ['Ordenación de los atributos test', 'evita comparaciones innecesarias.'],
              ['Divisiones', 'en algunos dominios son obvias; en otros, difíciles de determinar.'],
              ['Estructura del árbol', 'es preferible un árbol **balanceado** (poca profundidad).'],
              ['Criterio de parada', 'parar antes evita árboles enormes: equilibrio entre precisión y rendimiento.'],
              ['Ejemplos de entrenamiento', 'la estructura depende de ellos.'],
              ['Poda', 'mejora el rendimiento durante la clasificación.'],
            ],
          },
        ],
      },
      {
        t: 'Algoritmos clásicos',
        b: [
          {
            tabla: {
              cab: ['Año', 'Algoritmo', 'Autor'],
              filas: [
                ['1977', 'Recursive partitioning', 'Friedman'],
                ['1984', '[[cart]]', 'Breiman, Friedman, Olshen y Stone'],
                ['1986', '[[id3]]', 'Quinlan'],
                ['1993', '[[c45]]', 'Quinlan'],
              ],
            },
          },
          'C4.5 es el **n.º 1** de los 10 algoritmos más influyentes de minería de datos (C4.5, k-Means, SVM, Apriori, EM, PageRank, [[adaboost|AdaBoost]], [[knn|kNN]], [[naive-bayes|Naïve Bayes]] y [[cart|CART]]).',
        ],
      },
    ],
    rel: [
      ['arbol-regresion', 'la misma estructura con hojas numéricas'],
      ['random-forest', 'muchos árboles que votan'],
      ['bagging', 'los árboles son inestables: ideales para bagging'],
    ],
  },
  {
    id: 'criterios-division',
    nombre: 'Criterios de división (cómo elige el árbol)',
    corto: 'Criterios de división',
    padre: 'arboles',
    tipo: 'familia',
    salida: 'ambas',
    tema: 'T6 · T8',
    parte: 2,
    resumen: 'La medida con la que un árbol decide qué prueba pone en cada nodo. Cada algoritmo sigue una estrategia distinta, y se agrupan por la medida que usan.',
    esquema: [
      { k: 'in', t: 'Nodo con ejemplos T y atributos candidatos' },
      { k: 'bucle', t: 'Para cada atributo (o corte) candidato', pasos: [{ k: 'paso', t: 'Repartir T en las ramas que produciría' }, { k: 'paso', t: 'Medir la impureza de esas ramas con el criterio' }] },
      { k: 'paso', t: 'Quedarse con la mejor división (mayor ganancia / menor Gini)' },
      { k: 'out', t: 'Dividir el nodo y repetir en cada rama' },
    ],
    secciones: [
      {
        t: 'Idea común',
        b: [
          'Todos miden **cuánto desorden queda** en las ramas después de dividir. Una rama pura (una sola clase, o valores numéricos casi iguales) es la mejor. Lo que cambia es **cómo se mide el desorden**.',
          {
            tabla: {
              cab: ['Familia', 'Desorden de un nodo', 'Se elige', 'Algoritmos'],
              filas: [
                ['Entropía', '$H(S) = -\\sum p_i \\log_2 p_i$ → [[entropia]]', 'mayor [[ganancia-informacion|ganancia]]', '[[id3]]'],
                ['Entropía normalizada', 'ganancia ÷ información de la división → [[ratio-ganancia]]', 'mayor ratio', '[[c45]]'],
                ['Gini', '$1 - \\sum p_j^2$ → [[gini]]', 'menor $gini_{split}$', '[[cart]]'],
                ['Desviación típica', 'dispersión del valor numérico', 'mayor SDR', '[[arbol-regresion]], [[arbol-modelos]]'],
              ],
            },
          },
        ],
      },
      {
        t: 'Qué se hace después de dividir',
        b: ['Cuándo parar y cómo recortar el árbol no depende del criterio: es la [[poda]] (pre-poda al construir, post-poda al terminar).'],
      },
    ],
    ejemplo: 'Ganancia',
    rel: [
      ['entropia', 'mide el desorden'],
      ['poda', 'lo que viene después'],
      ['mdlp', 'la misma ganancia, para elegir cortes al discretizar'],
    ],
  },
  {
    id: 'tdidt',
    nombre: 'TDIDT · Top-Down Induction of Decision Trees',
    corto: 'TDIDT',
    padre: 'arboles',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 1.2',
    parte: 2,
    resumen: 'El esquema general (voraz, recursivo, divide y vencerás) del que derivan ID3, C4.5 y CART.',
    ficha: {
      entrada: 'T ejemplos, atributos A = {A₁…Aₙ}, clases C = {C₁…Cₖ}',
      interpretable: 'Caja blanca',
      devuelve: 'Un árbol de decisión',
      funcionamiento:
        'Si los ejemplos son de una clase o no quedan atributos, crea una hoja. Si no, elige el atributo que mejor clasifica, crea una rama por cada valor, reparte los ejemplos y se llama recursivamente sin ese atributo.',
      fuertes: ['Esquema común a todos los árboles', 'Voraz: rápido'],
      debiles: ['Voraz: no garantiza el mejor árbol posible', 'Depende de la medida que use para elegir el atributo'],
      parametros: ['Medida heurística o estadística para elegir el atributo'],
    },
    esquema: [
      { k: 'in', t: 'ConstruirÁrbol(T, C, A)' },
      { k: 'paso', t: 'Crear nodo RAÍZ' },
      { k: 'si', t: '¿Todos los ejemplos de T son de la clase Cᵢ?', si: 'hoja con etiqueta Cᵢ', no: 'continuar' },
      { k: 'si', t: '¿A = ∅ (no quedan atributos)?', si: 'hoja con la clase mayoritaria', no: 'continuar' },
      { k: 'paso', t: 'a ← atributo de A que mejor clasifica T; etiquetar RAÍZ con a' },
      {
        k: 'bucle',
        t: 'Para cada valor vᵢ de a',
        pasos: [
          { k: 'paso', t: 'Rama con el test a = vᵢ' },
          { k: 'paso', t: 'Tᵢ ← ejemplos de T con a = vᵢ' },
          { k: 'paso', t: 'ConstruirÁrbol(Tᵢ, C, A − {a})' },
        ],
      },
      { k: 'out', t: 'Devolver RAÍZ' },
    ],
    secciones: [
      {
        t: 'Condiciones de parada',
        b: [
          {
            ul: [
              'Todos los ejemplos de un nodo pertenecen a la misma clase (o la clase tiene muy poca variabilidad).',
              'No quedan atributos para seguir particionando → **voto de la mayoría**.',
              'No quedan ejemplos.',
            ],
          },
        ],
      },
      {
        t: 'Datos de crédito (ejemplo de clase)',
        b: [
          {
            tabla: {
              cab: ['Crédito', 'Ingresos', 'Propietario', 'Gastos mensuales'],
              filas: [
                ['N', 'Bajos', 'N', 'Altos'],
                ['N', 'Bajos', 'S', 'Altos'],
                ['N', 'Medios', 'S', 'Altos'],
                ['N', 'Medios', 'N', 'Altos'],
                ['N', 'Altos', 'N', 'Altos'],
                ['S', 'Altos', 'S', 'Altos'],
                ['N', 'Bajos', 'N', 'Bajos'],
                ['N', 'Medios', 'N', 'Bajos'],
                ['N', 'Altos', 'N', 'Bajos'],
                ['S', 'Medios', 'S', 'Bajos'],
              ],
            },
          },
          'En la diapositiva se elige primero **gastos**, después **ingresos** en la rama gastos = altos y **propietario** en el resto. El árbol final tiene 6 hojas: (gastos altos: ingresos bajos → NO (2,0), medios → NO (2,0), altos → propietario no → NO (1,0) / sí → SÍ (0,1)); (gastos bajos: propietario no → NO (3,0) / sí → SÍ (0,1)).',
        ],
      },
    ],
    ejemplo: 'ArbolTDIDT',
    rel: [
      ['id3', 'TDIDT + ganancia de información'],
      ['c45', 'TDIDT + ratio de ganancia + poda'],
      ['cart', 'TDIDT + Gini'],
    ],
  },
  {
    id: 'id3',
    nombre: 'ID3',
    padre: 'arboles',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 1.6',
    parte: 2,
    resumen: 'Quinlan (1986). TDIDT eligiendo en cada nodo el atributo con máxima ganancia de información.',
    ficha: {
      entrada: 'Atributos discretos (los continuos hay que discretizarlos antes)',
      interpretable: 'Caja blanca',
      devuelve: 'Un árbol de decisión sin poda',
      funcionamiento:
        'Usa teoría de la información: en cada nodo calcula la entropía antes y después de dividir por cada atributo y elige el de mayor ganancia. Crea un sucesor por valor y repite sin esa columna hasta que la entropía sea 0.',
      fuertes: [
        'Espacio de hipótesis completo: la función objetivo está incluida en él',
        'Usa información estadística de todos los ejemplos en cada paso (no uno a uno)',
        'Permite ruido en los datos',
        'Prefiere árboles cortos, con los atributos más informativos cerca de la raíz',
      ],
      debiles: [
        'Selecciona una única hipótesis: no determina todos los árboles compatibles',
        'No puede proponer ejemplos que reduzcan el espacio de búsqueda',
        'Sin vuelta atrás: hill-climbing, óptimo local que puede no ser el global',
        'La ganancia favorece atributos con muchos valores',
        'No trata continuos ni valores perdidos, no poda',
      ],
      parametros: ['Ninguno (la versión básica)'],
      weka: 'trees › Id3 (paquete simpleEducationalLearningSchemes)',
    },
    esquema: [
      { k: 'in', t: 'Conjunto S' },
      { k: 'paso', t: 'Elegir A que maximice G(S, A)' },
      { k: 'paso', t: 'Crear un nodo A con un sucesor por valor' },
      { k: 'paso', t: 'Repartir los ejemplos según su valor de A' },
      {
        k: 'bucle',
        t: 'Para cada sucesor',
        pasos: [{ k: 'si', t: '¿Solo hay ejemplos de una clase Cₖ?', si: 'etiquetarlo con Cₖ', no: 'ID3(ejemplos del nodo, sin la columna A)' }],
      },
      { k: 'out', t: 'Termina cuando todos los nodos tienen entropía 0' },
    ],
    secciones: [
      {
        t: 'Fórmulas',
        b: [
          { f: 'H(S) = -\\sum_{i=1}^{k} p_i \\log_2 p_i' },
          { f: 'G(S, A) = H(S) - \\sum_{v \\in \\text{valores}(A)} \\frac{|S_v|}{|S|}\\, H(S_v)' },
          'La ganancia es la diferencia entre la información necesaria para clasificar **antes** y **después** de dividir: entropía inicial menos la suma ponderada de las entropías de los subconjuntos. Ver [[entropia]] y [[ganancia-informacion]].',
        ],
      },
      {
        t: 'Ejemplo 1: alturas (¡en base 10!)',
        b: [
          '15 personas con género, altura y clase Short (4) / Medium (8) / Tall (3).',
          { nota: 'Errata a vigilar: este ejemplo usa **log₁₀**, no log₂. Por eso H(S) = 0,4384 (con log₂ saldría 1,456). El procedimiento es idéntico; solo cambia la escala.', tipo: 'ojo' },
          {
            ul: [
              '$H(S) = \\frac{4}{15}\\log\\frac{15}{4} + \\frac{8}{15}\\log\\frac{15}{8} + \\frac{3}{15}\\log\\frac{15}{3} = 0{,}4384$',
              'Género: $H(F) = 0{,}2764$ (9 personas: 3 Short, 6 Medium), $H(M) = 0{,}4392$ (6: 1 Short, 2 Medium, 3 Tall) → $G = 0{,}4384 - \\frac{9}{15}0{,}2764 - \\frac{6}{15}0{,}4392 = 0{,}09688$',
              'Altura discretizada en 6 rangos: (0,1.6], (1.6,1.7], (1.7,1.8], (1.8,1.9], (1.9,2.0], (2.0,∞). Todos puros salvo el 5.º (Jim Tall, Todd Medium, H = 0,301) → $G = 0{,}4384 - \\frac{2}{15}0{,}301 = 0{,}3983$',
              '**Se elige la altura** (0,3983 > 0,0969).',
            ],
          },
        ],
      },
      {
        t: 'Ejemplo 2: jugar al tenis',
        b: [
          'En la raíz gana **outlook** (0,247). En la rama soleado, la diapositiva da gain(temperature) = 0,571, gain(humidity) = 0,971, gain(windy) = 0,020 → se elige **humidity**. Calcúlalo tú en el simulador de abajo.',
          'El tercer ejemplo de las diapositivas aplica ID3 a los datos de crédito; en la última rama solo queda una opción: la variable gastos.',
        ],
      },
      {
        t: '¿Qué árbol elige ID3 y cómo se refina?',
        b: [
          'De todos los árboles compatibles con los ejemplos, prefiere **árboles cortos**, con los atributos de mayor ganancia cerca de la raíz.',
          'Refinamientos de ID3 (que llevan a [[c45]]): cuándo parar, atributos continuos, otras medidas de selección, atributos con coste diferente y ejemplos incompletos.',
        ],
      },
    ],
    ejemplo: 'ArbolID3',
    rel: [
      ['c45', 'su sucesor'],
      ['entropia', 'la medida base'],
      ['mdlp', 'misma ganancia aplicada a discretizar'],
    ],
  },
  {
    id: 'c45',
    nombre: 'C4.5',
    padre: 'arboles',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 1.6',
    parte: 2,
    resumen: 'Quinlan (1993). Desciende de ID3: ratio de ganancia, atributos continuos con umbral, valores perdidos y poda.',
    ficha: {
      entrada: 'Atributos discretos y continuos, admite valores perdidos',
      interpretable: 'Caja blanca',
      devuelve: 'Un árbol podado (o reglas con C4.5-reglas)',
      funcionamiento:
        'TDIDT con ratio de ganancia. Los atributos numéricos se parten en dos (≤ umbral / > umbral) eligiendo el umbral que maximiza el criterio. Al final aplica post-poda.',
      fuertes: ['Trata continuos y valores perdidos', 'Corrige el sesgo de ID3 hacia atributos con muchos valores', 'Propone soluciones al sobreaprendizaje (pre y post-poda)', 'N.º 1 del top-10 de algoritmos de minería de datos'],
      debiles: ['Cortes paralelos a los ejes (efecto escalera)', 'Árbol inestable: pequeños cambios en los datos lo cambian mucho'],
      parametros: ['Confianza de la poda', 'Mínimo de ejemplos por hoja', 'Con o sin poda'],
      weka: 'trees › J48',
    },
    esquema: [
      { k: 'in', t: 'Datos (discretos, continuos, con huecos)' },
      { k: 'paso', t: 'Para cada atributo numérico: probar umbrales y quedarse con el mejor' },
      { k: 'paso', t: 'Elegir el atributo con mayor ratio de ganancia' },
      { k: 'paso', t: 'Ramas: booleano → 2 · categórico → varias (agrupables) · numérico → 2 (≤ θ, > θ)' },
      { k: 'si', t: '¿Sin atributos/ejemplos, una sola clase o pocos ejemplos?', si: 'hoja con la clase mayoritaria', no: 'recursión en cada rama' },
      { k: 'paso', t: 'Post-poda: reemplazar o elevar subárboles' },
      { k: 'out', t: 'Árbol podado' },
    ],
    secciones: [
      {
        t: 'Familia C4.5',
        b: ['Conjunto de algoritmos para clasificación supervisada: **C4.5**, **C4.5 sin poda** y **C4.5-reglas**. Tiene una versión comercial superior: See5/C5.0 (RuleQuest Research).'],
      },
      {
        t: 'Mejoras sobre ID3',
        b: [
          {
            def: [
              ['Datos perdidos', 'al construir, se ignoran (solo se miran los registros con valor en ese atributo); al clasificar, el valor se predice con lo que se sabe del atributo en otros registros.'],
              ['Datos continuos', 'se dividen en rangos según los valores del entrenamiento. La discretización **no se propaga**.'],
              ['Sobreaprendizaje', 'pre-poda (decidir cuándo dejar de dividir) y post-poda (construir y después podar). Ver [[poda]].'],
              ['Selección de atributos', '**ratio de ganancia**, porque ID3 favorece atributos con muchas divisiones. Ver [[ratio-ganancia]].'],
            ],
          },
        ],
      },
      {
        t: 'Preguntas clave del algoritmo',
        b: [
          {
            def: [
              ['¿Qué tests hay en los nodos?', 'booleana → 2 ramas; categórica → varias ramas, pero los valores que predicen la misma clase se agrupan; numérica → 2 ramas {≤ θ, > θ}.'],
              ['¿Qué variables se eligen?', 'según la ganancia de información y el ratio de ganancia.'],
              ['¿Qué umbrales?', 'se ordenan los ejemplos por la variable y se elige el corte que maximiza el criterio.'],
              ['¿Cuándo termina?', 'no quedan variables o ejemplos; todos son de la misma clase; o el número de ejemplos está por debajo de un umbral.'],
              ['¿Qué etiqueta tienen las hojas?', 'la clase mayoritaria de los ejemplos de la rama.'],
            ],
          },
        ],
      },
      {
        t: 'Discretización interna',
        b: [
          'Cada variable numérica se discretiza en dos valores: $x \\le \\text{umbral}$ y $x > \\text{umbral}$.',
          {
            ol: [
              'Ordenar los valores de menor a mayor: $\\{x_1, \\dots, x_m\\}$.',
              'Probar cada $x_i$ ($i \\ge 2$) como umbral: bajo = $\\{x_1..x_i\\}$, alto = $\\{x_{i+1}..x_m\\}$, y calcular GainRatio.',
              'Elegir el umbral que maximiza la ganancia.',
            ],
          },
          'No hace falta probar todos: solo los valores donde **cambia la clase** respecto al anterior o al siguiente.',
          'Un mismo atributo continuo puede aparecer **varias veces** en el árbol, porque puede seguir discriminando en el subconjunto que llega a los hijos.',
        ],
      },
      {
        t: 'Ejemplo de ratio de ganancia (alturas, log₁₀)',
        b: [
          'Género: $H(9/15, 6/15) = 0{,}292$ → $GainRatio = 0{,}09688 / 0{,}292 = 0{,}332$.',
          'Altura: la diapositiva escribe $H(2/13, 2/13, 3/13, 4/13, 2/13)$.',
          { nota: 'Errata: la altura tiene 6 rangos con 2, 2, 3, 4, 2 y 2 personas (15 en total), así que la información de la división es $H(2/15, 2/15, 3/15, 4/15, 2/15, 2/15)$. Ojo también al último término, que pone log(13/3) en vez de log(13/2).', tipo: 'ojo' },
        ],
      },
      {
        t: 'Poda',
        b: [
          'Ver [[poda]]. **Pre-poda**: no se divide un nodo si hay poca confianza en él, o se para cuando el error en un conjunto de validación empieza a subir. **Post-poda** (la habitual en C4.5): **reemplazamiento de subárboles** (subárbol → hoja si el error es similar) y **elevación de subárbol** (un subárbol sustituye a su padre y sube de nivel). La diapositiva muestra también la poda por número de ejemplos (mínimo 2 ejemplos por hoja).',
        ],
      },
    ],
    ejemplo: 'ArbolC45',
    rel: [
      ['id3', 'su predecesor'],
      ['ratio-ganancia', 'su criterio'],
      ['si-modelos', 'C4.5 sobre instancias seleccionadas'],
      ['random-forest', 'bosques de árboles'],
      ['arbol-modelos', 'M5 extiende la idea a regresión'],
    ],
  },
  {
    id: 'cart',
    nombre: 'CART',
    padre: 'arboles',
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T6 · 1.3',
    parte: 2,
    resumen: 'Classification And Regression Trees (Breiman et al., 1984). Árboles binarios con el índice Gini; también hace regresión.',
    ficha: {
      entrada: 'Atributos discretos y continuos',
      interpretable: 'Caja blanca',
      devuelve: 'Árbol binario: clase en las hojas (clasificación) o valor numérico (regresión)',
      funcionamiento:
        'En cada nodo enumera todos los posibles puntos de división de cada atributo y elige el que da el $gini_{split}$ más pequeño. Divide siempre en dos.',
      fuertes: ['Sirve para clasificación y regresión', 'Gini es barato de calcular (sin logaritmos)'],
      debiles: ['Hay que enumerar todas las divisiones posibles', 'Cortes paralelos a los ejes'],
      parametros: ['Profundidad / mínimo por hoja', 'Poda por coste-complejidad'],
      weka: 'trees › SimpleCart (paquete)',
    },
    esquema: [
      { k: 'in', t: 'Nodo con ejemplos T' },
      { k: 'paso', t: 'Enumerar todas las divisiones binarias posibles' },
      { k: 'paso', t: 'Calcular gini_split de cada una' },
      { k: 'paso', t: 'Elegir la de gini_split mínimo' },
      { k: 'out', t: 'Recursión en T₁ y T₂' },
    ],
    ejemplo: 'ArbolCART',
    secciones: [
      {
        t: 'Índice Gini',
        b: [
          { f: 'gini(T) = 1 - \\sum_{j=1}^{n} p_j^2' },
          { f: 'gini_{split}(T) = \\frac{N_1}{N}\\,gini(T_1) + \\frac{N_2}{N}\\,gini(T_2)' },
          'Se elige el atributo con el $gini_{split}$ **más pequeño**. Ver [[gini]].',
        ],
      },
    ],
    rel: [
      ['gini', 'su criterio'],
      ['arbol-regresion', 'la R de CART'],
    ],
  },
  {
    id: 'reglas-arbol',
    nombre: 'Reglas desde un árbol (SBR)',
    corto: 'Reglas desde árbol',
    padre: 'reglas',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 2.2',
    parte: 2,
    resumen: 'Cada camino raíz-hoja de un árbol se convierte en una regla; el conjunto forma un Sistema Basado en Reglas.',
    ficha: {
      entrada: 'Un árbol de decisión ya construido',
      interpretable: 'Caja blanca',
      devuelve: 'Un conjunto (no ordenado) de reglas SI … ENTONCES clase',
      funcionamiento: 'Para cada camino de la raíz a una hoja se genera una regla con la conjunción de las pruebas del camino como antecedente y la clase de la hoja como consecuente.',
      fuertes: ['Las reglas se leen mejor que un árbol grande', 'Cubren todo el espacio (vienen de un árbol)'],
      debiles: ['Tantas reglas como hojas; reglas con premisas repetidas'],
      parametros: ['—'],
      weka: 'rules › PART (reglas a partir de árboles parciales C4.5)',
    },
    esquema: [
      { k: 'in', t: 'Árbol de decisión' },
      { k: 'bucle', t: 'Para cada camino raíz → hoja', pasos: [{ k: 'paso', t: 'SI (prueba₁ ∧ prueba₂ ∧ …) ENTONCES clase de la hoja' }] },
      { k: 'out', t: 'Sistema Basado en Reglas' },
    ],
    ejemplo: 'PasoReglasArbol',
    secciones: [
      {
        t: 'Con el primer árbol de crédito',
        b: [
          {
            ol: [
              'SI gastos = altos Y ingresos = bajos ENTONCES NO',
              'SI gastos = altos Y ingresos = medios ENTONCES NO',
              'SI gastos = altos Y ingresos = altos Y propietario = no ENTONCES NO',
              'SI gastos = altos Y ingresos = altos Y propietario = sí ENTONCES SÍ',
              'SI gastos = bajos Y propietario = no ENTONCES NO',
              'SI gastos = bajos Y propietario = sí ENTONCES SÍ',
            ],
          },
        ],
      },
    ],
    rel: [['listas-decision', 'la versión ordenada y compacta']],
  },
  {
    id: 'listas-decision',
    nombre: 'Listas de decisión',
    padre: 'reglas',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 2.2',
    parte: 2,
    resumen: 'Reglas ordenadas que se prueban de arriba abajo, con una regla por defecto al final.',
    ficha: {
      entrada: 'Datos (o un árbol)',
      interpretable: 'Caja blanca',
      devuelve: 'Lista ordenada de reglas + "EN OTRO CASO clase por defecto"',
      funcionamiento: 'Se busca la regla que cubra el mayor número de ejemplos positivos (o el menor de negativos); el orden importa: se aplica la primera que se cumple.',
      fuertes: ['Muy compactas', 'No necesitan particionar exhaustivamente el espacio'],
      debiles: ['Cada regla solo tiene sentido sabiendo que las anteriores no se cumplieron'],
      parametros: ['Criterio para elegir cada regla'],
    },
    esquema: [
      { k: 'in', t: 'Ejemplo a clasificar' },
      { k: 'bucle', t: 'Recorrer las reglas en orden', pasos: [{ k: 'si', t: '¿Se cumple el antecedente?', si: 'devolver su clase y parar', no: 'siguiente regla' }] },
      { k: 'out', t: 'Si ninguna se cumple: clase por defecto' },
    ],
    ejemplo: 'PasoLista',
    secciones: [
      {
        t: 'Ejemplos',
        b: [
          'Crédito: SI gastos = altos Y ingresos = altos Y propietario = sí ENTONCES SÍ; SI gastos = bajos Y propietario = sí ENTONCES SÍ; EN OTRO CASO NO.',
          'Espacio no particionado exhaustivamente: SI X = A ENTONCES círculo; SI X = B e Y = A ENTONCES círculo; SI X = C e Y = C ENTONCES círculo; EN OTRO CASO cuadrado.',
        ],
      },
    ],
    rel: [['prism', 'PRISM con regla por defecto produce una lista así']],
  },

  // ───────────── COBERTURA ─────────────
  {
    id: 'cobertura',
    nombre: 'Algoritmos de cobertura',
    padre: 'reglas',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T6 · 2.3',
    parte: 2,
    resumen: 'Generan reglas que cubren exactamente una clase, añadiendo condiciones (atributo = valor) de una en una.',
    secciones: [
      {
        t: 'Idea',
        b: [
          'Intentan generar reglas que **cubran exactamente una clase**. Habitualmente generan la mejor regla posible optimizando la probabilidad de clasificación deseada.',
          {
            vs: [
              { t: 'Árboles', items: ['Eligen el **mejor atributo**.', 'Miran todas las clases a la vez.'] },
              { t: 'Cobertura', items: ['Eligen el **mejor par (atributo, valor)**.', 'Construyen reglas para una clase cada vez.'] },
            ],
          },
          'Ejemplo: para clasificar personas altas se busca «SI ???? ENTONCES clase = alto» y el objetivo es reemplazar ???? por el predicado con mejor probabilidad de que la clase sea alto.',
          'Ejemplos: [[oner|1R]] (equivale a un árbol de primer nivel) y [[prism|PRISM]] (reglas para cada clase hasta describir todos sus ejemplos). Existen algoritmos de cobertura mucho más avanzados (p. ej. RIPPER, que en Weka es JRip).',
        ],
      },
    ],
  },
  {
    id: 'prism',
    nombre: 'PRISM',
    padre: 'cobertura',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 2.3',
    parte: 2,
    resumen: 'Para cada clase, va construyendo reglas perfectas añadiendo la condición con mayor proporción de aciertos, y elimina los ejemplos que ya cubre.',
    ficha: {
      entrada: 'Atributos discretos (los numéricos necesitan condiciones <, ≤, ≥, >)',
      interpretable: 'Caja blanca',
      devuelve: 'Un conjunto de reglas para cada clase (o para todas menos una + regla por defecto)',
      funcionamiento:
        'Para cada clase c: mientras queden ejemplos de c, empieza con una regla vacía → c y le va añadiendo el par atributo = valor con mayor exactitud s = positivos/cubiertos hasta que sea perfecta. Guarda la regla y quita los ejemplos que cubre.',
      fuertes: ['Reglas totalmente interpretables', 'Si no hay inconsistencias, clasificación perfecta del entrenamiento'],
      debiles: [
        'Voraz (una condición cada vez): puede no encontrar el conjunto óptimo',
        'Sobreajusta: prefiere una regla 1/1 a una 19/20 mucho más general',
        'Atributos numéricos no resueltos en la versión básica',
      ],
      parametros: ['Medida de selección (exactitud s o medida F)', 'Regla por defecto sí/no'],
      weka: 'rules › Prism (paquete simpleEducationalLearningSchemes)',
    },
    esquema: [
      { k: 'in', t: 'R ← ∅' },
      {
        k: 'bucle',
        t: 'Para cada clase c',
        pasos: [
          { k: 'paso', t: 'E ← BD' },
          {
            k: 'bucle',
            t: 'Mientras E tenga ejemplos de clase c',
            pasos: [
              { k: 'paso', t: 'Regla ← (∅ → c)' },
              {
                k: 'bucle',
                t: 'Hasta que la regla sea perfecta (o no queden atributos)',
                pasos: [
                  { k: 'paso', t: 'Probar todos los X = v no usados' },
                  { k: 'paso', t: 'Añadir el de mayor proporción de positivos' },
                ],
              },
              { k: 'paso', t: 'R ← R ∪ {Regla};  E ← E − cubiertos' },
            ],
          },
        ],
      },
      { k: 'out', t: 'Conjunto de reglas R' },
    ],
    secciones: [
      {
        t: 'Ejemplo de clase: crédito = SÍ',
        b: [
          { nota: 'Los datos de crédito de PRISM **no son exactamente** los del árbol de [[tdidt]]: el segundo SÍ es (ingresos altos, propietario sí, gastos **bajos**) en lugar de gastos altos. Si mezclas las tablas, los recuentos no cuadran.', tipo: 'ojo' },
          'Iteración 1 sobre los 10 ejemplos (s = positivos / cubiertos): ingresos = altos 1/3, medios 1/4, bajos 0/3, **propietario = sí 2/4**, propietario = no 0/6, gastos = altos 0/5, gastos = bajos 2/5. Se elige propietario = sí (empata en 2 aciertos con gastos = bajos, pero tiene mejor proporción). No es perfecta → se refina.',
          'Refinando: propietario = sí ∧ ingresos = altos **1/1**, ∧ medios 1/2, ∧ bajos 0/1, ∧ gastos = altos 0/2, ∧ gastos = bajos **2/2**. La diapositiva elige ingresos = altos (1/1, perfecta) → regla 1. Se quita ese ejemplo.',
          'Segunda regla para SÍ con 9 ejemplos: propietario = sí 1/3 → refinando, propietario = sí ∧ gastos = bajos 1/1 → regla 2. No quedan SÍ.',
          {
            nota: 'Fíjate: en el primer refinamiento, gastos = bajos (2/2) también era perfecta y cubría más ejemplos. Con s, 1/1 y 2/2 empatan. Este es exactamente el problema que señala la diapositiva: la exactitud no premia la generalidad. Con la medida F se habría elegido 2/2.',
            tipo: 'ojo',
          },
          'Conjunto final: SI propietario = sí ∧ ingresos = altos → SÍ; SI propietario = sí ∧ gastos = bajos → SÍ; SI propietario = no → NO; SI ingresos = bajos → NO; SI ingresos = medios ∧ gastos = altos → NO.',
          'Variante con regla por defecto (todas las clases menos la más probable a priori): las dos reglas de SÍ + «EN OTRO CASO crédito = NO».',
        ],
      },
      {
        t: 'Mejor criterio: la medida F',
        b: [{ f: 'F = \\frac{2\\,VP}{2\\,VP + FP + FN}' }, 'Con s, una regla 1/1 gana a una 19/20; con F se valora también cuántos positivos cubre. Ver [[medida-f]].'],
      },
    ],
    ejemplo: 'Prism',
    rel: [
      ['oner', 'cobertura de un solo atributo'],
      ['listas-decision', 'con regla por defecto'],
      ['medida-f', 'alternativa a la exactitud'],
    ],
  },

  // ───────────── EVOLUTIVOS ─────────────
  {
    id: 'evolutivos',
    nombre: 'Extracción evolutiva de reglas',
    padre: 'reglas',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T6 · 3–4',
    parte: 2,
    resumen: 'Algoritmos evolutivos cuyos cromosomas codifican una regla o un conjunto de reglas.',
    esquema: [
      { k: 'in', t: '1. Codificación (base de reglas o una regla)' },
      { k: 'paso', t: '2. Evaluación de los cromosomas (fitness)' },
      { k: 'paso', t: '3. Operadores genéticos' },
      { k: 'out', t: '4. Modelo de evolución' },
    ],
    secciones: [
      {
        t: 'Idea',
        b: [
          'Los cromosomas codifican **una regla o un conjunto de reglas**; cada gen codifica una regla o parte de ella: SI cond₁ ∧ … ∧ condₙ ENTONCES conocimiento.',
          {
            tabla: {
              cab: ['Conocimiento', 'Consecuente', 'Ejemplo'],
              filas: [
                ['Clasificación', 'La variable de clase', 'SI condición ENTONCES Cᵢ'],
                ['Asociación', 'Cualquier variable', 'SI pañales ENTONCES cerveza'],
              ],
            },
          },
        ],
      },
      {
        t: 'Tipos de reglas para clasificación',
        b: [
          {
            def: [
              ['Reglas intervalares', 'SI $x_1 \\in [a_1,b_1] \\wedge \\dots \\wedge x_n \\in [a_n,b_n]$ ENTONCES Clase = Cᵢ.'],
              ['Reglas difusas', 'SI $x_1$ es M ∧ … ∧ $x_n$ es G ENTONCES Clase = Cᵢ con grado de certeza $r_i$ (M…G son etiquetas lingüísticas, MP P M G MG, con funciones de pertenencia). Ver [[logica-difusa]].'],
            ],
          },
          'También para predicción: R1: SI X₁ es Alto y X₂ es Bajo → Y es Medio (ver [[sbrd]]).',
        ],
      },
      {
        t: '¿Cromosoma = base de reglas o cromosoma = regla?',
        b: [
          {
            tabla: {
              cab: ['', 'Cromosoma = base de reglas', 'Cromosoma = regla'],
              filas: [
                ['Modelos', '[[pittsburgh]]', '[[michigan]], [[irl]], [[coop-competitivo]] (la población es la base de reglas)'],
                ['Interacción entre reglas', 'Se trata de forma **natural**: el fitness evalúa el conjunto entero', 'Más compleja: hace falta un mecanismo extra'],
                ['Operadores', 'Más complejos', 'Más simples'],
              ],
            },
          },
          { nota: '**Las mejores reglas no son necesariamente el mejor conjunto de reglas.** Con calidad R1 > R2 > R3 > R4, quizá el mejor conjunto sea R1 + R3 porque R2 se solapa con R1. Se puede relajar la exigencia de cubrir el 100 % añadiendo una regla por defecto con la clase mayoritaria.', tipo: 'examen' },
          { demo: 'Solapamiento' },
        ],
      },
      {
        t: 'Qué se codifica',
        b: [
          {
            vs: [
              { t: 'Antecedente y consecuente', items: ['Cuidado al aplicar operadores entre reglas con distinto consecuente.', 'Se elige el consecuente que, para ese antecedente, maximiza el fitness.'] },
              {
                t: 'Solo el antecedente',
                items: [
                  'El consecuente es fijo: se ejecuta el AG una vez por clase.',
                  'Si cada ejecución es independiente y usa todos los ejemplos: **no controla redundancia ni solapamiento**.',
                  'Alternativa: al obtener las reglas de una clase, eliminar los ejemplos cubiertos.',
                ],
              },
            ],
          },
        ],
      },
      {
        t: 'Codificaciones',
        b: [
          {
            def: [
              ['Binaria (variables discretas, reglas DNF)', 'un bit por cada valor de cada variable. Problema de 18 variables con consecuente fijo: SI zona = centro ∧ utilidad de ferias = poca ∧ importancia de operaciones = poca **o** media ∧ cercanía de escaleras = sí ENTONCES eficacia = ALTA. Si todos los bits de una variable están a 0, la variable no interviene.'],
              ['Entera (reglas no DNF)', 'un gen por variable con el índice del valor; el 0 (que no es ningún valor) significa que la variable no interviene. Ej.: 2 0 1 0 0 0 0 0 1 0 … 1.'],
              ['Base de reglas lingüística', 'error ∈ {N, C, P}, variación ∈ {N, C, P}, potencia ∈ {B, M, A}, etiquetas numeradas del 1 al 9; cada regla son 3 genes: (2 6 9) = SI error es Cero ∧ variación es Positiva ENTONCES potencia es Alta.'],
              ['Pitt con reglas intervalares', 'cada atributo con dos reales (mín, máx) + la clase: $2n+1$ genes por regla, longitud fija $L = m(2n+1)$ para m reglas. Si $a_i > b_i$ el atributo no interviene.'],
              ['Con operadores', 'condición = (variable, operador, valor, activo). Longitud fija con bit de activo («género = hombre 1 · sueldo = alto 0 · edad > 55 1» → SI hombre ∧ edad > 55) o longitud variable (solo las condiciones activas).'],
            ],
          },
          'Para variables continuas: discretizarlas, tratarlas como variables lingüísticas/difusas, usar intervalos o codificar un umbral y un operador.',
          { demo: 'Codificacion' },
        ],
      },
      {
        t: 'Operadores específicos',
        b: [
          {
            ul: [
              'Cruce de **generalización** (OR bit a bit: los hijos aceptan más valores) / **especialización** (AND bit a bit: aceptan menos).',
              'Mutación de generalización / especialización.',
              'Inserción / eliminación de una condición.',
            ],
          },
          'Ejemplo: padres «hombre ∧ empleo = no ∧ salario < 40 000» y «mujer ∧ empleo = sí ∧ salario > 30 000». Generalización → «hombre ∧ empleo cualquiera ∧ salario cualquiera» y «mujer ∧ …». Especialización → «hombre ∧ empleo = sí ∧ 30 000 < salario < 40 000» y «mujer ∧ empleo = no ∧ 30 000 < salario < 40 000».',
        ],
      },
    ],
    rel: [
      ['chc', 'los evolutivos también seleccionan instancias'],
      ['logica-difusa', 'reglas difusas'],
    ],
  },
  {
    id: 'pittsburgh',
    nombre: 'Modelo Pittsburgh',
    padre: 'evolutivos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 3.1',
    parte: 2,
    resumen: 'Cada cromosoma es una base de reglas completa; el fitness evalúa el conjunto entero.',
    ficha: {
      entrada: 'Datos de entrenamiento',
      interpretable: 'Caja blanca',
      devuelve: 'El mejor cromosoma = la mejor base de reglas',
      funcionamiento: 'La población contiene bases de reglas completas. Se evalúa cada base con todos los ejemplos y se cruzan/mutan bases enteras.',
      fuertes: ['Trata la interacción entre reglas de forma natural', 'El fitness mide directamente lo que queremos (el conjunto)'],
      debiles: ['Cromosomas largos (L = m·(2n+1)) y operadores más complejos', 'Coste alto'],
      parametros: ['Número de reglas m por cromosoma', 'Codificación (p. ej. intervalar)'],
    },
    esquema: [
      { k: 'in', t: 'Población de bases de reglas' },
      { k: 'bucle', t: 'Generaciones', pasos: [{ k: 'paso', t: 'Fitness = rendimiento del conjunto de reglas completo' }, { k: 'paso', t: 'Selección, cruce y mutación de bases' }] },
      { k: 'out', t: 'Mejor base de reglas' },
    ],
    rel: [['michigan', 'el enfoque contrario: cromosoma = regla']],
  },
  {
    id: 'michigan',
    nombre: 'Modelo Michigan',
    padre: 'evolutivos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 3.1',
    parte: 2,
    resumen: 'Cada cromosoma es una regla y la población entera es la base de reglas; usa aprendizaje por refuerzo.',
    ficha: {
      entrada: 'Un entorno que devuelve recompensa',
      interpretable: 'Caja blanca',
      devuelve: 'La población final de reglas',
      funcionamiento: 'Las reglas compiten y cooperan en un entorno; un mecanismo de aprendizaje por refuerzo mide el rendimiento de cada regla en ese entorno.',
      fuertes: ['Operadores simples (una regla)', 'Aprendizaje en línea'],
      debiles: ['Medir la contribución de cada regla al conjunto es complejo'],
      parametros: ['Esquema de refuerzo'],
    },
    esquema: [
      { k: 'in', t: 'Población = base de reglas' },
      { k: 'bucle', t: 'Interacción con el entorno', pasos: [{ k: 'paso', t: 'Las reglas activadas actúan' }, { k: 'paso', t: 'Refuerzo: premiar/castigar reglas' }, { k: 'paso', t: 'AG ocasional para crear reglas nuevas' }] },
      { k: 'out', t: 'Población de reglas' },
    ],
    rel: [['pittsburgh', 'cromosoma = base de reglas']],
  },
  {
    id: 'irl',
    nombre: 'IRL · Aprendizaje iterativo de reglas',
    corto: 'IRL',
    padre: 'evolutivos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 3.1',
    parte: 2,
    resumen: 'Cromosoma = regla. Cada ejecución del AG aprende una regla; se repite eliminando los ejemplos cubiertos.',
    ficha: {
      entrada: 'Datos de entrenamiento',
      interpretable: 'Caja blanca',
      devuelve: 'Una regla por ejecución; el conjunto se forma iterando',
      funcionamiento: 'Múltiples ejecuciones del AG, cada una devuelve la mejor regla. Requiere mecanismos para potenciar la diversidad (a nivel fenotípico o genotípico), por ejemplo eliminar los ejemplos ya cubiertos.',
      fuertes: ['Operadores simples', 'Estrategia similar a la cobertura secuencial'],
      debiles: ['Muchas ejecuciones', 'Sin control explícito del conjunto final'],
      parametros: ['Criterio de parada de las iteraciones'],
    },
    esquema: [
      { k: 'in', t: 'Ejemplos E' },
      { k: 'bucle', t: 'Mientras queden ejemplos por cubrir', pasos: [{ k: 'paso', t: 'Ejecutar el AG → mejor regla' }, { k: 'paso', t: 'Añadirla y quitar los ejemplos que cubre' }] },
      { k: 'out', t: 'Conjunto de reglas' },
    ],
    rel: [['prism', 'misma filosofía de cubrir y quitar']],
  },
  {
    id: 'coop-competitivo',
    nombre: 'Enfoque cooperativo-competitivo',
    corto: 'Cooperativo-competitivo',
    padre: 'evolutivos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 3.1 · 4',
    parte: 2,
    resumen: 'Cromosoma = regla; las reglas compiten por los ejemplos y cooperan para formar la base. Necesita un mecanismo de diversidad (competición de tokens).',
    ficha: {
      entrada: 'Datos de entrenamiento',
      interpretable: 'Caja blanca',
      devuelve: 'La población (base de reglas) mejor durante la evolución',
      funcionamiento: 'Toda la población forma la solución. Para que no converja a muchas copias de la mejor regla se usa la competición de tokens: cada ejemplo es un token que solo puede capturar una regla.',
      fuertes: ['Una sola ejecución da un conjunto de reglas diverso'],
      debiles: ['Necesita un mecanismo de diversidad explícito'],
      parametros: ['Fitness por regla', 'Fitness global'],
    },
    esquema: [
      { k: 'in', t: 'Población = base de reglas' },
      { k: 'bucle', t: 'Generaciones', pasos: [{ k: 'paso', t: 'Generar hijos' }, { k: 'paso', t: 'Competición de tokens' }, { k: 'paso', t: 'Eliminar reglas sin tokens' }] },
      { k: 'out', t: 'Mejor población' },
    ],
    rel: [['prog-genetica', 'el ejemplo completo de la asignatura']],
  },
  {
    id: 'prog-genetica',
    nombre: 'Programación genética para reglas',
    corto: 'Programación genética',
    padre: 'evolutivos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · 4',
    parte: 2,
    resumen: 'Los cromosomas son árboles de expresión (el antecedente de la regla) generados por una gramática libre de contexto.',
    ficha: {
      entrada: 'Datos de entrenamiento + una gramática que define las reglas válidas',
      interpretable: 'Caja blanca',
      devuelve: 'La mejor población de reglas (difusas DNF con grado de certeza) encontrada durante la evolución',
      funcionamiento:
        'Cada individuo es una regla en forma de árbol. Cada generación produce tantos hijos como individuos (torneo de tamaño 2 + un operador), junta padres e hijos, aplica la competición de tokens, elimina las reglas sin tokens y crea reglas nuevas para los ejemplos sin cubrir.',
      fuertes: ['Estructuras de tamaño y forma variables (profundidad y anchura)', 'La gramática garantiza reglas válidas', 'Reglas DNF muy expresivas'],
      debiles: ['Árboles que crecen sin control (bloat)', 'Costoso'],
      parametros: ['α = 0,7 en el fitness', 'Pesos Wᵢ del fitness global', 'Probabilidades de los 4 operadores'],
    },
    esquema: [
      { k: 'in', t: '1. Población inicial según la gramática; evaluar' },
      { k: 'paso', t: '2. Fitness global; guardarla como la mejor' },
      {
        k: 'bucle',
        t: '3. Mientras no se cumpla la parada',
        pasos: [
          { k: 'paso', t: '4. Tantos hijos como individuos: torneo (2) + uno de los 4 operadores' },
          { k: 'paso', t: '5. Unir padres + hijos, ordenar por fitness, competición de tokens' },
          { k: 'paso', t: '6. Quitar fitness 0; reglas tipo 2 para tokens libres' },
          { k: 'paso', t: '7. Fitness global; actualizar la mejor' },
        ],
      },
      { k: 'out', t: '8. Devolver la mejor población' },
    ],
    secciones: [
      {
        t: 'El problema: credit scoring',
        b: [
          'Un banco quiere distinguir buenos y malos candidatos a partir de datos históricos (nº de hijos, salario, estado civil, OK?). Modelo: «SI (nº hijos = 2) ∧ (salario > 80 000) ENTONCES bueno SI_NO malo». Solo se desconoce el **antecedente**: el espacio de búsqueda es el conjunto de fórmulas.',
          'Fitness de una fórmula: % de ejemplos bien clasificados. Representación: la fórmula (fenotipo) es un **árbol** (genotipo): un nodo «Y» con dos hijos «=» (nº hijos, 2) y «>» (salario, 80 000).',
          { demo: 'ArbolExpresion' },
        ],
      },
      {
        t: 'Diferencias con otros paradigmas evolutivos',
        b: [
          {
            vs: [
              { t: 'AG, estrategias de evolución, programación evolutiva', items: ['Cromosomas lineales: bits, enteros, reales, permutaciones.', 'Tamaño normalmente fijo.'] },
              { t: 'Programación genética', items: ['Árboles: estructuras no lineales.', 'Varían en profundidad y en anchura.', 'Se basan en una gramática libre de contexto que define las sentencias válidas.'] },
            ],
          },
        ],
      },
      {
        t: 'Ejemplo: reglas difusas DNF',
        b: [
          'Reglas tipo 1: «SI X₁ es Alto o Medio ∧ X₂ es Bajo ENTONCES Clase 1 con certeza 0,75». Esquema cooperativo-competitivo, PG basada en gramática, 4 operadores, competición de tokens, reglas tipo 2 si quedan ejemplos sin cubrir y se guarda la mejor solución de toda la evolución.',
          {
            pseudo:
              'comienzo        → [Si] antec [entonces] consec.\nantec           → descriptor1 [y] descriptor2.\ndescriptor1     → [nada] | [X1 es] etiqueta.\ndescriptor2     → [nada] | [X2 es] etiqueta.\netiqueta        → B | M | A | B o M | B o A | M o A | B o M o A\nconsec          → [Clase es] descriptorClase.\ndescriptorClase → C1 | C2 | C3',
          },
          'La gramática permite varias etiquetas por variable (DNF) y también que falte alguna variable.',
        ],
      },
      {
        t: 'Competición de tokens',
        b: [
          'Analogía natural: si un individuo encuentra un buen nicho intenta explotarlo e impedir que otros entren, salvo que sean más fuertes; los demás deben buscar sus propios nichos → **aumenta la diversidad**.',
          'Cada ejemplo es un **token**. Las reglas, ordenadas de mejor a peor fitness, capturan los tokens que cubren y que siguen libres. El fitness se modifica según la proporción de tokens que consigue frente a los que podría coger: $F_{mod} = F \\cdot \\frac{contador}{ideal}$. Una regla que no consigue ningún token queda con fitness 0 y se elimina.',
          { demo: 'Tokens' },
        ],
      },
      {
        t: 'Fitness',
        b: [
          { f: 'F = \\alpha \\cdot confianza + (1-\\alpha)\\cdot soporte,\\quad \\alpha = 0{,}7' },
          { f: 'confianza = \\frac{tp}{tp + fp}\\qquad soporte = \\frac{tp}{n^{o}\\ ejemplos\\ de\\ la\\ clase}' },
          'tp y fp son las sumas de los grados de emparejamiento de los positivos verdaderos y falsos. Ver [[confianza-soporte]].',
          'Como tras la competición la última población no tiene por qué ser la mejor, se calcula un **fitness global** en cada iteración:',
          { f: 'F_{global} = W_1\\%Tra + W_2(1-\\#V) + W_3(1-\\#C) + W_4(1-\\#R),\\quad \\textstyle\\sum W_i = 1' },
          '#V: variables por regla, #C: condiciones por regla, #R: número de reglas (normalizados).',
        ],
      },
      {
        t: 'Operadores',
        b: [
          {
            ol: [
              '**Cruce**: dos puntos de corte en dos individuos, intercambia los trozos; genera **un solo** descendiente.',
              '**Mutación** (sobre conjuntos de etiquetas): añadir, quitar o cambiar una etiqueta.',
              '**Inserción**: añade una variable no usada.',
              '**Dropping condition**: elimina una variable usada.',
            ],
          },
        ],
      },
    ],
    rel: [
      ['coop-competitivo', 'su esquema de representación'],
      ['logica-difusa', 'reglas difusas DNF'],
      ['confianza-soporte', 'componentes del fitness'],
    ],
  },
];
