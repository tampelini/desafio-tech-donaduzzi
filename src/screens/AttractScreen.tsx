import { motion } from 'framer-motion';
import { Bot, Brain, Code2, Cpu, Database, Fingerprint, Network, Wifi } from 'lucide-react';
import { useAppData } from '../store/AppDataContext';
import { Logo } from '../components/Logo';
import { TechBackground } from '../components/TechBackground';

const ORBIT = [Cpu, Brain, Database, Code2, Wifi, Bot, Network, Fingerprint];

export function AttractScreen({ onStart, disabled }: { onStart: () => void; disabled?: boolean }) {
  const { settings } = useAppData();
  const minutes = Math.max(1, Math.round((settings.questionsPerGame * 18) / 60));

  return (
    <div className="hero relative flex h-full flex-col items-center px-[2rem] pb-[2.2rem] pt-[2.5rem] text-center">
      <TechBackground intensity={0.6} />
      <Logo size="lg" onDark />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-[1.4rem]"
      >
        {/* Com o logotipo na tela, o nome em texto seria repetido. */}
        {!settings.logo && (
          <p className="font-display text-[1.25rem] font-semibold uppercase tracking-[0.35em] text-primary">
            {settings.institutionName}
          </p>
        )}
        <h1 className="text-gradient mt-[0.6rem] font-display text-[4.6rem] font-extrabold leading-[0.95] tracking-tight">
          {settings.gameName}
        </h1>
        <p className="mt-[1.2rem] font-display text-[1.9rem] font-semibold leading-tight">{settings.tagline}</p>
        <p className="mx-auto mt-[1rem] max-w-[27rem] text-[1.2rem] leading-snug text-ink/80">{settings.intro}</p>
      </motion.div>

      {/* Botão central com órbita de ícones de computação */}
      <div className="relative my-auto flex h-[21rem] w-[21rem] shrink-0 items-center justify-center">
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          {ORBIT.map((Icon, i) => {
            const angle = (i / ORBIT.length) * Math.PI * 2;
            return (
              <div
                key={i}
                className="absolute flex h-[2.8rem] w-[2.8rem] items-center justify-center rounded-full border border-primary/40 bg-ink/10 text-primary"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * 8.6}rem - 1.4rem)`,
                  top: `calc(50% + ${Math.sin(angle) * 8.6}rem - 1.4rem)`,
                }}
              >
                <Icon className="h-[1.5rem] w-[1.5rem]" />
              </div>
            );
          })}
        </motion.div>
        <span aria-hidden="true" className="pulse-ring absolute h-[13rem] w-[13rem] rounded-full border-4 border-accent/70" />
        <motion.button
          type="button"
          disabled={disabled}
          onClick={onStart}
          whileTap={{ scale: 0.92 }}
          className="glow-primary relative z-10 flex h-[13rem] w-[13rem] flex-col items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display font-extrabold text-bg disabled:opacity-40"
        >
          <span className="text-[1.5rem] leading-tight">TOQUE PARA</span>
          <span className="text-[2.2rem] leading-tight">COMEÇAR</span>
        </motion.button>
      </div>

      <div className="space-y-[0.6rem]">
        <p className="font-display text-[1.6rem] font-bold">Você está pronto para o desafio?</p>
        <p className="text-[1.2rem] text-ink/80">
          {settings.questionsPerGame} perguntas • Aproximadamente {minutes} {minutes === 1 ? 'minuto' : 'minutos'}
        </p>
        {disabled && <p className="text-[1rem] text-gold">Nenhuma pergunta ativa. Configure o banco no painel administrativo.</p>}
      </div>
    </div>
  );
}
