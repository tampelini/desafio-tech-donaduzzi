import { DEFAULT_QUESTIONS } from '../data/questions';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { correctIndex, prepareQuestion, selectQuestions } from '../game/selection';

const opts = { questionsPerGame: 10, distribution: DEFAULT_SETTINGS.distribution };

/** Gerador determinístico (mulberry32) para testes reprodutíveis. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('seleção de perguntas', () => {
  it('seleciona exatamente 10 perguntas sem duplicatas', () => {
    for (let i = 0; i < 200; i++) {
      const picked = selectQuestions(DEFAULT_QUESTIONS, opts);
      expect(picked).toHaveLength(10);
      expect(new Set(picked.map((q) => q.id)).size).toBe(10);
    }
  });

  it('respeita a distribuição 3/2/2/1/1/1 por categoria', () => {
    for (let i = 0; i < 200; i++) {
      const picked = selectQuestions(DEFAULT_QUESTIONS, opts);
      const count = (c: string) => picked.filter((q) => q.category === c).length;
      expect([count('faculdade'), count('ia'), count('dados'), count('engsoft'), count('ads'), count('inovacao')]).toEqual([3, 2, 2, 1, 1, 1]);
    }
  });

  it('embaralha alternativas mantendo a resposta correta', () => {
    const rng = seeded(42);
    for (let i = 0; i < 300; i++) {
      for (const p of selectQuestions(DEFAULT_QUESTIONS, { ...opts, rng })) {
        const original = DEFAULT_QUESTIONS.find((q) => q.id === p.id)!;
        const originalCorrect = original.options.find((o) => o.id === original.correctOptionId)!.text;
        const preparedCorrect = p.options.find((o) => o.id === p.correctOptionId)!.text;
        expect(preparedCorrect).toBe(originalCorrect);
        expect(p.options.map((o) => o.text).sort()).toEqual(original.options.map((o) => o.text).sort());
      }
    }
  });

  it('a alternativa correta aparece em todas as posições', () => {
    const positions = new Map<number, number>();
    const q = DEFAULT_QUESTIONS[0];
    for (let i = 0; i < 2000; i++) {
      const idx = correctIndex(prepareQuestion(q));
      positions.set(idx, (positions.get(idx) ?? 0) + 1);
    }
    expect([...positions.keys()].sort()).toEqual([0, 1, 2, 3]);
    for (const n of positions.values()) expect(n).toBeGreaterThan(350); // ~500 esperado
  });

  it('nunca deixa a correta na mesma posição 3 vezes seguidas', () => {
    for (let i = 0; i < 300; i++) {
      const picked = selectQuestions(DEFAULT_QUESTIONS, opts);
      for (let j = 2; j < picked.length; j++) {
        const a = correctIndex(picked[j - 2]);
        const b = correctIndex(picked[j - 1]);
        const c = correctIndex(picked[j]);
        expect(a === b && b === c).toBe(false);
      }
    }
  });

  it('não sorteia perguntas inativas', () => {
    const bank = DEFAULT_QUESTIONS.map((q) => (q.id === 'fac-01' || q.id === 'ia-01' ? { ...q, active: false } : q));
    for (let i = 0; i < 200; i++) {
      const ids = selectQuestions(bank, opts).map((q) => q.id);
      expect(ids).not.toContain('fac-01');
      expect(ids).not.toContain('ia-01');
    }
  });

  it('evita perguntas das partidas recentes quando há alternativas', () => {
    const first = selectQuestions(DEFAULT_QUESTIONS, opts).map((q) => q.id);
    for (let i = 0; i < 100; i++) {
      const next = selectQuestions(DEFAULT_QUESTIONS, { ...opts, recentIds: first }).map((q) => q.id);
      expect(next.filter((id) => first.includes(id))).toEqual([]);
    }
  });

  it('completa com outras categorias se faltar pergunta ativa', () => {
    const bank = DEFAULT_QUESTIONS.filter((q) => q.category !== 'engsoft');
    const picked = selectQuestions(bank, opts);
    expect(picked).toHaveLength(10);
    expect(new Set(picked.map((q) => q.id)).size).toBe(10);
  });

  it('respeita quantidade configurável de perguntas', () => {
    expect(selectQuestions(DEFAULT_QUESTIONS, { questionsPerGame: 5, distribution: { ia: 2, dados: 3 } })).toHaveLength(5);
    expect(selectQuestions(DEFAULT_QUESTIONS, { questionsPerGame: 15, distribution: DEFAULT_SETTINGS.distribution })).toHaveLength(15);
  });
});
