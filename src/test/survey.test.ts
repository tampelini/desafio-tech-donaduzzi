import { gameReducer, initialGameState, sessionToRecord } from '../store/gameReducer';
import { selectQuestions } from '../game/selection';
import { DEFAULT_QUESTIONS } from '../data/questions';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { selfCheck } from '../data/survey';
import { mergeSettings } from '../services/repository';
import { gamesToCsv, summarizeSurvey, surveyToCsv } from '../services/stats';
import type { AnswerRecord, GameRecord, Settings } from '../types';

const questions = selectQuestions(DEFAULT_QUESTIONS, { questionsPerGame: 10, distribution: DEFAULT_SETTINGS.distribution });
const [biopark, faculdade] = DEFAULT_SETTINGS.survey.items;

function answersWith(correctFaculdade: number): AnswerRecord[] {
  let left = correctFaculdade;
  return questions.map((q) => {
    const correct = q.category === 'faculdade' ? left-- > 0 : true;
    return { questionId: q.id, chosenOptionId: correct ? q.correctOptionId : 'x', correct, timedOut: false, timeMs: 1000 };
  });
}

function game(id: string, survey: GameRecord['survey'], correctFaculdade = 3): GameRecord {
  const answers = answersWith(correctFaculdade);
  return {
    id,
    startedAt: 1,
    endedAt: 2,
    completed: true,
    score: 0,
    correctCount: answers.filter((a) => a.correct).length,
    totalQuestions: 10,
    durationMs: 1000,
    answers,
    ...(survey !== undefined ? { survey } : {}),
  };
}

describe('pesquisa: fluxo', () => {
  it('instruções → pesquisa → pergunta 1, guardando as respostas na partida', () => {
    let s = gameReducer(initialGameState, { type: 'OPEN_INSTRUCTIONS' });
    s = gameReducer(s, { type: 'OPEN_SURVEY' });
    expect(s.phase).toBe('survey');
    s = gameReducer(s, { type: 'BEGIN', id: 'g1', questions, now: 1000, survey: { biopark: 2, faculdade: 4 } });
    expect(s.phase).toBe('question');
    expect(sessionToRecord(s.session!, 100).survey).toEqual({ biopark: 2, faculdade: 4 });
  });

  it('pular registra null; sem pesquisa o campo fica ausente', () => {
    const s = gameReducer(initialGameState, { type: 'OPEN_INSTRUCTIONS' });
    const direct = gameReducer(s, { type: 'BEGIN', id: 'g1', questions, now: 1000 });
    expect('survey' in sessionToRecord(direct.session!, 100)).toBe(false);
    const skipped = gameReducer(gameReducer(s, { type: 'OPEN_SURVEY' }), { type: 'BEGIN', id: 'g2', questions, now: 1000, survey: null });
    expect(sessionToRecord(skipped.session!, 100).survey).toBeNull();
  });

  it('a pesquisa só abre a partir das instruções', () => {
    expect(gameReducer(initialGameState, { type: 'OPEN_SURVEY' }).phase).toBe('attract');
  });
});

describe('pesquisa: comparação no resultado', () => {
  it('compara a autoavaliação com os acertos da categoria', () => {
    const c = selfCheck(faculdade, 1, questions, answersWith(3))!;
    expect(c).toMatchObject({ correct: 3, total: 3 });
    expect(c.text).toBe('Você disse “Nunca ouvi falar” sobre a Faculdade Donaduzzi e acertou 3 de 3 perguntas sobre o assunto.');
    expect(c.verdict).toBe('Você conhece mais do que imaginava!');
    expect(selfCheck(faculdade, 5, questions, answersWith(3))!.verdict).toBe('Conhece mesmo. Mandou bem!');
    expect(selfCheck(faculdade, 5, questions, answersWith(0))!.verdict).toBe('Ainda tem muito para descobrir por aqui!');
    expect(selfCheck(faculdade, 2, questions, answersWith(1))!.verdict).toBe('Agora você já conhece um pouco mais!');
  });

  it('sem categoria ou sem resposta, não há comparação', () => {
    expect(selfCheck(biopark, 3, questions, answersWith(3))).toBeNull();
    expect(selfCheck(faculdade, undefined, questions, answersWith(3))).toBeNull();
  });
});

describe('pesquisa: estatísticas', () => {
  const games = [
    game('a', { biopark: 1, faculdade: 2 }, 3),
    game('b', { biopark: 5, faculdade: 2 }, 1),
    game('c', { biopark: 3, faculdade: 5 }, 3),
    game('d', null),
    game('e', undefined),
  ];

  it('conta respostas, pulos, distribuição, média e acerto por resposta', () => {
    const s = summarizeSurvey(games, DEFAULT_SETTINGS.survey.items, DEFAULT_QUESTIONS);
    expect(s).toMatchObject({ shown: 4, answered: 3, skipped: 1 });
    const [bp, fac] = s.items;
    expect(bp.counts).toEqual([1, 0, 1, 0, 1]);
    expect(bp.average).toBe(3);
    expect(bp.cross.every((c) => c.games === 0)).toBe(true);
    expect(fac.counts).toEqual([0, 2, 0, 0, 1]);
    expect(fac.cross[1]).toEqual({ rating: 2, games: 2, correct: 4, total: 6 });
    expect(fac.cross[4]).toEqual({ rating: 5, games: 1, correct: 3, total: 3 });
  });

  it('exporta CSV da pesquisa e colunas da pesquisa no CSV de partidas', () => {
    const s = summarizeSurvey(games, DEFAULT_SETTINGS.survey.items, DEFAULT_QUESTIONS);
    const csv = surveyToCsv(s);
    expect(csv).toContain('O quanto você conhece o Biopark?;1 - Nunca ouvi falar;1;33.3');
    expect(csv).toContain('pularam a pesquisa;1;25.0');
    const rows = gamesToCsv(games, DEFAULT_SETTINGS.survey.items).split('\r\n');
    expect(rows[0]).toContain('pesquisa_biopark;pesquisa_faculdade');
    expect(rows[1]).toMatch(/;1 - Nunca ouvi falar;2 - Já ouvi falar$/);
    expect(rows[4]).toMatch(/;pulou;pulou$/);
    expect(rows[5]).toMatch(/;;$/);
  });
});

describe('pesquisa: configurações', () => {
  it('configurações salvas antes da pesquisa recebem a pesquisa padrão', () => {
    const old: Partial<Settings> = { ...DEFAULT_SETTINGS };
    delete old.survey;
    expect(mergeSettings(old).survey).toEqual(DEFAULT_SETTINGS.survey);
  });

  it('mantém a pesquisa personalizada', () => {
    const custom = { ...DEFAULT_SETTINGS.survey, enabled: false, items: [{ ...biopark, prompt: 'Conhece o parque?' }] };
    expect(mergeSettings({ ...DEFAULT_SETTINGS, survey: custom }).survey).toEqual(custom);
  });
});
