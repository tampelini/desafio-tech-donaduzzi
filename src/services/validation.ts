import type { Question } from '../types';
import { CATEGORY_IDS } from '../data/categories';

export function validateQuestion(q: Partial<Question>, otherIds: Iterable<string> = []): string[] {
  const errors: string[] = [];
  const ids = new Set(otherIds);
  if (!q.id || !/^[\w-]+$/.test(q.id)) errors.push('ID inválido (use letras, números, "-" ou "_").');
  else if (ids.has(q.id)) errors.push(`O ID "${q.id}" já existe.`);
  if (!q.category || !CATEGORY_IDS.includes(q.category)) errors.push('Categoria inválida.');
  if (!q.prompt?.trim()) errors.push('O enunciado é obrigatório.');
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push('A pergunta precisa ter exatamente 4 alternativas.');
  } else {
    if (q.options.some((o) => !o?.text?.trim())) errors.push('Todas as alternativas precisam de texto.');
    const optionIds = q.options.map((o) => o?.id);
    if (new Set(optionIds).size !== optionIds.length) errors.push('IDs de alternativas repetidos.');
    const texts = q.options.map((o) => o?.text?.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) errors.push('Há alternativas com texto repetido.');
    if (!q.options.some((o) => o?.id === q.correctOptionId)) errors.push('Defina a alternativa correta.');
  }
  if (!q.explanation?.trim()) errors.push('A explicação é obrigatória.');
  if (typeof q.active !== 'boolean') errors.push('Status ativo/inativo inválido.');
  return errors;
}

export interface ImportResult {
  questions: Question[];
  errors: string[];
}

/** Valida um arquivo JSON de perguntas (array ou `{ questions: [...] }`). */
export function parseQuestionBank(json: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { questions: [], errors: ['Arquivo JSON inválido.'] };
  }
  const list = Array.isArray(data) ? data : (data as { questions?: unknown })?.questions;
  if (!Array.isArray(list)) return { questions: [], errors: ['O arquivo deve conter uma lista de perguntas.'] };

  const errors: string[] = [];
  const questions: Question[] = [];
  const seen: string[] = [];
  list.forEach((raw, i) => {
    const q = { active: true, ...(raw as Partial<Question>) } as Question;
    const errs = validateQuestion(q, seen);
    if (errs.length) errors.push(`Pergunta ${i + 1} (${q.id ?? 'sem ID'}): ${errs.join(' ')}`);
    else {
      questions.push(q);
      seen.push(q.id);
    }
  });
  return { questions, errors };
}
