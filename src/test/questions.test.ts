import { DEFAULT_QUESTIONS } from '../data/questions';
import { CATEGORY_IDS } from '../data/categories';
import { validateQuestion, parseQuestionBank } from '../services/validation';

describe('banco de perguntas padrão', () => {
  it('tem 60 perguntas com IDs únicos', () => {
    expect(DEFAULT_QUESTIONS).toHaveLength(60);
    expect(new Set(DEFAULT_QUESTIONS.map((q) => q.id)).size).toBe(60);
  });

  it('tem 10 perguntas em cada uma das 6 categorias', () => {
    for (const c of CATEGORY_IDS) expect(DEFAULT_QUESTIONS.filter((q) => q.category === c)).toHaveLength(10);
  });

  it('todas as perguntas passam na validação', () => {
    for (const q of DEFAULT_QUESTIONS) expect(validateQuestion(q)).toEqual([]);
  });

  it('respostas corretas conferem com o gabarito do documento (amostra)', () => {
    const answer = (id: string) => {
      const q = DEFAULT_QUESTIONS.find((x) => x.id === id)!;
      return q.options.find((o) => o.id === q.correctOptionId)!.text;
    };
    expect(answer('fac-01')).toBe('Toledo, no Parque Tecnológico Biopark');
    expect(answer('ia-03')).toBe('Aprendizado de Máquina');
    expect(answer('dados-03')).toBe('Python');
    expect(answer('es-02')).toBe('Uma sequência de instruções para resolver um problema');
    expect(answer('ads-03')).toBe('HTML');
    expect(answer('inov-10')).toBe('Manter o aprendizado contínuo');
  });
});

describe('validação de perguntas', () => {
  const base = structuredClone(DEFAULT_QUESTIONS[0]);

  it('rejeita alternativa correta inexistente', () => {
    expect(validateQuestion({ ...base, correctOptionId: 'z' })).toContain('Defina a alternativa correta.');
  });
  it('rejeita alternativas vazias e enunciado vazio', () => {
    const errs = validateQuestion({ ...base, prompt: ' ', options: base.options.map((o, i) => (i === 0 ? { ...o, text: '' } : o)) });
    expect(errs).toContain('O enunciado é obrigatório.');
    expect(errs).toContain('Todas as alternativas precisam de texto.');
  });
  it('rejeita ID duplicado', () => {
    expect(validateQuestion(base, [base.id]).join()).toMatch(/já existe/);
  });
  it('importa JSON válido e aponta itens inválidos', () => {
    const json = JSON.stringify([base, { ...base, id: 'x-1', options: [] }]);
    const res = parseQuestionBank(json);
    expect(res.questions).toHaveLength(1);
    expect(res.errors).toHaveLength(1);
    expect(parseQuestionBank('{oops').errors[0]).toMatch(/inválido/);
  });
});
