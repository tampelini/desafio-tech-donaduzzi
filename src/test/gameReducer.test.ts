import { gameReducer, initialGameState, sessionToRecord, type GameState } from '../store/gameReducer';
import { selectQuestions } from '../game/selection';
import { computeScore, pickTier, formatDuration } from '../game/scoring';
import { DEFAULT_QUESTIONS } from '../data/questions';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';

const questions = selectQuestions(DEFAULT_QUESTIONS, { questionsPerGame: 10, distribution: DEFAULT_SETTINGS.distribution });

function started(): GameState {
  const s = gameReducer(initialGameState, { type: 'OPEN_INSTRUCTIONS' });
  return gameReducer(s, { type: 'BEGIN', id: 'g1', questions, now: 1000 });
}

function wrongOption(i: number) {
  return questions[i].options.find((o) => o.id !== questions[i].correctOptionId)!.id;
}

describe('fluxo da partida', () => {
  it('atração → instruções → pergunta 1', () => {
    const s = started();
    expect(s.phase).toBe('question');
    expect(s.session!.index).toBe(0);
    expect(s.revealed).toBe(false);
  });

  it('resposta correta vale 100 e incorreta 0', () => {
    let s = started();
    s = gameReducer(s, { type: 'ANSWER', optionId: questions[0].correctOptionId, now: 3000 });
    expect(s.session!.answers[0]).toMatchObject({ correct: true, timedOut: false, timeMs: 2000 });
    s = gameReducer(s, { type: 'NEXT', now: 4000 });
    s = gameReducer(s, { type: 'ANSWER', optionId: wrongOption(1), now: 5000 });
    expect(s.session!.answers[1].correct).toBe(false);
    expect(computeScore(s.session!.answers, 100)).toBe(100);
  });

  it('tempo esgotado conta como incorreta e permite avançar', () => {
    let s = started();
    s = gameReducer(s, { type: 'ANSWER', optionId: null, now: 21000 });
    expect(s.revealed).toBe(true);
    expect(s.session!.answers[0]).toMatchObject({ correct: false, timedOut: true, chosenOptionId: null });
    s = gameReducer(s, { type: 'NEXT', now: 22000 });
    expect(s.session!.index).toBe(1);
  });

  it('ignora toques repetidos após responder', () => {
    let s = started();
    s = gameReducer(s, { type: 'ANSWER', optionId: wrongOption(0), now: 2000 });
    const again = gameReducer(s, { type: 'ANSWER', optionId: questions[0].correctOptionId, now: 2100 });
    expect(again).toBe(s);
    expect(again.session!.answers).toHaveLength(1);
  });

  it('ignora "próxima" antes de responder e IDs de alternativa inválidos', () => {
    const s = started();
    expect(gameReducer(s, { type: 'NEXT', now: 2000 })).toBe(s);
    expect(gameReducer(s, { type: 'ANSWER', optionId: 'zzz', now: 2000 })).toBe(s);
  });

  it('conclui após 10 perguntas com pontuação máxima de 1000', () => {
    let s = started();
    let t = 1000;
    for (let i = 0; i < 10; i++) {
      s = gameReducer(s, { type: 'ANSWER', optionId: questions[i].correctOptionId, now: (t += 3000) });
      s = gameReducer(s, { type: 'NEXT', now: (t += 500) });
    }
    expect(s.phase).toBe('result');
    const rec = sessionToRecord(s.session!, 100);
    expect(rec).toMatchObject({ completed: true, score: 1000, correctCount: 10, totalQuestions: 10 });
    expect(rec.durationMs).toBe(1000 + 10 * 3000 + 9 * 500 - 1000);
  });

  it('partida abandonada fica registrada como não concluída', () => {
    let s = started();
    s = gameReducer(s, { type: 'ANSWER', optionId: questions[0].correctOptionId, now: 2000 });
    const rec = sessionToRecord(s.session!, 100);
    expect(rec.completed).toBe(false);
    expect(rec.durationMs).toBeNull();
  });

  it('reinício limpa completamente o estado', () => {
    let s = started();
    s = gameReducer(s, { type: 'ANSWER', optionId: null, now: 2000 });
    s = gameReducer(s, { type: 'RESET' });
    expect(s).toEqual(initialGameState);
  });

  it('mensagens por faixa de pontuação', () => {
    const tiers = DEFAULT_SETTINGS.resultTiers;
    expect(pickTier(tiers, 0, 10).message).toMatch(/Todo especialista/);
    expect(pickTier(tiers, 3, 10).message).toMatch(/Todo especialista/);
    expect(pickTier(tiers, 4, 10).message).toMatch(/caminho certo/);
    expect(pickTier(tiers, 6, 10).message).toMatch(/caminho certo/);
    expect(pickTier(tiers, 7, 10).message).toMatch(/Excelente/);
    expect(pickTier(tiers, 9, 10).message).toMatch(/Excelente/);
    expect(pickTier(tiers, 10, 10).message).toMatch(/INCRÍVEL/);
  });

  it('formata duração', () => {
    expect(formatDuration(45_000)).toBe('45 s');
    expect(formatDuration(125_000)).toBe('2 min 05 s');
  });
});
