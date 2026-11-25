import { useEffect, useState } from 'react';

// Router mínimo basado en el hash: funciona en cualquier hosting estático
// sin configurar redirecciones.
//   #/                -> inicio (mapa general)
//   #/n/<id>          -> ficha de un nodo
//   #/parte/<n>       -> recorrido de una parte
//   #/tabla           -> tabla resumen de todos los algoritmos
export function leerRuta() {
  const h = (window.location.hash || '#/').replace(/^#\/?/, '');
  const [seccion = '', arg = ''] = h.split('/');
  return { seccion, arg: decodeURIComponent(arg) };
}

export function useRuta() {
  const [ruta, setRuta] = useState(leerRuta);
  useEffect(() => {
    const on = () => {
      setRuta(leerRuta());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return ruta;
}

export const irA = (ruta) => {
  window.location.hash = ruta;
};
