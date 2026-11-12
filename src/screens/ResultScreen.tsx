import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle2, Clock, GraduationCap, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import type { Session } from '../store/gameReducer';
import { sessionToRecord } from '../store/gameReducer';
import { useAppData } from '../store/AppDataContext';
import { formatDuration, pickTier } from '../game/scoring';
import { selfCheck } from '../data/survey';
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
  // Autoavaliação da pesquisa x acertos na categoria correspondente (ex.: Faculdade).
  const check = session.survey
    ? settings.survey.items
        .map((it) => selfCheck(it, session.survey?.[it.id], session.questions, session.answers))
        .find((c) => c !== null) ?? null
    : null;

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

      <h1 className="text-gradient mt-[1rem] whitespace-nowrap font-display text-[2.5rem] font-extrabold leading-none">DESAFIO CONCLUÍDO!</h1>

      <motion.div
        initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        className={`relative mt-[0.8rem] flex shrink-0 items-center justify-center ${check ? 'h-[6rem] w-[6rem]' : 'h-[7.6rem] w-[7.6rem]'}`}
      >
        <span aria-hidden="true" className={`absolute inset-0 rounded-full ${high ? 'bg-gold/25 pulse-ring' : 'bg-primary/15'}`} />
        <span className={`relative flex items-center justify-center rounded-full ${check ? 'h-[5rem] w-[5rem]' : 'h-[6.3rem] w-[6.3rem]'} ${high ? 'bg-gradient-to-br from-cream to-gold' : 'bg-gradient-to-br from-ink/90 to-cream'}`}>
          <Trophy aria-hidden="true" className={`${check ? 'h-[3.3rem] w-[3.3rem]' : 'h-[4.2rem] w-[4.2rem]'} text-bg`} strokeWidth={2.2} />
        </span>
      </motion.div>

      <div className={check ? 'mt-[0.8rem]' : 'mt-[1.2rem]'} aria-label={`${record.score} pontos`}>
        <motion.p className={`font-display ${check ? 'text-[4.4rem]' : 'text-[5.2rem]'} font-extrabold leading-none tabular-nums text-gold`}>{rounded}</motion.p>
        <p className="font-display text-[2rem] font-bold tracking-[0.3em] text-gold/90">PONTOS</p>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="mt-[1rem]">
        <p className="font-display text-[2.1rem] font-extrabold">{tier.title}</p>
        <p className="mx-auto mt-[0.6rem] max-w-[28rem] text-[1.35rem] leading-snug text-ink/85">{tier.message}</p>
      </motion.div>

      {check && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="glass mt-[1rem] flex w-full items-center gap-[1rem] rounded-2xl px-[1.2rem] py-[0.8rem] text-left"
          data-testid="self-check"
        >
          <Sparkles aria-hidden="true" className="h-[2.2rem] w-[2.2rem] shrink-0 text-gold" />
          <p className="text-[1.12rem] leading-snug text-ink/90">
            {check.text} <strong className="font-display font-bold text-gold">{check.verdict}</strong>
          </p>
        </motion.div>
      )}

      <div className={`${check ? 'mt-[1rem]' : 'mt-[1.4rem]'} grid w-full grid-cols-2 gap-[1rem]`}>
        {[
          { Icon: CheckCircle2, value: `${record.correctCount}/${record.totalQuestions}`, label: 'respostas corretas' },
          { Icon: Clock, value: formatDuration(record.durationMs ?? 0), label: 'tempo total' },
        ].map(({ Icon, value, label }) => (
          // Com a comparação da pesquisa na tela, os cartões ficam em linha para caber tudo.
          <div
            key={label}
            className={`glass rounded-2xl px-[1rem] ${check ? 'flex items-center justify-center gap-[0.8rem] py-[0.6rem] text-left' : 'py-[0.8rem]'}`}
          >
            <Icon aria-hidden="true" className={`h-[2rem] w-[2rem] shrink-0 text-gold ${check ? '' : 'mx-auto'}`} />
            <div>
              <p className={`font-display text-[1.9rem] font-bold leading-tight ${check ? '' : 'mt-1'}`}>{value}</p>
              <p className="text-[1rem] text-ink/70">{label}</p>
            </div>
          </div>
        ))}
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
