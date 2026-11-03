import type { Course } from '../types';

// Conteúdo informativo configurável. Não inclui duração, modalidade, vagas ou
// autorização regulatória: o administrador habilita apenas cursos ofertados.
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'ciencia-de-dados',
    name: 'Ciência de Dados',
    description:
      'Transforme dados em conhecimento. Aprenda a analisar informações, identificar padrões e desenvolver soluções para apoiar decisões.',
    icon: 'database',
    enabled: true,
  },
  {
    id: 'inteligencia-artificial',
    name: 'Inteligência Artificial',
    description:
      'Desenvolva sistemas inteligentes capazes de aprender, reconhecer padrões, interpretar informações e resolver problemas complexos.',
    icon: 'brain',
    enabled: true,
  },
  {
    id: 'engenharia-de-software',
    name: 'Engenharia de Software',
    description:
      'Aprenda a projetar, desenvolver, testar e evoluir softwares, aplicativos e sistemas utilizados por pessoas e organizações.',
    icon: 'code',
    enabled: true,
  },
  {
    id: 'ads',
    name: 'Análise e Desenvolvimento de Sistemas',
    description:
      'Aprenda a programar, desenvolver aplicativos, construir sistemas e criar soluções digitais para problemas reais.',
    icon: 'monitor',
    enabled: true,
  },
];
