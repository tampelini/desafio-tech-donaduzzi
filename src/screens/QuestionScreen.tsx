import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, Star, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import type { Session } from '../store/gameReducer';
import { useAppData } from '../store/AppDataContext';
import { useCountdown } from '../hooks/useCountdown';
import { computeScore } from '../game/scoring';
import { categoryLabel } from '../data/categories';
import { playSound } from '../services/sound';
import { Logo } from '../components/Logo';
import { TimerRing } from '../components/TimerRing';
import { TouchButton } from '../components/TouchButton';

interface Props {
  session: Session;
  revealed: boolean;
  onAnswer: (optionId: string | null) => void;
  onNext: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function QuestionScreen({ session, revealed, onAnswer, onNext }: Props) {
  const { settings } = useAppData();
  const question = session.questions[session.index];
  const total = session.questions.length;
  const answer = revealed ? session.answers[session.index] : undefined;
  const score = computeScore(session.answers, settings.pointsPerQuestion);
  const timerMs = settings.timePerQuestion * 1000;
  const isLast = session.index === total - 1;

  const remaining = useCountdown(timerMs, !revealed && timerMs > 0, () => onAnswer(null), question.id);

  useEffect(() => {
    if (answer) playSound(answer.correct ? 'correct' : 'wrong');
  }, [answer]);

  // Após a resposta, o enunciado e as alternativas irrelevantes encolhem para
  // abrir espaço ao feedback sem gerar rolagem.
  const len = question.prompt.length;
  const promptSize = revealed
    ? len > 60 ? 'text-[1.35rem] py-[0.7rem]' : 'text-[1.6rem] py-[0.7rem]'
    : len > 90 ? 'text-[1.7rem] py-[1.3rem]' : len > 60 ? 'text-[1.9rem] py-[1.3rem]' : 'text-[2.2rem] py-[1.3rem]';

  return (
    <div className="relative flex h-full flex-col px-[1.6rem] pb-[1.5rem] pt-[1.4rem]">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2 rounded-full border-[0.15rem] border-primary/25 bg-white px-[1rem] py-[0.3rem]" aria-label={`Pontuação: ${score}`}>
          <Star aria-hidden="true" className="h-[1.4rem] w-[1.4rem] fill-gold text-gold" />
          <motion.span key={score} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="font-display text-[1.5rem] font-bold tabular-nums text-heading">
            {score}
          </motion.span>
          <span className="text-[0.9rem] font-semibold text-primary">pts</span>
        </div>
      </header>

      <div className="mt-[0.8rem] flex items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-block max-w-full truncate rounded-full bg-primary/10 px-[0.9rem] py-[0.3rem] text-[0.95rem] font-bold uppercase tracking-wider text-primary">
            {categoryLabel(question.category)}
          </span>
          <p className="mt-[0.5rem] font-display text-[1.45rem] font-bold text-heading">
            Pergunta {session.index + 1} de {total}
          </p>
        </div>
        {timerMs > 0 && !revealed && <TimerRing remainingMs={remaining} totalMs={timerMs} />}
      </div>

      {/* Barra de progresso */}
      <div className="mt-[0.6rem] h-[0.6rem] overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={session.index + (revealed ? 1 : 0)}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={false}
          animate={{ width: `${((session.index + (revealed ? 1 : 0)) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* popLayout: a pergunta que sai é tirada do fluxo e a nova entra ao mesmo tempo. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.section
          key={question.id}
          initial={{ x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -48, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.8, 0.3, 1] }}
          className="mt-[0.8rem] flex min-h-0 flex-1 flex-col"
        >
          <h2 className={`glass rounded-3xl px-[1.5rem] font-display font-bold leading-tight text-heading transition-all ${promptSize}`}>{question.prompt}</h2>

          <ul className="mt-[0.8rem] flex flex-col gap-[0.6rem]" aria-label="Alternativas">
            {question.options.map((opt, i) => {
              const isCorrect = opt.id === question.correctOptionId;
              const isChosen = answer?.chosenOptionId === opt.id;
              const compact = revealed && !isCorrect && !isChosen;
              let style = 'glass';
              let badge = 'bg-primary text-white';
              let status: string | null = null;
              if (revealed) {
                if (isCorrect) {
                  style = 'border-2 border-success bg-success/15';
                  badge = 'bg-success text-white';
                  status = isChosen ? 'Sua resposta — correta' : 'Resposta correta';
                } else if (isChosen) {
                  style = 'border-2 border-danger bg-danger/10 shake-x';
                  badge = 'bg-danger text-white';
                  status = 'Sua resposta';
                } else {
                  style = 'glass opacity-50';
                  badge = 'bg-ink/15 text-ink';
                }
              }
              return (
                <li key={opt.id}>
                  <motion.button
                    type="button"
                    disabled={revealed}
                    onClick={() => onAnswer(opt.id)}
                    whileTap={revealed ? undefined : { scale: 0.97 }}
                    animate={revealed && isCorrect && isChosen ? { scale: [1, 1.04, 1] } : undefined}
                    transition={{ duration: 0.35 }}
                    className={`flex w-full items-center gap-[1rem] rounded-2xl px-[1.1rem] text-left transition-colors ${compact ? 'min-h-[3rem] py-[0.25rem]' : 'min-h-[4.8rem] py-[0.7rem]'} ${style}`}
                    aria-label={`Alternativa ${LETTERS[i]}: ${opt.text}${status ? ` (${status})` : ''}`}
                  >
                    <span className={`flex shrink-0 items-center justify-center rounded-xl font-display font-extrabold ${compact ? 'h-[2.2rem] w-[2.2rem] text-[1.1rem]' : 'h-[3rem] w-[3rem] text-[1.5rem]'} ${badge}`}>
                      {LETTERS[i]}
                    </span>
                    <span className={`flex-1 font-semibold leading-snug ${compact ? 'text-[1.05rem]' : 'text-[1.3rem]'}`}>{opt.text}</span>
                    {revealed && isCorrect && <CheckCircle2 aria-hidden="true" className="h-[2.2rem] w-[2.2rem] shrink-0 text-success" />}
                    {revealed && isChosen && !isCorrect && <XCircle aria-hidden="true" className="h-[2.2rem] w-[2.2rem] shrink-0 text-danger" />}
                  </motion.button>
                </li>
              );
            })}
          </ul>

          {/* Feedback educativo */}
          <div className="mt-auto pt-[0.8rem]" aria-live="polite">
            <AnimatePresence>
              {answer && (
                <motion.div
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-[0.8rem]"
                >
                  <div
                    className={`rounded-2xl border-l-[0.4rem] px-[1.2rem] py-[0.7rem] ${
                      answer.correct ? 'border-success bg-success/15' : 'border-danger bg-danger/15'
                    }`}
                  >
                    <p className="flex items-center gap-2 font-display text-[1.5rem] font-bold">
                      {answer.correct ? (
                        <><CheckCircle2 aria-hidden="true" className="h-[1.7rem] w-[1.7rem] text-success" /> Resposta correta! +{settings.pointsPerQuestion}</>
                      ) : answer.timedOut ? (
                        <><Clock aria-hidden="true" className="h-[1.7rem] w-[1.7rem] text-danger" /> Tempo esgotado!</>
                      ) : (
                        <><XCircle aria-hidden="true" className="h-[1.7rem] w-[1.7rem] text-danger" /> Resposta incorreta</>
                      )}
                    </p>
                    <p className="mt-[0.2rem] text-[1.1rem] leading-snug text-ink/90">{question.explanation}</p>
                  </div>
                  <TouchButton onPress={onNext} lockMs={500} className="min-h-[4.4rem] w-full">
                    {isLast ? 'VER RESULTADO' : 'PRÓXIMA PERGUNTA'}
                  </TouchButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
