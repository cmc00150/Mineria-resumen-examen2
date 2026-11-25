// Capa visual de cada ficha: pictogramas + fichas cortas (el texto largo de la
// ficha técnica aparece al pasar el ratón por cada ficha corta, en el mismo orden).
//   entrada: discreta | continua | mixta        caja: blanca | negra | gris
//   devuelve: arbol | arbol-podado | arbol-binario | reglas | lista | probs | red | comite | datos | intervalos | numero | ecuacion | regiones
//   avisos: [texto corto, explicación]          formulas: [nombre, latex]
//   infografia: componente de ejemplos/ que resume la ficha en un gráfico

export const VISUAL = {
  arboles: {
    entrada: 'discreta',
    caja: 'blanca',
    devuelve: 'arbol',
    fuertes: ['Fáciles y eficientes', 'Reglas interpretables', 'Escalan bien', 'Toleran el ruido'],
    debiles: ['Continuos: difícil', 'Solo cortes rectangulares', 'Valores perdidos', 'Sobreaprendizaje', 'No ven correlaciones'],
    infografia: 'InfoArboles',
  },
  tdidt: {
    entrada: 'discreta',
    caja: 'blanca',
    devuelve: 'arbol',
    fuertes: ['Esquema común a todos', 'Voraz → rápido'],
    debiles: ['No garantiza el mejor árbol', 'Depende de la medida'],
    parametros: ['Medida para elegir atributo'],
  },
  id3: {
    entrada: 'discreta',
    caja: 'blanca',
    devuelve: 'arbol',
    fuertes: ['Hipótesis completas', 'Usa todos los ejemplos a la vez', 'Tolera ruido', 'Prefiere árboles cortos'],
    debiles: ['Una sola hipótesis', 'No propone ejemplos', 'Sin vuelta atrás: óptimo local', 'Sesgo: atributos con muchos valores', 'Sin continuos, perdidos ni poda'],
    weka: 'Id3',
    avisos: [['Ejemplo de alturas en log₁₀', 'El ejemplo de alturas usa logaritmo en base 10: por eso H(S) = 0,4384 (en base 2 saldría 1,456). El procedimiento es el mismo.']],
    formulas: [
      ['Entropía', 'H(S) = -\\sum_{i} p_i \\log_2 p_i'],
      ['Ganancia', 'G(S,A) = H(S) - \\sum_{v} \\tfrac{|S_v|}{|S|} H(S_v)'],
    ],
    infografia: 'InfoID3',
  },
  c45: {
    entrada: 'mixta',
    caja: 'blanca',
    devuelve: 'arbol-podado',
    fuertes: ['Continuos y perdidos', 'Corrige el sesgo de ID3', 'Pre y post-poda', 'N.º 1 del top-10'],
    debiles: ['Cortes paralelos a los ejes', 'Inestable'],
    parametros: ['Confianza de poda', 'Mín. ejemplos por hoja'],
    weka: 'J48',
    avisos: [['Ratio de alturas: /13 → /15', 'La diapositiva calcula H(2/13, 2/13, 3/13, 4/13, 2/13), pero la altura tiene 6 rangos con 2, 2, 3, 4, 2 y 2 personas: debe ser H(2/15, 2/15, 3/15, 4/15, 2/15, 2/15).']],
    formulas: [
      ['Ratio de ganancia', 'GainRatio(S,A) = \\dfrac{G(S,A)}{H\\big(\\tfrac{|S_1|}{|S|},\\dots,\\tfrac{|S_v|}{|S|}\\big)}'],
      ['Corte numérico', 'x \\le \\theta \\;\\text{ o }\\; x > \\theta,\\quad \\theta = \\arg\\max G'],
    ],
    infografia: 'InfoC45',
  },
  cart: {
    entrada: 'mixta',
    caja: 'blanca',
    devuelve: 'arbol-binario',
    fuertes: ['Clasifica y hace regresión', 'Gini: sin logaritmos'],
    debiles: ['Enumera todas las divisiones', 'Cortes paralelos a los ejes'],
    parametros: ['Profundidad', 'Poda coste-complejidad'],
    weka: 'SimpleCart',
    formulas: [
      ['Gini', 'gini(T) = 1 - \\sum_j p_j^2'],
      ['Gini de la división', 'gini_{split} = \\tfrac{N_1}{N} gini(T_1) + \\tfrac{N_2}{N} gini(T_2)'],
    ],
    infografia: 'CurvaEntropia',
  },
};
