import type { Settings } from '../types';

// Paleta extraída de faculdadedonaduzzi.com.br (vinho, carmim, rosa, creme).
export const DEFAULT_COLORS = {
  brand: '#541822',
  cream: '#f7ebb5',
  bg: '#ffffff',
  surface: '#f1f1f1',
  primary: '#a31938',
  accent: '#cc3366',
  success: '#15803d',
  danger: '#dc2626',
  gold: '#e9b949',
  ink: '#333333',
};

export const DEFAULT_SETTINGS: Settings = {
  institutionName: 'FACULDADE DONADUZZI',
  gameName: 'DESAFIO TECH',
  tagline: 'Quanto você sabe sobre o futuro?',
  intro: 'Teste seus conhecimentos sobre tecnologia, inovação e descubra novas possibilidades para o seu futuro!',
  // Logotipo oficial (public/assets), empacotado no app para funcionar offline.
  logo: './assets/logo-donaduzzi.png',
  logoOnDark: '',
  logoLinkUrl: 'https://faculdadedonaduzzi.com.br/cursos-de-graduacao/',
  colors: DEFAULT_COLORS,
  questionsPerGame: 10,
  distribution: { faculdade: 3, ia: 2, dados: 2, engsoft: 1, ads: 1, inovacao: 1 },
  pointsPerQuestion: 100,
  timePerQuestion: 20,
  idleSeconds: 60,
  coursesIdleSeconds: 30,
  soundEnabled: true,
  fullscreenOnStart: true,
  qrUrl: '',
  qrLabel: 'Aponte a câmera do celular e conheça os cursos',
  coursesTitle: 'SEU FUTURO COMEÇA AQUI!',
  resultTiers: [
    { minPercent: 0, title: 'BOA TENTATIVA!', message: 'Todo especialista começa com uma descoberta. Continue explorando!' },
    { minPercent: 40, title: 'MUITO BEM!', message: 'Você está no caminho certo para explorar o mundo da tecnologia!' },
    { minPercent: 70, title: 'VOCÊ MANDOU MUITO BEM!', message: 'Excelente! Você demonstra grandes conhecimentos sobre tecnologia!' },
    { minPercent: 100, title: 'PONTUAÇÃO MÁXIMA!', message: 'INCRÍVEL! Você é um verdadeiro mestre do Desafio Tech!' },
  ],
  avoidRecentGames: 3,
  survey: {
    enabled: true,
    allowSkip: true,
    items: [
      { id: 'biopark', prompt: 'O quanto você conhece o Biopark?', subject: 'o Biopark', category: null },
      { id: 'faculdade', prompt: 'O quanto você conhece a Faculdade Donaduzzi?', subject: 'a Faculdade Donaduzzi', category: 'faculdade' },
    ],
  },
};
