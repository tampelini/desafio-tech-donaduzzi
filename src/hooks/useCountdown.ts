import { useEffect, useRef, useState } from 'react';

/**
 * Contagem regressiva baseada em prazo absoluto (Date.now), imune a atrasos
 * de renderização. `resetKey` reinicia a contagem (ex.: nova pergunta).
 * Retorna os milissegundos restantes.
 */
export function useCountdown(durationMs: number, running: boolean, onExpire: () => void, resetKey: unknown): number {
  const [remaining, setRemaining] = useState(durationMs);
  const deadline = useRef(0);
  const cb = useRef(onExpire);
  cb.current = onExpire;

  useEffect(() => {
    deadline.current = Date.now() + durationMs;
    setRemaining(durationMs);
  }, [durationMs, resetKey]);

  useEffect(() => {
    if (!running || durationMs <= 0) return;
    const tick = () => {
      const left = Math.max(0, deadline.current - Date.now());
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        cb.current();
      }
    };
    const id = window.setInterval(tick, 100);
    tick();
    return () => window.clearInterval(id);
  }, [running, durationMs, resetKey]);

  return remaining;
}
