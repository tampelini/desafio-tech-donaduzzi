import type { Category, CategoryId } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'faculdade', label: 'Faculdade Donaduzzi' },
  { id: 'ia', label: 'Inteligência Artificial' },
  { id: 'dados', label: 'Ciência de Dados' },
  { id: 'engsoft', label: 'Engenharia de Software' },
  { id: 'ads', label: 'Análise e Desenvolvimento de Sistemas' },
  { id: 'inovacao', label: 'Inovação e Profissões Tecnológicas' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
