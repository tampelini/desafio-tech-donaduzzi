import type { AnswerRecord, GameRecord, PreparedQuestion } from '../types';
import { computeScore } from '../game/scoring';

export type Phase = 'attract' | 'instructions' | 'question' | 'result' | 'courses';

export interface Session {
  id: string;
  startedAt: number;
  endedAt: number | null;
  questions: PreparedQuestion[];
  index: number;
  answers: AnswerRecord[];
  questionShownAt: number;
}

export interface GameState {
  phase: Phase;
  session: Session | null;
  /** true após responder (ou esgotar o tempo) a pergunta atual. */
  revealed: boolean;
}

export type GameAction =
  | { type: 'OPEN_INSTRUCTIONS' }
  | { type: 'BEGIN'; id: string; questions: PreparedQuestion[]; now: number }
  | { type: 'ANSWER'; optionId: string | null; now: number }
  | { type: 'NEXT'; now: number }
  | { type: 'SHOW_COURSES' }
  | { type: 'RESET' };

export const initialGameState: GameState = { phase: 'attract', session: null, revealed: false };

/**
 * Reducer puro do fluxo do jogo. Ações fora de contexto (toques repetidos,
 * eventos atrasados de timers) são ignoradas, o que evita estados inválidos.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'OPEN_INSTRUCTIONS':
      return state.phase === 'attract' || state.phase === 'result' || state.phase === 'courses'
        ? { phase: 'instructions', session: null, revealed: false }
        : state;

    case 'BEGIN':
      if (state.phase !== 'instructions' || action.questions.length === 0) return state;
      return {
        phase: 'question',
        revealed: false,
        session: {
          id: action.id,
          startedAt: action.now,
          endedAt: null,
          questions: action.questions,
          index: 0,
          answers: [],
          questionShownAt: action.now,
        },
      };

    case 'ANSWER': {
      const s = state.session;
      if (state.phase !== 'question' || !s || state.revealed) return state;
      const question = s.questions[s.index];
      const timedOut = action.optionId === null;
      const valid = timedOut || question.options.some((o) => o.id === action.optionId);
      if (!valid) return state;
      const answer: AnswerRecord = {
        questionId: question.id,
        chosenOptionId: action.optionId,
        correct: !timedOut && action.optionId === question.correctOptionId,
        timedOut,
        timeMs: Math.max(0, action.now - s.questionShownAt),
      };
      const answers = [...s.answers, answer];
      const isLast = s.index === s.questions.length - 1;
      return {
        ...state,
        revealed: true,
        session: { ...s, answers, endedAt: isLast ? action.now : null },
      };
    }

    case 'NEXT': {
      const s = state.session;
      if (state.phase !== 'question' || !s || !state.revealed) return state;
      if (s.index >= s.questions.length - 1) return { ...state, phase: 'result', revealed: false };
      return {
        ...state,
        revealed: false,
        session: { ...s, index: s.index + 1, questionShownAt: action.now },
      };
    }

    case 'SHOW_COURSES':
      return state.phase === 'result' || state.phase === 'attract' ? { ...state, phase: 'courses' } : state;

    case 'RESET':
      return initialGameState;

    default:
      return state;
  }
}

export function sessionToRecord(session: Session, pointsPerQuestion: number): GameRecord {
  const completed = session.endedAt !== null && session.answers.length === session.questions.length;
  return {
    id: session.id,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    completed,
    score: computeScore(session.answers, pointsPerQuestion),
    correctCount: session.answers.filter((a) => a.correct).length,
    totalQuestions: session.questions.length,
    durationMs: session.endedAt !== null ? session.endedAt - session.startedAt : null,
    answers: session.answers,
  };
}
