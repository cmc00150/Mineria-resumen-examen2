// PARTE IV · Predicción numérica o regresión (Tema 8)

export const regresion = [
  {
    id: 'regresion',
    nombre: 'Regresión (predicción numérica)',
    corto: 'Regresión',
    padre: 'mineria',
    tipo: 'familia',
    salida: 'num',
    tema: 'T8',
    parte: 4,
    resumen: 'Predecir el valor numérico de una variable a partir de los valores de otras.',
    secciones: [
      {
        t: 'El problema',
        b: [
          'Se parece a la [[clasificacion]]: hay variables predictoras y una variable objetivo, pero ahora es **numérica**. En regresión la mayoría (o todas) las predictoras también son numéricas.',
          'El problema fundamental es **modelar la relación entre las variables de estado** para obtener el valor de la variable de control.',
          'Ejemplos: consumo de un coche en autovía según peso, cilindrada y potencia; número de artículos del próximo pedido; meses para desarrollar un proyecto software; probabilidad de que un cliente responda a un envío publicitario; enfermos en urgencias la próxima Nochebuena.',
        ],
      },
      {
        t: 'Las ramas',
        b: [
          {
            tabla: {
              cab: ['Rama', 'Modelo', 'Tema'],
              filas: [
                ['[[regresion-adaptados|Técnicas de clasificación adaptadas]]', '[[knn]] promediando, [[mlp|redes]] con una neurona de salida', 'T8 · 3'],
                ['[[analisis-regresion|Análisis de regresión]]', 'Una ecuación: lineal, exponencial, múltiple', 'T8 · 4'],
                ['[[arbol-regresion|Árboles de regresión]]', 'Árbol con un número (media) en cada hoja', 'T8 · 5'],
                ['[[arbol-modelos|Árboles de modelos]]', 'Árbol con una regresión lineal en cada hoja', 'T8 · 6'],
                ['[[sbrd|Sistemas basados en reglas difusas]]', 'Reglas lingüísticas SI X es Alto … ENTONCES Y es Medio', 'T8 · 7'],
              ],
            },
          },
          'Todas las técnicas de **validación** de clasificación siguen valiendo; lo que cambia es **cómo se mide el error**: ver [[metricas-regresion]].',
        ],
      },
      {
        t: 'Comparativa con la BD CPU (resultados de las diapositivas)',
        b: [
          {
            tabla: {
              cab: ['Método', 'EMA', 'EAR'],
              filas: [
                ['[[regresion-multiple|Regresión lineal múltiple]]', '34,31 %', '39,26 %'],
                ['[[arbol-regresion|Árbol de regresión]] (sin suavizar)', '18,13', '20,74 %'],
                ['[[knn|1-NN]]', '15,13 %', '17,31 %'],
                ['[[knn|5-NN ponderado]]', '13,15 %', '15,04 %'],
                ['[[arbol-modelos|Árbol de modelos]] (sin suavizar)', '10,04', '11,49 %'],
                ['[[mlp|Red neuronal]] (100 epochs)', '6,10 %', '6,98 %'],
              ],
            },
          },
          { nota: 'Las diapositivas no siempre usan la misma etiqueta (EMA, EAM, EMR) ni las mismas unidades; lo que importa es el orden: la red y el árbol de modelos son los mejores con estos datos y la regresión lineal global, la peor.', tipo: 'idea' },
        ],
      },
    ],
    rel: [['clasificacion', 'mismo esquema con salida categórica']],
  },
  {
    id: 'metricas-regresion',
    nombre: 'Medidas de error en regresión',
    corto: 'Métricas de error',
    padre: 'regresion',
    tipo: 'concepto',
    salida: 'num',
    tema: 'T8 · 2',
    parte: 4,
    resumen: 'Cómo medir el error al aproximar los valores reales {v₁…vₙ} con las predicciones {v′₁…v′ₙ}.',
    secciones: [
      {
        t: 'Las cinco medidas',
        b: [
          {
            tabla: {
              cab: ['Medida', 'Fórmula', 'Lectura'],
              filas: [
                ['Error cuadrático medio (ECM)', '$\\frac{1}{n}\\sum (v_i - v\\prime_i)^2$', 'Castiga mucho los errores grandes'],
                ['ECM "estandarizado" (ECME, raíz)', '$\\sqrt{\\frac{1}{n}\\sum (v_i - v\\prime_i)^2}$', 'Mismas unidades que la variable'],
                ['Error medio absoluto (EMA)', '$\\frac{1}{n}\\sum |v_i - v\\prime_i|$', 'Error típico, robusto'],
                ['Error absoluto relativo (EAR)', '$\\frac{\\sum |v_i - v\\prime_i|}{\\sum |v_i - \\bar v|}$', 'Comparado con predecir siempre la media (< 100 % = mejor que la media)'],
                ['Coeficiente de correlación r', '$\\frac{\\sum (v_i - \\bar v)(v\\prime_i - \\bar v\\prime)}{(n-1)\\,s_v\\,s_{v\\prime}}$', 'De −1 a 1; cuanto más cerca de 1, mejor'],
              ],
            },
          },
          { demo: 'Metricas' },
        ],
      },
    ],
    rel: [['validacion-cruzada', 'la validación es la misma que en clasificación']],
  },
  {
    id: 'regresion-adaptados',
    nombre: 'Técnicas de clasificación válidas para regresión',
    corto: 'Adaptados de clasificación',
    padre: 'regresion',
    tipo: 'familia',
    salida: 'num',
    tema: 'T8 · 3',
    parte: 4,
    resumen: 'kNN y redes neuronales funcionan igual cambiando solo la salida: media de los vecinos o una neurona de salida.',
    secciones: [
      {
        t: 'Cómo se adaptan',
        b: [
          {
            def: [
              ['[[knn]]', 'se devuelve la media de los valores de los k vecinos, o la media ponderada con $w_i = 1/d(e_i, e\\prime)$.'],
              ['[[mlp|Redes neuronales]]', 'la capa de salida es una única neurona; como los pesos se adaptan con el error, basta con medirlo de forma adecuada.'],
              ['Otros', 'también tienen versión de regresión [[cart]], [[random-forest]] (media de los árboles), [[bagging]] y [[adaboost]] (sus extensiones).'],
            ],
          },
          'Ejemplo en Weka con la BD **CPU** (sin el atributo nominal fabricante): MCYT, MMIN, MMAX, CACH, CHMIN, CHMAX → rendimiento PRP. Resultados (5-cv) en la ficha de [[knn]].',
        ],
      },
    ],
  },
  {
    id: 'analisis-regresion',
    nombre: 'Análisis de regresión',
    padre: 'regresion',
    tipo: 'familia',
    salida: 'num',
    tema: 'T8 · 4',
    parte: 4,
    resumen: 'El método más utilizado para predicción numérica: estimar y como una ecuación cuyas incógnitas son las demás variables.',
    secciones: [
      {
        t: 'Tres variantes',
        b: [
          {
            tabla: {
              cab: ['Modelo', 'Ecuación', 'Cómo se estima'],
              filas: [
                ['[[regresion-lineal|Lineal simple]]', '$y = a + bx$', 'Mínimos cuadrados'],
                ['[[regresion-exponencial|Exponencial]]', '$y = a\\,e^{bx}$', 'Tomar logaritmos y hacer regresión lineal'],
                ['[[regresion-multiple|Lineal múltiple]]', '$y = a + b_1x_1 + \\dots + b_nx_n$', 'Operaciones con matrices (e inversas)'],
              ],
            },
          },
          'Existen técnicas más complejas que aproximan mejor los datos: **regresión segmentada**, **regresión logística**…',
        ],
      },
    ],
  },
  {
    id: 'regresion-lineal',
    nombre: 'Regresión lineal simple',
    padre: 'analisis-regresion',
    tipo: 'algoritmo',
    salida: 'num',
    tema: 'T8 · 4',
    parte: 4,
    resumen: 'Ajustar la recta y = a + b·x que minimiza la suma de los cuadrados de los errores.',
    ficha: {
      entrada: 'Una variable predictora numérica x',
      interpretable: 'Caja blanca',
      devuelve: 'Los coeficientes a (ordenada) y b (pendiente)',
      funcionamiento: 'Mínimos cuadrados: b = covarianza(x, y) / varianza(x) y a = ȳ − b·x̄.',
      fuertes: ['Fórmula cerrada, instantánea', 'Totalmente interpretable'],
      debiles: ['Solo relaciones lineales: con datos curvos es "no tan apropiada"'],
      parametros: ['Ninguno'],
      weka: 'functions › SimpleLinearRegression',
    },
    esquema: [
      { k: 'in', t: 'Puntos (xᵢ, yᵢ)' },
      { k: 'paso', t: 'Medias x̄ y ȳ' },
      { k: 'paso', t: 'b = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²' },
      { k: 'paso', t: 'a = ȳ − b·x̄' },
      { k: 'out', t: 'y = a + b·x' },
    ],
    secciones: [
      {
        t: 'Mínimos cuadrados',
        b: [
          { f: 'b = \\frac{\\sum_{i=1}^{s}(x_i-\\bar x)(y_i-\\bar y)}{\\sum_{i=1}^{s}(x_i-\\bar x)^2} \\qquad a = \\bar y - b\\,\\bar x' },
          'Las diapositivas comparan dos nubes de puntos: una casi recta («bastante apropiado») y otra curva («no tan apropiado»), para la que hace falta otra regresión, por ejemplo la [[regresion-exponencial|exponencial]].',
        ],
      },
    ],
    ejemplo: 'RegresionLineal',
    rel: [['regresion-exponencial', 'cuando los datos son curvos'], ['regresion-multiple', 'varias predictoras']],
  },
  {
    id: 'regresion-exponencial',
    nombre: 'Regresión exponencial',
    padre: 'analisis-regresion',
    tipo: 'algoritmo',
    salida: 'num',
    tema: 'T8 · 4',
    parte: 4,
    resumen: 'Para curvas y = a·e^(bx): se toman logaritmos y se convierte en una regresión lineal.',
    ficha: {
      entrada: 'Una predictora x e y > 0',
      interpretable: 'Caja blanca',
      devuelve: 'a y b de y = a·e^(bx)',
      funcionamiento: 'ln y = ln a + b·x. Se hace regresión lineal entre y* = ln y y x, se obtienen a* y b, y se deshace: a = e^(a*).',
      fuertes: ['Reutiliza la regresión lineal', 'Modela crecimientos o decaimientos'],
      debiles: ['Solo para y > 0', 'Minimiza el error en escala logarítmica, no en la original'],
      parametros: ['Ninguno'],
    },
    esquema: [
      { k: 'in', t: 'Puntos (xᵢ, yᵢ) con yᵢ > 0' },
      { k: 'paso', t: 'y*ᵢ = ln yᵢ' },
      { k: 'paso', t: 'Regresión lineal y* = a* + b·x' },
      { k: 'paso', t: 'a = e^(a*)' },
      { k: 'out', t: 'y = a·e^(bx)' },
    ],
    secciones: [{ t: 'Transformación', b: [{ f: '\\ln(y) = \\ln(a\\,e^{bx}) \\;\\Rightarrow\\; \\ln(y) = \\ln(a) + bx \\;\\Rightarrow\\; y^* = a^* + bx' }] }],
    ejemplo: 'RegresionLineal',
    rel: [['regresion-lineal', 'la usa por dentro']],
  },
  {
    id: 'regresion-multiple',
    nombre: 'Regresión lineal múltiple',
    padre: 'analisis-regresion',
    tipo: 'algoritmo',
    salida: 'num',
    tema: 'T8 · 4',
    parte: 4,
    resumen: 'Una ecuación lineal con varias predictoras: y = a + b₁x₁ + … + bₙxₙ.',
    ficha: {
      entrada: 'Varias predictoras numéricas',
      interpretable: 'Caja blanca',
      devuelve: 'Un coeficiente por variable más el término independiente',
      funcionamiento: 'Mínimos cuadrados en forma matricial: la estimación requiere operar con matrices y sus inversas.',
      fuertes: ['Interpretable: cada coeficiente dice cuánto pesa cada variable', 'Rápida'],
      debiles: ['Un único modelo lineal para todo el espacio: con CPU es la peor (EAM 34,31 %, EAR 39,26 %)'],
      parametros: ['Selección de atributos'],
      weka: 'functions › LinearRegression',
    },
    esquema: [
      { k: 'in', t: 'Matriz X (n ejemplos × variables) y vector y' },
      { k: 'paso', t: 'b = (XᵀX)⁻¹ Xᵀ y' },
      { k: 'out', t: 'y = a + Σ bᵢ xᵢ' },
    ],
    secciones: [
      {
        t: 'Ejemplo CPU',
        b: [
          { f: 'class = 0{,}066\\,MYCT + 0{,}0143\\,MMIN + 0{,}0066\\,MMAX + 0{,}4945\\,CACH - 0{,}1723\\,CHMIN + 1{,}2012\\,CHMAX - 66{,}4814' },
          'EAM = 34,31 %, EAR = 39,26 %. Una sola recta (hiperplano) no basta: por eso los [[arbol-modelos|árboles de modelos]] usan una por región.',
        ],
      },
    ],
    rel: [['arbol-modelos', 'una regresión múltiple en cada hoja']],
  },
  {
    id: 'arbol-regresion',
    nombre: 'Árboles de regresión',
    padre: 'regresion',
    tipo: 'algoritmo',
    salida: 'num',
    tema: 'T8 · 5',
    parte: 4,
    resumen: 'Árbol de decisión cuyas hojas predicen un número: la media de los ejemplos que llegaron a esa hoja.',
    ficha: {
      entrada: 'Predictoras numéricas (y discretas)',
      interpretable: 'Caja blanca',
      devuelve: 'Un árbol con un valor constante en cada hoja',
      funcionamiento: 'Se construye como un árbol de decisión, pero el criterio para elegir la variable es la reducción de la desviación típica (SDR). Cada hoja guarda la media de su clase. Al final se poda.',
      fuertes: ['Interpretable', 'Capta relaciones no lineales por tramos', 'Mejor que la regresión lineal global con CPU (EAR 20,7 % frente a 39,3 %)'],
      debiles: ['Predicción "a escalones" (discontinuidades) → suavizado', 'Necesita poda para no sobreajustar'],
      parametros: ['Poda', 'Suavizado (useUnsmoothed en Weka)'],
      weka: 'trees › M5P con buildRegressionTree = True · trees › REPTree',
    },
    esquema: [
      { k: 'in', t: 'Ejemplos T con objetivo numérico' },
      { k: 'paso', t: 'Para cada atributo/corte: SDR = sd(T) − Σ |Tᵢ|/|T| · sd(Tᵢ)' },
      { k: 'paso', t: 'Dividir por el de mayor SDR' },
      { k: 'paso', t: 'Recursión hasta que la desviación sea pequeña' },
      { k: 'paso', t: 'Hoja = media de los ejemplos que llegan' },
      { k: 'out', t: 'Podar' },
    ],
    secciones: [
      {
        t: 'Detalles',
        b: [
          'La evaluación de un nuevo ejemplo es idéntica a la de un [[arboles|árbol de decisión]]. Al predecir se puede **suavizar** el valor para salvar discontinuidades (en Weka, `useUnsmoothed`).',
          'Criterio: reducción del error esperado, es decir, de la **desviación típica** de la variable objetivo:',
          { f: 'SDR = sd(T) - \\sum_i \\frac{|T_i|}{|T|}\\, sd(T_i)' },
          'Es la misma idea que la [[ganancia-informacion]]: «desorden antes» menos «desorden medio después», cambiando entropía por desviación típica.',
        ],
      },
      {
        t: 'Ejemplo CPU (Weka, sin suavizar, poda = 1)',
        b: [
          'La raíz es MMAX ≤ 14 000; después aparecen CACH, MYCT, CHMIN… El árbol tiene 15 hojas con constantes (LM1 = 24,3 … LM15 = 971). EAM 18,13 · EAR 20,74 %.',
        ],
      },
    ],
    ejemplo: 'Sdr',
    rel: [
      ['arbol-modelos', 'mismo árbol con ecuaciones en las hojas'],
      ['cart', 'CART también construye árboles de regresión'],
    ],
  },
  {
    id: 'arbol-modelos',
    nombre: 'Árboles de modelos (M5)',
    corto: 'Árboles de modelos',
    padre: 'regresion',
    tipo: 'algoritmo',
    salida: 'num',
    tema: 'T8 · 6',
    parte: 4,
    resumen: 'Árboles de regresión más podados en cuyas hojas hay una ecuación de regresión lineal local a esa región.',
    ficha: {
      entrada: 'Predictoras numéricas',
      interpretable: 'Caja blanca (pocas hojas con ecuaciones)',
      devuelve: 'Un árbol pequeño con un modelo lineal LMᵢ en cada hoja',
      funcionamiento: 'Se construye como un árbol de regresión, se poda más y cada hoja guarda una regresión lineal múltiple ajustada solo con los ejemplos de esa partición del espacio.',
      fuertes: ['Mucho más preciso que la regresión global y que el árbol de regresión (CPU: EAR 11,5 %)', 'Árbol más pequeño (4 hojas frente a 15)'],
      debiles: ['Las ecuaciones son menos legibles que una constante'],
      parametros: ['Poda', 'Suavizado', 'Mínimo de ejemplos por hoja'],
      weka: 'trees › M5P',
    },
    esquema: [
      { k: 'in', t: 'Ejemplos con objetivo numérico' },
      { k: 'paso', t: 'Construir el árbol con SDR' },
      { k: 'paso', t: 'Podar más que un árbol de regresión' },
      { k: 'bucle', t: 'Para cada hoja', pasos: [{ k: 'paso', t: 'Ajustar una regresión lineal con sus ejemplos' }] },
      { k: 'out', t: 'Árbol con LM₁ … LMₖ' },
    ],
    secciones: [
      {
        t: 'Por qué funciona',
        b: [
          'Una sola recta para todos los datos (azul en la diapositiva) ajusta mal. Si el árbol separa la nube en dos regiones, cada una tiene su propia recta (verde y roja) y el ajuste mejora mucho.',
          { demo: 'Modelos3D' },
        ],
      },
      {
        t: 'Ejemplo CPU (Weka, sin suavizar, poda = 0)',
        b: [
          {
            pseudo:
              'MMAX <= 14000 :\n|  CACH <= 8.5 : LM1 (108/3.99%)\n|  CACH >  8.5 : LM2 (33/3.89%)\nMMAX >  14000 :\n|  MMAX <= 22500 : LM3 (37/4.73%)\n|  MMAX >  22500 : LM4 (31/69.2%)\n\nLM1: class = 15.9 - 0.00453 MYCT + 0.00327 MMAX\nLM2: class = -0.609 + 0.004 MMAX + 0.59 CACH + 1.57 CHMIN\nLM3: class = 1.64 - 0.0266 MYCT + 0.00485 MMIN + 0.00346 MMAX\n             + 0.627 CACH + 1.43 CHMIN + 0.127 CHMAX\nLM4: class = -350 - 0.843 MYCT + 0.0183 MMAX + 1.62 CACH',
          },
          'EMR 10,04 · EAR 11,49 %.',
        ],
      },
    ],
    rel: [
      ['regresion-multiple', 'lo que hay en cada hoja'],
      ['arbol-regresion', 'de donde viene'],
      ['c45', 'M5 sigue la filosofía de los árboles de Quinlan'],
    ],
  },
  {
    id: 'sbrd',
    nombre: 'Sistemas basados en reglas difusas (SBRD)',
    corto: 'Reglas difusas (SBRD)',
    padre: 'regresion',
    tipo: 'algoritmo',
    salida: 'ambas',
    tema: 'T8 · 7 · T6 · 3',
    parte: 4,
    resumen: 'Reglas lingüísticas (SI X₁ es Alto y X₂ es Bajo ENTONCES Y es Medio) con un mecanismo de inferencia difusa. Sirven para modelado, control y clasificación.',
    ficha: {
      entrada: 'Variables numéricas (se fuzzifican)',
      interpretable: 'Caja blanca en el modelado lingüístico',
      devuelve: 'Un valor nítido de salida (tras defuzzificar)',
      funcionamiento:
        'La entrada nítida se convierte en grados de pertenencia a etiquetas (fuzzificación); el mecanismo de inferencia aplica las reglas de la base de conocimiento; la salida difusa se convierte en un número (defuzzificación).',
      fuertes: ['Interpretable (modelado lingüístico)', 'Buen aproximador (modelado preciso)', 'Sirve para modelado, control y clasificación'],
      debiles: ['Equilibrio difícil entre interpretabilidad y precisión', 'Muchas reglas si hay muchas variables → selección de características'],
      parametros: ['Etiquetas y funciones de pertenencia (base de datos)', 'Reglas (base de reglas)', 'Factores de escala', 'Operadores de inferencia y defuzzificación'],
    },
    esquema: [
      { k: 'in', t: 'Entrada nítida (escalada)' },
      { k: 'paso', t: 'Interfaz de fuzzificación: valor → grados de pertenencia' },
      { k: 'paso', t: 'Mecanismo de inferencia con la base de conocimiento', d: 'base de reglas + base de datos (definición de las etiquetas)' },
      { k: 'paso', t: 'Interfaz de defuzzificación: salida difusa → número' },
      { k: 'out', t: 'Salida nítida (escalada)' },
    ],
    secciones: [
      {
        t: 'Componentes',
        b: [
          {
            def: [
              ['Interfaz de fuzzificación', 'convierte la entrada nítida en un valor difuso.'],
              ['Base de datos', 'contiene la definición lingüística de las variables (etiquetas, funciones de pertenencia y factores de escala).'],
              ['Base de reglas', 'contiene el conjunto de acciones a realizar en función del estado (R1: SI X₁ es Alto y X₂ es Bajo ENTONCES Y es Medio…).'],
              ['Base de conocimiento', 'base de datos + base de reglas.'],
              ['Mecanismo de inferencia', 'realiza el razonamiento para estimar la salida en función de la entrada.'],
              ['Interfaz de defuzzificación', 'convierte la salida difusa en un valor nítido.'],
            ],
          },
          { demo: 'Difuso' },
        ],
      },
      {
        t: 'Tipos de modelado y aprendizaje',
        b: [
          {
            vs: [
              { t: 'Modelado difuso lingüístico', items: ['Atiende al **poder descriptivo** del SBRD.', 'Prioriza la interpretabilidad.'] },
              { t: 'Modelado difuso preciso', items: ['Atiende al **poder aproximativo** del SBRD.', 'Prioriza la precisión.'] },
            ],
          },
          'Ejemplo de etiquetas para una variable: EB, MB, B, N, A, MA, EA (extremadamente bajo … extremadamente alto) entre un mínimo m y un máximo M.',
          'El SBRD se **aprende** de los datos del sistema y se usa para modelado, control o clasificación. Al proceso de aprendizaje se le añaden: **selección de características** (quitar variables redundantes o irrelevantes, que mejora precisión e interpretabilidad) y **procesos de mejora de la precisión**.',
        ],
      },
    ],
    rel: [
      ['logica-difusa', 'los fundamentos'],
      ['prog-genetica', 'aprende reglas difusas para clasificación'],
      ['evolutivos', 'base de reglas lingüística codificada en un cromosoma'],
    ],
  },
];
