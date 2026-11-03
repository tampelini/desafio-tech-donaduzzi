import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['rgb(var(--c-gold))', 'rgb(var(--c-primary))', 'rgb(var(--c-accent))', 'rgb(var(--c-ink))'];

/** Confete leve (poucas partículas, apenas transform/opacity). */
export function Confetti({ count = 36 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.4 + Math.random() * 1.8,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 0.5 + Math.random() * 0.5,
      })),
    [count],
  );
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block rounded-sm"
          style={{ left: `${p.left}%`, width: `${p.size}rem`, height: `${p.size * 1.6}rem`, background: p.color }}
          initial={{ y: '-10vh', rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rotate, opacity: [1, 1, 0.6] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
