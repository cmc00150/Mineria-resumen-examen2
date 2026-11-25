// PARTE III · Clasificación con otras técnicas (Tema 7)

export const otras = [
  // ───────────── PROBABILÍSTICOS ─────────────
  {
    id: 'probabilisticos',
    nombre: 'Clasificadores bayesianos',
    corto: 'Probabilísticos (Bayes)',
    padre: 'clasificacion',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T7 · 1',
    parte: 3,
    resumen: 'Representan la incertidumbre de forma natural: devuelven una distribución de probabilidad sobre las clases en lugar de una sola etiqueta.',
    secciones: [
      {
        t: 'Frente a los clasificadores nítidos',
        b: [
          'Las reglas y los árboles *crisp* representan **relaciones deterministas** entre los valores de las variables. Los métodos probabilísticos:',
          {
            ul: [
              'representan la **incertidumbre** asociada a los procesos de forma natural;',
              'consideran todas las variables a la vez mediante la **distribución de probabilidad conjunta (DPC)** → ventaja, pero el número de probabilidades de la DPC es enorme incluso con n moderado;',
              'extienden la incertidumbre a la predicción: devuelven una **distribución de probabilidad** para la clase.',
            ],
          },
          'Ejemplo de la bolsa: un árbol diría (P1, invertir) y (P2, invertir) → repartir a partes iguales. Una red bayesiana diría P1 invertir con 0,9 y P2 con 0,52 → repartir a partes iguales ya no parece razonable.',
        ],
      },
      {
        t: 'Teorema de Bayes e hipótesis MAP',
        b: [
          { f: 'P(Y \\mid X_1,\\dots,X_n) = \\frac{P(X_1,\\dots,X_n \\mid Y)\\,P(Y)}{P(X_1,\\dots,X_n)}' },
          'Un clasificador bayesiano devuelve la clase **más probable a posteriori** (hipótesis MAP, máxima a posteriori). El denominador es igual para todas las clases, así que se puede quitar:',
          { f: 'C(x) = \\arg\\max_{y} P(y \\mid x_1,\\dots,x_n) = \\arg\\max_{y} P(x_1,\\dots,x_n \\mid y)\\,P(y) = \\arg\\max_y P(x_1,\\dots,x_n, y)' },
          { nota: 'Problema: hay que trabajar con la DPC, que normalmente es inmanejable incluso para valores pequeños de n. La solución más simple es [[naive-bayes]].', tipo: 'examen' },
        ],
      },
    ],
    rel: [['redes-bayesianas', 'el modelo general']],
  },
  {
    id: 'naive-bayes',
    nombre: 'Naïve Bayes',
    padre: 'probabilisticos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T7 · 1.2',
    parte: 3,
    resumen: 'La red bayesiana más simple: supone que todos los atributos son independientes conocida la clase.',
    ficha: {
      entrada: 'Discretos (frecuencias) y numéricos (gaussiana por clase)',
      interpretable: 'Parcialmente (tablas de probabilidades)',
      devuelve: 'Una probabilidad para cada clase; se predice la de mayor valor (MAP)',
      funcionamiento:
        'Factoriza la DPC como $P(y)\\prod_i P(x_i\\mid y)$. Aprende en una pasada P(Y) y cada P(Xᵢ | y) por frecuencias (discretas) o media y desviación por clase (numéricas). Para clasificar multiplica y elige la clase con el producto mayor.',
      fuertes: [
        'Competitivo con la mayoría de clasificadores a pesar de su suposición poco realista',
        'Solo aprendizaje paramétrico, no estructural',
        'Muy eficiente en tiempo y espacio',
        'Incremental: útil con data streams y aprendizaje adaptativo',
        'Fácil de implementar',
      ],
      debiles: [
        'La independencia es una suposición que no se comprueba: la DPC es una aproximación',
        'Buen clasificador pero mal estimador de la probabilidad a posteriori',
        'No puede modelar dependencias entre variables',
        'Las variables redundantes causan problemas (→ selección de variables)',
      ],
      parametros: ['Corrección de Laplace sí/no', 'Gaussiana o discretización para numéricos'],
      weka: 'bayes › NaiveBayes',
    },
    esquema: [
      { k: 'in', t: 'Nuevo caso x = (x₁, …, xₙ)' },
      {
        k: 'bucle',
        t: 'Para cada clase y',
        pasos: [
          { k: 'paso', t: 'Empezar con P(y)' },
          { k: 'paso', t: 'Multiplicar por P(xᵢ | y) de cada atributo', d: 'discreto: frecuencia (con Laplace) · numérico: densidad normal N(x; μ, σ)' },
        ],
      },
      { k: 'paso', t: 'Normalizar (opcional) para obtener probabilidades' },
      { k: 'out', t: 'Clase con mayor valor (MAP)' },
    ],
    secciones: [
      {
        t: 'El modelo',
        b: [
          { f: 'P(x_1,\\dots,x_n, y) = P(y) \\prod_{i=1}^{n} P(x_i \\mid y)' },
          { f: 'C(x) = \\arg\\max_{y} \\; P(y)\\prod_{i=1}^{n} P(x_i \\mid y)' },
          'Gráficamente, la clase es el único padre de todos los atributos (estructura en estrella) y no hay arcos entre atributos.',
          { demo: 'EstrellaNB' },
          '¿Por qué funciona tan bien? **La clasificación no necesita probabilidades exactas**, basta con que la mayor se asigne a la clase correcta.',
        ],
      },
      {
        t: 'Estimación de parámetros',
        b: [
          'Hay que estimar la marginal P(Y) y n condicionales P(Xᵢ | y); se aprenden todas en **una pasada** por los datos.',
          '**Variables discretas.** Máxima verosimilitud (EMV): frecuencia relativa de los ejemplos de la clase $c_j$ con $X_i = x_i$:',
          { f: 'P(x_i \\mid c_j) = \\frac{n(x_i, c_j)}{n(c_j)} \\qquad \\text{Laplace: } P(x_i \\mid c_j) = \\frac{n(x_i, c_j) + 1}{n(c_j) + L_i}' },
          '$L_i$ es el número de valores que puede tomar $X_i$. Con muchos casos, Laplace tiende a la EMV; con pocos, tiende a la uniforme (y evita probabilidades 0 que anulan todo el producto).',
          { nota: 'En el PDF la fórmula aparece desordenada (con n(xᵢ) en el numerador y n(xᵢ,cⱼ) en el denominador). La correcta es la de arriba: casos con ese valor y esa clase entre casos de esa clase.', tipo: 'ojo' },
          '**Variables numéricas.** Se asume que siguen una **normal** dentro de cada clase: se estima una media μ y una desviación σ por clase.',
          { f: 'P(x \\mid c_i) = N(x;\\mu,\\sigma) = \\frac{1}{\\sqrt{2\\pi}\\,\\sigma}\\,e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
        ],
      },
      {
        t: 'Ejemplo de clase: tenis con temperatura y humedad numéricas',
        b: [
          'Estimaciones (desviación típica muestral, n − 1): temperatura | no: μ = 74,6, σ = 7,89; | sí: μ = 73, σ = 6,16. Humedad | no: μ = 86,6 en la diapositiva (en realidad 86,2), σ = 9,73; | sí: μ = 79,11, σ = 10,21.',
          'Nuevo caso x = (outlook = sunny, temp = 87, hum = 90, windy = false):',
          {
            ul: [
              'NO: 0,36 · 0,6 · 0,4 · N(87; 74,6, 7,89) · N(90; 86,6, 9,73) = 0,36 · 0,6 · 0,4 · 0,014706 · 0,038573 = **4,08·10⁻⁵**',
              'SÍ: 0,64 · 0,22 · 0,67 · N(87; 73, 6,16) · N(90; 79,11, 10,21) = 0,64 · 0,22 · 0,67 · 0,004894 · 0,022123 = **1,02·10⁻⁵**',
              'Normalizando (diapositiva): P(NO) = 0,8, P(SÍ) = 0,2 → **no se juega**.',
            ],
          },
          { nota: 'Erratas: (1) la línea de YES empieza por «P(NO)» y debe ser P(YES) = 0,64; (2) llama P(x|NO) a lo que en realidad es P(x, NO) = P(NO)·P(x|NO); (3) la media de la humedad para «no» es 86,2 (85, 90, 70, 95, 91), no 86,6; (4) el producto de NO está mal multiplicado: 0,36 · 0,6 · 0,4 · 0,014706 · 0,038573 = 4,90·10⁻⁵, no 4,08·10⁻⁵. Con las cuentas bien, P(NO) ≈ 0,82 y P(SÍ) ≈ 0,18: la conclusión (no se juega) no cambia.', tipo: 'ojo' },
        ],
      },
      {
        t: 'Ejemplo en Weka: iris y la discretización',
        b: [
          {
            tabla: {
              cab: ['Tratamiento de los numéricos', 'Acierto (10-cv)'],
              filas: [
                ['Gaussiana (por defecto)', '144/150 = 96 %'],
                ['Igual anchura, 2 intervalos', '116/150 = 77,33 %'],
                ['Igual anchura, 3 intervalos (tras análisis exploratorio)', '141/150 = 94 %'],
              ],
            },
          },
          'Con discretización Weka muestra "Discrete Estimator. Counts = …" con totales 52 y 53: son los recuentos **con Laplace** (50 ejemplos por clase + 1 por cada intervalo). La lección: [[discretizacion|cómo discretizas]] cambia mucho el resultado.',
        ],
      },
    ],
    ejemplo: 'NaiveBayes',
    rel: [
      ['redes-bayesianas', 'la solución cuando hay dependencias'],
      ['igual-amplitud', 'discretización usada con iris'],
    ],
  },
  {
    id: 'redes-bayesianas',
    nombre: 'Redes de creencia bayesianas',
    corto: 'Redes bayesianas',
    padre: 'probabilisticos',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T7 · 1',
    parte: 3,
    resumen: 'Combinan razonamiento bayesiano con relaciones causales entre atributos. Solo se mencionan como solución a la independencia de Naïve Bayes.',
    ficha: {
      entrada: 'Variables discretas (normalmente)',
      interpretable: 'Sí (grafo de dependencias)',
      devuelve: 'Distribución de probabilidad de la clase',
      funcionamiento: 'Un grafo dirigido acíclico con una tabla de probabilidad condicionada por nodo; a diferencia de Naïve Bayes, permite arcos entre atributos.',
      fuertes: ['Modela dependencias entre variables', 'Representa la incertidumbre de forma natural'],
      debiles: ['Requiere aprendizaje estructural (además del paramétrico)'],
      parametros: ['Algoritmo de búsqueda de estructura'],
      weka: 'bayes › BayesNet',
    },
    esquema: [
      { k: 'in', t: 'Datos' },
      { k: 'paso', t: 'Aprender la estructura (qué arcos hay)' },
      { k: 'paso', t: 'Aprender las tablas de probabilidad' },
      { k: 'out', t: 'Inferir P(clase | evidencia)' },
    ],
    rel: [['naive-bayes', 'caso particular: estrella sin arcos entre atributos']],
  },

  // ───────────── NEURONALES ─────────────
  {
    id: 'neuronales',
    nombre: 'Redes neuronales',
    padre: 'clasificacion',
    tipo: 'familia',
    salida: 'ambas',
    tema: 'T7 · 2',
    parte: 3,
    resumen: 'Computación distribuida mediante la interconexión de procesadores elementales (neuronas). Muy precisas pero cajas negras.',
    secciones: [
      {
        t: 'Inspiración biológica',
        b: [
          'Surgen como intento de emular el sistema nervioso: **paralelismo masivo**. Cada neurona recibe estímulos de otras (entradas), los procesa (acumula estímulos y se activa al alcanzar un punto de saturación), canaliza la salida y la transmite a otras neuronas: los terminales del axón, mediante las sinapsis, la hacen llegar a las dendritas de otras neuronas.',
          'Una red neuronal artificial es **computación modular distribuida** mediante la interconexión de procesadores elementales de información.',
        ],
      },
      {
        t: 'Ventajas, desventajas y cuándo usarlas',
        b: [
          {
            vs: [
              {
                t: 'Ventajas',
                items: [
                  'Habitualmente gran tasa de acierto',
                  'Robustez y flexibilidad: aprenden incluso con información incompleta o ambigua',
                  'Rapidez al evaluar nuevos casos',
                  'Excelentes en tareas complejas: patrones visuales, audio, temporales, lenguaje',
                ],
              },
              {
                t: 'Desventajas',
                items: ['Mucho tiempo de entrenamiento', 'Poca o ninguna interpretabilidad (caja negra)', 'Difícil incorporar conocimiento del dominio', 'Pueden sobreaprender'],
              },
            ],
          },
          '**¿Cuándo usarlas?** Entrada de alta dimensión, posibilidad de datos con ruido, forma de la función objetivo desconocida e interpretabilidad no importante.',
        ],
      },
      {
        t: 'Desarrollos históricos',
        b: [
          {
            tabla: {
              cab: ['Año', 'Hito'],
              filas: [
                ['1943', '[[neurona-mcp|Célula de McCulloch y Pitts]]'],
                ['1949', 'Regla de Hebb sobre aprendizaje'],
                ['1958', '[[perceptron|Perceptrón]] (Rosenblatt)'],
                ['1959', 'ADALINE (Widrow y Hoff)'],
                ['1962', 'Regla delta / LMS (Widrow y Hoff)'],
                ['1969', 'Limitaciones del perceptrón (Minsky y Papert)'],
                ['1972', 'Memorias asociativas (Kohonen)'],
                ['1982', 'Redes de Hopfield · Mapas autoorganizativos SOM (Kohonen)'],
                ['1986', '[[mlp|Backpropagation y perceptrón multicapa]] (Rumelhart, Hinton y Williams)'],
                ['1988', 'Redes de funciones de base radial (Broomhead y Lowe)'],
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'neurona-mcp',
    nombre: 'Neurona de McCulloch-Pitts',
    padre: 'neuronales',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T7 · 2',
    parte: 3,
    resumen: 'El modelo de neurona artificial: suma ponderada de las entradas, menos un umbral, pasada por una función de activación.',
    ficha: {
      entrada: 'Valores numéricos x₁ … xₙ',
      interpretable: 'Sí (es una sola fórmula)',
      devuelve: 'Una salida yⱼ = f(Netⱼ − θⱼ)',
      funcionamiento:
        'Cada entrada se multiplica por su peso sináptico (positivo = excitadora, negativo = inhibidora, cero = sin conexión). Se suman (Net) y se aplica la función de activación al resultado menos el umbral θ.',
      fuertes: ['Base de todas las redes', 'El umbral se puede tratar como un peso más con entrada fija −1'],
      debiles: ['Una sola neurona solo separa linealmente'],
      parametros: ['Pesos wⱼᵢ', 'Umbral θⱼ', 'Función de activación'],
    },
    esquema: [
      { k: 'in', t: 'Entradas x₁ … xₙ (+ entrada fija −1 para el umbral)' },
      { k: 'paso', t: 'Netⱼ = Σ wⱼᵢ · xᵢ' },
      { k: 'paso', t: 'Restar el umbral θⱼ' },
      { k: 'out', t: 'yⱼ = f(Netⱼ − θⱼ)' },
    ],
    secciones: [
      {
        t: 'Fórmulas',
        b: [
          { f: 'Net_j = w_{j1}x_1 + w_{j2}x_2 + \\dots + w_{jn}x_n = \\sum_{i=1}^{n} w_{ji}\\,x_i' },
          { f: 'y_j = f(Net_j - \\theta_j) = f\\Big(\\sum_i w_{ji}x_i - \\theta_j\\Big)' },
        ],
      },
      {
        t: 'Funciones de activación',
        b: [
          {
            def: [
              ['Escalón', 'dos estados: activada (1) o inhibida (0 o −1) según si Net ≥ θ.'],
              ['Lineal', '$y = Net - \\theta$.'],
              ['Lineal a tramos', 'lineal entre −a y a, saturada a −1 y 1 fuera.'],
              ['Sigmoidal', '$y = \\frac{1}{1+e^{-(Net-\\theta)}}$ (o la versión entre −1 y 1).'],
              ['Base radial', '$y = e^{-\\left(\\frac{Net-\\theta}{\\sigma}\\right)^2}$.'],
            ],
          },
          { demo: 'Activaciones' },
        ],
      },
    ],
    rel: [['perceptron', 'la neurona que aprende sus pesos']],
  },
  {
    id: 'perceptron',
    nombre: 'Perceptrón (una neurona que aprende)',
    corto: 'Perceptrón',
    padre: 'neuronales',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T7 · 2',
    parte: 3,
    resumen: 'Una neurona con activación escalón que corrige sus pesos con Wᵢ ← Wᵢ + α·D·xᵢ hasta que la salida es correcta.',
    ficha: {
      entrada: 'Ejemplos numéricos con salida deseada Z',
      interpretable: 'Sí (una ecuación lineal)',
      devuelve: 'Los pesos finales: una frontera lineal',
      funcionamiento: 'Para cada ejemplo calcula Y = escalón(W₁X₁ + W₂X₂ > umbral). La diferencia D = Z − Y corrige los pesos: Wᵢ ← Wᵢ + α·D·Xᵢ. Repite iteraciones hasta que no cambia nada.',
      fuertes: ['Regla de aprendizaje muy simple', 'Converge si el problema es linealmente separable'],
      debiles: ['Solo fronteras lineales (no aprende XOR; Minsky y Papert, 1969)'],
      parametros: ['α (tasa de aprendizaje) = 0,2', 'Umbral = 0,5', 'Pesos iniciales (semilla) 0,1 y 0,3'],
    },
    esquema: [
      { k: 'in', t: 'Pesos iniciales W₁, W₂' },
      {
        k: 'bucle',
        t: 'Repetir iteraciones',
        pasos: [
          {
            k: 'bucle',
            t: 'Para cada ejemplo (X₁, X₂, Z)',
            pasos: [
              { k: 'paso', t: 'Y = 1 si W₁X₁ + W₂X₂ > 0,5; si no 0' },
              { k: 'paso', t: 'D = Z − Y' },
              { k: 'paso', t: 'Wᵢ ← Wᵢ + α · D · Xᵢ' },
            ],
          },
        ],
      },
      { k: 'out', t: 'Pesos que no cambian en toda una iteración' },
    ],
    secciones: [
      {
        t: 'Ejemplo de clase: aprender la OR inclusiva',
        b: [
          'α = 0,2, umbral = 0,5, pesos iniciales 0,1 y 0,3. En la iteración 4 ya no hay errores y los pesos quedan en 0,7 y 0,7: la ecuación aprendida es $a = 0{,}7x_1 + 0{,}7x_2$.',
          'Fíjate en el detalle de la iteración 3: con (1,0) y W₁ = 0,5 la suma es exactamente 0,5, que **no supera** el umbral → Y = 0 → se corrige a 0,7.',
        ],
      },
    ],
    ejemplo: 'Perceptron',
    rel: [
      ['mlp', 'varias capas para fronteras no lineales'],
      ['neurona-mcp', 'el modelo de neurona que usa'],
    ],
  },
  {
    id: 'mlp',
    nombre: 'Perceptrón multicapa + backpropagation',
    corto: 'MLP',
    padre: 'neuronales',
    alias: ['regresion-adaptados'],
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T7 · 2 · T8 · 3',
    parte: 3,
    resumen: 'Capas de neuronas conectadas hacia delante; los pesos se aprenden propagando el error hacia atrás (gradiente descendente).',
    ficha: {
      entrada: 'Numéricos normalizados a [−1, 1]; nominales → una neurona por valor',
      interpretable: 'Caja negra',
      devuelve: 'Una probabilidad por clase en cada neurona de salida (o un valor numérico en regresión)',
      funcionamiento:
        'Pesos aleatorios pequeños. En cada epoch, cada ejemplo se propaga hacia delante para obtener las salidas Oⱼ; después se calcula el error de las neuronas de salida, se reparte hacia atrás a las ocultas y se actualizan pesos y sesgos.',
      fuertes: ['Aprende funciones no lineales complejas', 'Gran acierto', 'Rápida al clasificar', 'Sirve para regresión con una única neurona de salida'],
      debiles: ['Entrenamiento lento', 'Caja negra', 'Arquitectura difícil de fijar (requiere experiencia)', 'Sobreaprendizaje', 'No permite conexiones hacia atrás'],
      parametros: ['Capas ocultas (en Weka: 0, "a", "t", "4,3,5"…)', 'Tasa de aprendizaje α (η)', 'Número de epochs'],
      weka: 'functions › MultilayerPerceptron',
    },
    esquema: [
      { k: 'in', t: 'Inicializar pesos y sesgos aleatoriamente' },
      {
        k: 'bucle',
        t: 'Para r = 1 … nº de epochs',
        pasos: [
          {
            k: 'bucle',
            t: 'Para cada ejemplo e',
            pasos: [
              { k: 'paso', t: 'Forward: propagar e y guardar la salida Oⱼ de cada neurona' },
              { k: 'paso', t: 'Error de salida: Errⱼ = Oⱼ(1−Oⱼ)(Tⱼ−Oⱼ)' },
              { k: 'paso', t: 'Error oculto: Errⱼ = Oⱼ(1−Oⱼ) Σₖ Errₖ·wⱼₖ' },
              { k: 'paso', t: 'wᵢⱼ ← wᵢⱼ + α·Errⱼ·Oᵢ   ·   θⱼ ← θⱼ + α·Errⱼ' },
            ],
          },
        ],
      },
      { k: 'out', t: 'Clase = neurona de salida con mayor valor' },
    ],
    secciones: [
      {
        t: 'Arquitectura',
        b: [
          'La red más simple tiene la capa de entradas, una **capa oculta** y la salida; cada neurona oculta actúa como una célula de McCulloch-Pitts independiente (sin conexiones entre ellas) y sus salidas se agregan. La arquitectura depende de:',
          {
            def: [
              ['Número de capas', 'cuantas más capas ocultas, más complejas las funciones que puede aprender.'],
              ['Neuronas por capa', 'entrada y salida vienen dadas por las variables; las ocultas son un parámetro importante y difícil de fijar.'],
              ['Conexiones', 'solo con la capa anterior, también con capas previas o incluso dentro de la misma capa.'],
            ],
          },
        ],
      },
      {
        t: 'Cómo diseñarla (guía de Weka)',
        b: [
          {
            def: [
              ['Entradas', 'una neurona por variable numérica o binaria; una por **cada estado** en las nominales de más de dos valores.'],
              ['Salidas', 'una neurona por cada valor de la variable clase.'],
              ['Capas ocultas', '0 = sin capa oculta (**¡solo particiones lineales!**); «4,3,5» = tres capas de 4, 3 y 5 neuronas; comodines **i** (nº de entradas), **o** (nº de salidas), **t** = i + o, **a** = t/2 (**por defecto**).'],
            ],
          },
          'Con la red entrenada, se introducen los valores del ejemplo en las neuronas de entrada; cada neurona de salida indica la probabilidad de esa clase y se asigna la de mayor probabilidad. Las diapositivas prueban la BD *lentes* con capas ocultas 0, a, t y «a,t».',
          'Resolver un problema con una red implica: decidir (con conocimiento experto) los nodos de entrada, de salida y las capas ocultas; fijar pesos y funciones; entrenar propagando cada ejemplo y ajustando los pesos (subirlos para la clase correcta, bajarlos para las demás) y, por último, clasificar el test.',
        ],
      },
      {
        t: 'Backpropagation',
        b: [
          'Gradiente descendente. Todas las variables numéricas se normalizan a $[-1, 1]$. **1 epoch** = procesar todos los ejemplos de la BD.',
          { f: '\\text{Salida: } Err_j = O_j(1-O_j)(T_j - O_j)' },
          { f: '\\text{Oculta: } Err_j = O_j(1-O_j)\\sum_{k} Err_k\\, w_{jk}' },
          { f: 'w_{ij} \\leftarrow w_{ij} + \\alpha\\,Err_j\\,O_i \\qquad \\theta_j \\leftarrow \\theta_j + \\alpha\\,Err_j' },
          'La recursión BP(Nⱼ): si es de entrada, termina; si es de salida o oculta, calcula su error, actualiza pesos y sesgo y llama a BP para cada neurona Nᵢ que le envía conexión.',
          { nota: 'La diapositiva dice «Tⱼ el valor predicho». En realidad Tⱼ es el valor **deseado** (real) y Oⱼ el que produce la red; si no, el error siempre sería 0.', tipo: 'ojo' },
        ],
      },
      {
        t: 'En regresión',
        b: ['La capa de salida es **una sola neurona** y, como los pesos se adaptan en función del error, basta con medir ese error de forma adecuada. Con la BD CPU (100 epochs) obtiene EMA 6,10 % y EAR 6,98 %, el mejor de los métodos comparados. Ver [[regresion-adaptados]].'],
      },
    ],
    ejemplo: 'Red3D',
    rel: [
      ['perceptron', 'una sola neurona'],
      ['bagging', 'las redes también se pueden combinar'],
    ],
  },

  // ───────────── INSTANCIAS ─────────────
  {
    id: 'instancias',
    nombre: 'Basados en instancias',
    padre: 'clasificacion',
    tipo: 'familia',
    salida: 'ambas',
    tema: 'T3 · T7 · T8',
    parte: 3,
    resumen: 'El "modelo" son los propios ejemplos: para predecir se buscan los más parecidos (prototipos).',
    secciones: [
      {
        t: 'Por qué está aquí',
        b: [
          'No tiene un apartado propio en las diapositivas, pero aparece en tres temas: la [[seleccion-prototipos]] existe para mejorarlo (T3), es uno de los 10 algoritmos más influyentes (T6), se cita como «prototipos de clasificación» en las conclusiones (T7) y se usa para regresión (T8).',
        ],
      },
    ],
  },
  {
    id: 'knn',
    nombre: 'kNN · k vecinos más cercanos',
    corto: 'kNN',
    padre: 'instancias',
    alias: ['regresion-adaptados'],
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T3 · T8 · 3',
    parte: 3,
    resumen: 'Para un ejemplo nuevo se buscan los k ejemplos más cercanos: votan su clase (clasificación) o se promedian sus valores (regresión).',
    ficha: {
      entrada: 'Numéricos (normalizados para que la distancia tenga sentido)',
      interpretable: 'Parcialmente (se puede ver qué vecinos decidieron)',
      devuelve: 'Clase mayoritaria de los k vecinos, o la media (ponderada) de sus valores',
      funcionamiento:
        'No hay entrenamiento: se guardan los ejemplos. Para predecir se calcula la distancia a todos, se toman los k más cercanos y se vota o promedia, opcionalmente ponderando con wᵢ = 1/d.',
      fuertes: ['Sin fase de entrenamiento', 'Fronteras de cualquier forma', 'Clasificación y regresión con el mismo algoritmo'],
      debiles: ['Clasificar es caro: hay que comparar con todo el conjunto (de ahí la selección de prototipos)', 'Sensible al ruido (k = 1) y a la escala de los atributos', 'Hay que guardar todos los datos'],
      parametros: ['k', 'Distancia', 'Peso por distancia (1/d)'],
      weka: 'lazy › IBk',
    },
    esquema: [
      { k: 'in', t: 'Ejemplo nuevo e′' },
      { k: 'paso', t: 'Distancia de e′ a todos los ejemplos guardados' },
      { k: 'paso', t: 'Quedarse con los k más cercanos e₁ … eₖ' },
      { k: 'si', t: '¿Clasificación o regresión?', si: 'voto de la mayoría', no: 'media (o media ponderada por 1/d)' },
      { k: 'out', t: 'Predicción' },
    ],
    secciones: [
      {
        t: 'kNN para regresión (Tema 8)',
        b: [
          'Si los k vecinos más cercanos tienen valores $v_1,\\dots,v_k$ para la variable objetivo:',
          { f: '\\hat v = \\frac{1}{k}\\sum_{i=1}^{k} v_i \\quad\\text{(todos cuentan igual)} \\qquad \\hat v = \\frac{\\sum_i w_i v_i}{\\sum_i w_i},\\; w_i = \\frac{1}{d(e_i, e\\prime)}\\quad\\text{(voto ponderado)}' },
          {
            tabla: {
              cab: ['CPU (5-cv)', 'EMA', 'EAR'],
              filas: [
                ['1-NN', '15,13 %', '17,31 %'],
                ['5-NN', '17,53 %', '20,06 %'],
                ['5-NN ponderado por distancia', '13,15 %', '15,04 %'],
                ['[[mlp|Red neuronal]] (100 epochs)', '6,10 %', '6,98 %'],
              ],
            },
          },
        ],
      },
    ],
    ejemplo: 'Knn',
    rel: [
      ['seleccion-prototipos', 'reduce los ejemplos que kNN tiene que guardar'],
      ['cnn', 'basado en 1-NN'],
      ['smote', 'usa los k vecinos'],
    ],
  },

  // ───────────── MULTICLASIFICADORES ─────────────
  {
    id: 'multiclasificadores',
    nombre: 'Multiclasificadores (ensembles)',
    corto: 'Multiclasificadores',
    padre: 'clasificacion',
    tipo: 'familia',
    salida: 'ambas',
    tema: 'T7 · 3',
    parte: 3,
    resumen: 'En lugar de un predictor, se genera un conjunto de predictores base y se combinan: un comité de expertos que vota.',
    esquema: [
      { k: 'in', t: 'Datos de entrenamiento' },
      { k: 'paso', t: 'Crear versiones alteradas de los datos' },
      { k: 'paso', t: 'Aprender un clasificador Cᵢ con cada una (mismo método)' },
      { k: 'out', t: 'Agregar las salidas → C*' },
    ],
    secciones: [
      {
        t: 'Idea',
        b: [
          '**Aprendizaje tradicional**: un predictor a partir de los ejemplos. **Ensemble learning**: un conjunto de predictores base combinados. Estructura de **comité**: construir distintos «expertos» y dejarlos votar.',
          {
            ul: [
              'En clasificación se combina la salida de cada clasificador.',
              'Pueden basarse en técnicas distintas (árboles, reglas, instancias…), aunque **en general se aplican sobre una única técnica**.',
              'Pueden basarse en distintos conjuntos de ejemplos y/o de variables.',
            ],
          },
          {
            tabla: {
              cab: ['', '[[bagging|Bagging]]', '[[adaboost|Boosting]]', '[[binarizacion|Binarización]]'],
              filas: [
                ['Cómo se crean los modelos', 'Independientes, en paralelo', 'Secuenciales: cada uno se centra en los fallos del anterior', 'Uno por cada subproblema binario'],
                ['Datos de cada modelo', 'Muestra bootstrap', 'Pesos sobre los ejemplos (más a los difíciles)', 'Solo las clases del par (OVO) o una contra el resto (OVA)'],
                ['Combinación', 'Voto mayoritario / media', 'Voto ponderado por α', 'Agregación de las salidas binarias'],
                ['Reduce sobre todo', 'Varianza', 'Sesgo (y varianza)', 'La complejidad de cada frontera'],
                ['Más conocido', '[[random-forest]]', '[[adaboost]]', 'OVO en [[svm|SVM]]'],
              ],
            },
          },
          { demo: 'BaggingBoosting' },
        ],
      },
    ],
    rel: [['sesgo-varianza', 'por qué funcionan']],
  },
  {
    id: 'bagging',
    nombre: 'Bagging (Bootstrap Aggregating)',
    corto: 'Bagging',
    padre: 'multiclasificadores',
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T7 · 3.2',
    parte: 3,
    resumen: 'Entrenar el mismo tipo de modelo sobre m muestras bootstrap independientes y votar (o promediar).',
    ficha: {
      entrada: 'Datos + un algoritmo base (árboles, reglas, redes…)',
      interpretable: 'Caja negra (son m modelos)',
      devuelve: 'La clase predicha con mayor frecuencia por los m modelos (o la media en regresión)',
      funcionamiento:
        'Se crean m muestras del mismo tamaño que la BD con muestreo con reemplazamiento; se aprende un modelo con cada una y, al predecir, se devuelve la clase más votada.',
      fuertes: ['Mejora la precisión de cada modelo', 'Reduce sobre todo el error de varianza', 'Muy adecuado para algoritmos inestables (árboles)', 'Paralelizable'],
      debiles: ['Se pierde la interpretabilidad', 'Poco útil con modelos estables', 'm veces más coste'],
      parametros: ['Número de modelos m', 'Algoritmo base', 'Tamaño de la bolsa (100 %)'],
      weka: 'meta › Bagging',
    },
    esquema: [
      { k: 'in', t: 'BD con n ejemplos, m modelos' },
      {
        k: 'bucle',
        t: 'Fase 1 · Para i = 1 … m',
        pasos: [
          { k: 'paso', t: 'Muestrear con reemplazamiento n ejemplos' },
          { k: 'paso', t: 'Aprender un modelo → modelos[i]' },
        ],
      },
      { k: 'bucle', t: 'Fase 2 · Para cada modelo', pasos: [{ k: 'paso', t: 'Predecir la clase del ejemplo' }] },
      { k: 'out', t: 'Devolver la clase más frecuente' },
    ],
    secciones: [
      {
        t: '¿Por qué funciona?',
        b: [
          'El error de aprendizaje tiene tres fuentes (ver [[sesgo-varianza]]): **ruido** (error en la función objetivo), **sesgo** (el algoritmo no puede aprender el objetivo) y **varianza** (debida al muestreo y a cómo afecta al algoritmo). **Bagging minimiza especialmente la varianza**.',
          'Es muy adecuado para esquemas **inestables**: pequeños cambios en los datos provocan grandes cambios en el modelo (p. ej. árboles). Las diapositivas lo muestran con las fronteras de cuatro árboles y de tres redes: cada una es irregular y su combinación es más suave.',
          'La media de los errores en distintos conjuntos da además una mejor estimación de la capacidad predictiva del método.',
        ],
      },
    ],
    ejemplo: 'Bootstrap',
    rel: [
      ['bootstrap', 'muestreo con reemplazamiento'],
      ['muestreo-aleatorio', 'el mismo muestreo del Tema 3'],
      ['random-forest', 'bagging + atributos aleatorios'],
    ],
  },
  {
    id: 'random-forest',
    nombre: 'Random Forest',
    padre: 'bagging',
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T7 · 3.2',
    parte: 3,
    resumen: 'Bagging de árboles en el que cada nodo solo puede elegir entre m variables al azar. Breiman (2001).',
    ficha: {
      entrada: 'Atributos discretos y continuos',
      interpretable: 'Caja negra',
      devuelve: 'Voto mayoritario de los árboles (clasificación) o su media (regresión)',
      funcionamiento:
        'Bootstrap de los ejemplos; con cada muestra se construye un árbol completo, sin podar, en el que cada nodo elige el mejor corte entre m variables escogidas al azar.',
      fuertes: ['Árboles menos correlados → el ensemble funciona mejor', 'Junto con boosting, de los mejores algoritmos de analítica predictiva', 'Muy utilizado'],
      debiles: ['Difícil de interpretar', 'Hay que evitar el sobreaprendizaje'],
      parametros: ['m = √p (clasificación)', 'm = p/3 o p/2 (regresión)', 'Otras opciones: ½√p, 2√p', 'Número de árboles'],
      weka: 'trees › RandomForest',
    },
    esquema: [
      { k: 'in', t: 'Datos con p variables' },
      {
        k: 'bucle',
        t: 'Para cada árbol',
        pasos: [
          { k: 'paso', t: 'Muestra bootstrap' },
          { k: 'bucle', t: 'En cada nodo', pasos: [{ k: 'paso', t: 'Elegir m variables al azar' }, { k: 'paso', t: 'Mejor corte solo entre esas m' }] },
          { k: 'paso', t: 'Crecer el árbol entero, sin podar' },
        ],
      },
      { k: 'out', t: 'Voto mayoritario (clasif.) / media (regresión)' },
    ],
    secciones: [
      {
        t: 'Detalles',
        b: [
          'Si **m = p**, Random Forest es exactamente **bagging con árboles**.',
          'Al forzar que cada árbol considere solo un subconjunto de variables, el ensemble está formado por árboles **menos correlados y con mayor varianza**, y la combinación funciona mejor.',
          'Las diapositivas muestran su resultado en el dataset *gene expression* (15 clases, 500 variables), comparando distintos valores de m.',
        ],
      },
    ],
    ejemplo: 'Bosque3D',
    rel: [
      ['arboles', 'su modelo base'],
      ['binarizacion', 'citado junto a SVM como algoritmo de referencia'],
    ],
  },
  {
    id: 'adaboost',
    nombre: 'Boosting · AdaBoost',
    corto: 'AdaBoost',
    padre: 'multiclasificadores',
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T7 · 3.1',
    parte: 3,
    resumen: 'Clasificadores débiles entrenados uno tras otro, cada uno centrado en los ejemplos que el anterior falló; votan ponderados por su acierto.',
    ficha: {
      entrada: 'Datos + un algoritmo base débil',
      interpretable: 'Caja negra',
      devuelve: 'H(x) = signo(Σ αₜ·hₜ(x)): voto ponderado',
      funcionamiento:
        'Todos los ejemplos empiezan con el mismo peso. En cada ronda se entrena un clasificador con esos pesos, se mide su error ε, se le da un peso α = ½ ln((1−ε)/ε) y se aumentan los pesos de los ejemplos mal clasificados.',
      fuertes: ['Rápido', 'Sencillo y fácil de programar', 'Pocos parámetros', 'Flexible: combina cualquier algoritmo', 'Efectivo', 'Versátil: extensiones multiclase y regresión'],
      debiles: ['Depende de los datos y del clasificador base', 'Base muy compleja → sobreajuste', 'Base muy sencilla → poca precisión'],
      parametros: ['Número de rondas T', 'Algoritmo base'],
      weka: 'meta › AdaBoostM1',
    },
    esquema: [
      { k: 'in', t: 'D₁(i) = 1/m para los m ejemplos' },
      {
        k: 'bucle',
        t: 'Para t = 1 … T',
        pasos: [
          { k: 'paso', t: 'hₜ = L(D, Dₜ): entrenar con la distribución Dₜ' },
          { k: 'paso', t: 'εₜ = error ponderado de hₜ' },
          { k: 'si', t: '¿εₜ > 0,5?', si: 'parar', no: 'continuar' },
          { k: 'paso', t: 'αₜ = ½ ln((1 − εₜ)/εₜ)' },
          { k: 'paso', t: 'Dₜ₊₁(i) = Dₜ(i)·e^(∓αₜ)/Zₜ  (− si acierta, + si falla)' },
        ],
      },
      { k: 'out', t: 'H(x) = sign(Σ αₜ hₜ(x))' },
    ],
    secciones: [
      {
        t: 'Boosting en general',
        b: [
          '¿De qué forma? Se obtiene un predictor con un subconjunto de los ejemplos, otro con un segundo subconjunto… y se repite un número de veces. **¿Cómo se eligen los ejemplos?** Concentrándose en los más difíciles: los mal clasificados por los predictores anteriores. **¿Cómo se combinan?** Con el voto ponderado de cada uno.',
          'Esquema genérico: $D_1 = D$; para cada t: $h_t = L(D_t)$, $\\epsilon_t$ = error de $h_t$, $D_{t+1}$ = AdjustDistribution($D_t, \\epsilon_t$); salida H(x) = CombineOutputs($h_t(x)$).',
        ],
      },
      {
        t: 'AdaBoost paso a paso',
        b: [
          { f: '\\alpha_t = \\tfrac{1}{2}\\ln\\!\\left(\\frac{1-\\epsilon_t}{\\epsilon_t}\\right)' },
          { f: 'D_{t+1}(i) = \\frac{D_t(i)}{Z_t}\\times\\begin{cases} e^{-\\alpha_t} & \\text{si } h_t(x_i) = y_i \\\\ e^{\\alpha_t} & \\text{si } h_t(x_i) \\ne y_i\\end{cases} = \\frac{D_t(i)\\,e^{-\\alpha_t y_i h_t(x_i)}}{Z_t}' },
          { f: 'H(x) = \\operatorname{sign}\\Big(\\sum_{t=1}^{T} \\alpha_t h_t(x)\\Big)' },
          '$Z_t$ es un factor de normalización para que $D_{t+1}$ sea una distribución.',
          'Ejemplo de las diapositivas (tutorial de Meir): ronda 1 → ε₁ = 0,30, α₁ = 0,42; ronda 2 → ε₂ = 0,21, α₂ = 0,65; ronda 3 → ε₃ = 0,14, α₃ = 0,92. Predictor final: $sign(0{,}42\\,h_1 + 0{,}65\\,h_2 + 0{,}92\\,h_3)$.',
        ],
      },
      {
        t: 'En Weka',
        b: ['Bagging y AdaBoostM1 se aplican en las diapositivas a *nci.arff* con C4.5 como base y 5-validación cruzada.'],
      },
    ],
    ejemplo: 'AdaBoost',
    rel: [
      ['bagging', 'el otro gran ensemble'],
      ['sesgo-varianza', 'reduce el sesgo de los débiles'],
    ],
  },
  {
    id: 'binarizacion',
    nombre: 'Binarización (pairwise learning)',
    corto: 'Binarización',
    padre: 'multiclasificadores',
    tipo: 'familia',
    salida: 'cat',
    tema: 'T7 · 3.3',
    parte: 3,
    resumen: 'Descomponer un problema multiclase en varios binarios (divide y vencerás), resolverlos y agregar las salidas.',
    secciones: [
      {
        t: 'Idea',
        b: [
          'Multiclase → es más fácil resolver problemas binarios. Cada problema binario tiene su **clasificador base**. Hay que resolver dos cosas: **¿cómo descomponer?** y **¿cómo agregar las salidas?**',
          {
            tabla: {
              cab: ['', '[[ovo|One-vs-One (OVO)]]', '[[ova|One-vs-All (OVA)]]'],
              filas: [
                ['Problemas', 'Uno por cada **par** de clases', 'Uno por cada clase contra todas las demás'],
                ['Nº de clasificadores (m clases)', '$m(m-1)/2$', '$m$'],
                ['Con 3 clases ("1", "7", "8")', '1 vs 7, 1 vs 8, 8 vs 7', '7 vs {1,8}, 1 vs {7,8}, 8 vs {1,7}'],
              ],
            },
          },
          '**Ventajas**: clasificadores más pequeños (menos instancias) y fronteras de decisión más simples.',
          'El algoritmo del **estado del arte** en comportamiento, [[svm|SVM]], usa OVO. Otro con muy buen comportamiento y muy utilizado: [[random-forest]].',
          { demo: 'OvoOva' },
        ],
      },
    ],
  },
  {
    id: 'ovo',
    nombre: 'One-vs-One (OVO)',
    padre: 'binarizacion',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T7 · 3.3',
    parte: 3,
    resumen: 'Un clasificador binario por cada par de clases: m(m−1)/2 en total. También llamado pairwise learning, round robin o all-vs-all.',
    ficha: {
      entrada: 'Problema con m clases + clasificador binario base',
      interpretable: 'Depende del base',
      devuelve: 'La clase más votada en los enfrentamientos por pares',
      funcionamiento: 'Para cada par de clases se entrena un clasificador solo con los ejemplos de esas dos. Al clasificar, cada clasificador vota a una de sus dos clases y se agregan los votos.',
      fuertes: ['Cada clasificador ve pocas instancias', 'Fronteras muy simples', 'Lo usa SVM'],
      debiles: ['Número de clasificadores cuadrático en m'],
      parametros: ['Clasificador base', 'Método de agregación'],
    },
    esquema: [
      { k: 'in', t: 'm clases' },
      { k: 'bucle', t: 'Para cada par (i, j)', pasos: [{ k: 'paso', t: 'Entrenar i vs j solo con sus ejemplos' }] },
      { k: 'paso', t: 'Clasificar: cada par vota' },
      { k: 'out', t: 'Agregación → clase final' },
    ],
    rel: [['ova', 'la alternativa lineal en m'], ['svm', 'usa esta estrategia']],
  },
  {
    id: 'ova',
    nombre: 'One-vs-All (OVA)',
    padre: 'binarizacion',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T7 · 3.3',
    parte: 3,
    resumen: 'Un clasificador por clase que la separa de todas las demás: m clasificadores.',
    ficha: {
      entrada: 'Problema con m clases + clasificador binario base',
      interpretable: 'Depende del base',
      devuelve: 'La clase cuyo clasificador da la respuesta más segura',
      funcionamiento: 'Para cada clase se entrena un clasificador "esta clase" frente a "el resto" con todos los ejemplos; se agregan las salidas.',
      fuertes: ['Solo m clasificadores'],
      debiles: ['Cada problema está desbalanceado (una clase contra todas)', 'Cada clasificador usa todos los ejemplos'],
      parametros: ['Clasificador base'],
    },
    esquema: [
      { k: 'in', t: 'm clases' },
      { k: 'bucle', t: 'Para cada clase i', pasos: [{ k: 'paso', t: 'Entrenar i vs resto' }] },
      { k: 'out', t: 'Agregación → clase con mayor confianza' },
    ],
    rel: [['ovo', 'la alternativa por pares'], ['no-balanceados', 'cada subproblema queda desbalanceado']],
  },
  {
    id: 'svm',
    nombre: 'SVM · Support Vector Machine',
    corto: 'SVM',
    padre: 'binarizacion',
    tipo: 'algoritmo',
    salida: 'cat',
    tema: 'T6 · T7',
    parte: 3,
    resumen: 'Solo se menciona: está en el top-10, es el estado del arte en comportamiento y usa la estrategia OVO para problemas multiclase.',
    ficha: {
      entrada: 'Numéricos',
      interpretable: 'Caja negra',
      devuelve: 'Una clase (frontera de margen máximo)',
      funcionamiento: 'Clasificador binario que busca la frontera de margen máximo entre dos clases; para varias clases se combina con OVO. No se desarrolla en las diapositivas.',
      fuertes: ['Estado del arte en comportamiento'],
      debiles: ['Caja negra', 'Binario por naturaleza'],
      parametros: ['Kernel', 'C'],
      weka: 'functions › SMO',
    },
    esquema: [
      { k: 'in', t: 'm clases' },
      { k: 'paso', t: 'Descomponer con OVO' },
      { k: 'paso', t: 'Un SVM binario por par' },
      { k: 'out', t: 'Agregación de votos' },
    ],
    rel: [['ovo', 'su descomposición multiclase']],
  },
];
