import { useEffect, useRef } from 'react';

/**
 * Permite rolar uma faixa horizontal (categorias, filtros, etc) usando a
 * rodinha comum do mouse, sem precisar segurar Shift. Sem isso, o
 * navegador tenta rolar a página inteira verticalmente e a faixa não se
 * move (ou "trava" o scroll da página sem efeito nenhum).
 */
export function useHorizontalWheelScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      const isMostlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (!hasOverflow || !isMostlyVertical) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return ref;
}
