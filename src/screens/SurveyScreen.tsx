import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import type { SurveyAnswers } from '../types';
import { useAppData } from '../store/AppDataContext';
import { SURVEY_SCALE } from '../data/survey';
import { Logo } from '../components/Logo';
import { TouchButton } from '../components/TouchButton';
import { playSound } from '../services/sound';

interface Props {
  onBegin: (survey: SurveyAnswers | null) => void;
  onBack: () => void;
}

/**
 * Pesquisa rápida antes do desafio: um toque por pergunta, em uma escala de 1 a 5
 * com texto. Respostas anônimas, guardadas junto com a partida.
 */
export function SurveyScreen({ onBegin, onBack }: Props) {
  const { settings } = useAppData();
  const items = settings.survey.items;
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const complete = items.every((it) => answers[it.id]);

  const choose = (id: string, rating: number) => {
    playSound('next');
    setAnswers((a) => ({ ...a, [id]: rating }));
  };

  return (
    <div className="relative flex h-full flex-col px-[2rem] pb-[2rem] pt-[2rem]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[3.5rem] items-center gap-2 rounded-xl px-3 text-[1.1rem] font-semibold text-primary active:bg-primary/10"
          aria-label="Voltar à tela inicial"
        >
          <ArrowLeft className="h-[1.5rem] w-[1.5rem]" /> Voltar
        </button>
        <Logo size="sm" />
      </div>

      <p className="mt-[0.8rem] text-center font-display text-[1.2rem] font-bold uppercase tracking-[0.2em] text-primary">Antes de começar</p>
      <h1 className="text-center font-display text-[2.6rem] font-extrabold leading-tight text-heading">Conte pra gente!</h1>
      <p className="mt-[0.2rem] text-center text-[1.15rem] text-ink/75">Toque na opção que mais combina com você.</p>

      <div className="mt-[0.9rem] flex min-h-0 flex-1 flex-col justify-center gap-[1.1rem]">
        {items.map((item, i) => (
          <motion.section
            key={item.id}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 * i, duration: 0.3 }}
            className="glass rounded-3xl px-[1.1rem] pb-[1.1rem] pt-[1rem]"
          >
            <h2 id={`survey-${item.id}`} className="text-center font-display text-[1.6rem] font-bold leading-snug text-heading">
              {item.prompt}
            </h2>
            <div role="radiogroup" aria-labelledby={`survey-${item.id}`} className="mt-[0.8rem] grid grid-cols-5 gap-[0.5rem]">
              {SURVEY_SCALE.map((label, idx) => {
                const rating = idx + 1;
                const selected = answers[item.id] === rating;
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={label}
                    onClick={() => choose(item.id, rating)}
                    className={`flex min-h-[6.6rem] flex-col items-center justify-start gap-[0.4rem] rounded-2xl border-[0.15rem] px-[0.2rem] pb-[0.5rem] pt-[0.6rem] transition-colors active:scale-95 ${
                      selected ? 'border-primary bg-primary/10' : 'border-transparent bg-bg/70'
                    }`}
                  >
                    <span
                      className={`flex h-[2.9rem] w-[2.9rem] items-center justify-center rounded-full font-display text-[1.6rem] font-extrabold transition-colors ${
                        selected ? 'bg-gradient-to-br from-primary to-accent text-bg' : 'border-[0.15rem] border-primary/40 text-primary'
                      }`}
                    >
                      {selected ? <Check aria-hidden="true" className="h-[1.8rem] w-[1.8rem]" strokeWidth={3} /> : rating}
                    </span>
                    <span className={`text-[0.98rem] font-semibold leading-tight ${selected ? 'text-heading' : 'text-ink/80'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>

      <TouchButton onPress={() => onBegin(answers)} disabled={!complete} className="mt-[1rem] min-h-[5rem] w-full text-[2rem]">
        COMEÇAR DESAFIO
      </TouchButton>
      {settings.survey.allowSkip && (
        <button
          type="button"
          onClick={() => onBegin(null)}
          className="mx-auto mt-[0.3rem] min-h-[3rem] rounded-full px-6 text-[1.15rem] font-semibold text-ink/65 underline underline-offset-4 active:bg-primary/10"
        >
          Pular e começar
        </button>
      )}
    </div>
  );
}
