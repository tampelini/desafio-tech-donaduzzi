import { motion } from 'framer-motion';
import { ArrowLeft, ListChecks, MousePointerClick, Star, Timer, Trophy } from 'lucide-react';
import { useAppData } from '../store/AppDataContext';
import { Logo } from '../components/Logo';
import { TouchButton } from '../components/TouchButton';

export function InstructionsScreen({ onBegin, onBack, beginLabel = 'COMEÇAR DESAFIO' }: { onBegin: () => void; onBack: () => void; beginLabel?: string }) {
  const { settings } = useAppData();
  const rules = [
    { Icon: ListChecks, text: `Responda a ${settings.questionsPerGame} perguntas.` },
    { Icon: MousePointerClick, text: 'Escolha uma das quatro alternativas.' },
    { Icon: Star, text: `Cada resposta correta vale ${settings.pointsPerQuestion} pontos.` },
    {
      Icon: Timer,
      text: settings.timePerQuestion > 0 ? `Você terá até ${settings.timePerQuestion} segundos por pergunta.` : 'Responda sem pressa: não há limite de tempo.',
    },
    { Icon: Trophy, text: 'Descubra sua pontuação ao final.' },
  ];

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

      <p className="mt-[1.5rem] text-center font-display text-[1.2rem] font-bold uppercase tracking-[0.2em] text-primary">{settings.gameName}</p>
      <h1 className="text-center font-display text-[3.4rem] font-extrabold text-heading">Como jogar</h1>

      <ol className="mt-[1.2rem] flex min-h-0 flex-1 flex-col justify-center gap-[0.9rem]">
        {rules.map(({ Icon, text }, i) => (
          <motion.li
            key={i}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.08 * i, duration: 0.35 }}
            className="glass flex items-center gap-[1.2rem] rounded-2xl px-[1.4rem] py-[1rem]"
          >
            <span className="flex h-[3.4rem] w-[3.4rem] shrink-0 items-center justify-center rounded-full bg-primary font-display text-[1.7rem] font-extrabold text-bg">
              {i + 1}
            </span>
            <span className="flex-1 text-[1.45rem] font-semibold leading-snug text-heading">{text}</span>
            <Icon aria-hidden="true" className="h-[2rem] w-[2rem] shrink-0 text-primary" />
          </motion.li>
        ))}
      </ol>

      <TouchButton onPress={onBegin} className="mt-[1.4rem] min-h-[5.5rem] w-full text-[2rem]">
        {beginLabel}
      </TouchButton>
    </div>
  );
}
