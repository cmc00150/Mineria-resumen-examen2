// PARTE I · Preparación de datos (Tema 3, 2ª mitad · Tema 4)
// Sintaxis en textos: [[id]] o [[id|texto]] enlaza a otra ficha, **negrita**, $latex$.

export const preparacion = [
  {
    id: 'preparacion',
    nombre: 'Preparación de datos',
    padre: 'mineria',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T3 · T4',
    parte: 1,
    resumen:
      'Antes de aprender un modelo se reducen los datos: menos filas (selección de instancias) o valores más simples (discretización).',
    secciones: [
      {
        t: 'Dónde encaja',
        b: [
          'La **reducción de datos** tiene cinco caminos: selección de características, **selección de instancias**, agrupamiento, compactación y **discretización**. En este examen entran los dos marcados en negrita; la selección de características (filtro y envolvente) entró en el examen anterior, pero sus ideas reaparecen aquí: ver [[filtro-envolvente]].',
          {
            vs: [
              {
                t: 'Selección de instancias',
                items: [
                  'Quita **filas** (ejemplos).',
                  'Objetivo: aprender más rápido, generalizar mejor y obtener modelos más simples.',
                  'Muy ligada a [[knn]]: casi todos sus algoritmos usan vecinos cercanos.',
                ],
              },
              {
                t: 'Discretización',
                items: [
                  'Transforma **columnas** numéricas en categóricas (intervalos).',
                  'Objetivo: datos más concisos e interpretables; muchos algoritmos solo aceptan valores discretos.',
                  'Muy ligada a los [[arboles]] y a [[naive-bayes]].',
                ],
              },
            ],
          },
        ],
      },
      {
        t: 'Cómo conecta con el resto del temario',
        b: [
          {
            ul: [
              'El [[muestreo-aleatorio|muestreo con reemplazamiento]] es exactamente el *bootstrap* de [[bagging]] y [[random-forest]].',
              '[[cnn]], [[enn]] y [[smote]] están construidos sobre la regla del vecino más cercano ([[knn]]).',
              '[[chc]] y [[ssma]] son algoritmos evolutivos, la misma familia que la [[evolutivos|extracción evolutiva de reglas]].',
              'Seleccionar instancias antes de [[c45]] produce árboles y reglas más pequeños e interpretables ([[si-modelos]]).',
              '[[mdlp]] usa la misma [[entropia]] y [[ganancia-informacion]] que [[id3]]; [[c45]] discretiza internamente cada atributo continuo.',
              'El acierto de [[naive-bayes]] depende mucho de cómo se discretice (77 % con 2 intervalos frente a 94 % con 3 en iris).',
            ],
          },
        ],
      },
    ],
    rel: [
      ['clasificacion', 'los datos preparados alimentan a los clasificadores'],
      ['regresion', 'también se aplican antes de regresión'],
    ],
  },

  // ───────────────────────── SELECCIÓN DE INSTANCIAS ─────────────────────────
  {
    id: 'seleccion-instancias',
    nombre: 'Selección de instancias',
    padre: 'preparacion',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T3',
    parte: 1,
    resumen:
      'Elegir los ejemplos más representativos del conjunto de datos para quedarse con menos filas sin perder (o incluso ganando) calidad.',
    esquema: [
      { k: 'in', t: 'Conjunto de datos completo (N ejemplos)' },
      { k: 'paso', t: 'Elegir estrategia', d: 'muestreo · selección de prototipos · aprendizaje activo' },
      { k: 'paso', t: 'Seleccionar un subconjunto M < N' },
      { k: 'out', t: 'Conjunto reducido → se entrena el modelo con él' },
    ],
    secciones: [
      {
        t: 'Para qué sirve',
        b: [
          'La selección de instancias (SI) elige los ejemplos más representativos del conjunto de datos para obtener:',
          {
            def: [
              ['Menos datos', 'los algoritmos pueden aprender más rápidamente.'],
              ['Mayor exactitud', 'el clasificador generaliza mejor (se eliminan ejemplos ruidosos o redundantes).'],
              ['Resultados más simples', 'modelos más fáciles de entender.'],
            ],
          },
          'La diapositiva lo ilustra con el mismo conjunto representado con 8000, 2000 y 500 puntos: la forma de las clases se sigue reconociendo con muchos menos ejemplos.',
          { demo: 'PuntosReduccion' },
        ],
      },
      {
        t: 'Estrategias',
        b: [
          {
            tabla: {
              cab: ['Estrategia', 'Idea', 'Ficha'],
              filas: [
                ['Muestreo', 'Elegir M de los N casos con un procedimiento estadístico (aleatorio, por grupos, por estratos…).', '[[muestreo]]'],
                ['Selección de prototipos (aprendizaje basado en instancias)', 'Elegir instancias que mejoren a un clasificador por vecino más cercano.', '[[seleccion-prototipos]]'],
                ['Aprendizaje activo', 'Solo se nombra como tercera estrategia; no se desarrolla en las diapositivas.', '—'],
              ],
            },
          },
          'Además, el tema estudia dos situaciones especiales: [[si-grandes-bd|bases de datos muy grandes]] y [[no-balanceados|conjuntos no balanceados]], y el efecto de la SI sobre [[si-modelos|árboles y reglas]].',
        ],
      },
      {
        t: 'Eficiencia',
        b: [
          'El orden de los algoritmos de SI es superior a $O(n^2)$ y suele estar en $O(n^3)$.',
          'Las principales dificultades que deben afrontar son: **eficiencia, recursos, generalización y representación**. Por eso con bases de datos grandes se combinan con una [[si-grandes-bd|estrategia de estratificación]].',
          { nota: 'Pregunta típica: «¿qué se gana con la selección de instancias?» → menos datos, más exactitud, resultados más simples. Y «¿qué problema tiene?» → coste $O(n^2)$–$O(n^3)$.', tipo: 'examen' },
        ],
      },
    ],
    rel: [['knn', 'la mayoría de métodos se apoyan en vecinos cercanos']],
  },

  {
    id: 'muestreo',
    nombre: 'Muestreo',
    padre: 'seleccion-instancias',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T3 · 3.1',
    parte: 1,
    resumen: 'Seleccionar un conjunto M del total de los N casos (M < N) mediante un procedimiento estadístico.',
    secciones: [
      {
        t: 'Idea',
        b: [
          '**Objetivo:** seleccionar un conjunto M del total de los N casos presentes en el conjunto original (M < N).',
          'El número de muestras necesario depende de **la complejidad de los conceptos a descubrir** y de **la técnica de minería de datos** que se vaya a usar.',
          {
            tabla: {
              cab: ['Técnica', 'Cómo elige', 'Cuándo conviene'],
              filas: [
                ['[[muestreo-aleatorio|Sin reemplazamiento]] (SRSWOR)', 'Cada ejemplo puede salir una sola vez.', 'Reducir el tamaño sin duplicados.'],
                ['[[muestreo-aleatorio|Con reemplazamiento]] (SRSWR)', 'Un ejemplo puede salir varias veces.', 'Base del bootstrap de [[bagging]].'],
                ['[[muestreo-clusters|De grupos (clusters)]]', 'Se eligen ejemplos de cada grupo según su tamaño.', 'Representar mejor los datos y evitar outliers.'],
                ['[[muestreo-incremental|Incremental]]', 'Muestras cada vez mayores hasta que no hay progreso.', 'No se sabe de antemano cuántos datos hacen falta.'],
                ['[[muestreo-estratificado|Estratificado]]', 'Se muestrea dentro de cada estrato y se unen las muestras.', 'Datos formados por grupos homogéneos.'],
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'muestreo-aleatorio',
    nombre: 'Muestreo sin y con reemplazamiento',
    corto: 'Muestreo aleatorio',
    padre: 'muestreo',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.1.1',
    parte: 1,
    resumen: 'Sacar ejemplos al azar de la "urna" de datos, devolviéndolos (SRSWR) o no (SRSWOR) antes de la siguiente extracción.',
    ficha: {
      entrada: 'Cualquier conjunto de datos y el tamaño de muestra deseado',
      devuelve: 'Un subconjunto de M ejemplos (con posibles repeticiones si es con reemplazamiento)',
      funcionamiento:
        'Se extraen ejemplos al azar. Sin reemplazamiento (SRSWOR, *simple random sample without replacement*) cada ejemplo extraído sale de la urna; con reemplazamiento (SRSWR) se devuelve y puede volver a salir.',
      fuertes: ['Muy simple y rápido', 'Con reemplazamiento permite generar muchas muestras distintas del mismo tamaño que el original (bootstrap)'],
      debiles: ['Ignora la estructura de los datos: puede dejar fuera grupos pequeños o clases minoritarias', 'Con reemplazamiento aparecen duplicados'],
      parametros: ['Tamaño de la muestra (en Weka, sampleSizePercent)', 'Con o sin reemplazamiento (en Weka, noReplacement)', 'Semilla aleatoria'],
      weka: 'Filtro unsupervised › instance › Resample',
    },
    esquema: [
      { k: 'in', t: 'Urna con los N ejemplos' },
      {
        k: 'bucle',
        t: 'Repetir M veces',
        pasos: [
          { k: 'paso', t: 'Sacar un ejemplo al azar' },
          { k: 'si', t: '¿Con reemplazamiento?', si: 'devolverlo a la urna', no: 'dejarlo fuera' },
        ],
      },
      { k: 'out', t: 'Muestra de M ejemplos' },
    ],
    secciones: [
      {
        t: 'En Weka',
        b: [
          'Se hace con el filtro **Resample** (Preprocess › Filter › unsupervised › instance › Resample): «produce una submuestra aleatoria del conjunto usando muestreo con o sin reemplazamiento». Parámetros que aparecen en la diapositiva: `noReplacement` (False = con reemplazamiento), `sampleSizePercent` (100 por defecto), `randomSeed` e `invertSelection`.',
          { nota: 'Con reemplazamiento y sampleSizePercent = 100 obtienes una muestra bootstrap: el mismo tamaño que el original, con repetidos. Es justo lo que hace [[bagging]] en cada modelo.', tipo: 'idea' },
        ],
      },
    ],
    ejemplo: 'Urna',
    rel: [
      ['bootstrap', 'con reemplazamiento = bootstrap'],
      ['bagging', 'cada modelo se entrena con una muestra con reemplazamiento'],
    ],
  },
  {
    id: 'muestreo-clusters',
    nombre: 'Muestreo de clusters',
    padre: 'muestreo',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.1.2',
    parte: 1,
    resumen: 'Los datos están agrupados; de cada grupo se eligen ejemplos en proporción a su tamaño.',
    ficha: {
      entrada: 'Datos agrupados (clusters)',
      devuelve: 'Una muestra con representantes de todos los grupos',
      funcionamiento:
        'Se identifican los grupos y de cada uno se toma un número de ejemplos acorde a su tamaño ("reducción simple"). Los ejemplos elegidos representan mejor a los datos y se evitan los outliers.',
      fuertes: ['Representa mejor la estructura de los datos', 'Evita elegir outliers'],
      debiles: ['Necesita conocer o calcular los grupos'],
      parametros: ['Número de ejemplos por grupo (proporcional a su tamaño)'],
    },
    esquema: [
      { k: 'in', t: 'Datos sin refinar' },
      { k: 'paso', t: 'Identificar los grupos' },
      { k: 'bucle', t: 'Para cada grupo', pasos: [{ k: 'paso', t: 'Tomar ejemplos en proporción a su tamaño' }] },
      { k: 'out', t: 'Reducción simple: muestra representativa' },
    ],
    rel: [['muestreo-estratificado', 'idea parecida: muestrear dentro de cada grupo']],
  },
  {
    id: 'muestreo-incremental',
    nombre: 'Muestreo incremental',
    padre: 'muestreo',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.1.3',
    parte: 1,
    resumen: 'Usar conjuntos cada vez mayores y detenerse cuando ya no se gana nada.',
    ficha: {
      entrada: 'Conjunto de datos y un modelo a evaluar',
      devuelve: 'El tamaño de muestra a partir del cual no hay progreso',
      funcionamiento:
        'En cada etapa se usa un conjunto de datos mayor, deteniéndose cuando no se ha realizado ningún progreso. Un patrón típico es 10 %, 20 %, 33 %, 50 %, 67 % y 100 %.',
      fuertes: ['No obliga a fijar el tamaño de antemano', 'Ahorra cómputo si el modelo converge pronto'],
      debiles: ['Hay que entrenar y evaluar varias veces'],
      parametros: ['Secuencia de tamaños (10, 20, 33, 50, 67, 100 %)', 'Criterio de "sin progreso"'],
    },
    esquema: [
      { k: 'in', t: 'Secuencia 10 % → 20 % → 33 % → 50 % → 67 % → 100 %' },
      {
        k: 'bucle',
        t: 'Para cada tamaño',
        pasos: [
          { k: 'paso', t: 'Muestrear ese % y aprender' },
          { k: 'si', t: '¿Ha mejorado respecto a la etapa anterior?', si: 'siguiente tamaño', no: 'parar' },
        ],
      },
      { k: 'out', t: 'Muestra del último tamaño útil' },
    ],
  },
  {
    id: 'muestreo-estratificado',
    nombre: 'Muestreo estratificado',
    padre: 'muestreo',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.1.4',
    parte: 1,
    resumen: 'Dividir en estratos que no se solapan, muestrear cada uno y unir las muestras.',
    ficha: {
      entrada: 'Datos formados por un conjunto homogéneo de grupos (estratos)',
      devuelve: 'La unión de las muestras de cada estrato',
      funcionamiento:
        'Se divide el conjunto en estratos no superpuestos, se seleccionan muestras de cada estrato y el conjunto final es la unión de esos muestreos.',
      fuertes: ['Ningún grupo queda sin representar', 'Más efectivo que el aleatorio cuando hay grupos homogéneos'],
      debiles: ['Hay que definir bien los estratos'],
      parametros: ['Criterio para formar los estratos', 'Tamaño de muestra por estrato'],
    },
    esquema: [
      { k: 'in', t: 'Datos con grupos homogéneos' },
      { k: 'paso', t: 'Dividir en estratos no superpuestos' },
      { k: 'bucle', t: 'Para cada estrato', pasos: [{ k: 'paso', t: 'Seleccionar una muestra' }] },
      { k: 'out', t: 'Unión de las muestras' },
    ],
    rel: [['si-grandes-bd', 'la estratificación es la clave para escalar la SI a grandes BD']],
  },

  {
    id: 'seleccion-prototipos',
    nombre: 'Selección de prototipos',
    padre: 'seleccion-instancias',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen:
      'Seleccionar instancias de forma que mejore la capacidad de predicción de un clasificador basado en el vecino más cercano (kNN).',
    esquema: [
      { k: 'in', t: 'Conjunto D → entrenamiento TR + test TS' },
      { k: 'paso', t: 'Algoritmo de selección de prototipos sobre TR' },
      { k: 'paso', t: 'Prototipos seleccionados (TSS)' },
      { k: 'paso', t: 'Clasificador 1-NN usando solo TSS' },
      { k: 'out', t: 'Se evalúa con TS' },
    ],
    secciones: [
      {
        t: 'Objetivo y uso',
        b: [
          'El objetivo es elegir instancias que **mejoren la predicción de [[knn|kNN]]** (en la diapositiva, 1-NN). El conjunto se divide en entrenamiento (TR) y test (TS); el algoritmo de selección obtiene los prototipos (TSS) a partir de TR y el 1-NN clasifica TS usando solo TSS.',
          'Un segundo uso: **seleccionar el conjunto de entrenamiento** de cualquier otro algoritmo de minería de datos. TSS se pasa a ese algoritmo (por ejemplo [[c45]]) y se obtiene un modelo (ver [[si-modelos]]).',
        ],
      },
      {
        t: 'Propiedades (taxonomía)',
        b: [
          {
            tabla: {
              cab: ['Propiedad', 'Valores'],
              filas: [
                ['Dirección de la búsqueda', '**Incremental** (empieza vacío y añade), **decremental** (empieza con todo y quita), **por lotes** (decide sobre todos a la vez), **mezclada** y **fijada** (tamaño final fijo).'],
                ['Tipo de selección', '**Condensación** (conserva los puntos de la frontera y quita los interiores redundantes), **edición** (quita los ruidosos de la frontera y suaviza), **híbrido** (las dos cosas).'],
                ['Tipo de evaluación', '**Filtrada** o **envolvente** (wrapper), igual que en selección de atributos: ver [[filtro-envolvente]].'],
              ],
            },
          },
          'La taxonomía de García, Derrac, Cano y Herrera (2012) organiza así los métodos: Condensación (incrementales como [[cnn]], decrementales, por lotes), Edición (decrementales como [[enn]] y [[multiedit]], por lotes como AllKNN) e Híbridos (incrementales como [[ib3]], decrementales filtro como [[drop3]], mezclados/envolventes como [[chc]] y [[ssma]], fijados como [[rmhc]]).',
        ],
      },
      {
        t: 'Cómo se evalúa un algoritmo de selección para k-NN',
        b: [
          {
            ol: [
              '**Reducción del espacio de almacenamiento** (% de instancias eliminadas).',
              '**Tolerancia al ruido.**',
              '**Precisión en la generalización** del aprendizaje.',
              '**Requerimientos de cómputo.**',
            ],
          },
        ],
      },
      {
        t: 'Familias de algoritmos (comparación de Cano, Herrera y Lozano)',
        b: [
          {
            tabla: {
              cab: ['Familia', 'Ejemplo'],
              filas: [
                ['Selección basada en reglas NN', '[[multiedit]], [[ib3]]'],
                ['Selección basada en eliminación ordenada', '[[drop3]]'],
                ['Algoritmos evolutivos', '[[chc]]'],
                ['Muestreo', '[[muestreo-aleatorio|Muestreo aleatorio]]'],
              ],
            },
          },
          'Las diapositivas los comparan visualmente sobre **iris** (longitud × anchura del pétalo) y sobre **banana** (5300 instancias, dos clases): CNN conserva solo la frontera, AllKNN suaviza la frontera conservando el interior, RMHC deja un tamaño fijo, DROP3 y SSMA reducen muchísimo.',
          { demo: 'Prototipos' },
        ],
      },
    ],
    rel: [
      ['knn', 'el clasificador que se quiere mejorar'],
      ['filtro-envolvente', 'misma distinción que en selección de atributos'],
    ],
  },
  {
    id: 'cnn',
    nombre: 'CNN · Condensed Nearest Neighbor',
    corto: 'CNN',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'Algoritmo clásico de condensación: añade solo las instancias que el conjunto actual clasifica mal.',
    ficha: {
      entrada: 'Conjunto de entrenamiento etiquetado',
      devuelve: 'Subconjunto condensado: casi solo puntos del borde entre clases',
      funcionamiento:
        'Incremental. Empieza con una instancia aleatoria de cada clase y recorre los datos: cada instancia mal clasificada por 1-NN con el conjunto actual se inserta. Al final retiene solo los puntos pertenecientes al borde.',
      fuertes: ['Gran reducción del almacenamiento', 'Mantiene las fronteras de decisión', 'Simple'],
      debiles: ['Dependiente del orden de presentación', 'No elimina ruido: un punto ruidoso siempre está "mal clasificado" y se conserva', 'Solo retiene puntos del borde'],
      parametros: ['Orden de presentación de los ejemplos (afecta al resultado)'],
    },
    esquema: [
      { k: 'in', t: 'S ← una instancia aleatoria de cada clase' },
      {
        k: 'bucle',
        t: 'Para cada instancia x del entrenamiento',
        pasos: [
          { k: 'paso', t: 'Clasificar x con 1-NN usando S' },
          { k: 'si', t: '¿Mal clasificada?', si: 'añadir x a S', no: 'descartarla' },
        ],
      },
      { k: 'out', t: 'S: puntos del borde' },
    ],
    secciones: [
      {
        t: 'Propiedades según la taxonomía',
        b: [{ tabla: { cab: ['Dirección', 'Tipo', 'Evaluación'], filas: [['Incremental', 'Condensación', 'Filtro']] } }],
      },
    ],
    ejemplo: 'CnnEnn',
    rel: [
      ['enn', 'el clásico opuesto: edición'],
      ['knn', 'usa 1-NN para decidir'],
    ],
  },
  {
    id: 'enn',
    nombre: 'ENN · Edited Nearest Neighbor',
    corto: 'ENN',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'Algoritmo clásico de edición: borra las instancias que sus k vecinos clasifican mal.',
    ficha: {
      entrada: 'Conjunto de entrenamiento etiquetado y un k (3, 5 o 9)',
      devuelve: 'Conjunto "limpio": fronteras suavizadas, interior intacto',
      funcionamiento:
        'Por lotes. Para cada instancia se miran sus k vecinos más cercanos; si la clasifican incorrectamente, se marca. Al final se borran todas las marcadas a la vez.',
      fuertes: ['Elimina ruido y outliers', 'Suaviza las fronteras', 'No depende del orden (decide por lotes)'],
      debiles: ['Reduce poco: retiene el resto de puntos, muchos de ellos redundantes'],
      parametros: ['k = 3, 5 o 9'],
    },
    esquema: [
      { k: 'in', t: 'Entrenamiento T, parámetro k' },
      {
        k: 'bucle',
        t: 'Para cada instancia x de T',
        pasos: [
          { k: 'paso', t: 'Buscar sus k vecinos (sin contarse a sí misma)' },
          { k: 'si', t: '¿La mayoría de vecinos tiene otra clase?', si: 'marcar x', no: 'mantener' },
        ],
      },
      { k: 'paso', t: 'Borrar todas las marcadas a la vez (por lotes)' },
      { k: 'out', t: 'Conjunto editado' },
    ],
    secciones: [
      {
        t: 'AllKNN',
        b: [
          '**AllKNN** es la aplicación iterativa de ENN con k = 3, 5 y 7. En el conjunto banana se ve que suaviza todavía más la frontera mientras conserva el interior de las clases.',
          { tabla: { cab: ['Algoritmo', 'Dirección', 'Tipo'], filas: [['ENN', 'Por lotes (la diapositiva) · decremental en la taxonomía', 'Edición'], ['AllKNN', 'Por lotes', 'Edición']] } },
        ],
      },
    ],
    ejemplo: 'CnnEnn',
    rel: [
      ['cnn', 'el clásico opuesto: condensación'],
      ['multiedit', 'otra variante de edición'],
      ['knn', 'usa los k vecinos'],
    ],
  },
  {
    id: 'multiedit',
    nombre: 'Multiedit',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'Método de edición basado en reglas NN; aparece en la comparación sobre iris.',
    ficha: {
      entrada: 'Conjunto de entrenamiento',
      devuelve: 'Conjunto editado (sin ruido)',
      funcionamiento:
        'Edición repetida (en varias particiones) con la regla del vecino más cercano: elimina los ejemplos mal clasificados hasta que no cambia nada. Las diapositivas solo lo sitúan en la taxonomía (Edición, decremental) y en la comparación visual.',
      fuertes: ['Limpia el ruido de forma más agresiva que ENN'],
      debiles: ['Reduce poco el tamaño comparado con condensación o híbridos'],
      parametros: ['Número de particiones'],
    },
    esquema: [
      { k: 'in', t: 'Entrenamiento' },
      { k: 'bucle', t: 'Repetir hasta que no haya cambios', pasos: [{ k: 'paso', t: 'Editar con la regla NN (como ENN) en varias particiones' }] },
      { k: 'out', t: 'Conjunto editado' },
    ],
    rel: [['enn', 'edición clásica']],
  },
  {
    id: 'ib3',
    nombre: 'IB3 (e IB2)',
    corto: 'IB3',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'Híbrido incremental basado en reglas NN que solo acepta instancias con buen historial de clasificación.',
    ficha: {
      entrada: 'Conjunto de entrenamiento',
      devuelve: 'Conjunto reducido de prototipos',
      funcionamiento:
        'Incremental, como CNN (IB2 es prácticamente CNN). IB3 añade un registro de aciertos por instancia y solo conserva las que tienen un historial de clasificación aceptable, con lo que tolera el ruido. Las diapositivas lo usan en las comparaciones (iris, KDD Cup’99).',
      fuertes: ['Más tolerante al ruido que CNN', 'Muy rápido con estratificación (0–2 s en KDD Cup’99)'],
      debiles: ['Depende del orden de presentación (incremental)'],
      parametros: ['Umbrales de aceptación/rechazo'],
    },
    esquema: [
      { k: 'in', t: 'S vacío' },
      {
        k: 'bucle',
        t: 'Para cada instancia x',
        pasos: [
          { k: 'si', t: '¿El vecino aceptable de S la clasifica mal?', si: 'añadir x', no: 'descartar' },
          { k: 'paso', t: 'Actualizar registro de aciertos y quitar las de mal historial' },
        ],
      },
      { k: 'out', t: 'Prototipos aceptables' },
    ],
    rel: [['cnn', 'IB2 ≈ CNN']],
  },
  {
    id: 'drop3',
    nombre: 'DROP3',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'La técnica híbrida más conocida y utilizada para NN; elimina por orden.',
    ficha: {
      entrada: 'Conjunto de entrenamiento',
      devuelve: 'Conjunto muy reducido',
      funcionamiento:
        'Decremental (eliminación ordenada). Primero filtra el ruido con un paso tipo ENN y luego elimina instancias, en orden, cuando sus "asociados" se siguen clasificando bien sin ellas.',
      fuertes: ['Híbrido: limpia ruido y condensa', 'Gran reducción'],
      debiles: ['Coste alto ($O(n^2)$ o más)', 'Con KDD Cup’99 estratificado, C4.5 sobre DROP1/2/3 pierde mucho acierto en test (35–77 %)'],
      parametros: ['k vecinos'],
    },
    esquema: [
      { k: 'in', t: 'Entrenamiento T' },
      { k: 'paso', t: 'Quitar ruido (paso de edición)' },
      { k: 'paso', t: 'Ordenar instancias (las lejanas a la frontera primero)' },
      { k: 'bucle', t: 'Para cada instancia en ese orden', pasos: [{ k: 'si', t: '¿Sus asociados se clasifican igual de bien sin ella?', si: 'eliminarla', no: 'conservarla' }] },
      { k: 'out', t: 'Conjunto reducido' },
    ],
  },
  {
    id: 'rmhc',
    nombre: 'RMHC',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'Muestreo adaptativo basado en búsqueda local con un tamaño final fijo.',
    ficha: {
      entrada: 'Conjunto de entrenamiento y tamaño final deseado',
      devuelve: 'Subconjunto de tamaño fijo',
      funcionamiento:
        'Random Mutation Hill Climbing: parte de un subconjunto aleatorio del tamaño fijado y lo cambia con mutaciones aleatorias, aceptando el cambio si mejora el acierto (búsqueda local).',
      fuertes: ['Controlas exactamente el tamaño final'],
      debiles: ['Búsqueda local: puede quedarse en óptimos locales'],
      parametros: ['Tamaño final', 'Número de iteraciones'],
    },
    esquema: [
      { k: 'in', t: 'Subconjunto aleatorio de tamaño m' },
      { k: 'bucle', t: 'Repetir', pasos: [{ k: 'paso', t: 'Cambiar una instancia al azar' }, { k: 'si', t: '¿Mejora el acierto?', si: 'aceptar', no: 'deshacer' }] },
      { k: 'out', t: 'Subconjunto de tamaño m' },
    ],
  },
  {
    id: 'chc',
    nombre: 'CHC (selección evolutiva)',
    corto: 'CHC',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2–3.4',
    parte: 1,
    resumen: 'Algoritmo evolutivo: cada cromosoma es un vector de bits que indica qué instancias se quedan.',
    ficha: {
      entrada: 'Conjunto de entrenamiento',
      devuelve: 'Subconjunto (cromosoma binario ganador)',
      funcionamiento:
        'Cada individuo es una cadena de bits (1 = la instancia se queda). El fitness combina acierto y reducción. Evoluciona una población y devuelve el mejor subconjunto.',
      fuertes: [
        'Mejor equilibrio reducción/acierto en los estudios de la asignatura',
        'Con KDD Cup’99: 99,68 % de reducción y 99,43 % de acierto en test',
        'Con C4.5 sobre Adult: de 359 reglas a 5, de 14 variables/regla a 3',
      ],
      debiles: ['El más lento: 1960 s con 100 estratos (frente a 0–8 s de CNN/IB)'],
      parametros: ['Tamaño de población', 'Número de evaluaciones', 'Peso entre reducción y acierto'],
    },
    esquema: [
      { k: 'in', t: 'Población de cromosomas binarios (1 bit por instancia)' },
      {
        k: 'bucle',
        t: 'Generaciones',
        pasos: [
          { k: 'paso', t: 'Evaluar: acierto de 1-NN con las instancias a 1 + % de reducción' },
          { k: 'paso', t: 'Cruzar y seleccionar los mejores' },
        ],
      },
      { k: 'out', t: 'Mejor subconjunto encontrado' },
    ],
    rel: [
      ['evolutivos', 'misma familia de algoritmos que la extracción evolutiva de reglas'],
      ['si-modelos', 'IS-CHC + C4.5'],
    ],
  },
  {
    id: 'ssma',
    nombre: 'SSMA',
    padre: 'seleccion-prototipos',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.2',
    parte: 1,
    resumen: 'Aproximación evolutiva basada en algoritmos meméticos (evolutivo + búsqueda local).',
    ficha: {
      entrada: 'Conjunto de entrenamiento',
      devuelve: 'Subconjunto muy reducido',
      funcionamiento:
        'Steady-State Memetic Algorithm: un algoritmo evolutivo de estado estacionario al que se añade una búsqueda local para refinar los individuos.',
      fuertes: ['Reducción muy alta con buen acierto (banana)'],
      debiles: ['Coste computacional elevado'],
      parametros: ['Parámetros evolutivos y de búsqueda local'],
    },
    esquema: [
      { k: 'in', t: 'Población de subconjuntos' },
      { k: 'bucle', t: 'Generaciones', pasos: [{ k: 'paso', t: 'Cruce/mutación' }, { k: 'paso', t: 'Búsqueda local sobre el hijo' }] },
      { k: 'out', t: 'Mejor subconjunto' },
    ],
    rel: [['chc', 'otro selector evolutivo']],
  },

  {
    id: 'si-grandes-bd',
    nombre: 'Selección de instancias en grandes bases de datos',
    corto: 'SI con estratificación',
    padre: 'seleccion-instancias',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.3',
    parte: 1,
    resumen: 'Dividir la base de datos en estratos y aplicar la selección de instancias a cada estrato por separado.',
    ficha: {
      entrada: 'Base de datos muy grande',
      devuelve: 'Unión de los subconjuntos seleccionados en cada estrato',
      funcionamiento:
        'Se divide el conjunto en t estratos T1…Tt. Cada estrato se separa en TRi y TSi, se aplica el algoritmo de SI a TRi y se obtiene SSi. Como cada estrato es pequeño, el coste $O(n^2)$–$O(n^3)$ deja de ser un problema.',
      fuertes: ['Permite usar algoritmos caros (incluso CHC) con medio millón de instancias', 'Paralelizable'],
      debiles: ['Cada estrato solo "ve" una parte de los datos'],
      parametros: ['Número de estratos (100, 200, 300 en el ejemplo)'],
    },
    esquema: [
      { k: 'in', t: 'Conjunto de datos grande' },
      { k: 'paso', t: 'Dividir en t estratos T1 … Tt' },
      { k: 'bucle', t: 'Para cada estrato Ti', pasos: [{ k: 'paso', t: 'Separar TRi / TSi' }, { k: 'paso', t: 'Aplicar SI a TRi → SSi' }] },
      { k: 'out', t: 'Unión de los SSi' },
    ],
    secciones: [
      {
        t: 'Ejemplo: KDD Cup’99',
        b: [
          '494 022 instancias, 41 atributos, 23 clases. Resultados (tiempo en segundos, % de reducción, % de acierto en entrenamiento y en test):',
          {
            tabla: {
              cab: ['Método', 'Tiempo', '% Red', '% Ac. Trn', '% Ac. Test'],
              filas: [
                ['1-NN completo', '18 568', '—', '99,91', '99,91'],
                ['CNN st 100', '8', '81,61', '99,30', '99,27'],
                ['CNN st 200', '3', '65,57', '99,90', '99,15'],
                ['CNN st 300', '1', '63,38', '99,89', '98,23'],
                ['IB2 st 100', '0', '82,01', '97,90', '98,19'],
                ['IB2 st 200', '3', '65,66', '99,93', '98,71'],
                ['IB2 st 300', '2', '60,31', '99,89', '99,03'],
                ['IB3 st 100', '2', '78,82', '93,83', '98,82'],
                ['IB3 st 200', '0', '98,27', '98,37', '98,93'],
                ['IB3 st 300', '0', '97,97', '97,92', '99,27'],
                ['CHC st 100', '1960', '99,68', '99,21', '99,43'],
                ['CHC st 200', '418', '99,48', '99,92', '99,23'],
                ['CHC st 300', '208', '99,28', '99,93', '99,19'],
              ],
            },
          },
          { nota: 'Lectura rápida: el 1-NN completo tarda más de 5 horas; con estratificación cualquier método baja a segundos. CHC es el más lento pero el que más reduce manteniendo el acierto.', tipo: 'idea' },
        ],
      },
    ],
    rel: [
      ['muestreo-estratificado', 'misma idea de estratos'],
      ['chc', 'el que mejor equilibra'],
    ],
  },
  {
    id: 'si-modelos',
    nombre: 'Selección de instancias + árboles y reglas',
    corto: 'SI + árboles y reglas',
    padre: 'seleccion-instancias',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.4',
    parte: 1,
    resumen: 'Usar la SI para entrenar árboles de decisión y extractores de reglas más pequeños e interpretables.',
    ficha: {
      entrada: 'Gran base de datos + un algoritmo de árboles/reglas (C4.5)',
      devuelve: 'Un árbol o un conjunto de reglas más pequeño',
      funcionamiento:
        'Se selecciona un conjunto de entrenamiento (TSS) con un algoritmo de SI estratificado y se entrena C4.5 sobre él. Es una alternativa (o complemento) a la poda, que elimina nodos.',
      fuertes: ['Árboles más pequeños → más comprensibles', 'Reglas con más información (más confianza)'],
      debiles: ['Algunos selectores destrozan el acierto (DROP1: 35 % en test)'],
      parametros: ['Selector de instancias', 'Número de estratos'],
    },
    esquema: [
      { k: 'in', t: 'Datos grandes' },
      { k: 'paso', t: 'SI estratificada → TSS' },
      { k: 'paso', t: 'C4.5 sobre TSS' },
      { k: 'out', t: 'Árbol / reglas reducidos' },
    ],
    secciones: [
      {
        t: 'Árboles con KDD Cup’99 (100 estratos)',
        b: [
          {
            tabla: {
              cab: ['Método', 'Nº reglas', '% Red.', '% Ac Trn', '% Ac Test'],
              filas: [
                ['C4.5', '252', '—', '99,97', '99,94'],
                ['Cnn Strat', '83', '81,61', '98,48', '96,43'],
                ['Drop1 Strat', '3', '99,97', '38,63', '34,97'],
                ['Drop2 Strat', '82', '76,66', '81,40', '76,58'],
                ['Drop3 Strat', '49', '56,74', '77,02', '75,38'],
                ['Ib2 Strat', '48', '82,01', '95,81', '95,05'],
                ['Ib3 Strat', '74', '78,92', '99,13', '96,77'],
                ['Icf Strat', '68', '23,62', '99,98', '99,53'],
                ['CHC Strat', '9', '99,68', '98,97', '97,53'],
              ],
            },
          },
          'CHC pasa de 252 reglas a 9 manteniendo un 97,5 % de acierto en test.',
        ],
      },
      {
        t: 'Reglas con Adult (2 clases, 30 132 instancias, 14 variables)',
        b: [
          {
            tabla: {
              cab: ['', 'C4.5', 'IS-CHC / C4.5'],
              filas: [
                ['Nº reglas', '359', '5'],
                ['Variables por regla', '14', '3'],
                ['Confianza N(Cond,Clas)/N', '0,003', '0,167'],
              ],
            },
          },
          'La selección de instancias permite obtener conjuntos de reglas **más interpretables y con aporte de mayor información**.',
        ],
      },
    ],
    rel: [
      ['c45', 'el algoritmo que se entrena después'],
      ['poda', 'otra forma de reducir el árbol'],
      ['chc', 'IS-CHC'],
    ],
  },

  {
    id: 'no-balanceados',
    nombre: 'Conjuntos no balanceados',
    padre: 'seleccion-instancias',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T3 · 3.5',
    parte: 1,
    resumen: 'Cuando una clase es mucho más frecuente que otra, el acierto engaña: hay que reequilibrar.',
    secciones: [
      {
        t: 'El problema',
        b: [
          'Algunos problemas tienen una presencia de clases muy desigual:',
          {
            tabla: {
              cab: ['Dominio', 'Mayoritaria', 'Minoritaria'],
              filas: [
                ['Diagnosis médica', '90 % sin enfermedad', '10 % enfermedad'],
                ['e-comercio', '99 % no compra', '1 % compra'],
                ['Seguridad', '> 99,99 % conexiones normales', 'ataques'],
              ],
            },
          },
          'La situación es similar con múltiples clases. La mayoría de clasificadores obtienen un **97 % de acierto pero no son útiles**: basta con predecir siempre la mayoritaria (como haría [[zeror]]).',
        ],
      },
      {
        t: 'Cómo se procesan',
        b: [
          {
            vs: [
              { t: 'Reducir la clase mayoritaria', items: ['Técnicas de reducción de datos (selección de instancias) aplicadas a la clase mayoritaria.'] },
              { t: 'Sobremuestrear la minoritaria', items: ['Aumentar el tamaño de las clases minoritarias.', 'Riesgo: **sobreajuste** si se copian datos con ruido.', 'Solución: [[smote]].'] },
            ],
          },
        ],
      },
    ],
    rel: [['zeror', 'el clasificador trivial que ya acierta un 97 %']],
  },
  {
    id: 'smote',
    nombre: 'SMOTE',
    padre: 'no-balanceados',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T3 · 3.5',
    parte: 1,
    resumen: 'Synthetic Minority Oversampling Technique: crea ejemplos sintéticos de la clase minoritaria sobre los segmentos que la unen con sus vecinos.',
    ficha: {
      entrada: 'Conjunto no balanceado',
      devuelve: 'El conjunto original + ejemplos sintéticos de la clase minoritaria',
      funcionamiento:
        'Para cada ejemplo de la clase minoritaria se buscan sus k vecinos más cercanos de la misma clase y se introducen ejemplos sintéticos en el segmento que lo une con cualquiera/todos esos vecinos. Crea instancias nuevas usando la similitud en el espacio de características.',
      fuertes: ['Evita el sobreajuste del sobremuestreo por copia', 'Rellena la región de la clase minoritaria en lugar de repetir puntos'],
      debiles: ['Si la minoritaria tiene ruido, se generan puntos sintéticos ruidosos', 'Puede invadir la región de la otra clase'],
      parametros: ['k vecinos', 'Cantidad de sobremuestreo (%)'],
      weka: 'Filtro supervised › instance › SMOTE (paquete adicional)',
    },
    esquema: [
      { k: 'in', t: 'Ejemplos de la clase minoritaria' },
      {
        k: 'bucle',
        t: 'Para cada ejemplo minoritario x',
        pasos: [
          { k: 'paso', t: 'Buscar sus k vecinos minoritarios' },
          { k: 'paso', t: 'Elegir un vecino v' },
          { k: 'paso', t: 'Nuevo punto = x + λ·(v − x), λ ∈ [0,1]' },
        ],
      },
      { k: 'out', t: 'Datos más balanceados' },
    ],
    secciones: [{ t: 'Fórmula', b: [{ f: 'x_{\\text{nuevo}} = x_i + \\lambda\\,(x_{vecino} - x_i),\\quad \\lambda \\sim U(0,1)' }] }],
    ejemplo: 'Smote',
    rel: [
      ['knn', 'busca vecinos más cercanos'],
      ['sobreajuste', 'lo que intenta evitar frente al sobremuestreo por copia'],
    ],
  },

  // ───────────────────────── DISCRETIZACIÓN ─────────────────────────
  {
    id: 'discretizacion',
    nombre: 'Discretización',
    padre: 'preparacion',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T4',
    parte: 1,
    resumen:
      'Transformar un atributo continuo en uno discreto dividiendo su rango en un número finito de intervalos con etiqueta.',
    esquema: [
      { k: 'in', t: 'Atributo continuo' },
      { k: 'paso', t: 'Ordenación', d: 'ordenar los valores del atributo' },
      {
        k: 'bucle',
        t: 'Mientras no se cumpla el criterio de parada',
        pasos: [
          { k: 'paso', t: 'Evaluación', d: 'obtener punto de corte o intervalos adyacentes candidatos y medirlos' },
          { k: 'si', t: '¿La medida es aceptable?', si: 'seguir', no: 'probar otro candidato' },
          { k: 'paso', t: 'División / combinación', d: 'dividir o mezclar intervalos adyacentes' },
        ],
      },
      { k: 'out', t: 'Atributo discretizado' },
    ],
    secciones: [
      {
        t: 'Concepto',
        b: [
          'Los valores discretos representan la información de forma **más concisa**, son **más fáciles de entender** y están más cerca de la representación a nivel de conocimiento. Discretizar es **cuantificar** un atributo numérico: se asocian valores categóricos a intervalos y se guardan solo las etiquetas.',
          'Como los valores nominales tienen un dominio finito, también se considera una **técnica de reducción de datos**. Puede hacerse **antes** o **durante** la obtención de conocimiento.',
          'Ejemplo: nota numérica $[0,10]$ → {Suspenso, Aprobado, Notable, Sobresaliente}. Otros de las diapositivas: EDAD → [5,15], [16,24], [25,67] según tener coche en propiedad; PESO → 50–58 kg, 59–67 kg, > 68 kg según los picos de su distribución.',
        ],
      },
      {
        t: 'Definición formal',
        b: [
          'Dado un problema de clasificación con P ejemplos y C valores de la variable objetivo, un algoritmo de discretización divide una variable continua A en m intervalos:',
          { f: 'D = \\{[d_0, d_1], (d_1, d_2], \\dots, (d_{m-1}, d_m]\\}' },
          '$d_0$ es el mínimo, $d_m$ el máximo y $d_i < d_{i+1}$. D es el **esquema de discretización** de A y $P = \\{d_0, d_1, \\dots, d_m\\}$ es el **conjunto de puntos de corte**.',
        ],
      },
      {
        t: '¿Por qué hace falta?',
        b: [
          {
            vs: [
              {
                t: 'Ventajas',
                items: [
                  'Muchos algoritmos están diseñados para atributos discretos.',
                  'Con datos continuos, el aprendizaje suele ser menos eficiente y efectivo.',
                  'Reduce y simplifica los datos: aprendizaje más rápido; resultados más precisos, compactos y sencillos.',
                  'Para el usuario final las variables discretas son más fáciles de interpretar.',
                ],
              },
              {
                t: 'Inconveniente',
                items: ['**Toda discretización conlleva una pérdida de información.** El objetivo de cualquier discretizador es minimizar esa pérdida.'],
              },
            ],
          },
        ],
      },
      {
        t: 'Tipos de discretizadores (7 criterios)',
        b: [
          {
            tabla: {
              cab: ['Criterio', 'Opción A', 'Opción B'],
              filas: [
                ['Variables', '**Univariable**: variable a variable', '**Multivariable**: de forma conjunta'],
                ['Clase', '**Supervisado**: usa la variable objetivo', '**No supervisado**: no la usa'],
                ['Momento', '**Dinámico**: mientras se construye el modelo', '**Estático**: antes'],
                ['Alcance', '**Local**: una subregión del espacio de instancias', '**Global**: todas las instancias'],
                ['Dirección', '**Top-down**: empieza con la lista de cortes vacía', '**Bottom-up**: empieza con la lista llena'],
                ['Optimización', '**Directo**: sin optimización posterior', '**Incremental**: con optimización posterior'],
                ['Operación', '**Divisor**: crea intervalos dividiendo', '**Mezclador**: crea intervalos mezclando previos'],
              ],
            },
          },
          { nota: 'Regla para recordarlo: top-down ≈ divisor (empieza sin cortes y va partiendo), bottom-up ≈ mezclador (empieza con cada valor como intervalo y va fusionando).', tipo: 'idea' },
          {
            vs: [
              { t: 'Algoritmo de división', items: ['1. Ordena los valores.', '2. Busca un punto de corte apropiado.', '3. Divide el rango según el corte.', '4. Para si se cumple el criterio; si no, vuelve a 2.'] },
              { t: 'Algoritmo de mezcla', items: ['1. Ordena los valores.', '2. Encuentra la mejor pareja de intervalos adyacentes.', '3. Los mezcla en un único intervalo.', '4. Para si se cumple el criterio; si no, vuelve a 2.'] },
            ],
          },
        ],
      },
      {
        t: 'Taxonomía (Liu et al., 2002)',
        b: [
          { demo: 'TaxonomiaDiscretizacion' },
          'Nivel 1: **mezcla** o **división**. Nivel 2: supervisado o no. Nivel 3: medida usada (dependencia, binning, entropía, exactitud). Nivel 4: método concreto. Fíjate en que [[oner|1R]] aparece como binning supervisado e [[id3]] como discretizador por entropía.',
        ],
      },
      {
        t: 'Comparar discretizadores',
        b: [
          {
            def: [
              ['Número de intervalos', 'tan pequeño como sea posible: muchos intervalos → aprendizaje lento e inefectivo.'],
              ['Inconsistencia', 'medida supervisada: número de errores inevitables. **Error inevitable**: dos ejemplos con iguales valores de entrada y distinta clase.'],
              ['Capacidad predictiva', 'no debería disminuir significativamente.'],
              ['Coste en tiempo', 'especialmente relevante en discretización dinámica.'],
            ],
          },
          '¿Cuál es mejor? **No hay directrices válidas para todos los problemas.** Resultados experimentales:',
          {
            ul: [
              'Respecto a la inconsistencia, casi todos tienen menor ratio en test que en entrenamiento.',
              'Hay una relación directa entre el discretizador y el método de aprendizaje; es especialmente crítica en **inducción de reglas**.',
              'Los clásicos obtienen con frecuencia los mejores resultados: **[[chimerge|ChiMerge]], [[mdlp|MDLP]], Distance y Chi2**.',
              'Nuevos prometedores: Khiops, CAIM, MODL, Ameva y CACC.',
            ],
          },
          'La diapositiva de comparación muestra el mismo conjunto discretizado con igual anchura, igual frecuencia y k-medias: los cortes caen en sitios distintos según el método.',
        ],
      },
    ],
    rel: [
      ['c45', 'discretiza internamente con un umbral binario'],
      ['naive-bayes', 'el acierto cambia según los intervalos'],
      ['entropia', 'base de MDLP'],
    ],
  },
  {
    id: 'no-supervisada',
    nombre: 'Discretización no supervisada',
    padre: 'discretizacion',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T4 · 2',
    parte: 1,
    resumen: 'No usan la clase. Son métodos de binning, divisores, directos y estáticos.',
    secciones: [
      {
        t: 'Qué tienen en común',
        b: [
          'Igual amplitud e igual frecuencia son de **binning**, **divisores**, **directos** y **estáticos**, y no usan la información de la clase.',
          'Consideraciones adicionales para los dos: **crear cajas para valores especiales**, usar **puntos de corte interpretables** y tener en cuenta que son **sensibles a la aridad** (el número k de intervalos que fijas).',
        ],
      },
    ],
  },
  {
    id: 'igual-amplitud',
    nombre: 'Intervalos de igual amplitud',
    corto: 'Igual amplitud',
    padre: 'no-supervisada',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T4 · 2',
    parte: 1,
    resumen: 'Dividir el rango en k intervalos de la misma anchura.',
    ficha: {
      entrada: 'Atributo numérico y número de intervalos k',
      devuelve: 'k intervalos de anchura (máx − mín)/k',
      funcionamiento: 'Anchura = (máx − mín)/k; los cortes son mín + anchura, mín + 2·anchura… Cada valor va al intervalo en que cae.',
      fuertes: ['Trivial de calcular', 'Cortes fáciles de interpretar'],
      debiles: ['Puede producir desequilibrios: con salarios casi todo cae en el primer intervalo', 'Sensible a outliers y a la aridad', 'Ignora la clase'],
      parametros: ['k (número de intervalos)'],
      weka: 'Filtro unsupervised › attribute › Discretize (useEqualFrequency = False)',
    },
    esquema: [
      { k: 'in', t: 'Valores ordenados, k' },
      { k: 'paso', t: 'anchura = (máx − mín) / k' },
      { k: 'paso', t: 'Cortes: mín + i·anchura, i = 1…k−1' },
      { k: 'out', t: 'Asignar cada valor a su intervalo' },
    ],
    secciones: [
      {
        t: 'Ejemplo de clase: temperaturas',
        b: [
          'Valores: 64 65 68 69 70 71 72 72 75 75 80 81 83 85, k = 7 → anchura 3: [64,67) [67,70) [70,73) [73,76) [76,79) [79,82) [82,85] con frecuencias 2, 2, 4, 2, **0**, 2, 2. Aparece un intervalo vacío.',
          'En la diapositiva del salario de una empresa, $[0, 200M)$ concentra casi todos los valores y $[1800M, 2000M]$ casi ninguno: **¿qué podemos hacer para conseguir una mejor distribución?** → [[igual-frecuencia]].',
        ],
      },
    ],
    ejemplo: 'Binning',
    rel: [['igual-frecuencia', 'la alternativa que equilibra las cajas']],
  },
  {
    id: 'igual-frecuencia',
    nombre: 'Intervalos de igual frecuencia',
    corto: 'Igual frecuencia',
    padre: 'no-supervisada',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T4 · 2',
    parte: 1,
    resumen: 'Dividir en k intervalos que contengan N/k valores cada uno.',
    ficha: {
      entrada: 'Atributo numérico y número de intervalos k',
      devuelve: 'k intervalos con (aproximadamente) el mismo número de valores',
      funcionamiento: 'Se ordenan los valores y se cortan en bloques de N/k valores consecutivos.',
      fuertes: ['Cajas equilibradas aunque la distribución esté sesgada', 'Sin intervalos vacíos'],
      debiles: ['Los cortes pueden quedar en sitios poco interpretables', 'Valores repetidos pueden quedar en cajas distintas', 'Ignora la clase'],
      parametros: ['k (o el número de valores por intervalo)'],
      weka: 'Filtro unsupervised › attribute › Discretize (useEqualFrequency = True)',
    },
    esquema: [
      { k: 'in', t: 'N valores ordenados, k' },
      { k: 'paso', t: 'Tamaño de cada caja = N / k' },
      { k: 'paso', t: 'Cortar cada N/k valores' },
      { k: 'out', t: 'k intervalos de igual frecuencia' },
    ],
    secciones: [
      {
        t: 'Ejemplo de clase: temperaturas',
        b: ['Mismos 14 valores con 4 valores por caja: [64 … 69] [70 … 72] [73 … 81] [83 … 85] → frecuencias 4, 4, 4, 2. Igual frecuencia = 4, excepto el último intervalo.'],
      },
    ],
    ejemplo: 'Binning',
    rel: [['igual-amplitud', 'la alternativa por anchura']],
  },
  {
    id: 'supervisada',
    nombre: 'Discretización supervisada',
    padre: 'discretizacion',
    tipo: 'familia',
    salida: 'prep',
    tema: 'T4 · 3',
    parte: 1,
    resumen: 'Usan la clase para elegir los cortes. Los dos del temario: MDLP (división) y ChiMerge (mezcla).',
    secciones: [
      {
        t: 'Los dos clásicos',
        b: [
          {
            tabla: {
              cab: ['', '[[mdlp|MDLP]] (Fayyad e Irani, 1993)', '[[chimerge|ChiMerge]] (Kerber, 1992)'],
              filas: [
                ['Tipo', 'División (top-down)', 'Mezcla (bottom-up)'],
                ['Medida', 'Entropía / ganancia de información', 'Test $\\chi^2$ entre intervalos adyacentes'],
                ['Parada', 'Criterio MDL (umbral δ)', 'Nivel de significancia + nº máximo de intervalos'],
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'mdlp',
    nombre: 'MDLP (Fayyad e Irani)',
    corto: 'MDLP',
    padre: 'supervisada',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T4 · 3',
    parte: 1,
    resumen: 'Divisor basado en entropía: acepta un corte solo si la ganancia de información supera el umbral del Minimum Description Length Principle.',
    ficha: {
      entrada: 'Atributo numérico + clase',
      devuelve: 'Cortes que hacen los intervalos lo más puros posible',
      funcionamiento:
        'Método de división que evalúa cada punto de corte candidato con la entropía de la clase. Busca la partición con máxima ganancia de información y la acepta solo si supera el umbral MDL; después se aplica recursivamente a cada mitad. δ actúa como umbral, así que el criterio de parada también es MDLP.',
      fuertes: ['Elige automáticamente el número de intervalos', 'Intervalos puros (casi una sola clase cada uno)', 'Uno de los mejores en los estudios experimentales'],
      debiles: ['Necesita la clase (solo sirve en problemas supervisados)', 'Más costoso que el binning'],
      parametros: ['Ninguno relevante: el umbral lo da MDL'],
      weka: 'Filtro supervised › attribute › Discretize (método por defecto)',
    },
    esquema: [
      { k: 'in', t: 'Valores ordenados con su clase (conjunto S de N ejemplos)' },
      { k: 'paso', t: 'Para cada corte T candidato: calcular G(A,T;S)' },
      { k: 'paso', t: 'Elegir el corte de máxima ganancia' },
      { k: 'si', t: '¿G supera log₂(N−1)/N + δ/N?', si: 'aceptar y repetir en S₁ y S₂', no: 'parar (no se divide)' },
      { k: 'out', t: 'Conjunto de puntos de corte' },
    ],
    secciones: [
      {
        t: 'Criterio de aceptación',
        b: [
          'Intuitivamente, encuentra la mejor partición de cada atributo de forma que las divisiones sean lo **más puras posible**: que la mayoría de valores de cada división correspondan a la misma clase. Formalmente, acepta la partición inducida por un corte T en un conjunto S de N ejemplos si:',
          { f: 'G(A,T;S) > \\frac{\\log_2(N-1)}{N} + \\frac{\\delta(A,T;S)}{N}' },
          { f: '\\delta(A,T;S) = \\log_2(3^c - 2) - \\left[c\\,H(S) - c_1 H(S_1) - c_2 H(S_2)\\right]' },
          'c, c₁ y c₂ son el número de clases presentes en S, S₁ y S₂; H es la [[entropia]] y G la [[ganancia-informacion]].',
        ],
      },
    ],
    rel: [
      ['entropia', 'mide la pureza de cada intervalo'],
      ['id3', 'misma ganancia de información'],
      ['c45', 'también busca el corte de máxima ganancia'],
    ],
  },
  {
    id: 'chimerge',
    nombre: 'ChiMerge (Kerber)',
    corto: 'ChiMerge',
    padre: 'supervisada',
    tipo: 'algoritmo',
    salida: 'prep',
    tema: 'T4 · 3',
    parte: 1,
    resumen: 'Mezclador bottom-up: fusiona los intervalos adyacentes cuya distribución de clases es más parecida según χ².',
    ficha: {
      entrada: 'Atributo numérico + clase',
      devuelve: 'Intervalos en los que las clases se distribuyen de forma distinta',
      funcionamiento:
        'Al principio cada valor distinto es un intervalo. Se calcula $\\chi^2$ para cada par de intervalos adyacentes y se mezclan los de menor $\\chi^2$ (los más parecidos), hasta cumplir el criterio de parada.',
      fuertes: ['Uno de los clásicos con mejores resultados', 'Fronteras con sentido estadístico'],
      debiles: ['Hay que fijar el nivel de significancia', 'Coste alto si hay muchos valores distintos'],
      parametros: ['Nivel de significancia de $\\chi^2$ (criterio de parada)', 'Número máximo de intervalos (evita que salgan demasiados)'],
    },
    esquema: [
      { k: 'in', t: 'Cada valor distinto = un intervalo' },
      {
        k: 'bucle',
        t: 'Mientras no se cumpla la parada',
        pasos: [
          { k: 'paso', t: 'Calcular χ² de cada par de intervalos adyacentes' },
          { k: 'paso', t: 'Mezclar el par con menor χ²' },
          { k: 'si', t: '¿Todos los χ² superan el umbral de significancia (o se alcanzó el máximo de intervalos)?', si: 'parar', no: 'seguir mezclando' },
        ],
      },
      { k: 'out', t: 'Intervalos finales' },
    ],
    secciones: [
      {
        t: 'El test χ²',
        b: [
          { f: '\\chi^2 = \\sum_{i=1}^{2}\\sum_{j=1}^{k} \\frac{(A_{ij}-E_{ij})^2}{E_{ij}},\\qquad E_{ij} = \\frac{R_i\\,C_j}{N}' },
          '$A_{ij}$: ejemplos del intervalo i con clase j; $R_i$: ejemplos del intervalo i; $C_j$: ejemplos de clase j en los dos intervalos; N: total de los dos. Un $\\chi^2$ bajo significa que la clase es **independiente** del intervalo → los dos intervalos se pueden fusionar.',
        ],
      },
    ],
    ejemplo: 'ChiMerge',
    rel: [['mdlp', 'el otro supervisado clásico, en dirección contraria']],
  },
];
