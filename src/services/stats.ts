import type { GameRecord, Question } from '../types';
import { categoryLabel } from '../data/categories';

export interface QuestionStats {
  questionId: string;
  shown: number;
  correct: number;
  wrong: number;
  timeouts: number;
  /** Contagem por ID original da alternativa (a, b, c, d…). */
  choices: Record<string, number>;
  avgTimeMs: number;
}

export interface Summary {
  started: number;
  completed: number;
  avgScore: number;
  avgDurationMs: number;
  scoreDistribution: Record<number, number>;
  perQuestion: QuestionStats[];
}

export function summarize(games: readonly GameRecord[]): Summary {
  const completed = games.filter((g) => g.completed);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const scoreDistribution: Record<number, number> = {};
  for (const g of completed) scoreDistribution[g.score] = (scoreDistribution[g.score] ?? 0) + 1;

  const map = new Map<string, QuestionStats & { totalTime: number }>();
  for (const g of games) {
    for (const a of g.answers) {
      let s = map.get(a.questionId);
      if (!s) {
        s = { questionId: a.questionId, shown: 0, correct: 0, wrong: 0, timeouts: 0, choices: {}, avgTimeMs: 0, totalTime: 0 };
        map.set(a.questionId, s);
      }
      s.shown++;
      s.totalTime += a.timeMs;
      if (a.correct) s.correct++;
      else if (a.timedOut) s.timeouts++;
      else s.wrong++;
      if (a.chosenOptionId) s.choices[a.chosenOptionId] = (s.choices[a.chosenOptionId] ?? 0) + 1;
    }
  }
  const perQuestion = [...map.values()].map(({ totalTime, ...s }) => ({ ...s, avgTimeMs: s.shown ? totalTime / s.shown : 0 }));

  return {
    started: games.length,
    completed: completed.length,
    avgScore: avg(completed.map((g) => g.score)),
    avgDurationMs: avg(completed.map((g) => g.durationMs ?? 0)),
    scoreDistribution,
    perQuestion,
  };
}

// CSV com ";" e BOM UTF-8: abre corretamente no Excel em português.
const SEP = ';';
function cell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows: unknown[][]): string {
  return '﻿' + rows.map((r) => r.map(cell).join(SEP)).join('\r\n');
}
const iso = (t: number | null) => (t ? new Date(t).toLocaleString('pt-BR') : '');

export function gamesToCsv(games: readonly GameRecord[]): string {
  const rows: unknown[][] = [['id', 'inicio', 'fim', 'concluida', 'pontuacao', 'acertos', 'total_perguntas', 'duracao_segundos']];
  for (const g of games) {
    rows.push([
      g.id, iso(g.startedAt), iso(g.endedAt), g.completed ? 'sim' : 'nao', g.score, g.correctCount, g.totalQuestions,
      g.durationMs !== null ? (g.durationMs / 1000).toFixed(1) : '',
    ]);
  }
  return toCsv(rows);
}

export function questionStatsToCsv(summary: Summary, questions: readonly Question[]): string {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const rows: unknown[][] = [[
    'id', 'categoria', 'enunciado', 'exibida', 'acertos', 'erros', 'tempo_esgotado', 'percentual_acerto',
    'tempo_medio_s', 'escolhas_a', 'escolhas_b', 'escolhas_c', 'escolhas_d',
  ]];
  for (const s of summary.perQuestion) {
    const q = byId.get(s.questionId);
    rows.push([
      s.questionId, q ? categoryLabel(q.category) : '', q?.prompt ?? '(removida)', s.shown, s.correct, s.wrong, s.timeouts,
      s.shown ? ((s.correct / s.shown) * 100).toFixed(1) : '0', (s.avgTimeMs / 1000).toFixed(1),
      s.choices.a ?? 0, s.choices.b ?? 0, s.choices.c ?? 0, s.choices.d ?? 0,
    ]);
  }
  return toCsv(rows);
}
