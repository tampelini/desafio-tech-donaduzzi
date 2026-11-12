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
  /**
   * Pesquisa "o quanto você conhece…": nota de 1 a 5 por item.
   * null = o visitante pulou; ausente = pesquisa desativada nesta partida.
   */
  survey?: SurveyAnswers | null;
}

/** Nota de 1 (nunca ouvi falar) a 5 (conheço muito bem), por ID do item. */
export type SurveyAnswers = Record<string, number>;

export interface SurveyItem {
  id: string;
  /** Pergunta exibida (ex.: "O quanto você conhece o Biopark?"). */
  prompt: string;
  /** Com artigo, para frases como "sobre o Biopark" (ex.: "o Biopark"). */
  subject: string;
  /** Categoria do quiz usada para comparar a autoavaliação com os acertos. */
  category: CategoryId | null;
}

export interface SurveySettings {
  enabled: boolean;
  allowSkip: boolean;
  items: SurveyItem[];
}

export type CourseIcon =
  | 'database' | 'brain' | 'code' | 'monitor' | 'cpu' | 'graduation' | 'flask' | 'heart'
  | 'briefcase' | 'book' | 'dna' | 'pill' | 'users' | 'scale';

export interface Course {
  id: string;
  name: string;
  /** Opcional: sem descrição, o curso aparece só com o nome. */
  description: string;
  icon: CourseIcon;
  enabled: boolean;
  /** Destaque: cartão grande no topo da tela de cursos (cursos de computação). */
  highlight: boolean;
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
  /** Página aberta ao tocar no logotipo (ex.: cursos de graduação). Vazio = sem link. */
  logoLinkUrl: string;
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
  /** Pesquisa rápida antes do desafio. */
  survey: SurveySettings;
}
