import type { PreparedQuestion, AnswerRecord, SurveyItem } from '../types';

/** Escala de 1 a 5 da pesquisa "o quanto você conhece…". */
export const SURVEY_SCALE = ['Nunca ouvi falar', 'Já ouvi falar', 'Conheço um pouco', 'Conheço bem', 'Conheço muito bem'] as const;

export const scaleLabel = (rating: number) => SURVEY_SCALE[rating - 1] ?? '';

export interface SelfCheck {
  item: SurveyItem;
  rating: number;
  correct: number;
  total: number;
  /** Frase comparando a autoavaliação com os acertos. */
  text: string;
  verdict: string;
}

/**
 * Compara o que o visitante disse que conhece com o que acertou nas perguntas
 * da categoria correspondente nesta partida.
 */
export function selfCheck(
  item: SurveyItem,
  rating: number | undefined,
  questions: readonly PreparedQuestion[],
  answers: readonly AnswerRecord[],
): SelfCheck | null {
  if (!item.category || !rating) return null;
  const ids = new Set(questions.filter((q) => q.category === item.category).map((q) => q.id));
  const mine = answers.filter((a) => ids.has(a.questionId));
  if (mine.length === 0) return null;
  const correct = mine.filter((a) => a.correct).length;
  const total = mine.length;
  const good = correct / total >= 2 / 3;
  const verdict = good
    ? rating <= 2
      ? 'Você conhece mais do que imaginava!'
      : 'Conhece mesmo. Mandou bem!'
    : rating >= 4
      ? 'Ainda tem muito para descobrir por aqui!'
      : 'Agora você já conhece um pouco mais!';
  const text = `Você disse “${scaleLabel(rating)}” sobre ${item.subject} e acertou ${correct} de ${total} ${total === 1 ? 'pergunta' : 'perguntas'} sobre o assunto.`;
  return { item, rating, correct, total, text, verdict };
}
