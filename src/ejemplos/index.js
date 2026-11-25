import { lazy } from 'react';
import * as p1 from './parte1.jsx';
import * as p2 from './parte2.jsx';
import * as p3 from './parte3.jsx';
import * as p4 from './parte4.jsx';
import * as info from './info.jsx';
import * as mu from './muestreo.jsx';
import * as pr from './prototipos.jsx';
import { Knn } from './knn.jsx';
import { PasoChiMerge, PasoMDLP } from './discretizacion.jsx';
import { PasoLista, PasoReglasArbol } from './reglas.jsx';
import { ComiteGeneral, ComiteBagging, ComiteBoosting } from './ensembles.jsx';
import { PasoZeroR, PasoOneR, OneRDisc } from './basicos.jsx';
import { PasoCriterio, Impureza } from './criterios.jsx';
import { ArbolTDIDT, ArbolID3, ArbolC45, ArbolCART } from './arboles.jsx';

// Los ejemplos 3D se cargan solo cuando se abren (three.js pesa).
const Red3D = lazy(() => import('./tresd.jsx').then((m) => ({ default: m.Red3D })));
const Bosque3D = lazy(() => import('./tresd.jsx').then((m) => ({ default: m.Bosque3D })));
const Modelos3D = lazy(() => import('./tresd.jsx').then((m) => ({ default: m.Modelos3D })));

export const DEMOS = {
  // Infografías
  InfoArboles: info.InfoArboles,
  InfoID3: info.InfoID3,
  InfoC45: info.InfoC45,
  // Parte I
  PuntosReduccion: p1.PuntosReduccion,
  Prototipos: p1.Prototipos,
  CnnEnn: p1.CnnEnn,
  Urna: mu.Urna,
  Bootstrap: mu.Bootstrap,
  Clusters: mu.Clusters,
  Incremental: mu.Incremental,
  Estratificado: mu.Estratificado,
  Estratificacion: mu.Estratificacion,
  SiArbol: mu.SiArbol,
  PasoCNN: pr.PasoCNN,
  PasoENN: pr.PasoENN,
  PasoMultiedit: pr.PasoMultiedit,
  PasoIB3: pr.PasoIB3,
  PasoDROP3: pr.PasoDROP3,
  PasoRMHC: pr.PasoRMHC,
  PasoCHC: pr.PasoCHC,
  PasoSSMA: pr.PasoSSMA,
  Borde: pr.Borde,
  DiagramaPrototipos: pr.DiagramaPrototipos,
  Smote: p1.Smote,
  Binning: p1.Binning,
  ChiMerge: p1.ChiMerge,
  TaxonomiaDiscretizacion: p1.TaxonomiaDiscretizacion,
  // Parte II
  ArbolTenis: p2.ArbolTenis,
  ParticionEspacio: p2.ParticionEspacio,
  ArbolCredito: p2.ArbolCredito,
  Ganancia: p2.Ganancia,
  UmbralC45: p2.UmbralC45,
  Prism: p2.Prism,
  Solapamiento: p2.Solapamiento,
  Codificacion: p2.Codificacion,
  ArbolExpresion: p2.ArbolExpresion,
  Tokens: p2.Tokens,
  // Parte III
  EstrellaNB: p3.EstrellaNB,
  NaiveBayes: p3.NaiveBayes,
  Activaciones: p3.Activaciones,
  Perceptron: p3.Perceptron,
  Knn,
  PasoChiMerge,
  PasoMDLP,
  PasoLista,
  PasoReglasArbol,
  ComiteGeneral,
  ComiteBagging,
  ComiteBoosting,
  PasoZeroR,
  PasoOneR,
  OneRDisc,
  PasoCriterio,
  Impureza,
  ArbolTDIDT,
  ArbolID3,
  ArbolC45,
  ArbolCART,
  BaggingBoosting: p3.BaggingBoosting,
  AdaBoost: p3.AdaBoost,
  OvoOva: p3.OvoOva,
  Red3D,
  Bosque3D,
  // Parte IV y conceptos
  Metricas: p4.Metricas,
  RegresionLineal: p4.RegresionLineal,
  Sdr: p4.Sdr,
  Difuso: p4.Difuso,
  Modelos3D,
  Pertenencia: p4.Pertenencia,
  CurvaEntropia: p4.CurvaEntropia,
  Sobreajuste: p4.Sobreajuste,
};

// Ejemplos que avanzan sincronizados con el esquema de su ficha
export const SINCRONIZADOS = new Set([
  'Urna', 'Clusters', 'Incremental', 'Estratificado', 'Estratificacion', 'SiArbol',
  'PasoCNN', 'PasoENN', 'PasoMultiedit', 'PasoIB3', 'PasoDROP3', 'PasoRMHC', 'PasoCHC', 'PasoSSMA',
  'Knn', 'PasoChiMerge', 'PasoMDLP', 'PasoLista', 'PasoReglasArbol', 'NaiveBayes', 'Perceptron', 'Prism', 'RegresionLineal', 'Sdr', 'ComiteGeneral', 'ComiteBagging', 'ComiteBoosting', 'PasoZeroR', 'PasoOneR', 'PasoCriterio', 'ArbolTDIDT', 'ArbolID3', 'ArbolC45', 'ArbolCART',
]);
