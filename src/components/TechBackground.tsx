import { memo } from 'react';

/** Trilhas de circuito animadas apenas com CSS (leve para Android intermediário). */
export const TechBackground = memo(function TechBackground({ intensity = 1 }: { intensity?: number }) {
  const paths = [
    'M0 220 H140 L190 270 H360',
    'M540 160 H420 L380 200 H250',
    'M0 610 H90 L130 650 V760 L170 800 H260',
    'M540 520 H470 L430 560 V690',
    'M0 1060 H120 L160 1020 H300',
    'M540 900 H400 L360 940 V1040 L320 1080',
    'M70 0 V90 L110 130 H200',
    'M460 960 V1200',
    'M200 1200 V1110 L240 1070 H380',
  ];
  const nodes = [
    [360, 270], [250, 200], [260, 800], [430, 690], [300, 1020], [320, 1080], [200, 130], [380, 1070], [140, 220], [470, 520],
  ];
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 540 1200"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.55 * intensity }}
    >
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 H0 V30" fill="none" stroke="rgb(var(--c-primary) / 0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="540" height="1200" fill="url(#grid)" />
      {paths.map((d, i) => (
        <g key={d}>
          <path d={d} fill="none" stroke="rgb(var(--c-primary) / 0.18)" strokeWidth="2" />
          <path
            d={d}
            fill="none"
            stroke={i % 2 ? 'rgb(var(--c-accent))' : 'rgb(var(--c-primary))'}
            strokeWidth="2"
            className="circuit-flow"
            style={{ animationDelay: `${-i * 1.3}s` }}
          />
        </g>
      ))}
      {nodes.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4.5"
          fill="rgb(var(--c-primary))"
          className="blink-node"
          style={{ animationDelay: `${-i * 0.7}s` }}
        />
      ))}
    </svg>
  );
});
