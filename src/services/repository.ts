import type { Course, Question, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_QUESTIONS } from '../data/questions';
import { DEFAULT_COURSES } from '../data/courses';
import { getKV, setKV } from './db';

const KEYS = {
  settings: 'settings',
  questions: 'questions',
  courses: 'courses',
  recent: 'recentGames',
} as const;

export interface AppData {
  settings: Settings;
  questions: Question[];
  courses: Course[];
}

/** Mescla configurações salvas com os padrões (novos campos ganham valor padrão). */
export function mergeSettings(saved: Partial<Settings> | undefined): Settings {
  if (!saved) return structuredClone(DEFAULT_SETTINGS);
  // A paleta azul da primeira versão é trocada pela identidade institucional;
  // cores personalizadas pelo administrador são mantidas.
  const colors = saved.colors?.bg?.toLowerCase() === '#061532' ? undefined : saved.colors;
  // Configurações salvas antes do logotipo oficial vir embutido: usa o padrão.
  const logo = saved.logoOnDark === undefined && !saved.logo ? DEFAULT_SETTINGS.logo : saved.logo;
  return {
    ...structuredClone(DEFAULT_SETTINGS),
    ...saved,
    logo: logo ?? DEFAULT_SETTINGS.logo,
    colors: { ...DEFAULT_SETTINGS.colors, ...(colors ?? {}) },
    distribution: { ...DEFAULT_SETTINGS.distribution, ...(saved.distribution ?? {}) },
    resultTiers: saved.resultTiers?.length ? saved.resultTiers : structuredClone(DEFAULT_SETTINGS.resultTiers),
    // Configurações salvas antes da pesquisa existir recebem a pesquisa padrão.
    survey: {
      ...structuredClone(DEFAULT_SETTINGS.survey),
      ...(saved.survey ?? {}),
      items: saved.survey?.items?.length ? saved.survey.items : structuredClone(DEFAULT_SETTINGS.survey.items),
    },
  };
}

/**
 * Cursos salvos por versões anteriores (sem o campo `highlight`): os existentes
 * viram destaque, como eram exibidos, e os cursos novos do padrão são acrescentados.
 */
export function migrateCourses(saved: Course[]): Course[] {
  if (saved.every((c) => typeof c.highlight === 'boolean')) return saved;
  const upgraded = saved.map((c) => ({ ...c, highlight: typeof c.highlight === 'boolean' ? c.highlight : true }));
  const ids = new Set(upgraded.map((c) => c.id));
  return [...upgraded, ...structuredClone(DEFAULT_COURSES).filter((c) => !c.highlight && !ids.has(c.id))];
}

export async function loadAppData(): Promise<AppData> {
  const [settings, questions, courses] = await Promise.all([
    getKV<Partial<Settings>>(KEYS.settings).catch(() => undefined),
    getKV<Question[]>(KEYS.questions).catch(() => undefined),
    getKV<Course[]>(KEYS.courses).catch(() => undefined),
  ]);
  return {
    settings: mergeSettings(settings),
    questions: Array.isArray(questions) ? questions : structuredClone(DEFAULT_QUESTIONS),
    courses: Array.isArray(courses) ? migrateCourses(courses) : structuredClone(DEFAULT_COURSES),
  };
}

export const saveSettings = (s: Settings) => setKV(KEYS.settings, s);
export const saveQuestions = (q: Question[]) => setKV(KEYS.questions, q);
export const saveCourses = (c: Course[]) => setKV(KEYS.courses, c);

/** Histórico das últimas partidas (apenas IDs de perguntas) para reduzir repetição. */
export async function getRecentQuestionIds(): Promise<string[]> {
  const games = (await getKV<string[][]>(KEYS.recent).catch(() => undefined)) ?? [];
  return games.flat();
}

export async function pushRecentGame(questionIds: string[], keepGames: number): Promise<void> {
  const games = (await getKV<string[][]>(KEYS.recent).catch(() => undefined)) ?? [];
  const next = [...games, questionIds].slice(-Math.max(0, keepGames));
  await setKV(KEYS.recent, next);
}
