import type { AnswerRecord, ResultTier } from '../types';

export function computeScore(answers: readonly AnswerRecord[], pointsPerQuestion: number): number {
  return answers.filter((a) => a.correct).length * pointsPerQuestion;
}

/** Escolhe a faixa de mensagem com o maior `minPercent` atingido. */
export function pickTier(tiers: readonly ResultTier[], correct: number, total: number): ResultTier {
  const percent = total > 0 ? (correct / total) * 100 : 0;
  const sorted = tiers.slice().sort((a, b) => a.minPercent - b.minPercent);
  let chosen = sorted[0] ?? { minPercent: 0, title: 'DESAFIO CONCLUÍDO!', message: '' };
  for (const tier of sorted) if (percent + 1e-9 >= tier.minPercent) chosen = tier;
  return chosen;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`;
}
