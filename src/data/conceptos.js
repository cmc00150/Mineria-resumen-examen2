// Raíz del mapa y conceptos transversales que comparten varios algoritmos.

export const raiz = {
  id: 'mineria',
  nombre: 'Minería de datos predictiva',
  padre: null,
  tipo: 'familia',
  salida: null,
  tema: 'T3–T8',
  resumen: 'Aprender, a partir de ejemplos, un modelo que predice una variable: una clase (clasificación) o un número (regresión).',
  secciones: [
    {
      t: 'Cómo leer el mapa',
      b: [
        'El árbol tiene tres grandes ramas: [[preparacion]] (antes de aprender), [[clasificacion]] (salida categórica) y [[regresion]] (salida numérica). Los [[conceptos]] son ideas que comparten varios algoritmos y se explican una sola vez.',
      ],
    },
  ],
};

export const conceptos = [
  {
    id: 'conceptos',
    nombre: 'Conceptos transversales',
    corto: 'Conceptos',
    padre: 'mineria',
    tipo: 'familia',
    salida: 'concepto',
    tema: '—',
    resumen: 'Medidas e ideas que reaparecen en varios temas. Cada una enlaza con los algoritmos que la usan.',
    secciones: [],
  },
  {
    id: 'entropia',
    nombre: 'Entropía',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6 · T4',
    resumen: 'Mide la aleatoriedad, sorpresa o incertidumbre al predecir la clase de un conjunto.',
    secciones: [
      {
        t: 'Definición',
        b: [
          'Con dos clases, P (p ejemplos) y N (n ejemplos), la información necesaria para decidir la clase de un ejemplo arbitrario es:',
          { f: 'I(p,n) = -\\frac{p}{p+n}\\log_2\\frac{p}{p+n} - \\frac{n}{p+n}\\log_2\\frac{n}{p+n}' },
          'Con k clases: $H(S) = \\sum_{i=1}^{k} p_i \\log_2(1/p_i) = -\\sum p_i \\log_2 p_i$.',
          {
            ul: [
              '**0** cuando todos los ejemplos son de la misma clase (conjunto puro).',
              '**Máxima** (1 bit con dos clases) cuando las clases están al 50 %.',
              'La base del logaritmo solo cambia la escala (cuidado con el ejemplo de alturas, en base 10).',
            ],
          },
          { demo: 'CurvaEntropia' },
        ],
      },
    ],
    rel: [
      ['id3', 'elige atributos con ella'],
      ['mdlp', 'evalúa cortes con ella'],
      ['ganancia-informacion', 'se calcula a partir de ella'],
      ['gini', 'alternativa más barata'],
    ],
  },
  {
    id: 'ganancia-informacion',
    nombre: 'Ganancia de información',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6 · T4',
    resumen: 'Cuánto baja la entropía al dividir por un atributo: entropía antes menos entropía media después.',
    secciones: [
      {
        t: 'Definición',
        b: [
          'Si el atributo A divide S en $\\{S_1,\\dots,S_v\\}$ y $S_i$ tiene $p_i$ positivos y $n_i$ negativos:',
          { f: 'E(A) = \\sum_{i=1}^{v} \\frac{p_i+n_i}{p+n}\\,I(p_i,n_i) \\qquad Gain(A) = I(p,n) - E(A)' },
          'Es la **reducción de la entropía** al considerar A. Se elige el atributo con mayor ganancia ([[id3]]).',
          { nota: 'Sesgo: favorece atributos con muchos valores (un identificador tendría ganancia máxima). Por eso [[c45]] usa el [[ratio-ganancia]].', tipo: 'examen' },
        ],
      },
    ],
    rel: [['id3', 'su criterio'], ['mdlp', 'G(A,T;S)'], ['arbol-regresion', 'SDR es la versión numérica']],
  },
  {
    id: 'ratio-ganancia',
    nombre: 'Ratio de ganancia (GainRatio)',
    corto: 'Ratio de ganancia',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6',
    resumen: 'La ganancia dividida por la entropía de la propia división: penaliza los atributos con muchos valores.',
    secciones: [
      {
        t: 'Definición',
        b: [
          { f: 'GainRatio(S,A) = \\frac{Gain(S,A)}{H\\!\\left(\\frac{|S_1|}{|S|}, \\dots, \\frac{|S_v|}{|S|}\\right)} = \\frac{H(C) - H(C\\mid X)}{H(X)}' },
          'El denominador («información de la división») tiene en cuenta la **cardinalidad** de cada división: un atributo que parte los datos en muchos trozos pequeños tiene un denominador grande.',
        ],
      },
    ],
    rel: [['c45', 'su criterio']],
  },
  {
    id: 'gini',
    nombre: 'Índice Gini',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6',
    resumen: 'Impureza de un conjunto: 1 menos la suma de los cuadrados de las proporciones de cada clase. Se elige la división con Gini mínimo.',
    secciones: [
      {
        t: 'Definición',
        b: [
          { f: 'gini(T) = 1 - \\sum_{j=1}^{n} p_j^2 \\qquad gini_{split}(T) = \\frac{N_1}{N}gini(T_1) + \\frac{N_2}{N}gini(T_2)' },
          'Vale 0 en un conjunto puro y es máximo (0,5 con dos clases) cuando están igualadas. Se elige el atributo con el $gini_{split}$ **más pequeño**; hay que enumerar todos los puntos de división posibles de cada atributo.',
        ],
      },
    ],
    rel: [['cart', 'su criterio'], ['entropia', 'medida de impureza alternativa']],
  },
  {
    id: 'poda',
    nombre: 'Poda',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6 · T8',
    resumen: 'Quitar ramas que describen ruido o datos anómalos para que el árbol generalice mejor.',
    secciones: [
      {
        t: 'Pre-poda y post-poda',
        b: [
          {
            vs: [
              {
                t: 'Pre-poda',
                items: [
                  'Se decide **cuándo dejar de dividir**.',
                  'No se divide un nodo si hay poca confianza (la diferencia de clases no es significativa).',
                  'O se valida con un conjunto independiente y se para cuando su error empieza a subir.',
                  'Riesgo: detener la división demasiado pronto.',
                ],
              },
              {
                t: 'Post-poda (la habitual)',
                items: [
                  'Se construye el árbol completo y después se poda.',
                  '**Reemplazamiento de subárboles**: un subárbol pasa a ser hoja si el error es similar.',
                  '**Elevación de subárbol**: un subárbol sustituye a su padre (se mueve a un nodo superior).',
                ],
              },
            ],
          },
          'También se poda por número de ejemplos (p. ej. mínimo 2 ejemplos por hoja). La diapositiva «efecto del tamaño del árbol» muestra que, al crecer el árbol, el error de entrenamiento siempre baja, pero el de test baja y luego sube (→ [[sobreajuste]]).',
          { demo: 'Sobreajuste' },
        ],
      },
    ],
    rel: [['c45', 'usa post-poda'], ['arbol-modelos', 'se poda más que un árbol de regresión'], ['si-modelos', 'otra forma de reducir el árbol']],
  },
  {
    id: 'sobreajuste',
    nombre: 'Sobreajuste (sobreaprendizaje)',
    corto: 'Sobreajuste',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T3 · T6 · T7',
    resumen: 'El modelo memoriza el entrenamiento (incluido el ruido) y generaliza peor.',
    secciones: [
      {
        t: 'Dónde aparece',
        b: [
          {
            ul: [
              '[[arboles|Árboles]]: árboles muy grandes → [[poda]].',
              '[[prism|PRISM]]: busca reglas perfectas → «sobreajusta a los datos».',
              '[[mlp|Redes neuronales]] y [[random-forest]]: hay que evitarlo.',
              '[[adaboost|AdaBoost]] con clasificadores base muy complejos.',
              '[[no-balanceados|Sobremuestreo]] copiando datos con ruido → [[smote]].',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bootstrap',
    nombre: 'Bootstrap',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T3 · T7',
    resumen: 'Muestra del mismo tamaño que el original, tomada con reemplazamiento.',
    secciones: [
      {
        t: 'Definición',
        b: [
          'Se toman n ejemplos de un conjunto de n **con reemplazamiento**: unos salen repetidos y otros no salen. En promedio, cada muestra contiene alrededor del 63,2 % de los ejemplos distintos (1 − 1/e).',
          'Es el [[muestreo-aleatorio|muestreo con reemplazamiento]] del Tema 3 y la base de [[bagging]] y [[random-forest]].',
        ],
      },
    ],
  },
  {
    id: 'sesgo-varianza',
    nombre: 'Ruido, sesgo y varianza',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T7',
    resumen: 'Las tres fuentes del error de aprendizaje; explican por qué funcionan los multiclasificadores.',
    secciones: [
      {
        t: 'Las tres fuentes',
        b: [
          {
            def: [
              ['Ruido', 'error en la propia función objetivo (no se puede eliminar).'],
              ['Sesgo', 'el algoritmo no puede aprender el objetivo (modelo demasiado simple).'],
              ['Varianza', 'debida al muestreo y a cómo afecta al algoritmo (modelo inestable).'],
            ],
          },
          '[[bagging]] reduce sobre todo la **varianza** (promedia modelos inestables). [[adaboost|Boosting]] combina clasificadores débiles (con sesgo alto) para reducir el **sesgo**.',
        ],
      },
    ],
  },
  {
    id: 'filtro-envolvente',
    nombre: 'Filtro vs. envolvente (wrapper)',
    corto: 'Filtro / envolvente',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T3',
    resumen: 'Dos formas de evaluar una selección (de atributos o de instancias): con una medida propia de los datos o con el acierto del clasificador final.',
    secciones: [
      {
        t: 'Definición',
        b: [
          {
            vs: [
              { t: 'Filtro', items: ['Evalúa con una medida independiente del clasificador final.', 'Más rápido.'] },
              { t: 'Envolvente (wrapper)', items: ['Evalúa entrenando y probando el clasificador final.', 'Más preciso, más caro.'] },
            ],
          },
          'Esta distinción entró en el examen anterior para **selección de atributos** y reaparece como «tipo de evaluación» en la [[seleccion-prototipos]] (p. ej. [[drop3]] es filtro; [[chc]] es envolvente).',
        ],
      },
    ],
  },
  {
    id: 'medida-f',
    nombre: 'Medida F',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6',
    resumen: 'Combina precisión y exhaustividad; alternativa a la exactitud para elegir reglas.',
    secciones: [
      {
        t: 'Definición',
        b: [
          { f: 'F = \\frac{2\\,VP}{2\\,VP + FP + FN}' },
          'Con la exactitud $s = VP/(VP+FP)$, una regla 1/1 gana a una 19/20. La medida F también cuenta los **falsos negativos** (positivos que la regla no cubre), así que premia las reglas generales. Se propone en [[prism]].',
        ],
      },
    ],
  },
  {
    id: 'confianza-soporte',
    nombre: 'Confianza y soporte de una regla',
    corto: 'Confianza y soporte',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6 · T3',
    resumen: 'Confianza: cuánto acierta la regla cuando se cumple. Soporte: qué parte de su clase cubre.',
    secciones: [
      {
        t: 'Definición',
        b: [
          { f: 'confianza = \\frac{tp}{tp+fp} \\qquad soporte = \\frac{tp}{n^{o}\\ ejemplos\\ de\\ la\\ clase}' },
          'En [[prog-genetica]] el fitness de cada regla es $0{,}7 \\cdot confianza + 0{,}3 \\cdot soporte$. En [[si-modelos]] la confianza N(Cond, Clas)/N sube de 0,003 a 0,167 al seleccionar instancias.',
        ],
      },
    ],
  },
  {
    id: 'logica-difusa',
    nombre: 'Etiquetas lingüísticas y pertenencia difusa',
    corto: 'Lógica difusa',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T6 · T8',
    resumen: 'Un valor pertenece a varias etiquetas (Bajo, Medio, Alto) con un grado entre 0 y 1.',
    secciones: [
      {
        t: 'Definición',
        b: [
          'Una variable lingüística tiene etiquetas (MP, P, M, G, MG; o B, M, A) con **funciones de pertenencia**, normalmente triangulares. Un valor puede ser «0,7 Medio y 0,3 Alto» a la vez.',
          'Aparece en las [[evolutivos|reglas difusas para clasificación]] (con grado de certeza), en [[prog-genetica]] (reglas DNF: «X₁ es Alto o Medio») y en los [[sbrd]] de regresión.',
          { demo: 'Pertenencia' },
        ],
      },
    ],
  },
  {
    id: 'validacion-cruzada',
    nombre: 'Validación cruzada',
    padre: 'conceptos',
    tipo: 'concepto',
    salida: 'concepto',
    tema: 'T7 · T8',
    resumen: 'Dividir los datos en k partes, entrenar con k−1 y probar con la restante, k veces.',
    secciones: [
      {
        t: 'Dónde aparece',
        b: [
          'Los ejemplos de Weka usan 10-cv (Naïve Bayes con iris) y 5-cv (multiclasificadores con nci, regresión con CPU). En regresión las técnicas de validación son **las mismas** que en clasificación; solo cambia la medida de error ([[metricas-regresion]]).',
        ],
      },
    ],
  },
];
