import type { CategoryId, PreparedQuestion, Question } from '../types';

export type Rng = () => number;

/** Fisher–Yates. Retorna uma cópia; não altera o array original. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface SelectionOptions {
  questionsPerGame: number;
  distribution: Partial<Record<CategoryId, number>>;
  /** IDs usados em partidas recentes — evitados sempre que houver alternativas. */
  recentIds?: Iterable<string>;
  rng?: Rng;
}

/**
 * Embaralha as alternativas mantendo o ID da correta (a referência nunca
 * depende da posição, então não há como "perder" a resposta certa).
 */
export function prepareQuestion(question: Question, rng: Rng = Math.random): PreparedQuestion {
  return {
    id: question.id,
    category: question.category,
    prompt: question.prompt,
    options: shuffle(question.options, rng).map((o) => ({ ...o })),
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
  };
}

export function correctIndex(q: PreparedQuestion): number {
  return q.options.findIndex((o) => o.id === q.correctOptionId);
}

/** Retira até `count` itens, priorizando os que não estão em `recent`. */
function take(pool: Question[], count: number, recent: Set<string>, rng: Rng): Question[] {
  const fresh = shuffle(pool.filter((q) => !recent.has(q.id)), rng);
  const stale = shuffle(pool.filter((q) => recent.has(q.id)), rng);
  return [...fresh, ...stale].slice(0, Math.max(0, count));
}

export function selectQuestions(bank: readonly Question[], opts: SelectionOptions): PreparedQuestion[] {
  const rng = opts.rng ?? Math.random;
  const recent = new Set(opts.recentIds ?? []);
  const total = Math.max(1, Math.floor(opts.questionsPerGame));
  const active = bank.filter((q) => q.active && q.options.some((o) => o.id === q.correctOptionId));

  const picked: Question[] = [];
  const used = new Set<string>();
  for (const [category, count] of Object.entries(opts.distribution) as [CategoryId, number][]) {
    if (!count) continue;
    const pool = active.filter((q) => q.category === category && !used.has(q.id));
    for (const q of take(pool, count, recent, rng)) {
      picked.push(q);
      used.add(q.id);
    }
  }

  // Completa com outras categorias se faltar (categoria com poucas perguntas
  // ativas ou distribuição menor que o total configurado).
  if (picked.length < total) {
    const rest = active.filter((q) => !used.has(q.id));
    for (const q of take(rest, total - picked.length, recent, rng)) {
      picked.push(q);
      used.add(q.id);
    }
  }

  const ordered = shuffle(picked, rng).slice(0, total);
  return balanceCorrectPositions(ordered.map((q) => prepareQuestion(q, rng)), bank, rng);
}

/**
 * Evita que a alternativa correta fique na mesma posição em 3 perguntas
 * seguidas, reembaralhando as alternativas da pergunta quando necessário.
 */
function balanceCorrectPositions(prepared: PreparedQuestion[], bank: readonly Question[], rng: Rng): PreparedQuestion[] {
  const byId = new Map(bank.map((q) => [q.id, q]));
  for (let i = 2; i < prepared.length; i++) {
    const prev = correctIndex(prepared[i - 1]);
    if (prev !== correctIndex(prepared[i - 2])) continue;
    const source = byId.get(prepared[i].id);
    if (!source || source.options.length < 2) continue;
    for (let attempt = 0; attempt < 10 && correctIndex(prepared[i]) === prev; attempt++) {
      prepared[i] = prepareQuestion(source, rng);
    }
  }
  return prepared;
}
