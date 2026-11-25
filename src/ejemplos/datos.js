// Conjuntos de datos de las diapositivas.

const filas = (cab, txt) =>
  txt
    .trim()
    .split('\n')
    .map((l) => {
      const v = l.trim().split(/\s+/);
      return Object.fromEntries(cab.map((c, i) => [c, v[i]]));
    });

export const TENIS = filas(
  ['outlook', 'temperature', 'humidity', 'windy', 'play'],
  `sunny hot high false no
sunny hot high true no
overcast hot high false yes
rain mild high false yes
rain cool normal false yes
rain cool normal true no
overcast cool normal true yes
sunny mild high false no
sunny cool normal false yes
rain mild normal false yes
sunny mild normal true yes
overcast mild high true yes
overcast hot normal false yes
rain mild high true no`,
);

// Versión numérica (Naïve Bayes y C4.5): mismo orden de días
export const TENIS_NUM = [
  { outlook: 'sunny', temp: 85, hum: 85, windy: 'false', play: 'no' },
  { outlook: 'sunny', temp: 80, hum: 90, windy: 'true', play: 'no' },
  { outlook: 'overcast', temp: 83, hum: 86, windy: 'false', play: 'yes' },
  { outlook: 'rain', temp: 70, hum: 96, windy: 'false', play: 'yes' },
  { outlook: 'rain', temp: 68, hum: 80, windy: 'false', play: 'yes' },
  { outlook: 'rain', temp: 65, hum: 70, windy: 'true', play: 'no' },
  { outlook: 'overcast', temp: 64, hum: 65, windy: 'true', play: 'yes' },
  { outlook: 'sunny', temp: 72, hum: 95, windy: 'false', play: 'no' },
  { outlook: 'sunny', temp: 69, hum: 70, windy: 'false', play: 'yes' },
  { outlook: 'rain', temp: 75, hum: 80, windy: 'false', play: 'yes' },
  { outlook: 'sunny', temp: 75, hum: 70, windy: 'true', play: 'yes' },
  { outlook: 'overcast', temp: 72, hum: 90, windy: 'true', play: 'yes' },
  { outlook: 'overcast', temp: 81, hum: 75, windy: 'false', play: 'yes' },
  { outlook: 'rain', temp: 71, hum: 91, windy: 'true', play: 'no' },
];

// Crédito tal y como aparece en la construcción del árbol (TDIDT)
export const CREDITO = filas(
  ['credito', 'ingresos', 'propietario', 'gastos'],
  `no bajos no altos
no bajos si altos
no medios si altos
no medios no altos
no altos no altos
si altos si altos
no bajos no bajos
no medios no bajos
no altos no bajos
si medios si bajos`,
);

// Crédito tal y como aparece en el ejemplo de PRISM (una fila distinta)
export const CREDITO_PRISM = filas(
  ['credito', 'ingresos', 'propietario', 'gastos'],
  `no bajos no altos
no altos no altos
no bajos no bajos
no medios no bajos
no altos no bajos
no medios no altos
no bajos si altos
no medios si altos
si medios si bajos
si altos si bajos`,
);

// Alturas (ID3 con log10); altura ya discretizada en los 6 rangos de la diapositiva
export const ALTURAS = filas(
  ['nombre', 'genero', 'altura', 'clase'],
  `Kristina F 1 short
Jim M 5 tall
Maggie F 4 medium
Martha F 4 medium
Stephanie F 2 short
Bob M 4 medium
Kathy F 1 short
Dave M 2 short
Worth M 6 tall
Steven M 6 tall
Debbie F 3 medium
Todd M 5 medium
Kim F 4 medium
Amy F 3 medium
Wynette F 3 medium`,
);

export const DATASETS = {
  tenis: { nombre: 'Jugar al tenis', filas: TENIS, clase: 'play', clases: ['yes', 'no'], attrs: ['outlook', 'temperature', 'humidity', 'windy'], base: 2 },
  credito: { nombre: 'Crédito (árbol)', filas: CREDITO, clase: 'credito', clases: ['si', 'no'], attrs: ['ingresos', 'propietario', 'gastos'], base: 2 },
  alturas: { nombre: 'Alturas (log₁₀)', filas: ALTURAS, clase: 'clase', clases: ['short', 'medium', 'tall'], attrs: ['genero', 'altura'], base: 10 },
};

// Horas jugadas por día (mismo orden que TENIS / TENIS_NUM). No está en las diapositivas: se añade para
// poder enseñar la regresión con árboles (SDR, CART) sobre datos que ya se conocen.
export const HORAS = [25, 30, 46, 45, 52, 23, 43, 35, 38, 46, 48, 52, 44, 30];
