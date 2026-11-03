import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppData } from '../store/AppDataContext';
import { Logo } from '../components/Logo';
import { TouchButton } from '../components/TouchButton';
import { CourseIcon } from '../components/CourseIcon';
import { QrCode } from '../components/QrCode';

interface Props {
  onPlayAgain: () => void;
  onHome: () => void;
}

/** Contagem visual até o retorno automático (reinicia a cada toque). */
function useIdleCountdown(totalSeconds: number) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    let last = Date.now();
    const reset = () => (last = Date.now());
    window.addEventListener('pointerdown', reset);
    const id = window.setInterval(() => setLeft(Math.max(0, totalSeconds - Math.floor((Date.now() - last) / 1000))), 500);
    return () => {
      window.removeEventListener('pointerdown', reset);
      window.clearInterval(id);
    };
  }, [totalSeconds]);
  return left;
}

export function CoursesScreen({ onPlayAgain, onHome }: Props) {
  const { settings, courses } = useAppData();
  const visible = courses.filter((c) => c.enabled);
  const compact = visible.length > 4;
  const left = useIdleCountdown(settings.coursesIdleSeconds);

  // Densidade da lista: 0 = normal, 1 = compacta, 2 = descrições em 2 linhas, 3 = só nomes.
  // Sobe de nível enquanto os cartões não couberem (vários cursos, QR Code).
  const listRef = useRef<HTMLDivElement>(null);
  const [density, setDensity] = useState(0);
  const [measureKey, setMeasureKey] = useState(0);
  useEffect(() => {
    // Remede quando o espaço da lista muda (o QR Code é gerado de forma assíncrona e
    // ocupa altura depois) e quando as fontes terminam de carregar.
    const el = listRef.current;
    let lastHeight = el?.clientHeight ?? 0;
    const remeasure = () => setMeasureKey((k) => k + 1);
    void document.fonts?.ready.then(remeasure);
    const ro =
      el && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (el.clientHeight !== lastHeight) {
              lastHeight = el.clientHeight;
              remeasure();
            }
          })
        : null;
    if (el) ro?.observe(el);
    return () => ro?.disconnect();
  }, []);
  useLayoutEffect(() => setDensity(0), [visible.length, settings.qrUrl, measureKey]);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && density < 3 && el.scrollHeight > el.clientHeight + 1) setDensity((d) => d + 1);
  });
  const card = ['p-[1.1rem] gap-[1rem]', 'p-[0.8rem] gap-[0.8rem]', 'p-[0.7rem] gap-[0.7rem]', 'p-[0.6rem] gap-[0.7rem] items-center'][density];
  const title = compact ? 'text-[1.15rem]' : ['text-[1.4rem]', 'text-[1.25rem]', 'text-[1.2rem]', 'text-[1.2rem]'][density];
  const desc = compact ? 'text-[0.9rem]' : ['text-[1.05rem]', 'text-[0.95rem]', 'text-[0.92rem] line-clamp-2', 'hidden'][density];

  return (
    <div className="relative flex h-full flex-col px-[1.8rem] pb-[1.6rem] pt-[1.8rem]">
      <div className="flex justify-center">
        <Logo size="sm" />
      </div>
      <p className="mt-[1rem] text-center font-display text-[1.1rem] font-bold uppercase tracking-[0.2em] text-primary">Graduação</p>
      <h1 className="text-center font-display text-[2.3rem] font-extrabold leading-tight text-heading">Conheça nossos cursos</h1>

      <div
        ref={listRef}
        className={`mt-[1.1rem] grid min-h-0 flex-1 content-start overflow-hidden ${density ? 'gap-[0.6rem]' : 'gap-[0.8rem]'} ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {visible.map((course, i) => (
          <motion.article
            key={course.id}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.07 * i }}
            className={`glass flex rounded-2xl ${card} ${compact ? 'flex-col' : 'items-start'}`}
          >
            <span className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-bg">
              <CourseIcon name={course.icon} className="h-[1.7rem] w-[1.7rem]" />
            </span>
            <div className="min-w-0">
              <h2 className={`font-display font-bold leading-tight text-heading ${title}`}>{course.name}</h2>
              <p className={`mt-[0.2rem] leading-snug text-ink/80 ${desc}`}>{course.description}</p>
            </div>
          </motion.article>
        ))}
        {visible.length === 0 && <p className="text-center text-[1.2rem] text-ink/70">Cursos em breve.</p>}
      </div>

      <section className="hero mt-[1rem] flex shrink-0 items-center gap-[1.1rem] rounded-3xl p-[1rem]">
        {settings.qrUrl ? <QrCode value={settings.qrUrl} className="h-[7.5rem] w-[7.5rem] shrink-0" /> : null}
        <div className={settings.qrUrl ? 'text-left' : 'w-full text-center'}>
          <p className="font-display text-[1.6rem] font-extrabold leading-tight text-gold">{settings.coursesTitle}</p>
          {settings.qrUrl && <p className="mt-[0.3rem] text-[1.05rem] leading-snug text-ink/85">{settings.qrLabel}</p>}
        </div>
      </section>

      <div className="mt-[1rem] grid shrink-0 grid-cols-2 gap-[0.8rem]">
        <TouchButton variant="primary" onPress={onPlayAgain} className="px-3 text-[1.15rem]">
          <RotateCcw aria-hidden="true" className="h-[1.4rem] w-[1.4rem] shrink-0" /> JOGAR NOVAMENTE
        </TouchButton>
        <TouchButton variant="secondary" onPress={onHome} className="px-3 text-[1.15rem]">
          <Home aria-hidden="true" className="h-[1.4rem] w-[1.4rem] shrink-0" /> INÍCIO
        </TouchButton>
      </div>
      <p className="mt-[0.6rem] shrink-0 text-center text-[0.9rem] text-ink/55" aria-live="off">
        Voltando ao início em {left} s sem interação
      </p>
    </div>
  );
}
