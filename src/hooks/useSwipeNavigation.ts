import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Permite trocar de aba (Início, Cardápio, Sacola, Pedidos, Perfil/Entrar)
 * arrastando o dedo pra esquerda/direita em qualquer lugar da tela,
 * como um app nativo. Ignora arrastões que começam dentro de elementos
 * que já têm scroll horizontal próprio (galeria, categorias, cupons etc.)
 * marcados com a classe "overflow-x-auto" ou o atributo "data-no-swipe".
 */
export function useSwipeNavigation(paths: string[]) {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.overflow-x-auto') || target.closest('[data-no-swipe]')) {
        touchStart.current = null;
        return;
      }
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      touchStart.current = null;

      const minDistance = 70;
      if (Math.abs(dx) < minDistance) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) return;

      const currentIndex = paths.indexOf(location.pathname);
      if (currentIndex === -1) return;

      if (dx < 0 && currentIndex < paths.length - 1) {
        navigate(paths[currentIndex + 1]);
      } else if (dx > 0 && currentIndex > 0) {
        navigate(paths[currentIndex - 1]);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [paths, location.pathname, navigate]);
}
