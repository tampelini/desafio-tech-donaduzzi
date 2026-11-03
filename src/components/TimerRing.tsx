interface Props {
  remainingMs: number;
  totalMs: number;
}

export function TimerRing({ remainingMs, totalMs }: Props) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const fraction = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const seconds = Math.ceil(remainingMs / 1000);
  const urgent = seconds <= 5;
  const color = urgent ? 'rgb(var(--c-danger))' : seconds <= 10 ? 'rgb(var(--c-gold))' : 'rgb(var(--c-primary))';
  return (
    <div
      className="relative h-[5.5rem] w-[5.5rem] shrink-0"
      role="timer"
      aria-live={urgent ? 'assertive' : 'off'}
      aria-label={`${seconds} segundos restantes`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="rgb(var(--c-bg) / 0.6)" stroke="rgb(var(--c-ink) / 0.12)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction)}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-display text-[2rem] font-bold tabular-nums ${urgent ? 'text-danger' : ''}`}
      >
        {seconds}
      </span>
    </div>
  );
}
