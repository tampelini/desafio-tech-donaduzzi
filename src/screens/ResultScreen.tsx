import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle2, Clock, GraduationCap, RotateCcw, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import type { Session } from '../store/gameReducer';
import { sessionToRecord } from '../store/gameReducer';
import { useAppData } from '../store/AppDataContext';
import { formatDuration, pickTier } from '../game/scoring';
import { Logo } from '../components/Logo';
import { TouchButton } from '../components/TouchButton';
import { Confetti } from '../components/Confetti';
import { TechBackground } from '../components/TechBackground';

interface Props {
  session: Session;
  onCourses: () => void;
  onPlayAgain: () => void;
}

export function ResultScreen({ session, onCourses, onPlayAgain }: Props) {
  const { settings } = useAppData();
  const record = sessionToRecord(session, settings.pointsPerQuestion);
  const tier = pickTier(settings.resultTiers, record.correctCount, record.totalQuestions);
  const percent = record.totalQuestions ? record.correctCount / record.totalQuestions : 0;
  const high = percent >= 0.7;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('pt-BR'));
  useEffect(() => {
    const controls = animate(count, record.score, { duration: 1.4, ease: 'easeOut' });
    return () => controls.stop();
  }, [count, record.score]);

  return (
    <div className="hero relative flex h-full flex-col items-center px-[2rem] pb-[2rem] pt-[2rem] text-center">
      <TechBackground intensity={0.45} />
      {high && <Confetti count={percent === 1 ? 48 : 30} />}
      <Logo size="sm" onDark />

      <h1 className="text-gradient mt-[1.1rem] font-display text-[2.8rem] font-extrabold leading-none">DESAFIO CONCLUÍDO!</h1>

      <motion.div
        initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        className="relative mt-[0.8rem] flex h-[7.6rem] w-[7.6rem] shrink-0 items-center justify-center"
      >
        <span aria-hidden="true" className={`absolute inset-0 rounded-full ${high ? 'bg-gold/25 pulse-ring' : 'bg-primary/15'}`} />
        <span className={`relative flex h-[6.3rem] w-[6.3rem] items-center justify-center rounded-full ${high ? 'bg-gradient-to-br from-cream to-gold' : 'bg-gradient-to-br from-ink/90 to-cream'}`}>
          <Trophy aria-hidden="true" className="h-[4.2rem] w-[4.2rem] text-bg" strokeWidth={2.2} />
        </span>
      </motion.div>

      <div className="mt-[1.2rem]" aria-label={`${record.score} pontos`}>
        <motion.p className="font-display text-[5.2rem] font-extrabold leading-none tabular-nums text-gold">{rounded}</motion.p>
        <p className="font-display text-[2rem] font-bold tracking-[0.3em] text-gold/90">PONTOS</p>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="mt-[1rem]">
        <p className="font-display text-[2.1rem] font-extrabold">{tier.title}</p>
        <p className="mx-auto mt-[0.6rem] max-w-[28rem] text-[1.35rem] leading-snug text-ink/85">{tier.message}</p>
      </motion.div>

      <div className="mt-[1.4rem] grid w-full grid-cols-2 gap-[1rem]">
        <div className="glass rounded-2xl px-[1rem] py-[0.8rem]">
          <CheckCircle2 aria-hidden="true" className="mx-auto h-[2rem] w-[2rem] text-gold" />
          <p className="mt-1 font-display text-[1.9rem] font-bold">
            {record.correctCount}/{record.totalQuestions}
          </p>
          <p className="text-[1rem] text-ink/70">respostas corretas</p>
        </div>
        <div className="glass rounded-2xl px-[1rem] py-[0.8rem]">
          <Clock aria-hidden="true" className="mx-auto h-[2rem] w-[2rem] text-gold" />
          <p className="mt-1 font-display text-[1.9rem] font-bold">{formatDuration(record.durationMs ?? 0)}</p>
          <p className="text-[1rem] text-ink/70">tempo total</p>
        </div>
      </div>

      <div className="mt-auto flex w-full flex-col gap-[0.9rem] pt-[1rem]">
        <TouchButton variant="gold" onPress={onCourses} className="min-h-[5rem] w-full text-[1.35rem]">
          <GraduationCap aria-hidden="true" className="h-[1.8rem] w-[1.8rem] shrink-0" /> CONHEÇA NOSSOS CURSOS
        </TouchButton>
        <TouchButton variant="secondary" onPress={onPlayAgain} className="w-full">
          <RotateCcw aria-hidden="true" className="h-[1.7rem] w-[1.7rem]" /> JOGAR NOVAMENTE
        </TouchButton>
      </div>
    </div>
  );
}
