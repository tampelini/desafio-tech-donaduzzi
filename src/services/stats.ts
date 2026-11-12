import type { GameRecord, Question, SurveyItem } from '../types';
import { categoryLabel } from '../data/categories';
import { SURVEY_SCALE, scaleLabel } from '../data/survey';

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

export function gamesToCsv(games: readonly GameRecord[], surveyItems: readonly SurveyItem[] = []): string {
  const rows: unknown[][] = [[
    'id', 'inicio', 'fim', 'concluida', 'pontuacao', 'acertos', 'total_perguntas', 'duracao_segundos',
    ...surveyItems.map((it) => `pesquisa_${it.id}`),
  ]];
  for (const g of games) {
    rows.push([
      g.id, iso(g.startedAt), iso(g.endedAt), g.completed ? 'sim' : 'nao', g.score, g.correctCount, g.totalQuestions,
      g.durationMs !== null ? (g.durationMs / 1000).toFixed(1) : '',
      ...surveyItems.map((it) => {
        if (g.survey === undefined) return '';
        if (g.survey === null) return 'pulou';
        const r = g.survey[it.id];
        return r ? `${r} - ${scaleLabel(r)}` : '';
      }),
    ]);
  }
  return toCsv(rows);
}

// ---------- Pesquisa "o quanto você conhece…" ----------

export interface SurveyCross {
  rating: number;
  games: number;
  correct: number;
  total: number;
}

export interface SurveyItemStats {
  item: SurveyItem;
  responses: number;
  /** Quantidade por nota (índice 0 = nota 1 … índice 4 = nota 5). */
  counts: number[];
  average: number;
  /** Acerto nas perguntas da categoria do item, por nota de autoavaliação. */
  cross: SurveyCross[];
}

export interface SurveySummary {
  /** Partidas em que a pesquisa foi exibida. */
  shown: number;
  answered: number;
  skipped: number;
  items: SurveyItemStats[];
}

export function summarizeSurvey(
  games: readonly GameRecord[],
  items: readonly SurveyItem[],
  questions: readonly Question[],
): SurveySummary {
  const categoryOf = new Map(questions.map((q) => [q.id, q.category]));
  const withSurvey = games.filter((g) => g.survey !== undefined);
  const answered = withSurvey.filter((g) => g.survey);
  return {
    shown: withSurvey.length,
    answered: answered.length,
    skipped: withSurvey.length - answered.length,
    items: items.map((item) => {
      const counts = SURVEY_SCALE.map(() => 0);
      const cross: SurveyCross[] = SURVEY_SCALE.map((_, i) => ({ rating: i + 1, games: 0, correct: 0, total: 0 }));
      let sum = 0;
      for (const g of answered) {
        const r = g.survey?.[item.id];
        if (!r || r < 1 || r > 5) continue;
        counts[r - 1]++;
        sum += r;
        if (item.category && g.completed) {
          const mine = g.answers.filter((a) => categoryOf.get(a.questionId) === item.category);
          if (mine.length) {
            const c = cross[r - 1];
            c.games++;
            c.total += mine.length;
            c.correct += mine.filter((a) => a.correct).length;
          }
        }
      }
      const responses = counts.reduce((a, b) => a + b, 0);
      return { item, responses, counts, average: responses ? sum / responses : 0, cross };
    }),
  };
}

export function surveyToCsv(summary: SurveySummary): string {
  const rows: unknown[][] = [['pergunta', 'resposta', 'quantidade', 'percentual']];
  for (const s of summary.items) {
    SURVEY_SCALE.forEach((label, i) => {
      rows.push([s.item.prompt, `${i + 1} - ${label}`, s.counts[i], s.responses ? ((s.counts[i] / s.responses) * 100).toFixed(1) : '0']);
    });
    rows.push([s.item.prompt, 'média (1 a 5)', s.responses, s.average.toFixed(2)]);
  }
  rows.push(['(geral)', 'pularam a pesquisa', summary.skipped, summary.shown ? ((summary.skipped / summary.shown) * 100).toFixed(1) : '0']);
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
