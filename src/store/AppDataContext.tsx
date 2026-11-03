import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Course, Question, Settings, ThemeColors } from '../types';
import { loadAppData, saveCourses, saveQuestions, saveSettings } from '../services/repository';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_QUESTIONS } from '../data/questions';
import { DEFAULT_COURSES } from '../data/courses';
import { setSoundEnabled } from '../services/sound';

interface AppDataValue {
  ready: boolean;
  settings: Settings;
  questions: Question[];
  courses: Course[];
  updateSettings: (s: Settings) => Promise<void>;
  updateQuestions: (q: Question[]) => Promise<void>;
  updateCourses: (c: Course[]) => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function hexToRgbTriplet(hex: string): string {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return '0 0 0';
  return m.slice(1).map((h) => parseInt(h, 16)).join(' ');
}

export function applyTheme(colors: ThemeColors) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(colors)) root.style.setProperty(`--c-${name}`, hexToRgbTriplet(value));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.brand);
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);

  useEffect(() => {
    let alive = true;
    loadAppData()
      .then((data) => {
        if (!alive) return;
        setSettings(data.settings);
        setQuestions(data.questions);
        setCourses(data.courses);
      })
      .catch((err) => console.warn('Usando dados padrão', err))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    applyTheme(settings.colors);
    setSoundEnabled(settings.soundEnabled);
    document.title = `${settings.gameName} — ${settings.institutionName}`;
  }, [settings]);

  const updateSettings = useCallback(async (s: Settings) => {
    setSettings(s);
    await saveSettings(s);
  }, []);
  const updateQuestions = useCallback(async (q: Question[]) => {
    setQuestions(q);
    await saveQuestions(q);
  }, []);
  const updateCourses = useCallback(async (c: Course[]) => {
    setCourses(c);
    await saveCourses(c);
  }, []);

  const value = useMemo(
    () => ({ ready, settings, questions, courses, updateSettings, updateQuestions, updateCourses }),
    [ready, settings, questions, courses, updateSettings, updateQuestions, updateCourses],
  );
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData fora do AppDataProvider');
  return ctx;
}
