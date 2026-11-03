import { useEffect, useRef } from 'react';

const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;

/**
 * Chama `onIdle` após `timeoutMs` sem interação. Qualquer toque reinicia a
 * contagem. `resetKey` reinicia a contagem quando muda (ex.: troca de tela).
 */
export function useIdle(timeoutMs: number, onIdle: () => void, enabled = true, resetKey?: unknown) {
  const cb = useRef(onIdle);
  cb.current = onIdle;

  useEffect(() => {
    if (!enabled || timeoutMs <= 0) return;
    let timer = window.setTimeout(() => cb.current(), timeoutMs);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => cb.current(), timeoutMs);
    };
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeoutMs, enabled, resetKey]);
}
