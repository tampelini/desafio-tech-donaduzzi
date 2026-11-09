import type { Course } from '../types';

// Conteúdo informativo configurável. Não inclui duração, modalidade, vagas ou
// autorização regulatória: o administrador habilita apenas cursos ofertados.
// Os 4 cursos de computação ficam em destaque (cartões grandes, no topo); os
// demais seguem a lista de faculdadedonaduzzi.com.br/cursos-de-graduacao e
// aparecem só com o nome, até o administrador cadastrar uma descrição.
export const DEFAULT_COURSES: Course[] = [
  {
    id: 'ciencia-de-dados',
    name: 'Ciência de Dados',
    description:
      'Transforme dados em conhecimento. Aprenda a analisar informações, identificar padrões e desenvolver soluções para apoiar decisões.',
    icon: 'database',
    enabled: true,
    highlight: true,
  },
  {
    id: 'inteligencia-artificial',
    name: 'Inteligência Artificial',
    description:
      'Desenvolva sistemas inteligentes capazes de aprender, reconhecer padrões, interpretar informações e resolver problemas complexos.',
    icon: 'brain',
    enabled: true,
    highlight: true,
  },
  {
    id: 'engenharia-de-software',
    name: 'Engenharia de Software',
    description:
      'Aprenda a projetar, desenvolver, testar e evoluir softwares, aplicativos e sistemas utilizados por pessoas e organizações.',
    icon: 'code',
    enabled: true,
    highlight: true,
  },
  {
    id: 'ads',
    name: 'Análise e Desenvolvimento de Sistemas',
    description:
      'Aprenda a programar, desenvolver aplicativos, construir sistemas e criar soluções digitais para problemas reais.',
    icon: 'monitor',
    enabled: true,
    highlight: true,
  },
  { id: 'administracao', name: 'Administração', description: '', icon: 'briefcase', enabled: true, highlight: false },
  { id: 'pedagogia', name: 'Pedagogia', description: '', icon: 'book', enabled: true, highlight: false },
  {
    id: 'engenharia-de-bioprocessos-e-biotecnologia',
    name: 'Engenharia de Bioprocessos e Biotecnologia',
    description: '',
    icon: 'dna',
    enabled: true,
    highlight: false,
  },
  { id: 'farmacia', name: 'Farmácia', description: '', icon: 'pill', enabled: true, highlight: false },
  { id: 'psicologia', name: 'Psicologia', description: '', icon: 'users', enabled: true, highlight: false },
  { id: 'direito', name: 'Direito', description: '', icon: 'scale', enabled: true, highlight: false },
];
