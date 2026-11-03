export type CategoryId = 'faculdade' | 'ia' | 'dados' | 'engsoft' | 'ads' | 'inovacao';

export interface Category {
  id: CategoryId;
  label: string;
}

export type OptionId = string;

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;
  category: CategoryId;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: OptionId;
  explanation: string;
  active: boolean;
}

/** Pergunta pronta para uma partida: alternativas já embaralhadas. */
export interface PreparedQuestion {
  id: string;
  category: CategoryId;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: OptionId;
  explanation: string;
}

export interface AnswerRecord {
  questionId: string;
  chosenOptionId: OptionId | null;
  correct: boolean;
  timedOut: boolean;
  timeMs: number;
}

export interface GameRecord {
  id: string;
  startedAt: number;
  endedAt: number | null;
  completed: boolean;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationMs: number | null;
  answers: AnswerRecord[];
}

export type CourseIcon = 'database' | 'brain' | 'code' | 'monitor' | 'cpu' | 'graduation' | 'flask' | 'heart';

export interface Course {
  id: string;
  name: string;
  description: string;
  icon: CourseIcon;
  enabled: boolean;
}

export interface ThemeColors {
  /** Vinho institucional: faixas, telas de destaque e títulos. */
  brand: string;
  /** Creme/amarelo dos banners institucionais. */
  cream: string;
  bg: string;
  surface: string;
  primary: string;
  accent: string;
  success: string;
  danger: string;
  gold: string;
  ink: string;
}

export interface ResultTier {
  /** Percentual mínimo de acerto (0–100) para a faixa ser aplicada. */
  minPercent: number;
  title: string;
  message: string;
}

export interface Settings {
  institutionName: string;
  gameName: string;
  tagline: string;
  intro: string;
  /** URL ou data URL do logotipo oficial. Vazio = espaço reservado. */
  logo: string;
  /** Versão do logotipo para fundo escuro (vinho). Opcional. */
  logoOnDark: string;
  colors: ThemeColors;
  questionsPerGame: number;
  distribution: Record<CategoryId, number>;
  pointsPerQuestion: number;
  /** Segundos por pergunta. 0 = temporizador desativado. */
  timePerQuestion: number;
  /** Inatividade (s) durante a partida antes de voltar à tela inicial. */
  idleSeconds: number;
  /** Inatividade (s) na tela de cursos. */
  coursesIdleSeconds: number;
  soundEnabled: boolean;
  fullscreenOnStart: boolean;
  qrUrl: string;
  qrLabel: string;
  coursesTitle: string;
  resultTiers: ResultTier[];
  /** Quantas partidas recentes são consideradas para evitar repetição. */
  avoidRecentGames: number;
}
