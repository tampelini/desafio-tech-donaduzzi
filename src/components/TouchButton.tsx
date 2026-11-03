import { motion, type HTMLMotionProps } from 'framer-motion';
import { useRef } from 'react';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost';

// Botões "pílula" como os do site institucional.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-primary to-accent text-bg shadow-[0_0.5rem_1.6rem_rgb(var(--c-primary)/0.3)]',
  secondary: 'border-[0.15rem] border-primary bg-transparent text-heading',
  gold: 'bg-gradient-to-r from-gold to-cream text-brand shadow-[0_0.5rem_1.6rem_rgb(var(--c-gold)/0.3)]',
  ghost: 'bg-transparent text-ink/80 border border-ink/20',
};

interface Props extends Omit<HTMLMotionProps<'button'>, 'onClick'> {
  variant?: Variant;
  onPress: () => void;
  /** Ignora novos toques por este intervalo (evita toques duplos). */
  lockMs?: number;
}

export function TouchButton({ variant = 'primary', onPress, lockMs = 700, className = '', children, disabled, ...rest }: Props) {
  const lockedUntil = useRef(0);
  // Tamanho de texto padrão só quando quem usa não define o seu (evita classes em conflito).
  const textSize = /(^|\s)text-\[/.test(className) ? '' : 'text-[1.5rem]';
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      disabled={disabled}
      onClick={() => {
        const now = Date.now();
        if (now < lockedUntil.current) return;
        lockedUntil.current = now + lockMs;
        onPress();
      }}
      className={`flex min-h-[4.25rem] items-center justify-center gap-3 rounded-full px-8 font-display ${textSize} font-bold tracking-wide transition-[filter,opacity] active:brightness-110 disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
