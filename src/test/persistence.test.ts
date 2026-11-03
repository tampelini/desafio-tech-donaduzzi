import { __resetDBForTests, getAllGames, putGame } from '../services/db';
import { getRecentQuestionIds, loadAppData, pushRecentGame, saveCourses, saveQuestions, saveSettings } from '../services/repository';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_QUESTIONS } from '../data/questions';
import { gamesToCsv, questionStatsToCsv, summarize } from '../services/stats';
import { DEFAULT_PIN, isDefaultPin, setPin, sha256Hex, verifyPin } from '../services/pin';
import type { GameRecord } from '../types';

beforeEach(() => __resetDBForTests());

describe('persistência local (IndexedDB)', () => {
  it('carrega padrões na primeira execução', async () => {
    const data = await loadAppData();
    expect(data.settings).toEqual(DEFAULT_SETTINGS);
    expect(data.questions).toHaveLength(60);
    expect(data.courses).toHaveLength(4);
  });

  it('salva e recarrega configurações, perguntas e cursos', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, timePerQuestion: 0, qrUrl: 'https://exemplo.edu.br/cursos' });
    await saveQuestions(DEFAULT_QUESTIONS.slice(0, 12));
    await saveCourses([]);
    const data = await loadAppData();
    expect(data.settings.timePerQuestion).toBe(0);
    expect(data.settings.qrUrl).toBe('https://exemplo.edu.br/cursos');
    expect(data.questions).toHaveLength(12);
    expect(data.courses).toEqual([]);
  });

  it('mescla configurações antigas com novos campos padrão', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await saveSettings({ gameName: 'X' } as any);
    const data = await loadAppData();
    expect(data.settings.gameName).toBe('X');
    expect(data.settings.distribution).toEqual(DEFAULT_SETTINGS.distribution);
  });

  it('mantém apenas as N partidas recentes no histórico anti-repetição', async () => {
    await pushRecentGame(['a'], 2);
    await pushRecentGame(['b'], 2);
    await pushRecentGame(['c'], 2);
    expect(await getRecentQuestionIds()).toEqual(['b', 'c']);
  });
});

describe('estatísticas', () => {
  const game = (id: string, completed: boolean, score: number): GameRecord => ({
    id,
    startedAt: Date.UTC(2026, 10, 3, 12),
    endedAt: completed ? Date.UTC(2026, 10, 3, 12, 2) : null,
    completed,
    score,
    correctCount: score / 100,
    totalQuestions: 10,
    durationMs: completed ? 120_000 : null,
    answers: [
      { questionId: 'fac-01', chosenOptionId: 'b', correct: true, timedOut: false, timeMs: 4000 },
      { questionId: 'ia-01', chosenOptionId: null, correct: false, timedOut: true, timeMs: 20000 },
    ],
  });

  it('registra e resume partidas', async () => {
    await putGame(game('g1', true, 800));
    await putGame(game('g2', true, 600));
    await putGame(game('g3', false, 100));
    const games = await getAllGames();
    const s = summarize(games);
    expect(s.started).toBe(3);
    expect(s.completed).toBe(2);
    expect(s.avgScore).toBe(700);
    expect(s.avgDurationMs).toBe(120_000);
    const fac = s.perQuestion.find((q) => q.questionId === 'fac-01')!;
    expect(fac).toMatchObject({ shown: 3, correct: 3, choices: { b: 3 } });
    expect(s.perQuestion.find((q) => q.questionId === 'ia-01')!.timeouts).toBe(3);
  });

  it('exporta CSV com cabeçalho e uma linha por item', () => {
    const games = [game('g1', true, 800)];
    const csv = gamesToCsv(games);
    expect(csv.startsWith('﻿id;inicio')).toBe(true);
    expect(csv.split('\r\n')).toHaveLength(2);
    const qcsv = questionStatsToCsv(summarize(games), DEFAULT_QUESTIONS);
    expect(qcsv.split('\r\n')).toHaveLength(3);
    expect(qcsv).toContain('Onde está localizada a Faculdade Donaduzzi?');
  });
});

describe('PIN administrativo', () => {
  it('SHA-256 confere com vetor conhecido', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('usa PIN padrão até ser alterado', async () => {
    expect(await isDefaultPin()).toBe(true);
    expect(await verifyPin(DEFAULT_PIN)).toBe(true);
    await setPin('987654');
    expect(await isDefaultPin()).toBe(false);
    expect(await verifyPin(DEFAULT_PIN)).toBe(false);
    expect(await verifyPin('987654')).toBe(true);
    await expect(setPin('12')).rejects.toThrow();
  });
});
