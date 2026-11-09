import { motion } from 'framer-motion';
import { ChevronsDown, Home, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Course } from '../types';
import { useAppData } from '../store/AppDataContext';
import { Logo } from '../components/Logo';
import { TouchButton } from '../components/TouchButton';
import { CourseIcon } from '../components/CourseIcon';
import { QrCode } from '../components/QrCode';

interface Props {
  onPlayAgain: () => void;
  onHome: () => void;
}

const ACTIVITY_EVENTS = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;

/** Contagem visual até o retorno automático (reinicia a cada toque ou rolagem). */
function useIdleCountdown(totalSeconds: number) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    let last = Date.now();
    const reset = () => (last = Date.now());
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    const id = window.setInterval(() => setLeft(Math.max(0, totalSeconds - Math.floor((Date.now() - last) / 1000))), 500);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset));
      window.clearInterval(id);
    };
  }, [totalSeconds]);
  return left;
}

/** Cartão grande: cursos em destaque (computação), com descrição. */
function FeaturedCourse({ course, index }: { course: Course; index: number }) {
  return (
    <motion.li
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.06 * index }}
      className="glass flex items-start gap-[1rem] rounded-2xl p-[1.1rem]"
    >
      <span className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-bg">
        <CourseIcon name={course.icon} className="h-[1.7rem] w-[1.7rem]" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-[1.4rem] font-bold leading-tight text-heading">{course.name}</h3>
        {course.description && <p className="mt-[0.2rem] text-[1.05rem] leading-snug text-ink/80">{course.description}</p>}
      </div>
    </motion.li>
  );
}

/** Linha compacta: demais cursos de graduação. */
function OtherCourse({ course }: { course: Course }) {
  return (
    <li className="flex items-start gap-[0.9rem] rounded-2xl border border-ink/10 bg-white px-[1rem] py-[0.8rem]">
      <span className="flex h-[2.5rem] w-[2.5rem] shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CourseIcon name={course.icon} className="h-[1.4rem] w-[1.4rem]" />
      </span>
      <div className="min-w-0 self-center">
        <h3 className="font-display text-[1.2rem] font-bold leading-tight text-heading">{course.name}</h3>
        {course.description && <p className="mt-[0.15rem] text-[0.95rem] leading-snug text-ink/75">{course.description}</p>}
      </div>
    </li>
  );
}

export function CoursesScreen({ onPlayAgain, onHome }: Props) {
  const { settings, courses } = useAppData();
  const visible = courses.filter((c) => c.enabled);
  // Destaques primeiro (na ordem do painel), depois os demais cursos.
  const featured = visible.filter((c) => c.highlight);
  const others = visible.filter((c) => !c.highlight);
  const left = useIdleCountdown(settings.coursesIdleSeconds);

  // A lista rola; o aviso "deslize" e o degradê inferior somem ao chegar no fim.
  const listRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      setCanScroll(el.scrollHeight > el.clientHeight + 4);
      setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    void document.fonts?.ready.then(update);
    return () => {
      el.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [visible.length]);

  return (
    <div className="relative flex h-full flex-col px-[1.8rem] pb-[1.6rem] pt-[1.8rem]">
      <div className="flex justify-center">
        <Logo size="sm" />
      </div>
      <p className="mt-[1rem] text-center font-display text-[1.1rem] font-bold uppercase tracking-[0.2em] text-primary">Graduação</p>
      <h1 className="text-center font-display text-[2.3rem] font-extrabold leading-tight text-heading">Conheça nossos cursos</h1>

      <div className="relative mt-[1rem] flex min-h-0 flex-1 flex-col">
        <div
          ref={listRef}
          className="course-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-[0.3rem]"
          tabIndex={0}
          aria-label={`Lista com ${visible.length} cursos de graduação`}
        >
          {featured.length > 0 && (
            <ul className="flex flex-col gap-[0.8rem]">
              {featured.map((course, i) => (
                <FeaturedCourse key={course.id} course={course} index={i} />
              ))}
            </ul>
          )}
          {others.length > 0 && (
            <>
              <h2 className="mb-[0.7rem] mt-[1.3rem] font-display text-[1.05rem] font-bold uppercase tracking-[0.15em] text-primary">
                Mais cursos de graduação
              </h2>
              <ul className="flex flex-col gap-[0.6rem] pb-[0.4rem]">
                {others.map((course) => (
                  <OtherCourse key={course.id} course={course} />
                ))}
              </ul>
            </>
          )}
          {visible.length === 0 && <p className="text-center text-[1.2rem] text-ink/70">Cursos em breve.</p>}
        </div>

        {canScroll && !atEnd && (
          <>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[4rem] bg-gradient-to-t from-bg to-transparent" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[0.5rem] left-1/2 flex -translate-x-1/2 items-center gap-[0.4rem] whitespace-nowrap rounded-full bg-brand px-[1rem] py-[0.4rem] text-[0.95rem] font-semibold text-white shadow-lg"
            >
              <ChevronsDown className="float-y h-[1.2rem] w-[1.2rem]" /> Deslize para ver os {visible.length} cursos
            </div>
          </>
        )}
      </div>

      <section className="hero mt-[1rem] flex shrink-0 items-center gap-[1.1rem] rounded-3xl p-[1rem]">
        {settings.qrUrl ? <QrCode value={settings.qrUrl} className="h-[7.5rem] w-[7.5rem] shrink-0" /> : null}
        <div className={settings.qrUrl ? 'text-left' : 'w-full text-center'}>
          <p className="font-display text-[1.6rem] font-extrabold leading-tight text-gold">{settings.coursesTitle}</p>
          {settings.qrUrl && <p className="mt-[0.3rem] text-[1.05rem] leading-snug text-ink/85">{settings.qrLabel}</p>}
        </div>
      </section>

      <div className="mt-[1rem] grid shrink-0 grid-cols-2 gap-[0.8rem]">
        <TouchButton variant="primary" onPress={onPlayAgain} className="whitespace-nowrap px-3 text-[1.05rem]">
          <RotateCcw aria-hidden="true" className="h-[1.4rem] w-[1.4rem] shrink-0" /> JOGAR NOVAMENTE
        </TouchButton>
        <TouchButton variant="secondary" onPress={onHome} className="whitespace-nowrap px-3 text-[1.05rem]">
          <Home aria-hidden="true" className="h-[1.4rem] w-[1.4rem] shrink-0" /> INÍCIO
        </TouchButton>
      </div>
      <p className="mt-[0.6rem] shrink-0 text-center text-[0.9rem] text-ink/55" aria-live="off">
        Voltando ao início em {left} s sem interação
      </p>
    </div>
  );
}
